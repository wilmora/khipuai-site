/* Markdown content negotiation and edge security hardening for khipuai.co.

   GitHub Pages serves files as they are and ignores the Accept header, so it
   cannot answer `Accept: text/markdown`, send `Vary: Accept`, or attach modern
   HTTP security headers. This Cloudflare Worker sits in front of Pages (route
   khipuai.co/*) and adds:

   - 404 blocking for internal repo files (/AGENTS.md, /README.md, /docs/*,
     /edge/*, /tools/*, /tests/*, /demos/README.md, /logos/SOURCES.md)
   - Security headers on all responses (X-Content-Type-Options, X-Frame-Options,
     Referrer-Policy, Permissions-Policy, and Content-Security-Policy on HTML)
   - Accept prefers text/markdown and the page has a Markdown twin
     (index.md beside index.html, kept in step with the page by hand)
       -> 200, the Markdown, Content-Type: text/markdown, Vary: Accept
   - Accept prefers text/markdown and the page does not exist
       -> 404, the body of /404.md, Content-Type: text/markdown, Vary: Accept
   - Everything else passes through with Vary: Accept on HTML so shared caches
     never hand Markdown to a browser or HTML to an agent. */

const MD_TYPE = 'text/markdown; charset=utf-8';

const PRIVATE_PREFIXES = ['/docs/', '/edge/', '/tools/', '/tests/', '/.github/'];
const PRIVATE_EXACT = new Set([
  '/agents.md',
  '/readme.md',
  '/demos/readme.md',
  '/logos/sources.md',
  '/docs',
  '/edge',
  '/tools',
  '/tests',
  '/.nojekyll',
]);

export function isPrivatePath(pathname) {
  const lower = (pathname || '/').toLowerCase();
  if (PRIVATE_EXACT.has(lower)) return true;
  return PRIVATE_PREFIXES.some(prefix => lower.startsWith(prefix));
}

const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://connect.facebook.net https://assets.calendly.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://assets.calendly.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: https://www.facebook.com https://www.google-analytics.com https://khipuai.co",
  "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://region1.google-analytics.com https://connect.facebook.net https://www.facebook.com https://calendly.com https://script.google.com https://script.googleusercontent.com",
  "frame-src 'self' https://calendly.com https://www.facebook.com",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'self'",
].join('; ');

export function withSecurityHeaders(headers, isHtml = false) {
  const h = new Headers(headers);
  if (!h.has('X-Content-Type-Options')) h.set('X-Content-Type-Options', 'nosniff');
  if (!h.has('X-Frame-Options')) h.set('X-Frame-Options', 'SAMEORIGIN');
  if (!h.has('Referrer-Policy')) h.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  if (!h.has('Permissions-Policy')) h.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  if (isHtml && !h.has('Content-Security-Policy')) h.set('Content-Security-Policy', CSP);
  return h;
}

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
    const mdUrl = new URL(mdPath, url);
    const md = await originFetch(new Request(mdUrl, { method: 'GET', redirect: 'follow' }));
    if (md.ok) {
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
  const type = res.headers.get('Content-Type') || '';
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
