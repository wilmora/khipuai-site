// Static checks for what AI agents read without running JavaScript.
// Run: node --test tests/   (also run `python tools/prerender.py --check`
// to confirm the no-JavaScript copy matches the current content).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const ROOT = new URL('../', import.meta.url);
const read = p => readFileSync(new URL(p, ROOT), 'utf8');

// Visible text a non-JS reader gets from the body: scripts, styles and tags
// removed, whitespace collapsed.
function rawText(html) {
  const body = html.split(/<body[^>]*>/i)[1] ?? html;
  return body
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
const headings = html => {
  const body = (html.split(/<body[^>]*>/i)[1] ?? html).replace(/<script[\s\S]*?<\/script>/gi, '');
  return [...body.matchAll(/<h([1-6])[\s>]/gi)].map(m => Number(m[1]));
};
const jsonLd = html => [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  .map(m => JSON.parse(m[1]));

const PRERENDERED = ['index.html', 'es/index.html', 'about/index.html'];

for (const page of PRERENDERED) {
  test(`${page}: readable without JavaScript`, () => {
    const html = read(page);
    assert.ok(html.includes('<!-- prerender:start -->') && html.includes('<!-- prerender:end -->'));
    assert.ok(rawText(html).length >= 500, `only ${rawText(html).length} chars`);
  });

  test(`${page}: one H1 and no skipped heading levels`, () => {
    const levels = headings(read(page));
    assert.equal(levels.filter(l => l === 1).length, 1);
    assert.equal(levels[0], 1);
    for (let i = 1; i < levels.length; i++) {
      assert.ok(levels[i] <= levels[i - 1] + 1, `h${levels[i - 1]} followed by h${levels[i]}`);
    }
  });

  test(`${page}: the copy is hidden once JavaScript runs`, () => {
    assert.match(read(page), /<script>document\.documentElement\.classList\.add\("js"\)<\/script>/);
  });
}

test('kinetic.css hides the no-JavaScript copy for script-enabled visitors', () => {
  assert.match(read('shared/kinetic.css'), /\.js \.prerender\{display:none\}/);
});

for (const md of ['index.md', 'es/index.md', 'about/index.md', 'contact/index.md']) {
  test(`${md}: Markdown twin exists with an H1`, () => {
    const s = read(md);
    assert.ok(s.length >= 500);
    assert.match(s, /^# \S/m);
  });
}

test('404.md explains the error and links to llms.txt and the sitemap', () => {
  const s = read('404.md');
  assert.ok(s.length >= 20);
  assert.match(s, /https:\/\/khipuai\.co\/llms\.txt/);
  assert.match(s, /https:\/\/khipuai\.co\/sitemap\.xml/);
});

test('404.html exists for GitHub Pages and links to llms.txt', () => {
  const s = read('404.html');
  assert.match(s, /href="\/llms\.txt"/);
  assert.match(s, /noindex/);
});

for (const page of ['about/index.html', 'contact/index.html', 'privacy.html']) {
  test(`${page}: trust page has at least 500 characters without JavaScript`, () => {
    assert.ok(rawText(read(page)).length >= 500);
  });
}

test('llms.txt follows the llmstxt.org shape and says when to use KHIPUAI', () => {
  const s = read('llms.txt');
  const lines = s.split('\n');
  assert.match(lines[0], /^# KHIPUAI$/);
  assert.ok(lines.some(l => l.startsWith('> ')), 'needs a blockquote summary');
  assert.match(s, /^## When to use KHIPUAI$/m);
  assert.match(s, /^## How an agent should engage$/m);
  assert.match(s, /https:\/\/khipuai\.co\/contact\//);
  assert.doesNotMatch(s, /self_assessment\.html/, 'old self-assessment URL');
  assert.doesNotMatch(s, /—/, 'no em dashes');
});

test('sitemap lists the contact page', () => {
  assert.match(read('sitemap.xml'), /<loc>https:\/\/khipuai\.co\/contact\/<\/loc>/);
});

test('every Person in JSON-LD has a description and jobTitle, worksFor or sameAs', () => {
  const people = [];
  const collect = n => {
    if (!n || typeof n !== 'object') return;
    if (Array.isArray(n)) return n.forEach(collect);
    if (n['@type'] === 'Person') people.push(n);
    Object.values(n).forEach(collect);
  };
  for (const page of ['index.html', 'es/index.html', 'about/index.html', 'contact/index.html']) {
    jsonLd(read(page)).forEach(collect);
  }
  const founders = people.filter(p => p.name === 'Wil Mora');
  assert.ok(founders.length >= 3);
  for (const p of founders) {
    assert.ok(p.description && p.description.length > 20, 'description');
    assert.ok(p.jobTitle || p.worksFor || p.sameAs, 'jobTitle / worksFor / sameAs');
  }
});

test('pages advertise their Markdown twin', () => {
  for (const [page, md] of [['index.html', '/index.md'], ['es/index.html', '/es/index.md'],
    ['about/index.html', '/about/index.md'], ['contact/index.html', '/contact/index.md']]) {
    assert.ok(read(page).includes(`<link rel="alternate" type="text/markdown" href="${md}">`), page);
    assert.ok(existsSync(new URL(md.slice(1), ROOT)), md);
  }
});
