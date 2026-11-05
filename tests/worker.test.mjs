// Unit tests for edge/worker.js. Run: node --test tests/worker.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { handle, prefersMarkdown, markdownPath, isPrivatePath, normalizePath } from '../edge/worker.js';

// A fake GitHub Pages origin: a few files, 404 for the rest, Vary like Pages.
const FILES = {
  '/': ['text/html; charset=utf-8', '<h1>Home</h1>'],
  '/index.md': ['text/markdown; charset=utf-8', '# Home\n\nHello agents.\n'],
  '/privacy.html': ['text/html; charset=utf-8', '<h1>Privacy</h1>'],
  '/404.html': ['text/html; charset=utf-8', '<h1>404</h1>'],
  '/404.md': ['text/markdown; charset=utf-8', '# 404: Page not found\n\n[llms.txt](https://khipuai.co/llms.txt)\n'],
  '/llms.txt': ['text/plain; charset=utf-8', '# KHIPUAI'],
  '/AGENTS.md': ['text/markdown; charset=utf-8', '# Internal Instructions'],
  '/README.md': ['text/markdown; charset=utf-8', '# Repo Readme'],
  '/docs/GO_LIVE_CHECKLIST.md': ['text/markdown; charset=utf-8', '# Checklist'],
  '/edge/leads/Code.gs': ['text/plain; charset=utf-8', 'function doPost() {}'],
};
const origin = async req => {
  const { pathname } = new URL(req.url);
  const f = FILES[pathname];
  const headers = { 'Vary': 'Accept-Encoding', 'Cache-Control': 'max-age=600' };
  if (!f) return new Response('<h1>404</h1>', { status: 404, headers: { ...headers, 'Content-Type': 'text/html; charset=utf-8' } });
  return new Response(f[1], { status: 200, headers: { ...headers, 'Content-Type': f[0] } });
};
const get = (path, accept, method = 'GET') =>
  handle(new Request('https://khipuai.co' + path, { method, headers: accept ? { Accept: accept } : {} }), origin);

test('prefersMarkdown follows quality values', () => {
  assert.equal(prefersMarkdown('text/markdown'), true);
  assert.equal(prefersMarkdown('text/markdown, */*;q=0.1'), true);
  assert.equal(prefersMarkdown('text/markdown;q=0.9, text/html;q=0.5'), true);
  assert.equal(prefersMarkdown('text/html, text/markdown;q=0.5'), false);
  assert.equal(prefersMarkdown('text/markdown;q=0, */*'), false);
  assert.equal(prefersMarkdown('text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'), false);
  assert.equal(prefersMarkdown('*/*'), false);
  assert.equal(prefersMarkdown(''), false);
  assert.equal(prefersMarkdown(null), false);
});

test('markdownPath maps pages and skips assets', () => {
  assert.equal(markdownPath('/'), '/index.md');
  assert.equal(markdownPath('/about/'), '/about/index.md');
  assert.equal(markdownPath('/about'), '/about/index.md');
  assert.equal(markdownPath('/privacy.html'), '/privacy.md');
  assert.equal(markdownPath('/llms.txt'), null);
  assert.equal(markdownPath('/shared/kinetic.js'), null);
});

test('isPrivatePath identifies internal repo files and directories', () => {
  assert.equal(isPrivatePath('/AGENTS.md'), true);
  assert.equal(isPrivatePath('/agents.md'), true);
  assert.equal(isPrivatePath('/README.md'), true);
  assert.equal(isPrivatePath('/demos/README.md'), true);
  assert.equal(isPrivatePath('/logos/SOURCES.md'), true);
  assert.equal(isPrivatePath('/docs/GO_LIVE_CHECKLIST.md'), true);
  assert.equal(isPrivatePath('/edge/leads/Code.gs'), true);
  assert.equal(isPrivatePath('/tools/prerender.py'), true);
  assert.equal(isPrivatePath('/tests/site.test.mjs'), true);
  assert.equal(isPrivatePath('/'), false);
  assert.equal(isPrivatePath('/index.md'), false);
  assert.equal(isPrivatePath('/demos/support/index.html'), false);
  assert.equal(isPrivatePath('/llms.txt'), false);
});

test('internal repo paths return 404 even if present on origin', async () => {
  for (const p of ['/AGENTS.md', '/README.md', '/docs/GO_LIVE_CHECKLIST.md', '/edge/leads/Code.gs']) {
    const r = await get(p, 'text/html');
    assert.equal(r.status, 404, p);
    assert.equal(r.headers.get('X-Frame-Options'), 'SAMEORIGIN');
    assert.equal(r.headers.get('X-Content-Type-Options'), 'nosniff');
  }
});

test('homepage returns Markdown with Vary: Accept and security headers', async () => {
  const r = await get('/', 'text/markdown');
  assert.equal(r.status, 200);
  assert.match(r.headers.get('Content-Type'), /^text\/markdown/);
  assert.match(r.headers.get('Vary'), /\bAccept\b/);
  assert.equal(r.headers.get('X-Content-Type-Options'), 'nosniff');
  assert.equal(r.headers.get('X-Frame-Options'), 'SAMEORIGIN');
  assert.equal(r.headers.get('Referrer-Policy'), 'strict-origin-when-cross-origin');
  const body = await r.text();
  assert.ok(body.startsWith('# Home'));
});

test('homepage returns HTML for browsers, with Vary: Accept and CSP added', async () => {
  const r = await get('/', 'text/html');
  assert.equal(r.status, 200);
  assert.match(r.headers.get('Content-Type'), /^text\/html/);
  assert.equal(r.headers.get('Vary'), 'Accept-Encoding, Accept');
  assert.equal(r.headers.get('X-Frame-Options'), 'SAMEORIGIN');
  assert.equal(r.headers.get('X-Content-Type-Options'), 'nosniff');
  assert.equal(r.headers.get('Referrer-Policy'), 'strict-origin-when-cross-origin');
  assert.ok(r.headers.get('Content-Security-Policy')?.includes("frame-ancestors 'self'"));
  assert.equal(await r.text(), '<h1>Home</h1>');
});

test('missing page returns a Markdown 404 that links to llms.txt', async () => {
  const r = await get('/__ora-404-probe', 'text/markdown');
  assert.equal(r.status, 404);
  assert.match(r.headers.get('Content-Type'), /^text\/markdown/);
  assert.match(r.headers.get('Vary'), /\bAccept\b/);
  const body = await r.text();
  assert.ok(body.length >= 20);
  assert.match(body, /llms\.txt/);
});

test('missing page still returns the HTML 404 to browsers', async () => {
  const r = await get('/nope', 'text/html');
  assert.equal(r.status, 404);
  assert.match(r.headers.get('Content-Type'), /^text\/html/);
});

test('existing page without a Markdown twin falls back to HTML', async () => {
  const r = await get('/privacy.html', 'text/markdown');
  assert.equal(r.status, 200);
  assert.match(r.headers.get('Content-Type'), /^text\/html/);
  assert.match(r.headers.get('Vary'), /\bAccept\b/);
});

test('non-HTML files pass through with baseline security headers', async () => {
  const r = await get('/llms.txt', 'text/markdown');
  assert.equal(r.status, 200);
  assert.equal(r.headers.get('Vary'), 'Accept-Encoding');
  assert.equal(r.headers.get('X-Content-Type-Options'), 'nosniff');
  assert.equal(r.headers.get('X-Frame-Options'), 'SAMEORIGIN');
});

test('HEAD gets Markdown headers and no body', async () => {
  const r = await get('/', 'text/markdown', 'HEAD');
  assert.equal(r.status, 200);
  assert.match(r.headers.get('Content-Type'), /^text\/markdown/);
  assert.equal(await r.text(), '');
});

// ---- Disguised internal paths (security review, 2026-11-04) -----------------

// An origin as lenient as some web servers: it undoes percent-encoding more
// than once, folds look-alike characters, reads backslashes as slashes,
// ignores repeated slashes, resolves . and .., ignores letter case and drops
// trailing dots and spaces. If the worker passed a disguised path on, this
// origin would serve the internal file. For any other host it answers with
// injected text, so a lookup that leaves the site shows up in the response.
const SECRET = 'INTERNAL-FILE-CONTENT';
const INJECTED = 'TEXT-FROM-ANOTHER-HOST';
const SECURITY_TXT = 'Contact: https://khipuai.co/security/\n';
const LENIENT_FILES = {
  '/': ['text/html; charset=utf-8', '<h1>Home</h1>'],
  '/index.md': ['text/markdown; charset=utf-8', '# Home\n'],
  '/404.html': ['text/html; charset=utf-8', '<h1>404</h1>'],
  '/404.md': ['text/markdown; charset=utf-8', '# 404: Page not found\n\n[llms.txt](https://khipuai.co/llms.txt)\n'],
  '/.well-known/security.txt': ['text/plain; charset=utf-8', SECURITY_TXT],
};
for (const f of ['/docs/x', '/agents.md', '/readme.md', '/es/readme.md', '/demos/readme.md', '/logos/sources.md', '/edge/leads/code.gs',
  '/tests/worker.test.mjs', '/.git/config', '/.github/workflows/pages.yml', '/.gitignore', '/.nojekyll'])
  LENIENT_FILES[f] = ['text/plain; charset=utf-8', SECRET];

function lenientKey(pathname) {
  let p = pathname;
  for (let i = 0; i < 3; i++) {
    try { p = decodeURIComponent(p).normalize('NFKC'); } catch { return null; }
  }
  const out = [];
  for (const s of p.replace(/\\/g, '/').split('/')) {
    if (!s || s === '.') continue;
    if (s === '..') { out.pop(); continue; }
    out.push(s.replace(/[. ]+$/, '').toLowerCase());
  }
  return '/' + out.join('/');
}
const lenientOrigin = async req => {
  const u = new URL(req.url);
  if (u.host !== 'khipuai.co') return new Response(INJECTED, { status: 200, headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
  const f = LENIENT_FILES[lenientKey(u.pathname)];
  if (!f) return new Response('<h1>404</h1>', { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  return new Response(f[1], { status: 200, headers: { 'Content-Type': f[0] } });
};
// Sends one request through the worker to the lenient origin. `passedOn` lists
// what the worker asked the origin for, other than its own 404 pages.
async function lenientGet(path, accept, method = 'GET') {
  const asked = [];
  const req = new Request('https://khipuai.co' + path, { method, headers: accept ? { Accept: accept } : {} });
  const r = await handle(req, rq => { asked.push(rq.url); return lenientOrigin(rq); });
  const passedOn = asked.filter(u => u !== 'https://khipuai.co/404.html' && u !== 'https://khipuai.co/404.md');
  return { r, body: await r.text(), asked, passedOn };
}
const ACCEPTS = ['text/html', 'text/markdown'];

// The forms the review found slipping past the old block list, which compared
// the raw path.
const BYPASSES = ['/%64ocs/x', '/%2564ocs/x', '//docs/x', '/./docs/x', '/tests/../docs/x', '/DoCs/x', '/docs\\x', '/docs%2Fx', '/docs./x'];

test('the lenient test origin really would serve the internal file for each disguised path', async () => {
  // Without this, the 404s below could come from the origin, not the worker.
  for (const p of BYPASSES) {
    const r = await lenientOrigin(new Request('https://khipuai.co' + p));
    assert.equal(r.status, 200, p);
    assert.equal(await r.text(), SECRET, p);
  }
});

test('disguised forms of an internal path return 404 to browsers and to agents', async () => {
  for (const p of BYPASSES) for (const accept of ACCEPTS) {
    const { r, body, passedOn } = await lenientGet(p, accept);
    assert.equal(r.status, 404, `${p} (${accept})`);
    assert.ok(!body.includes(SECRET), `${p} (${accept}) leaked the internal file`);
    assert.match(r.headers.get('Content-Type'), accept === 'text/html' ? /^text\/html/ : /^text\/markdown/, `${p} (${accept})`);
    assert.deepEqual(passedOn, [], `${p} (${accept}): the worker passed the path on to the origin`);
  }
});

test('HEAD on a disguised internal path gets a 404 and no body', async () => {
  for (const accept of ACCEPTS) {
    const { r, body, passedOn } = await lenientGet('/%2564ocs/x', accept, 'HEAD');
    assert.equal(r.status, 404, accept);
    assert.equal(body, '');
    assert.deepEqual(passedOn, []);
  }
});

test('isPrivatePath sees through encoding, look-alikes, dot segments, case, backslashes and trailing dots', () => {
  for (const p of [...BYPASSES, '/docs%20/x', '/%2e%2e/docs/x', '/foo/%2E%2E/docs/x', '/%252e%252e/docs/x', '/docs%5Cx', '/docs%5cx',
    '/%EF%BD%84ocs/x', '/docs%EF%BC%8Fx', '/%74ools/x', '/tests', '/edge/', '/AGENTS.md.', '/readme.md%20', '/README.MD', '/es/README.md',
    '/x/logos/SOURCES.md'])
    assert.equal(isPrivatePath(p), true, p);
  assert.equal(normalizePath('/%2564ocs/x'), '/docs/x');
  assert.equal(normalizePath('/tests/../docs/./x'), '/docs/x');
  assert.equal(normalizePath('//DoCs\\x.'), '/docs/x');
  assert.equal(normalizePath('/docs%2Fx'), '/docs/x');
  assert.equal(normalizePath('/docs%EF%BC%8Fx'), '/docs/x', 'a fullwidth slash is a slash');
  assert.equal(normalizePath('/'), '/');
  assert.equal(normalizePath('/About/'), '/about');
});

test('malformed or suspicious encoding returns 404 without reaching the origin', async () => {
  // Broken percent-encoding, an overlong UTF-8 dot (%C0%AE), a NUL byte, path
  // parameters, an NTFS stream name, five layers of encoding, and segments made
  // only of dots and spaces.
  const BAD = ['/%E0%A4%A', '/%', '/docs%2', '/%zz/x', '/%C0%AE%C0%AE/docs/x', '/docs%00/x', '/docs;x/y', '/docs::$DATA/x',
    '/%2525252564ocs/x', '/a/...', '/a/.%20/docs/x'];
  for (const p of BAD) {
    assert.equal(normalizePath(p), null, p);
    assert.equal(isPrivatePath(p), true, p);
    for (const accept of ACCEPTS) {
      const { r, passedOn } = await lenientGet(p, accept);
      assert.equal(r.status, 404, `${p} (${accept})`);
      assert.deepEqual(passedOn, [], `${p} (${accept}): the worker passed the path on to the origin`);
    }
  }
});

test('Git files and other dot files return 404; /.well-known/ stays public', async () => {
  for (const p of ['/.git', '/.git/', '/.git/config', '/.git/HEAD', '/.GIT/config', '/%2egit/config', '/.git./config', '/.github',
    '/.github/workflows/pages.yml', '/.gitignore', '/.nojekyll', '/.env', '/es/.git/config', '/.well-known/.git/config'])
    assert.equal(isPrivatePath(p), true, p);
  for (const p of ['/.well-known/security.txt', '/.WELL-KNOWN/security.txt', '/.well-known/acme-challenge/a1-B2_c3'])
    assert.equal(isPrivatePath(p), false, p);
  for (const p of ['/.git/config', '/.github/workflows/pages.yml', '/.gitignore', '/.nojekyll']) for (const accept of ACCEPTS) {
    const { r, body, passedOn } = await lenientGet(p, accept);
    assert.equal(r.status, 404, `${p} (${accept})`);
    assert.ok(!body.includes(SECRET), `${p} (${accept}) leaked the file`);
    assert.deepEqual(passedOn, [], `${p} (${accept})`);
  }
});

test('/.well-known/security.txt passes through to browsers and agents', async () => {
  for (const accept of [...ACCEPTS, undefined]) {
    const { r, body } = await lenientGet('/.well-known/security.txt', accept);
    assert.equal(r.status, 200, String(accept));
    assert.match(r.headers.get('Content-Type'), /^text\/plain/);
    assert.equal(body, SECURITY_TXT);
    assert.equal(r.headers.get('X-Content-Type-Options'), 'nosniff');
  }
});

test('a page address never returns an internal file as its Markdown twin', async () => {
  // /README.html maps to the twin /README.md, which must not be served.
  for (const p of ['/AGENTS.html', '/README.html', '/demos/README.html', '/logos/SOURCES.html', '/es/README.html', '/%61gents.html']) {
    const { r, body, asked } = await lenientGet(p, 'text/markdown');
    assert.equal(r.status, 404, p);
    assert.ok(!body.includes(SECRET), `${p} served an internal file as its twin`);
    assert.deepEqual(asked.filter(u => /\.md$/i.test(u) && u !== 'https://khipuai.co/404.md'), [], `${p}: asked for an internal file`);
  }
});

test('the Markdown twin lookup never leaves the site', async () => {
  // Resolving //evil.example/x.md against the request URL would name another host.
  for (const p of ['//evil.example/x.html', '//evil.example/x/', '//evil.example/x', '/%2F%2Fevil.example/x.html']) {
    const { r, body, asked } = await lenientGet(p, 'text/markdown');
    assert.equal(r.status, 404, p);
    assert.ok(!body.includes(INJECTED), `${p} served text from another host`);
    assert.ok(asked.length > 0, p);
    for (const u of asked) assert.equal(new URL(u).host, 'khipuai.co', `${p}: the worker fetched ${u}`);
  }
});

// The worker must block what the Pages workflow leaves out of the published
// site (the rsync --exclude list in .github/workflows/pages.yml: a name without
// a slash matches in every folder, a name with a slash matches the end of a
// path), plus dot files other than /.well-known/, and nothing else.
const ROOT = new URL('../', import.meta.url);
const walk = (dir = '') => readdirSync(new URL(dir, ROOT), { withFileTypes: true }).flatMap(e =>
  e.isDirectory() ? (['.git', 'node_modules', '_site'].includes(e.name) ? [] : walk(`${dir}${e.name}/`)) : [`${dir}${e.name}`]);
const REPO_FILES = walk();
const leftOutByPages = f => {
  const parts = f.split('/');
  return parts.some(p => p.startsWith('.git'))
    || parts.slice(0, -1).some(p => ['docs', 'edge', 'tools', 'tests'].includes(p))
    || ['AGENTS.md', 'README.md'].includes(parts.at(-1))
    || /(^|\/)(demos\/README|logos\/SOURCES)\.md$/.test(f);
};
const dotFile = f => f.split('/').some((p, i) => p.startsWith('.') && !(i === 0 && p === '.well-known'));

test('every file in the repository is blocked exactly when the Pages workflow leaves it out, or it is a dot file', () => {
  assert.ok(REPO_FILES.includes('index.html') && REPO_FILES.includes('AGENTS.md') && REPO_FILES.includes('edge/worker.js'));
  const wrong = [];
  for (const f of REPO_FILES) {
    const blocked = leftOutByPages(f) || dotFile(f);
    if (isPrivatePath('/' + f) !== blocked) wrong.push(`${f} should be ${blocked ? 'blocked' : 'served'}`);
  }
  assert.deepEqual(wrong, []);
});

// ---- Security headers -------------------------------------------------------

const HSTS = 'max-age=31536000; includeSubDomains';
const EXPECTED_CSP = "default-src 'self'; "
  + "script-src 'self' 'unsafe-inline' https://*.googletagmanager.com https://connect.facebook.net https://assets.calendly.com https://challenges.cloudflare.com; "
  + "style-src 'self' 'unsafe-inline' https://assets.calendly.com; "
  + "img-src 'self' data: https://*.google-analytics.com https://*.googletagmanager.com https://*.g.doubleclick.net https://www.google.com https://www.facebook.com https://assets.calendly.com; "
  + "font-src 'self' data: https://assets.calendly.com; "
  + "connect-src 'self' https://script.google.com https://script.googleusercontent.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://*.g.doubleclick.net https://www.google.com https://www.facebook.com https://connect.facebook.net https://calendly.com https://challenges.cloudflare.com; "
  + "frame-src 'self' https://calendly.com https://challenges.cloudflare.com; "
  + "object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'; upgrade-insecure-requests";
const parseCsp = value => new Map(value.split(';').map(d => d.trim().split(/\s+/)).filter(([n]) => n).map(([n, ...v]) => [n.toLowerCase(), v]));

test('HSTS is on HTML, Markdown, other files and 404s: one year, includeSubDomains, no preload', async () => {
  const cases = [['/', 'text/html'], ['/', 'text/markdown'], ['/', undefined], ['/llms.txt', 'text/markdown'], ['/llms.txt', undefined],
    ['/privacy.html', 'text/markdown'], ['/nope', 'text/html'], ['/nope', 'text/markdown'], ['/AGENTS.md', 'text/html'], ['/AGENTS.md', 'text/markdown']];
  for (const [p, accept] of cases) {
    const r = await get(p, accept);
    assert.equal(r.headers.get('Strict-Transport-Security'), HSTS, `${p} (${accept})`);
  }
  const head = await get('/', 'text/markdown', 'HEAD');
  assert.equal(head.headers.get('Strict-Transport-Security'), HSTS, 'HEAD');
});

test('the edge HSTS value replaces a weaker one from the origin', async () => {
  const weak = async () => new Response('<h1>Hi</h1>', { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Strict-Transport-Security': 'max-age=0' } });
  const r = await handle(new Request('https://khipuai.co/'), weak);
  assert.equal(r.headers.get('Strict-Transport-Security'), HSTS);
});

test('the HTML policy blocks framing, upgrades http, and allows Google Analytics 4', async () => {
  const r = await get('/', 'text/html');
  const value = r.headers.get('Content-Security-Policy');
  const csp = parseCsp(value);
  assert.equal(csp.size, value.split(';').length, 'no directive appears twice');
  assert.deepEqual(csp.get('frame-ancestors'), ["'self'"]);
  assert.deepEqual(csp.get('upgrade-insecure-requests'), []);
  assert.deepEqual(csp.get('default-src'), ["'self'"]);
  assert.deepEqual(csp.get('object-src'), ["'none'"]);
  assert.deepEqual(csp.get('base-uri'), ["'self'"]);
  assert.deepEqual(csp.get('form-action'), ["'self'"]);
  // GA4: gtag.js comes from googletagmanager.com hosts, and hits go to
  // regional google-analytics.com and analytics.google.com hosts.
  assert.ok(csp.get('script-src').includes('https://*.googletagmanager.com'));
  for (const host of ['https://*.google-analytics.com', 'https://*.analytics.google.com', 'https://*.googletagmanager.com', 'https://*.g.doubleclick.net'])
    assert.ok(csp.get('connect-src').includes(host), `connect-src ${host}`);
  for (const host of ['https://*.google-analytics.com', 'https://*.googletagmanager.com', 'https://*.g.doubleclick.net'])
    assert.ok(csp.get('img-src').includes(host), `img-src ${host}`);
  assert.equal(value, EXPECTED_CSP);
  // Every HTML answer carries it: pages, the HTML fallback for agents, and 404s.
  for (const [p, accept] of [['/nope', 'text/html'], ['/AGENTS.md', 'text/html'], ['/privacy.html', 'text/markdown']])
    assert.equal((await get(p, accept)).headers.get('Content-Security-Policy'), EXPECTED_CSP, `${p} (${accept})`);
});

test('Permissions-Policy turns off features the site never uses', async () => {
  const r = await get('/', 'text/html');
  const features = r.headers.get('Permissions-Policy').split(',').map(s => s.trim());
  for (const f of ['camera=()', 'microphone=()', 'geolocation=()', 'payment=()', 'usb=()', 'browsing-topics=()']) assert.ok(features.includes(f), f);
});

// Each page also carries its own policy in a <meta> tag. The browser enforces
// both, so the header must allow everything a page's meta policy allows, or
// deploying the worker would break that page.
const PAGES = REPO_FILES.filter(f => f.endsWith('.html') && !leftOutByPages(f) && !/^google[0-9a-f]+\.html$/.test(f));
const ENTITY = { '&#39;': "'", '&apos;': "'", '&quot;': '"', '&amp;': '&' };
const metaPolicies = html => [...html.matchAll(/<meta\b[^>]*>/gi)].map(m => m[0])
  .filter(tag => /http-equiv\s*=\s*["']?content-security-policy\b/i.test(tag))
  .map(tag => { const m = /\scontent\s*=\s*(?:"([^"]*)"|'([^']*)')/i.exec(tag); return (m ? m[1] ?? m[2] : '').replace(/&#39;|&apos;|&quot;|&amp;/g, e => ENTITY[e]); });
// Which directive governs each kind of load when a policy leaves it out (CSP Level 3).
const FALLBACK = {
  'script-src-elem': ['script-src-elem', 'script-src', 'default-src'], 'script-src-attr': ['script-src-attr', 'script-src', 'default-src'],
  'style-src-elem': ['style-src-elem', 'style-src', 'default-src'], 'style-src-attr': ['style-src-attr', 'style-src', 'default-src'],
  'img-src': ['img-src', 'default-src'], 'font-src': ['font-src', 'default-src'], 'connect-src': ['connect-src', 'default-src'],
  'media-src': ['media-src', 'default-src'], 'object-src': ['object-src', 'default-src'], 'frame-src': ['frame-src', 'child-src', 'default-src'],
  'worker-src': ['worker-src', 'child-src', 'script-src', 'default-src'], 'manifest-src': ['manifest-src', 'default-src'],
  'base-uri': ['base-uri'], 'form-action': ['form-action'],
};
const governing = (csp, kind) => { const d = FALLBACK[kind].find(x => csp.has(x)); return d === undefined ? null : csp.get(d); };
const HASH = /^'(sha256|sha384|sha512|nonce)-/i;
const HOST = /^(https?):\/\/(\*\.)?([^/:]+)(:\d+)?(\/.*)?$/i;
// Whether a header source list allows at least what one page source allows.
function headerCovers(list, source) {
  const s = source.toLowerCase(), l = list.map(x => x.toLowerCase());
  if (s === "'none'" || s === "'report-sample'") return true;
  // A hash allows one inline script; the header's 'unsafe-inline' allows all of
  // them, unless the header lists hashes itself (then 'unsafe-inline' is ignored).
  if (HASH.test(s)) return l.includes(s) || (l.includes("'unsafe-inline'") && !l.some(x => HASH.test(x)));
  const m = HOST.exec(s);
  if (!m) return l.includes(s);   // 'self', 'unsafe-inline', data: and other keywords and schemes
  return l.some(x => {
    if (x === `${m[1]}:`) return true;
    const h = HOST.exec(x);
    if (!h || h[1] !== m[1] || (h[4] ?? '') !== (m[4] ?? '')) return false;
    const hostOk = h[2] ? (m[3] === h[3] ? Boolean(m[2]) : m[3].endsWith(`.${h[3]}`)) : (!m[2] && m[3] === h[3]);
    return hostOk && (!h[5] || (m[5] ?? '').startsWith(h[5]));
  });
}

test('the header policy allows everything each page\'s own policy allows', async () => {
  const header = parseCsp((await get('/', 'text/html')).headers.get('Content-Security-Policy'));
  const problems = [];
  let checked = 0;
  for (const f of PAGES) {
    const metas = metaPolicies(readFileSync(new URL(f, ROOT), 'utf8'));
    if (metas.length !== 1) continue;   // tests/csp.test.mjs requires exactly one per page
    checked++;
    const page = parseCsp(metas[0]);
    for (const kind of Object.keys(FALLBACK)) {
      const pageList = governing(page, kind), headerList = governing(header, kind);
      if (headerList === null) continue;
      if (pageList === null) { problems.push(`${f}: the page sets no limit for ${kind}, but the header does`); continue; }
      for (const s of pageList)
        if (!headerCovers(headerList, s)) problems.push(`${f}: its policy allows ${s} for ${kind}; add it to the CSP in edge/worker.js`);
    }
  }
  assert.ok(checked > 0, 'no page carries a CSP meta tag to compare with');
  assert.deepEqual(problems, []);
});

test('headerCovers matches CSP sources the way browsers do', () => {
  assert.equal(headerCovers(['https://*.googletagmanager.com'], 'https://www.googletagmanager.com'), true);
  assert.equal(headerCovers(['https://*.googletagmanager.com'], 'https://*.googletagmanager.com'), true);
  assert.equal(headerCovers(['https://*.googletagmanager.com'], 'https://googletagmanager.com'), false);
  assert.equal(headerCovers(['https://www.google.com'], 'https://*.google.com'), false);
  assert.equal(headerCovers(['https://challenges.cloudflare.com'], 'https://challenges.cloudflare.com/turnstile/v0/api.js'), true);
  assert.equal(headerCovers(["'self'", "'unsafe-inline'"], "'sha256-abc='"), true);
  assert.equal(headerCovers(["'self'", "'unsafe-inline'", "'sha256-xyz='"], "'sha256-abc='"), false);
  assert.equal(headerCovers(["'self'"], 'data:'), false);
  assert.equal(headerCovers(["'self'"], "'none'"), true);
});
