// Checks for the portfolio click-through demos (concepts/basic/demos/).
// Run: node --test tests/*.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const DIR = new URL('../concepts/basic/demos/', import.meta.url);
const { KIT } = await import(new URL('kit.js', DIR));
const { PROJECTS } = await import(new URL('../projects.js', DIR));
const KEYS = PROJECTS.en.items.map(x => x.key);

// Same keys, same array lengths, no empty strings, all the way down.
function sameShape(a, b, path) {
  assert.equal(typeof a, typeof b, `${path}: type differs`);
  if (Array.isArray(a)) {
    assert.ok(Array.isArray(b), `${path}: not an array in both`);
    assert.equal(a.length, b.length, `${path}: length differs`);
    a.forEach((x, i) => sameShape(x, b[i], `${path}[${i}]`));
  } else if (a && typeof a === 'object') {
    assert.deepEqual(Object.keys(a).sort(), Object.keys(b).sort(), `${path}: keys differ`);
    for (const k of Object.keys(a)) sameShape(a[k], b[k], `${path}.${k}`);
  } else if (typeof a === 'string') {
    assert.ok(a.trim() && b.trim(), `${path}: empty string`);
  }
}
const strings = o => typeof o === 'string' ? [o] : o && typeof o === 'object' ? Object.values(o).flatMap(strings) : [];

test('demo kit strings match in English and Spanish', () => sameShape(KIT.en, KIT.es, 'KIT'));

test('every portfolio project has a demo file', () => {
  for (const k of KEYS) assert.ok(existsSync(new URL(`${k}.js`, DIR)), `missing demos/${k}.js`);
});

for (const key of KEYS) {
  test(`demo ${key}: tabs, Spanish parity and safe content`, async () => {
    const src = readFileSync(new URL(`${key}.js`, DIR), 'utf8');
    const def = (await import(new URL(`${key}.js`, DIR))).default;
    assert.equal(def.key, key);
    assert.ok(def.tabs.length >= 3 && def.tabs.length <= 5, 'three to five tabs');
    sameShape(def.t.en, def.t.es, `${key}.t`);
    for (const lang of ['en', 'es']) {
      const t = def.t[lang];
      for (const tab of def.tabs) {
        assert.ok(t.tabs[tab], `${lang}: no label for tab ${tab}`);
        const html = def.view[tab](def.init(lang), t, lang);
        assert.doesNotMatch(html, /undefined|NaN|\[object/, `${lang} ${tab}: broken output`);
        for (const [, k] of html.matchAll(/data-real="(\w+)"/g)) assert.ok(t.real[k], `${lang} ${tab}: no note for ${k}`);
        for (const [, a] of html.matchAll(/data-act="(\w+)"/g)) assert.equal(typeof def.act[a], 'function', `${tab}: no action ${a}`);
      }
      const opener = lang === 'en' ? 'In the real product this would ' : 'En el producto real, esto ';
      for (const note of Object.values(t.real)) assert.ok(note.startsWith(opener), `${lang}: note must start "${opener}"`);
      for (const s of strings(t)) assert.ok(!s.includes('—'), `${lang}: em dash in "${s}"`);
    }
    // Nothing is sent or fetched, and nothing from a client app appears.
    assert.doesNotMatch(src, /fetch\(|XMLHttpRequest|WebSocket|sendBeacon|<iframe|https?:\/\//, 'no network calls or embeds');
    assert.doesNotMatch(src, /tesseon|apusito|apus\b|gastineau|factoa|sunlu|kestrel|riverside|northgate|\b11[0-2]\d\b/i, 'no client names or codes');
  });
}
