// Guards for the three high-risk findings of the 2026-11-04 review:
// client names in the public repository, local file links in what ships,
// and deploys that skip the tests.
// Run: node --test tests/*.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { confidentialLines } from './confidential.mjs';

const ROOT = new URL('../', import.meta.url);
const SKIP_DIRS = new Set(['.git', 'node_modules', '_site']);

// Every file in the working copy, as paths relative to the repository root.
const walk = (dir = '') => readdirSync(new URL(dir, ROOT), { withFileTypes: true }).flatMap(e =>
  e.isDirectory() ? (SKIP_DIRS.has(e.name) ? [] : walk(`${dir}${e.name}/`)) : [`${dir}${e.name}`]);
const FILES = walk();
const TEXT = /\.(html?|m?js|cjs|css|md|txt|json|xml|gs|toml|ya?ml|svg|csv|webmanifest)$/i;
const read = f => readFileSync(new URL(f, ROOT), 'utf8');

// What the Pages workflow leaves out of the published site (pages.yml rsync).
const UNPUBLISHED = /^(\.git|AGENTS\.md$|README\.md$|demos\/README\.md$|logos\/SOURCES\.md$|docs\/|edge\/|tools\/|tests\/)/;
const SHIPPED = FILES.filter(f => !UNPUBLISHED.test(f));

// Link targets inside a PDF. Link annotations are stored uncompressed, as
// /URI (literal) or /URI <hex> strings, so they can be read without a PDF
// library. Literal strings may escape any byte as octal (\072 is ":"), which
// is how some tools write them, so escapes are decoded before any check.
const ESC = { n: '\n', r: '\r', t: '\t', b: '\b', f: '\f', '(': '(', ')': ')', '\\': '\\' };
const literal = s => s.replace(/\\([0-7]{1,3}|[nrtbf()\\]|\r?\n)/g, (m, e) => /^[0-7]/.test(e) ? String.fromCharCode(parseInt(e, 8)) : ESC[e] ?? '');
const hex = s => { const h = s.replace(/\s+/g, ''); return (h.length % 2 ? h + '0' : h).replace(/../g, b => String.fromCharCode(parseInt(b, 16))); };
const pdfLinks = f => [...readFileSync(new URL(f, ROOT)).toString('latin1').matchAll(/\/URI\s*(?:\(((?:\\[\s\S]|[^\\)])*)\)|<([0-9A-Fa-f\s]*)>)/g)]
  .map(m => (m[1] !== undefined ? literal(m[1]) : hex(m[2])));

// A path on someone's own computer: file:/// links, Windows and macOS user folders.
const LOCAL = /file:\/\/\/|\b[A-Za-z]:[\\/]Users[\\/]|\/Users\/[^/\s"')]+\//;

test('no client name appears anywhere in the repository', () => {
  const found = [];
  for (const f of FILES.filter(f => TEXT.test(f))) {
    const lines = confidentialLines(read(f));
    if (lines.length) found.push(`${f}:${lines.join(',')}`);
  }
  for (const f of FILES.filter(f => /\.pdf$/i.test(f)))
    if (confidentialLines(pdfLinks(f).join('\n')).length) found.push(`${f}: a link names a client`);
  assert.deepEqual(found, [], 'Client names (listed as hashes in tests/confidential.mjs) on these lines');
});

test('nothing that ships links to a file on someone\'s computer', () => {
  const found = SHIPPED.filter(f => TEXT.test(f) && LOCAL.test(read(f)));
  for (const f of SHIPPED.filter(f => /\.pdf$/i.test(f)))
    if (pdfLinks(f).some(u => LOCAL.test(u))) found.push(f);
  assert.deepEqual(found, []);
});

test('every link in a published PDF is a public https or mailto address', () => {
  const pdfs = SHIPPED.filter(f => /\.pdf$/i.test(f));
  assert.ok(pdfs.includes('self-assessment.pdf'), 'the self-assessment PDF is published');
  for (const f of pdfs) {
    const links = pdfLinks(f);
    for (const u of links) assert.match(u, /^(https:\/\/|mailto:)/, `${f}: ${u}`);
  }
  // The worksheet's booking button goes to the same booking page as the site.
  assert.ok(pdfLinks('self-assessment.pdf').some(u => u.startsWith('https://calendly.com/wmorapal/30min')), 'booking link');
});

test('the Pages workflow runs the tests before it deploys', () => {
  const wf = read('.github/workflows/pages.yml');
  assert.match(wf, /^  test:\n/m, 'a test job');
  assert.match(wf, /run: node --test tests\/\*\.test\.mjs/, 'the test job runs the site tests');
  assert.match(wf, /^  deploy:\n    needs: test\n/m, 'deploy waits for the tests');
  assert.match(wf, /^permissions:\n  contents: read\n\n/m, 'read-only token by default');
  // Each pages.yml exclude and UNPUBLISHED above must name the same paths.
  for (const p of ['AGENTS.md', 'README.md', 'demos/README.md', 'logos/SOURCES.md', 'docs/', 'edge/', 'tools/', 'tests/'])
    assert.ok(wf.includes(`--exclude='${p}'`), `pages.yml leaves out ${p}`);
});
