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
  ['solution-design/index.html', 'en'], ['es/solution-design/index.html', 'es'],
  ['self-assessment/index.html', 'en'], ['thank-you/index.html', 'en'],
  ['portal/index.html', 'en'], ['es/portal/index.html', 'es'],
  ['es/contact/index.html', 'es'], ['es/privacy/index.html', 'es'],
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

// Launch readiness: every trial page (and the homepages, demos and 404) has
// a title, a description and the icons; shareable pages carry Open Graph
// tags with an existing image of the page's language.
const HOMES = [['index.html', 'en'], ['es/index.html', 'es']];
const DEMOS = ['payroll', 'aca', 'hub', 'review', 'support', 'materials', 'whatsapp'].map(k => [`demos/${k}/index.html`]);
for (const [path, lang] of [...PAGES, ...HOMES, ...DEMOS, ['404.html']]) {
  test(`trial page ${path}: title, description and icons`, () => {
    const html = readFileSync(new URL(path, ROOT), 'utf8');
    const title = html.match(/<title>([^<]+)<\/title>/)?.[1] || '';
    assert.ok(title.includes('KHIPUAI') && !/trial|prueba/i.test(title), `title "${title}"`);
    assert.match(html, /<meta name="description" content="[^"]{40,}">/);
    assert.match(html, /<link rel="icon" href="\/shared\/assets\/mark\.svg"/);
    assert.match(html, /<link rel="apple-touch-icon" href="\/concepts\/basic\/icons\/apple-touch-icon\.png">/);
    if (!lang) return;
    for (const prop of ['og:title', 'og:description', 'og:image']) assert.match(html, new RegExp(`<meta property="${prop}" content="[^"]+">`), prop);
    const img = html.match(/<meta property="og:image" content="https:\/\/khipuai\.co\/concepts\/basic\/og\/og-(en|es)\.png">/);
    assert.ok(img, 'og:image path'); assert.equal(img[1], lang);
    assert.ok(existsSync(new URL(`og/og-${lang}.png`, ROOT)));
  });
}

test('no duplicate titles across the trial pages', () => {
  const titles = [...PAGES, ...HOMES, ...DEMOS].map(([p]) => readFileSync(new URL(p, ROOT), 'utf8').match(/<title>([^<]+)<\/title>/)[1]);
  assert.equal(new Set(titles).size, titles.length, titles.join(' / '));
});

// Alex, 2026-10-20: one shared address on the site, no personal ones, and
// no name-dropping in everyday lines (people are named where they are
// introduced); "remotely" is not part of the studio line.
test('trial pages use the shared address and neutral everyday lines', () => {
  for (const [path] of [...PAGES, ...HOMES, ['404.html']]) {
    const html = readFileSync(new URL(path, ROOT), 'utf8');
    for (const m of html.matchAll(/[a-z.]+@khipuai\.co/g)) assert.equal(m[0], 'hello@khipuai.co', path);
    assert.doesNotMatch(html, /Wil will|Wil can|Email Wil|escribe a Wil/, path);
    assert.doesNotMatch(html, /work remotely|de forma remota con empresas/, path);
  }
  const tone = readFileSync(new URL('tone.js', ROOT), 'utf8');
  assert.match(tone, /'wil@khipuai\.co': 'hello@khipuai\.co'/);
  assert.match(tone, /studio serving clients across the United States and Canada\.'/);
});

// Solution Design replaces the audit (Alex, 2026-10-20): the old trial
// addresses forward to the new pages, and no visible text says "audit".
test('the old audit addresses forward to Solution Design', () => {
  for (const [path, to] of [['audit/index.html', '/concepts/basic/solution-design/'], ['es/audit/index.html', '/concepts/basic/es/solution-design/']]) {
    const html = readFileSync(new URL(path, ROOT), 'utf8');
    assert.match(html, new RegExp(`<meta http-equiv="refresh" content="0; url=${to}">`));
    assert.match(html, /noindex/);
  }
});
test('no page names the service an audit', () => {
  for (const [path] of [...PAGES, ...HOMES, ['404.html']]) {
    const text = readFileSync(new URL(path, ROOT), 'utf8').replace(/<!--[\s\S]*?-->/g, '').replace(/href="[^"]*"/g, '');
    assert.doesNotMatch(text, /audit|auditor/i, path);
  }
  for (const f of ['labels.js', 'self-assessment/quiz.js']) assert.doesNotMatch(readFileSync(new URL(f, ROOT), 'utf8'), /\baudit\b|auditoría/i, f);
});
