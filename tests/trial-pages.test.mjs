// Checks for the trial's other pages (concepts/basic/<page>/): the live pages
// in the trial homepage's look. Run: node --test tests/*.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const ROOT = new URL('../concepts/basic/', import.meta.url);
const PAGES = [
  ['about/index.html', 'en'], ['es/about/index.html', 'es'],
  ['security/index.html', 'en'], ['es/security/index.html', 'es'],
  ['contact/index.html', 'en'], ['privacy/index.html', 'en'],
  ['audit/index.html', 'en'], ['es/audit/index.html', 'es'],
  ['self-assessment/index.html', 'en'], ['thank-you/index.html', 'en'],
  ['portal/index.html', 'en'], ['es/portal/index.html', 'es'],
];

for (const [path, lang] of PAGES) {
  test(`trial page ${path}: noindex, shared look, nothing sent`, () => {
    const url = new URL(path, ROOT);
    assert.ok(existsSync(url), `missing concepts/basic/${path}`);
    const html = readFileSync(url, 'utf8');
    assert.match(html, new RegExp(`<html lang="${lang}" class="doc">`));
    assert.match(html, /<meta name="robots" content="noindex, nofollow">/);
    assert.match(html, /basic\.css">/);
    assert.match(html, /page\.css">/);
    assert.match(html, /<nav class="nav" id="nav"/);
    assert.match(html, new RegExp(`page\\(C, LABELS\\.${lang}, '`));
    assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, 'exactly one h1');
    assert.doesNotMatch(html, /googletagmanager|gtag\(|meta-pixel|fbq\(|script\.google|fetch\(|sendBeacon|application\/ld\+json/, 'no analytics, structured data or sending');
    assert.ok(!html.includes('—'), 'no em dash');
  });
}
