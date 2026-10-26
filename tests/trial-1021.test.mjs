// Website changes from Alex and Wil's meeting, 2026-10-21 (ORD-20261021-02):
// held sections, the held miniatures, the renamed sales assistant, the pager
// and the wording that was removed. Run: node --test tests/*.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { PROJECTS } from '../projects.js';
import { LABELS } from '../labels.js';

const ROOT = new URL('../', import.meta.url);
const read = p => readFileSync(new URL(p, ROOT), 'utf8');
const PAGES = ['index.html', 'es/index.html', 'about/index.html', 'es/about/index.html', 'security/index.html', 'es/security/index.html',
  'solution-design/index.html', 'es/solution-design/index.html', 'contact/index.html', 'es/contact/index.html',
  'self-assessment/index.html', 'thank-you/index.html', 'privacy/index.html', 'es/privacy/index.html', '404.html'];

test('Integrations and Build your portal are held back, with the code kept', () => {
  const js = read('basic.js');
  assert.match(js, /const SHOW_INTEGRATIONS = false;/);
  assert.match(js, /const SHOW_PORTAL = false;/);
  assert.match(js, /if \(!SHOW_INTEGRATIONS\) return;/);
  for (const L of [LABELS.en, LABELS.es]) {
    const names = L.integrations.map(([n]) => n).join(' ');
    assert.match(names, /WhatsApp/); assert.match(names, /GitHub/); assert.match(names, /3D/);
  }
  assert.ok(existsSync(new URL('portal/index.html', ROOT)), 'the portal page code stays');
  for (const p of PAGES) assert.doesNotMatch(read(p), /href="[^"]*portal\//, `${p} links to Build your portal`);
});

test('the billing agent card is held back; the sales assistant is named for what it does', () => {
  for (const lang of ['en', 'es']) {
    const items = PROJECTS[lang].items;
    assert.equal(items.find(x => x.key === 'review').hidden, true);
    const wa = items.find(x => x.key === 'whatsapp');
    assert.match(wa.t, lang === 'en' ? /^WhatsApp sales and orders assistant$/i : /^Asistente de ventas y pedidos por WhatsApp$/);
    assert.match(wa.who, lang === 'en' ? /never confirms a payment/ : /nunca confirma un pago/);
    for (const x of items) assert.match(x.home, /^#\//, `${x.key} has a home address`);
  }
});

test('the miniatures are held at Home, and only KHIPUAI\'s own is published', () => {
  const mini = read('demos/mini.js');
  assert.match(mini, /export const HOLD = true;/);
  assert.match(mini, /if \(HOLD\) hold\(\);/);
  // Client work waits for each client's permission (Wil, 2026-10-26).
  const own = PROJECTS.en.items.filter(x => x.key === 'support').map(x => x.key);
  assert.deepEqual(readdirSync(new URL('demos/', ROOT), { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name), own);
});

test('no screenshots on the portfolio cards', () => {
  assert.ok(!existsSync(new URL('shots/', ROOT)), 'no client screenshots published');
  assert.match(read('basic.js'), /const SHOW_SHOTS = false;/);
});

test('only Privacy scrolls; every other page is paged', () => {
  assert.match(read('pager.js'), /export function mountPager/);
  assert.match(read('basic.js'), /classList\.contains\('scroll'\)\) mountPager/);
  for (const p of PAGES.filter(p => p.includes('/') && !p.startsWith('404'))) {
    const scrolls = /class="doc scroll"/.test(read(p));
    assert.equal(scrolls, /privacy/.test(p), `${p}: ${scrolls ? 'scrolls' : 'paged'}`);
  }
  for (const L of [LABELS.en, LABELS.es]) for (const k of ['pages', 'back', 'next', 'page']) assert.ok(L.pager[k], k);
});

test('the removed wording stays removed', () => {
  const text = PAGES.map(read).join('\n') + read('labels.js');
  assert.doesNotMatch(text, /finance-grade|nivel financiero|Accuracy-checked|Precisión verificada|GREEN \/ YELLOW \/ RED|concrete plan|plan corto y concreto|and who it is not for|y para quién no/);
  const tone = read('tone.js');
  assert.match(tone, /'No new platform forced on you\.': 'Centralize all your applications in one place\.'/);
  assert.match(tone, /You lead a 20 to 300-person recurring-service business with complex back-office work\./);   // in the drop list
  assert.doesNotMatch(read('basic.js'), /C\.fit\.notForYou/);
  assert.equal(LABELS.en.get[1] + ' ' + LABELS.en.get[2], 'An action plan to put in place.');
});
