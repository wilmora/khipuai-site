// Build your portal (concepts/basic/portal/): draft pricing in one data file,
// deterministic plan rules, English and Spanish parity, nothing sent.
// Run: node --test tests/*.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PRICING, TEMPLATES, REGIONS, estimate, clampCount } from '../concepts/basic/portal/plans.js';
import { TEXT } from '../concepts/basic/portal/text.js';

const all = key => TEMPLATES.find(t => t.key === key).features.map(f => f.key);
const core = key => TEMPLATES.find(t => t.key === key).features.filter(f => !f.custom).map(f => f.key);

test('six starting templates, each with a custom feature', () => {
  assert.deepEqual(TEMPLATES.map(t => t.key), ['hr', 'sales', 'billing', 'compliance', 'support', 'materials']);
  for (const t of TEMPLATES) assert.ok(t.features.some(f => f.custom), t.key);
});

test('pricing is draft: the portal $100 a month in the region currency, hosting not set', () => {
  assert.equal(PRICING.draft, true);
  assert.equal(PRICING.portalMonthly, 100);
  assert.deepEqual(PRICING.currency, { us: 'USD', ca: 'CAD' });
  assert.equal(PRICING.hostingMonthly, null);
  assert.deepEqual(REGIONS, ['us', 'ca']);
});

test('Option A by default, in the region currency', () => {
  const us = estimate({ template: 'hr', features: core('hr'), region: 'us', users: 10, locations: 1 });
  assert.equal(us.plan, 'a'); assert.equal(us.portalMonthly, 100); assert.equal(us.hostingMonthly, null); assert.equal(us.currency, 'USD'); assert.equal(us.draft, true);
  const ca = estimate({ template: 'hr', features: core('hr'), region: 'ca', users: 10, locations: 1 });
  assert.equal(ca.currency, 'CAD'); assert.equal(ca.portalMonthly, 100);
});

test('a custom feature adds custom work; above the limits is Enterprise', () => {
  const c = estimate({ template: 'billing', features: all('billing'), region: 'us', users: 5, locations: 1 });
  assert.equal(c.plan, 'custom'); assert.deepEqual(c.custom, ['accounting']); assert.equal(c.portalMonthly, 100);
  for (const [users, locations] of [[PRICING.enterprise.users + 1, 1], [1, PRICING.enterprise.locations + 1]]) {
    const e = estimate({ template: 'sales', features: [], region: 'ca', users, locations });
    assert.equal(e.plan, 'enterprise'); assert.equal(e.portalMonthly, null);
  }
  // Exactly at the limits is still Option A (lowest and highest non-enterprise scope).
  assert.equal(estimate({ template: 'sales', features: [], region: 'us', users: 1, locations: 1 }).plan, 'a');
  assert.equal(estimate({ template: 'sales', features: [], region: 'us', users: PRICING.enterprise.users, locations: PRICING.enterprise.locations }).plan, 'a');
});

test('bad input falls back safely', () => {
  const e = estimate({ template: 'nope', features: ['payroll', 'zzz'], region: 'mx', users: 'abc', locations: -4 });
  assert.equal(e.template, 'hr'); assert.equal(e.region, 'us'); assert.equal(e.users, 1); assert.equal(e.locations, 1);
  assert.deepEqual(e.features, ['payroll']);
  assert.equal(clampCount(99999, [1, 5000]), 5000);
  assert.equal(clampCount(2.7, [1, 5000]), 2);
});

test('English and Spanish wording has the same shape and covers every key', () => {
  const shape = o => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, v && typeof v === 'object' && !Array.isArray(v) ? shape(v) : Array.isArray(v) ? v.length : typeof v]));
  assert.deepEqual(shape(TEXT.es), shape(TEXT.en));
  for (const lang of ['en', 'es']) {
    const T = TEXT[lang];
    for (const t of TEMPLATES) {
      assert.ok(T.templates[t.key], `${lang} template ${t.key}`);
      for (const f of t.features) assert.ok(T.features[f.key], `${lang} feature ${f.key}`);
    }
    const words = JSON.stringify(T);
    assert.ok(!words.includes('\u2014'), `${lang}: no em dash`);
  }
  assert.equal(TEXT.en.plans.a[1], 'Build it with us in one sitting');
  assert.equal(TEXT.en.contact, 'Contact us');
  assert.equal(TEXT.en.quoted, 'Quoted separately');
  assert.equal(TEXT.en.perMonth(100, 'USD'), '$100 USD / month');
  assert.equal(TEXT.es.perMonth(100, 'CAD'), '$100 CAD / mes');
  assert.equal(TEXT.en.hostingTbc, 'To be confirmed / month');
  assert.equal(TEXT.en.rows.hosting, 'Hosting (we run the server for you)');
});

test('the configurator sends and stores nothing', () => {
  const src = ['portal.js', 'plans.js', 'text.js'].map(f => readFileSync(new URL(`../concepts/basic/portal/${f}`, import.meta.url), 'utf8')).join('\n');
  assert.doesNotMatch(src, /fetch\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|indexedDB|document\.cookie|<form|\.submit\(/);
});
