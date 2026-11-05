// Guards for the three high-risk findings of the 2026-11-04 review:
// client names in the public repository, local file links in what ships,
// and deploys that skip the tests. Also what the Pages workflow publishes:
// the held portal stays out, and security.txt (how to report a
// vulnerability) goes in and stays current.
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
// rsync reads 'portal/' (no leading slash) as a folder named portal at any
// depth, so it leaves out portal/ and es/portal/; the last pattern does too.
const UNPUBLISHED = /^(\.git|AGENTS\.md$|README\.md$|demos\/README\.md$|logos\/SOURCES\.md$|docs\/|edge\/|tools\/|tests\/|(.*\/)?portal\/)/;
const SHIPPED = FILES.filter(f => !UNPUBLISHED.test(f));
// The addresses GitHub Pages answers for those files. A folder's index.html
// also answers at the folder itself (es/index.html at /es/).
const ROUTES = SHIPPED.flatMap(f => [`/${f}`, ...(/(^|\/)index\.html$/.test(f) ? [`/${f.slice(0, -'index.html'.length)}`] : [])]);

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
  const LEFT_OUT = ['AGENTS.md', 'README.md', 'demos/README.md', 'logos/SOURCES.md', 'docs/', 'edge/', 'tools/', 'tests/', 'portal/'];
  for (const p of LEFT_OUT)
    assert.ok(wf.includes(`--exclude='${p}'`), `pages.yml leaves out ${p}`);
  // And pages.yml leaves out nothing else, so a new exclude cannot quietly drop
  // a published file (such as .well-known/security.txt) without this list and
  // UNPUBLISHED changing with it.
  const excludes = [...wf.matchAll(/--exclude(?:=|\s+)(?:'([^']*)'|"([^"]*)"|([^\s'"\\]+))/g)].map(m => m[1] ?? m[2] ?? m[3]);
  assert.deepEqual(excludes.sort(), ['.git*', '_site', ...LEFT_OUT].sort(), 'the excludes in pages.yml');
});

// Build your portal (portal/, es/portal/) is held back: its pricing is a
// draft the owner has not approved, so neither folder is published.
test('the held Build your portal pages are never published', () => {
  assert.ok(ROUTES.includes('/') && ROUTES.includes('/es/'), 'the homepages are published');
  for (const r of ['/portal/', '/es/portal/'])
    assert.deepEqual(ROUTES.filter(u => u.startsWith(r)), [], `${r} is not published`);
  for (const f of ['portal/index.html', 'portal/plans.js', 'es/portal/index.html']) assert.match(f, UNPUBLISHED, f);
  // The deploy's artifact check also stops a deploy that would ship either folder.
  const wf = read('.github/workflows/pages.yml');
  const checked = (wf.match(/for p in ([^;\n]*); do/)?.[1] ?? '').trim().split(/\s+/);
  for (const p of ['portal', 'es/portal']) assert.ok(checked.includes(p), `the artifact check looks for ${p}`);
});

// RFC 9116: how to report a vulnerability, at https://khipuai.co/.well-known/security.txt.
test('security.txt is published, follows RFC 9116 and has not expired', () => {
  const f = '.well-known/security.txt';
  assert.ok(SHIPPED.includes(f), `${f} is published`);
  const txt = read(f);
  assert.ok(txt.endsWith('\n'), 'every line ends with a line break');
  const fields = txt.split(/\r?\n/).filter(l => l.trim() && !l.startsWith('#')).map(l => {
    const m = l.match(/^([A-Za-z-]+): (\S.*)$/);
    assert.ok(m, `"${l}" is a comment or a "Field: value" line`);
    return [m[1].toLowerCase(), m[2].trim()];
  });
  const all = name => fields.filter(([k]) => k === name).map(([, v]) => v);
  // Contact: the site's one public address (see tests/site.test.mjs).
  assert.ok(all('contact').includes('mailto:alexp@khipuai.co'), 'Contact: mailto:alexp@khipuai.co');
  for (const v of all('contact')) assert.match(v, /^(mailto:[^@\s]+@[^@\s]+|https:\/\/\S+)$/, `Contact ${v}`);
  assert.deepEqual(all('preferred-languages'), ['en, es'], 'Preferred-Languages: en, es (once)');
  assert.ok(all('canonical').includes('https://khipuai.co/.well-known/security.txt'), 'Canonical address');
  for (const v of all('canonical')) assert.match(v, /^https:\/\//, `Canonical ${v}`);
  const expires = all('expires');
  assert.equal(expires.length, 1, 'Expires appears exactly once');
  assert.match(expires[0], /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/, 'Expires is an RFC 3339 date and time');
  const when = Date.parse(expires[0]);
  assert.ok(Number.isFinite(when), `Expires ${expires[0]} is a real date`);
  assert.ok(Date.now() < when, `security.txt expired on ${expires[0]}. Renew it: set Expires in ${f} to a date less than a year from today. Until then this test fails, so the Pages workflow does not deploy.`);
  // RFC 9116 recommends less than a year ahead, so the contact is checked again every year.
  const yearAhead = new Date(); yearAhead.setUTCFullYear(yearAhead.getUTCFullYear() + 1);
  assert.ok(when < yearAhead.getTime(), `Expires ${expires[0]} is more than a year ahead; RFC 9116 recommends less than a year.`);
});

// actions/upload-pages-artifact v3 packs every file in _site except .git and
// .github, so .well-known/security.txt is published. Later versions may leave
// hidden folders (names that start with a dot) out of the artifact; v4 is
// reported to. A Dependabot update to such a version would drop security.txt
// from the site without any other test noticing, so it fails here first.
test('the Pages artifact keeps .well-known (upload-pages-artifact v3)', () => {
  const wf = read('.github/workflows/pages.yml');
  assert.match(wf, /uses: actions\/upload-pages-artifact@(v3\b|[0-9a-f]{40} # v3\b)/,
    'Before moving actions/upload-pages-artifact past v3, confirm the new version still publishes .well-known/security.txt (v4 is reported to leave hidden folders out), then update this test.');
});
