// Unit tests for edge/worker.js. Run: node --test tests/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handle, prefersMarkdown, markdownPath } from '../edge/worker.js';

// A fake GitHub Pages origin: a few files, 404 for the rest, Vary like Pages.
const FILES = {
  '/': ['text/html; charset=utf-8', '<h1>Home</h1>'],
  '/index.md': ['text/markdown; charset=utf-8', '# Home\n\nHello agents.\n'],
  '/privacy.html': ['text/html; charset=utf-8', '<h1>Privacy</h1>'],
  '/404.md': ['text/markdown; charset=utf-8', '# 404: Page not found\n\n[llms.txt](https://khipuai.co/llms.txt)\n'],
  '/llms.txt': ['text/plain; charset=utf-8', '# KHIPUAI'],
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

test('homepage returns Markdown with Vary: Accept', async () => {
  const r = await get('/', 'text/markdown');
  assert.equal(r.status, 200);
  assert.match(r.headers.get('Content-Type'), /^text\/markdown/);
  assert.match(r.headers.get('Vary'), /\bAccept\b/);
  const body = await r.text();
  assert.ok(body.startsWith('# Home'));
});

test('homepage returns HTML for browsers, with Vary: Accept added', async () => {
  const r = await get('/', 'text/html');
  assert.equal(r.status, 200);
  assert.match(r.headers.get('Content-Type'), /^text\/html/);
  assert.equal(r.headers.get('Vary'), 'Accept-Encoding, Accept');
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

test('non-HTML files pass through untouched', async () => {
  const r = await get('/llms.txt', 'text/markdown');
  assert.equal(r.status, 200);
  assert.equal(r.headers.get('Vary'), 'Accept-Encoding');
});

test('HEAD gets Markdown headers and no body', async () => {
  const r = await get('/', 'text/markdown', 'HEAD');
  assert.equal(r.status, 200);
  assert.match(r.headers.get('Content-Type'), /^text\/markdown/);
  assert.equal(await r.text(), '');
});
