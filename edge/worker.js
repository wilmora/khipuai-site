/* Markdown content negotiation and edge security hardening for khipuai.co.

   GitHub Pages serves files as they are and ignores the Accept header, so it
   cannot answer `Accept: text/markdown`, send `Vary: Accept`, or attach HTTP
   security headers. This Cloudflare Worker sits in front of Pages (route
   khipuai.co/*) and adds:

   - 404 for internal repository files (README.md and AGENTS.md files, the
     docs, edge, tools and tests folders, logos/SOURCES.md) and for dot files
     such as /.git/*, /.github/*, /.gitignore and /.nojekyll, but not for
     /.well-known/*. The path is normalized first, so an encoded or oddly
     written form of an internal path gets the same 404 (see normalizePath).
   - Security headers on every response (Strict-Transport-Security,
     X-Content-Type-Options, X-Frame-Options, Referrer-Policy and
     Permissions-Policy), plus a Content-Security-Policy on HTML.
   - Accept prefers text/markdown and the page has a Markdown twin
     (index.md beside index.html, kept in step with the page by hand)
       -> 200, the Markdown, Content-Type: text/markdown, Vary: Accept
   - Accept prefers text/markdown and the page does not exist
       -> 404, the body of /404.md, Content-Type: text/markdown, Vary: Accept
   - Everything else passes through with Vary: Accept on HTML so shared caches
     never hand Markdown to a browser or HTML to an agent. */

const MD_TYPE = 'text/markdown; charset=utf-8';

/* ---- Internal files ---------------------------------------------------------

   The Pages workflow (.github/workflows/pages.yml) leaves these out of the
   published site. The worker blocks them again, as a second line of defence,
   in case one ever reaches the origin. Like the workflow's rsync excludes,
   the rules apply in every folder. They are checked against the normalized,
   lower-case path. */
const PRIVATE_DIRS = new Set(['docs', 'edge', 'tools', 'tests']);
const PRIVATE_FILES = new Set(['readme.md', 'agents.md']);
// Dot files and folders (.git, .github, .gitignore, .nojekyll, .env and so on)
// are internal too, except a top-level /.well-known/, which holds public files
// such as security.txt and the checks that renew the site's certificate.
const PUBLIC_DOT_DIR = '.well-known';

// Characters that no page address on this site uses. Some servers read them
// as the end of a path (? # ; and control characters such as NUL), as a
// wildcard (* < > ") or as a file stream (:), and invisible or unassigned
// characters can hide a name. A path that holds one after decoding is refused.
const UNSAFE_CHARS = /[\p{C}\p{Zl}\p{Zp}?#;:*<>|"]/u;
const MAX_DECODE_ROUNDS = 5;

/* Reads a URL path the way a lenient web server might, so that a disguised
   path compares equal to the plain one:
   - percent-encoding is undone until nothing changes (/%2564ocs -> /%64ocs ->
     /docs), and each round folds look-alike characters into plain ones
     (Unicode NFKC: a fullwidth slash becomes /, a fullwidth d becomes d);
   - backslashes become slashes;
   - empty segments (repeated slashes) and "." segments are dropped, and ".."
     removes the segment before it;
   - spaces around each segment and dots at its end are cut (/docs./ ->
     /docs/), as Windows servers do;
   - letters are lower-cased.
   Returns the path without a trailing slash, or null when the path cannot be
   read safely: broken encoding (such as %E0%A4%A, or %C0%AE, an overlong
   form of "."), more than four layers of encoding, an UNSAFE_CHARS character,
   or a segment made only of dots and spaces other than "." and "..".
   Callers must treat null as "do not serve". */
export function normalizePath(pathname) {
  let path = String(pathname || '/');
  for (let round = 0; ; round++) {
    if (round === MAX_DECODE_ROUNDS) return null;
    let next;
    try {
      next = decodeURIComponent(path).normalize('NFKC');
    } catch {
      return null;
    }
    if (next === path) break;
    path = next;
  }
  if (UNSAFE_CHARS.test(path)) return null;
  const segments = [];
  for (const raw of path.replace(/\\/g, '/').split('/')) {
    if (raw === '' || raw === '.') continue;
    if (raw === '..') {
      segments.pop();
      continue;
    }
    const segment = raw.replace(/^\s+|[\s.]+$/g, '');
    if (segment === '') return null;
    segments.push(segment.toLowerCase());
  }
  return '/' + segments.join('/');
}

export function isPrivatePath(pathname) {
  const path = normalizePath(pathname);
  if (path === null) return true;
  const segments = path.split('/').filter(Boolean);
  return segments.some((s, i) =>
    PRIVATE_DIRS.has(s)
    || PRIVATE_FILES.has(s)
    || (s === 'sources.md' && segments[i - 1] === 'logos')
    || (s.startsWith('.') && !(i === 0 && s === PUBLIC_DOT_DIR)));
}

/* ---- Security headers -------------------------------------------------------

   Content-Security-Policy for HTML responses.

   Every page also carries its own policy in a <meta http-equiv> tag, and that
   policy allows each inline script only by its exact SHA-256 hash. The
   browser enforces both policies, so a script runs only if both allow it. A
   header is the same for every page and cannot know each page's hashes, so
   script-src here keeps 'unsafe-inline' and leaves the inline-script check to
   the meta policy. Without 'unsafe-inline', this header would block every
   inline script on the site.

   The header adds what a meta tag cannot do: frame-ancestors, which stops
   other sites from framing the pages. It must allow everything each page's
   meta policy allows, or deploying the worker would break that page;
   tests/worker.test.mjs checks this. The hosts are Google Analytics 4
   (gtag.js and its collection endpoints), the Meta Pixel, Calendly,
   Cloudflare Turnstile and the Google Apps Script endpoint behind the
   self-assessment form. form-action 'none' refuses every native form
   submit: no page needs one (the self-assessment email form is sent by
   fetch), and a submit made before the page script runs would put the
   visitor's name, work email and company in the URL. upgrade-insecure-requests
   makes the browser fetch any http:// address a page uses over https
   instead. */
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://*.googletagmanager.com https://connect.facebook.net https://assets.calendly.com https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline' https://assets.calendly.com",
  "img-src 'self' data: https://*.google-analytics.com https://*.googletagmanager.com https://*.g.doubleclick.net https://www.google.com https://www.facebook.com https://assets.calendly.com",
  "font-src 'self' data: https://assets.calendly.com",
  "connect-src 'self' https://script.google.com https://script.googleusercontent.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://*.g.doubleclick.net https://www.google.com https://www.facebook.com https://connect.facebook.net https://calendly.com https://challenges.cloudflare.com",
  "frame-src 'self' https://calendly.com https://challenges.cloudflare.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
  "frame-ancestors 'self'",
  'upgrade-insecure-requests',
].join('; ');

/* HTTPS only, for one year, on khipuai.co and every subdomain. Set on every
   response and never taken from the origin, so the edge alone decides it.
   No preload yet: edge/README.md says how and when to add it. */
const HSTS = 'max-age=31536000; includeSubDomains';

const PERMISSIONS = 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()';

export function withSecurityHeaders(headers, isHtml = false) {
  const h = new Headers(headers);
  h.set('Strict-Transport-Security', HSTS);
  if (!h.has('X-Content-Type-Options')) h.set('X-Content-Type-Options', 'nosniff');
  if (!h.has('X-Frame-Options')) h.set('X-Frame-Options', 'SAMEORIGIN');
  if (!h.has('Referrer-Policy')) h.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  if (!h.has('Permissions-Policy')) h.set('Permissions-Policy', PERMISSIONS);
  if (isHtml && !h.has('Content-Security-Policy')) h.set('Content-Security-Policy', CSP);
  return h;
}

/* ---- Markdown negotiation ---------------------------------------------------- */

/* Returns true when the client ranks text/markdown above text/html.
   Follows RFC 9110 quality values: a missing q is 1, q=0 means "not
   acceptable", and an exact type beats a wildcard at the same q. */
export function prefersMarkdown(accept) {
  if (!accept) return false;
  let md = -1;
  let html = -1;
  let wild = -1;
  for (const part of accept.split(',')) {
    const [type, ...params] = part.trim().toLowerCase().split(';');
    let q = 1;
    for (const p of params) {
      const [k, v] = p.trim().split('=');
      if (k === 'q') q = Number.parseFloat(v);
    }
    if (Number.isNaN(q)) q = 0;
    const t = type.trim();
    if (t === 'text/markdown' || t === 'text/x-markdown') md = Math.max(md, q);
    else if (t === 'text/html' || t === 'application/xhtml+xml') html = Math.max(html, q);
    else if (t === 'text/*' || t === '*/*') wild = Math.max(wild, q);
  }
  if (md <= 0) return false;
  const htmlQ = html >= 0 ? html : wild;
  return md > htmlQ || (md === htmlQ && html < 0);
}

/* Maps a page URL path to its Markdown twin. Returns null for files that
   are not pages (images, scripts, llms.txt, the .md files themselves). */
export function markdownPath(pathname) {
  if (pathname.endsWith('/')) return pathname + 'index.md';
  if (pathname.endsWith('.html')) return pathname.slice(0, -5) + '.md';
  const last = pathname.slice(pathname.lastIndexOf('/') + 1);
  if (last.includes('.')) return null;
  return pathname + '/index.md';
}

/* An address on this site. The path is set with the pathname setter and never
   resolved against the request URL, because resolving a path that starts
   with // (such as //example.com/x.md) would point at another host. */
function siteUrl(url, pathname) {
  const u = new URL(url.origin);
  u.pathname = pathname;
  return u;
}

function withVary(headers) {
  const h = new Headers(headers);
  const vary = (h.get('Vary') || '').split(',').map(s => s.trim()).filter(Boolean);
  if (!vary.some(v => v.toLowerCase() === 'accept')) vary.push('Accept');
  h.set('Vary', vary.join(', '));
  return h;
}

function markdownResponse(body, status, source) {
  const h = withSecurityHeaders(new Headers(), false);
  h.set('Content-Type', MD_TYPE);
  h.set('Vary', 'Accept');
  h.set('Cache-Control', (source && source.headers && source.headers.get('Cache-Control')) || 'max-age=600');
  return new Response(body, { status, headers: h });
}

export async function handle(request, originFetch = fetch) {
  const url = new URL(request.url);
  const wantsMd = (request.method === 'GET' || request.method === 'HEAD')
    && prefersMarkdown(request.headers.get('Accept'));

  if (isPrivatePath(url.pathname)) {
    if (wantsMd) {
      const nf = await originFetch(new Request(new URL('/404.md', url), { method: 'GET' }));
      const body = nf.ok
        ? await nf.text()
        : '# 404: Page not found\n\nSee https://khipuai.co/llms.txt or https://khipuai.co/sitemap.xml\n';
      return markdownResponse(request.method === 'HEAD' ? null : body, 404, nf);
    }
    const nfHtml = await originFetch(new Request(new URL('/404.html', url), { method: 'GET' }));
    const body = request.method === 'HEAD' ? null : (nfHtml.ok ? await nfHtml.text() : '<h1>404 Not Found</h1>');
    const h = withSecurityHeaders(withVary(nfHtml.headers), true);
    h.set('Content-Type', 'text/html; charset=utf-8');
    return new Response(body, { status: 404, headers: h });
  }

  const mdPath = wantsMd ? markdownPath(url.pathname) : null;

  if (mdPath) {
    // The twin must be a public file on this site: /README.html is never
    // answered with /README.md. Redirects are not followed, so the Markdown
    // always comes from the address the worker asked for.
    const md = isPrivatePath(mdPath)
      ? null
      : await originFetch(new Request(siteUrl(url, mdPath), { method: 'GET', redirect: 'manual' }));
    if (md && md.ok) {
      const body = request.method === 'HEAD' ? null : await md.text();
      return markdownResponse(body, 200, md);
    }
    // No Markdown twin. If the page itself is missing, answer with a Markdown
    // 404; if it exists, fall through and serve its HTML.
    const page = await originFetch(request);
    if (page.status === 404) {
      const nf = await originFetch(new Request(new URL('/404.md', url), { method: 'GET' }));
      const body = nf.ok
        ? await nf.text()
        : '# 404: Page not found\n\nSee https://khipuai.co/llms.txt or https://khipuai.co/sitemap.xml\n';
      return markdownResponse(request.method === 'HEAD' ? null : body, 404, page);
    }
    return new Response(page.body, { status: page.status, statusText: page.statusText, headers: withSecurityHeaders(withVary(page.headers), true) });
  }

  const res = await originFetch(request);
  const type = (res.headers.get('Content-Type') || '').toLowerCase();
  if (!type.startsWith('text/html')) {
    return new Response(res.body, { status: res.status, statusText: res.statusText, headers: withSecurityHeaders(res.headers, false) });
  }
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers: withSecurityHeaders(withVary(res.headers), true) });
}

export default {
  fetch(request) {
    return handle(request);
  },
};
