// Checks for the portfolio miniatures (concepts/basic/demos/<key>/): one
// static copy per real app, shown in the Learn more dialog.
// Run: node --test tests/*.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';

const DIR = new URL('../concepts/basic/demos/', import.meta.url);
const { PROJECTS } = await import(new URL('../projects.js', DIR));
const KEYS = PROJECTS.en.items.map(x => x.key);

const walk = url => readdirSync(url).flatMap(name => {
  const u = new URL(name, url);
  return statSync(u).isDirectory() ? walk(new URL(`${name}/`, url)) : [u];
});
const TEXT = /\.(html|js|css|md)$/;
// Client brands, people and codes that must never appear in the public repo.
const FORBIDDEN = /tesseon|apusito|\bapus\b|gastineau|\bglh\b|log homes|factoa|kestrel|riverside|northgate|meadowlark|krissie|\b110[0-9]\b|\b1120\b/i;

test('the dialog text matches in English and Spanish', () => {
  const [en, es] = [PROJECTS.en, PROJECTS.es];
  assert.deepEqual(Object.keys(en).sort(), Object.keys(es).sort());
  assert.deepEqual(en.items.map(x => [x.key, x.app, x.shots.length, (x.alt || []).length]), es.items.map(x => [x.key, x.app, x.shots.length, (x.alt || []).length]));
  for (const k of ['frameLabel', 'frameTitle', 'frameNote', 'openFull', 'view', 'demoView', 'shotsView']) assert.ok(en[k] && es[k], k);
  assert.ok(en.frameTitle.includes('{app}') && es.frameTitle.includes('{app}'));
});

for (const key of KEYS) {
  test(`miniature ${key}: a static, noindex page`, () => {
    const page = new URL(`${key}/index.html`, DIR);
    assert.ok(existsSync(page), `missing demos/${key}/index.html`);
    const html = readFileSync(page, 'utf8');
    assert.match(html, /<meta name="robots" content="noindex, nofollow">/);
    assert.match(html, /<title>[^<]+ demo \| KHIPUAI<\/title>/);
    assert.match(html, /href="\.\.\/mini\.css"/);
    assert.match(html, /<script type="module" src="app\.js"><\/script>/);
    assert.ok(existsSync(new URL(`${key}/app.js`, DIR)) && existsSync(new URL(`${key}/app.css`, DIR)));
    assert.match(readFileSync(new URL(`${key}/app.js`, DIR), 'utf8'), /from '\.\.\/mini\.js'/);
  });
}

test('no miniature talks to a server, embeds a page or names a client', () => {
  const files = walk(DIR).filter(u => TEXT.test(u.pathname));
  assert.ok(files.length > 0);
  for (const u of files) {
    const src = readFileSync(u, 'utf8'), name = u.pathname.split('/demos/')[1];
    // Licence comments in compiled CSS (Tailwind's MIT notice) name a URL but load nothing.
    const code = /\.css$/.test(u.pathname) ? src.replace(/\/\*[\s\S]*?\*\//g, '') : src;
    assert.doesNotMatch(code.replaceAll('http://www.w3.org/2000/svg', ''), /https?:\/\//, `${name}: outside URL`);
    assert.doesNotMatch(src, /\bfetch\(|XMLHttpRequest|WebSocket|sendBeacon|<iframe|@import/, `${name}: network call or embed`);
    assert.doesNotMatch(src, FORBIDDEN, `${name}: client name or code`);
    assert.ok(!src.includes('—'), `${name}: em dash`);
  }
});

test('notes for actions the demo does not perform use the agreed wording', () => {
  for (const u of walk(DIR).filter(u => /\.js$/.test(u.pathname))) {
    const src = readFileSync(u, 'utf8');
    for (const [, s] of src.matchAll(/data-real="([^"$]{12,})"/g))
      assert.match(s, /^(In the real product this would|En el producto real, esto)/, `${u.pathname.split('/demos/')[1]}: ${s.slice(0, 60)}`);
  }
});
