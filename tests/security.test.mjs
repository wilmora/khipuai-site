// Guards for the high-risk findings of the 2026-11-04 review: client names in
// the public repository, local file links in what ships, and deploys that
// skip the tests. Also what the Pages workflow publishes: the held portal and
// the unused quote engine stay out, every top-level path that ships is on an
// approved list, no risky file (keys, logs, data exports, archives) ships,
// and security.txt (how to report a vulnerability) goes in and stays current.
// Run: node --test tests/*.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { inflateSync, deflateSync, constants as zlib } from 'node:zlib';
import { confidentialLines, makeMatcher, SKIP_REASON, warnIfSkipped } from './confidential.mjs';
import { REPO_FILES } from './files.mjs';

// Without the CONFIDENTIAL_TERMS secret the client-name check is skipped; in
// GitHub Actions this also puts a warning on the run.
warnIfSkipped();

const ROOT = new URL('../', import.meta.url);
const SKIP_DIRS = new Set(['.git', 'node_modules', '_site']);
// The local list of confidential terms (gitignored). It is never scanned: it
// holds the terms by design.
const TERMS_PATH = 'tests/.confidential-terms';

// Every file in the repository (git's tracked and not-ignored files), from
// tests/files.mjs, without the local terms file.
const FILES = REPO_FILES;
const TEXT = /\.(html?|m?js|cjs|css|md|txt|json|xml|gs|toml|ya?ml|svg|csv|webmanifest)$/i;
const read = f => readFileSync(new URL(f, ROOT), 'utf8');

// What the Pages workflow leaves out of the published site (pages.yml rsync).
// rsync reads 'portal/' (no leading slash) as a folder named portal at any
// depth, so it leaves out portal/ and es/portal/, and 'shared/quote.js' (a
// slash inside) as the end of a path; the last two patterns below do the same.
const UNPUBLISHED = /^(\.git|AGENTS\.md$|README\.md$|demos\/README\.md$|logos\/SOURCES\.md$|docs\/|edge\/|tools\/|tests\/|(.*\/)?portal\/|(.*\/)?shared\/quote\.js$)/;
const SHIPPED = FILES.filter(f => !UNPUBLISHED.test(f));
// The addresses GitHub Pages answers for those files. A folder's index.html
// also answers at the folder itself (es/index.html at /es/).
const ROUTES = SHIPPED.flatMap(f => [`/${f}`, ...(/(^|\/)index\.html$/.test(f) ? [`/${f.slice(0, -'index.html'.length)}`] : [])]);

// ---- PDF reading --------------------------------------------------------------

// PDF strings. Literal strings may escape any byte as octal (\072 is ":"),
// which is how some tools write them, so escapes are decoded before any check.
const ESC = { n: '\n', r: '\r', t: '\t', b: '\b', f: '\f', '(': '(', ')': ')', '\\': '\\' };
const literal = s => s.replace(/\\([0-7]{1,3}|[nrtbf()\\]|\r?\n)/g, (m, e) => /^[0-7]/.test(e) ? String.fromCharCode(parseInt(e, 8)) : ESC[e] ?? '');
const hex = s => { const h = s.replace(/[^0-9A-Fa-f]/g, ''); return (h.length % 2 ? h + '0' : h).replace(/../g, b => String.fromCharCode(parseInt(b, 16))); };
// Text strings outside page content (document details, link and alt text)
// are UTF-16 when they start with a byte order mark, otherwise one byte each.
const textString = s => s.startsWith('\xFE\xFF')
  ? s.slice(2).replace(/[\s\S]{1,2}/g, p => String.fromCharCode((p.charCodeAt(0) << 8) | (p.charCodeAt(1) || 0)))
  : s;

// Link targets inside a PDF. Link annotations are stored uncompressed, as
// /URI (literal) or /URI <hex> strings, so they can be read without a PDF
// library.
const pdfLinks = f => [...readFileSync(new URL(f, ROOT)).toString('latin1').matchAll(/\/URI\s*(?:\(((?:\\[\s\S]|[^\\)])*)\)|<([0-9A-Fa-f\s]*)>)/g)]
  .map(m => (m[1] !== undefined ? literal(m[1]) : hex(m[2])));

// The tokens of PDF content or a PDF object: strings, names, numbers,
// operators and brackets. Inline image data (between ID and EI) is skipped.
function* pdfTokens(s) {
  const word = /[^\s\0()<>[\]{}/%]+/y;
  for (let i = 0; i < s.length;) {
    const c = s[i];
    if (/[\s\0]/.test(c)) { i++; continue; }
    if (c === '%') { while (i < s.length && s[i] !== '\n' && s[i] !== '\r') i++; continue; }
    if (c === '(') {
      let depth = 1, j = i + 1;
      for (; j < s.length && depth; j++) {
        if (s[j] === '\\') j++;
        else if (s[j] === '(') depth++;
        else if (s[j] === ')') depth--;
      }
      yield { t: 'str', v: literal(s.slice(i + 1, j - 1)) };
      i = j; continue;
    }
    if (s.startsWith('<<', i) || s.startsWith('>>', i)) { yield { t: 'dict', v: s.slice(i, i + 2) }; i += 2; continue; }
    if (c === '<') {
      const j = s.indexOf('>', i);
      if (j < 0) return;
      yield { t: 'str', v: hex(s.slice(i + 1, j)) };
      i = j + 1; continue;
    }
    if ('[]{}>)'.includes(c)) { yield { t: 'op', v: c }; i++; continue; }
    const name = c === '/', at = name ? i + 1 : i;
    word.lastIndex = at;
    const v = word.exec(s)?.[0] ?? '';
    i = at + v.length;
    if (name) { yield { t: 'name', v }; continue; }
    if (!v) { i++; continue; }
    if (/^[+-]?(\d+\.?\d*|\.\d+)$/.test(v)) { yield { t: 'num', v: Number(v) }; continue; }
    if (v === 'ID') {
      const end = /\sEI(?=[\s\0]|$)/g;
      end.lastIndex = i;
      const e = end.exec(s);
      i = e ? e.index + e[0].length : s.length;
      continue;
    }
    yield { t: 'op', v };
  }
}

// Inflates a stream when it is FlateDecode (or not compressed at all).
function streamData(dict, raw) {
  const filters = [...(/\/Filter\s*(\[[^\]]*\]|\/\w+)/.exec(dict)?.[1] ?? '').matchAll(/\/(\w+)/g)].map(m => m[1]);
  if (!filters.length) return raw;
  if (filters.length > 1 || !/^(FlateDecode|Fl)$/.test(filters[0])) return null;
  try { return inflateSync(raw); } catch {}
  try { return inflateSync(raw, { finishFlush: zlib.Z_SYNC_FLUSH }); } catch { return null; }
}

// Every object in a PDF: its dictionary or value as text, and its stream,
// inflated, when it has one. Objects packed in object streams are read too.
function pdfObjects(buf) {
  const s = buf.toString('latin1'), objs = new Map();
  const head = /(\d+)\s+\d+\s+obj\b/g;
  for (let m; (m = head.exec(s));) {
    const from = head.lastIndex, end = s.indexOf('endobj', from), kw = s.indexOf('stream', from);
    if (kw !== -1 && (end === -1 || kw < end)) {
      const dict = s.slice(from, kw);
      let start = kw + 'stream'.length;
      if (s[start] === '\r') start++;
      if (s[start] === '\n') start++;
      const len = /\/Length\s+(\d+)(?!\s+\d+\s+R)/.exec(dict);
      let stop = len ? start + Number(len[1]) : -1;
      if (stop < start || !/^\s*endstream/.test(s.slice(stop, stop + 40))) stop = s.indexOf('endstream', start);
      if (stop < 0) stop = s.length;
      objs.set(Number(m[1]), { dict, data: streamData(dict, buf.subarray(start, stop)) });
      head.lastIndex = stop;
    } else {
      objs.set(Number(m[1]), { dict: s.slice(from, end < 0 ? undefined : end), data: null });
      if (end >= 0) head.lastIndex = end;
    }
  }
  for (const { dict, data } of [...objs.values()]) {
    if (!data || !/\/Type\s*\/ObjStm\b/.test(dict)) continue;
    const text = data.toString('latin1'), first = Number(/\/First\s+(\d+)/.exec(dict)?.[1] ?? 0);
    const nums = (text.slice(0, first).match(/\d+/g) ?? []).map(Number);
    for (let k = 0; k + 1 < nums.length; k += 2)
      if (!objs.has(nums[k])) objs.set(nums[k], { dict: text.slice(first + nums[k + 1], k + 3 < nums.length ? first + nums[k + 3] : undefined), data: null });
  }
  return objs;
}

// A font's ToUnicode map (character code -> text) and its code width in bytes.
function fontInfo(objs, num) {
  const font = objs.get(num);
  if (!font) return null;
  let width = /\/Subtype\s*\/Type0\b/.test(font.dict) ? 2 : 1;
  const map = new Map();
  const ref = /\/ToUnicode\s+(\d+)\s+\d+\s+R/.exec(font.dict);
  const cmap = ref && objs.get(Number(ref[1]))?.data?.toString('latin1');
  if (cmap) {
    const range = /begincodespacerange\s*<([0-9A-Fa-f]+)>/.exec(cmap);
    if (range) width = Math.max(1, range[1].length >> 1);
    const utf16 = h => textString('\xFE\xFF' + hex(h));
    for (const [, body] of cmap.matchAll(/beginbfchar([\s\S]*?)endbfchar/g))
      for (const [, src, dst] of body.matchAll(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]*)>/g)) map.set(parseInt(src, 16), utf16(dst));
    for (const [, body] of cmap.matchAll(/beginbfrange([\s\S]*?)endbfrange/g))
      for (const [, lo, hi, dst, list] of body.matchAll(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*(?:<([0-9A-Fa-f]*)>|\[([^\]]*)\])/g)) {
        const a = parseInt(lo, 16), b = Math.min(parseInt(hi, 16), a + 0xFFFF);
        const items = list === undefined ? null : [...list.matchAll(/<([0-9A-Fa-f]*)>/g)].map(x => utf16(x[1]));
        const base = dst === undefined ? '' : utf16(dst);
        for (let c = a; c <= b; c++)
          map.set(c, items ? items[c - a] ?? '' : base && base.slice(0, -1) + String.fromCharCode(base.charCodeAt(base.length - 1) + c - a));
      }
  }
  return { width, map };
}

// The fonts named in a page's or form's resources (name -> object number),
// inherited from the parent page tree node when the page has none.
function fontsOf(objs, dict, inherit = true, depth = 0) {
  const fonts = new Map();
  const res = /\/Resources\s+(\d+)\s+\d+\s+R/.exec(dict);
  const text = res ? objs.get(Number(res[1]))?.dict ?? '' : dict;
  let body = /\/Font\s*<<([\s\S]*?)>>/.exec(text)?.[1];
  const ref = body === undefined && /\/Font\s+(\d+)\s+\d+\s+R/.exec(text);
  if (ref) body = objs.get(Number(ref[1]))?.dict;
  for (const [, name, n] of (body ?? '').matchAll(/\/([^\s/<>[\]()]+)\s+(\d+)\s+\d+\s+R/g)) fonts.set(name, Number(n));
  const parent = /\/Parent\s+(\d+)\s+\d+\s+R/.exec(dict);
  if (!fonts.size && inherit && parent && depth < 32) return fontsOf(objs, objs.get(Number(parent[1]))?.dict ?? '', true, depth + 1);
  return fonts;
}

// The text a content stream shows (Tj, TJ, ' and " operators), decoded with
// each font's ToUnicode map. Approximate, and given twice: once with every
// piece joined directly (some writers split words into pieces), once with a
// space at every text move (some writers draw no space characters).
function shownText(content, fonts, info) {
  const glued = [], spaced = [];
  let font = null, stack = [];
  const arrays = [];
  const show = s => {
    let t = '';
    if (!font) t = s;
    else for (let i = 0; i < s.length; i += font.width) {
      const code = font.width === 2 ? (s.charCodeAt(i) << 8) | (s.charCodeAt(i + 1) || 0) : s.charCodeAt(i);
      t += font.map.get(code) ?? (font.width === 1 ? String.fromCharCode(code) : '');
    }
    glued.push(t); spaced.push(t);
  };
  for (const tok of pdfTokens(content)) {
    if (tok.t !== 'op') { stack.push(tok); continue; }
    if (tok.v === '[') { arrays.push(stack); stack = []; continue; }
    if (tok.v === ']') { const arr = stack; stack = arrays.pop() ?? []; stack.push({ t: 'arr', v: arr }); continue; }
    const last = stack.at(-1);
    switch (tok.v) {
      case 'Tf': { const n = fonts.get(stack.at(-2)?.v); font = n === undefined ? null : info(n); break; }
      case "'": case '"': spaced.push(' '); // falls through: both move to the next line, then show a string
      case 'Tj': if (last?.t === 'str') show(last.v); break;
      case 'TJ':
        for (const x of last?.t === 'arr' ? last.v : []) {
          if (x.t === 'str') show(x.v);
          else if (x.t === 'num' && x.v <= -200) spaced.push(' ');
        }
        break;
      case 'BT': case 'ET': case 'Td': case 'TD': case 'T*': case 'Tm': spaced.push(' '); break;
    }
    stack = [];
  }
  return `${glued.join('')}\n${spaced.join('')}`;
}

// The words a PDF holds, approximately: the text each page and form shows,
// every string outside page content (document details, links, alt text), and
// any XML metadata. For the client-name check.
function pdfText(buf) {
  const objs = pdfObjects(buf), out = [], infos = new Map();
  const info = n => { if (!infos.has(n)) infos.set(n, fontInfo(objs, n)); return infos.get(n); };
  const allFonts = new Map();
  for (const { dict } of objs.values()) for (const [k, v] of fontsOf(objs, dict, false)) if (!allFonts.has(k)) allFonts.set(k, v);
  const contentOf = dict => {
    const one = /\/Contents\s+(\d+)\s+\d+\s+R/.exec(dict), many = /\/Contents\s*\[([^\]]*)\]/.exec(dict);
    let refs = many ? [...many[1].matchAll(/(\d+)\s+\d+\s+R/g)].map(r => Number(r[1])) : one ? [Number(one[1])] : [];
    if (refs.length === 1 && !objs.get(refs[0])?.data) refs = [...(objs.get(refs[0])?.dict ?? '').matchAll(/(\d+)\s+\d+\s+R/g)].map(r => Number(r[1]));
    return refs.map(n => objs.get(n)?.data?.toString('latin1') ?? '').join('\n');
  };
  const withFallback = fonts => new Map([...allFonts, ...fonts]);
  for (const { dict, data } of objs.values()) {
    if (/\/Type\s*\/Page(?![a-zA-Z])/.test(dict)) out.push(shownText(contentOf(dict), withFallback(fontsOf(objs, dict)), info));
    else if (data && /\/Subtype\s*\/Form\b/.test(dict)) out.push(shownText(data.toString('latin1'), withFallback(fontsOf(objs, dict, false)), info));
    else if (data && /\/Subtype\s*\/XML\b/.test(dict)) out.push(data.toString('utf8'));
    if (!data) for (const tok of pdfTokens(dict)) if (tok.t === 'str') out.push(textString(tok.v));
  }
  return out.join('\n');
}

// ---- Client names ---------------------------------------------------------------

// A path that names a client is shown with the naming folder or file hidden,
// so a failing check never prints the name.
const shownPath = f => {
  const parts = f.split('/'), hidden = parts.map(p => confidentialLines(p).length > 0);
  if (!hidden.some(Boolean) && confidentialLines(f).length) hidden.fill(true, 1);
  return parts.map((p, i) => (hidden[i] ? '<hidden: names a client>' : p)).join('/');
};

// A file that holds text: a text extension, or no NUL byte in its first 8 KB.
const isText = (f, buf) => TEXT.test(f) || !buf.subarray(0, 8192).includes(0);

test('the secret may separate terms with new lines, |, commas or semicolons (invented terms)', () => {
  const m = makeMatcher('Zorvanta, Brix Halden; Qent | code:4242\nFlimwick');
  assert.deepEqual(m.confidentialLines('ok\nWe worked with Zorvanta.\nthe Qent team\nbrix-halden\nflimwick\nfine'), [2, 3, 4, 5]);
  assert.deepEqual(m.confidentialLines('ref 4242', { codes: true }), [1]);
});

test('the client-name matcher catches every form it should (invented terms)', () => {
  // Made-up words only. The real terms never appear in the repository.
  const m = makeMatcher([
    '# A comment line | with a separator, ignored',
    '',
    '  Zorblatt | quix  ',
    '   # an indented comment, ignored',
    'vexo dran',
    'code:7391',
  ].join('\n'));
  const hit = (s, opts) => m.confidentialLines(s, opts).length > 0;
  assert.equal(m.available, true);
  assert.equal(makeMatcher('').available, false, 'no terms');
  assert.equal(makeMatcher('# only a comment\n\n   \n').available, false, 'only comments and blank lines');

  // A name of 5 or more letters matches anywhere, in any case or accent.
  for (const s of ['We worked with Zorblatt.', 'ZORBLATT', 'zörblatt', 'logos/zorblatt-logo.svg', 'zorblattreport.pdf',
    'prezorblattish', 'getZorblattData', 'const zorblatt_id = 1;', 'Zor\u00ADblatt', 'Zor\u200Bblatt', 'Ｚｏｒｂｌａｔｔ'])
    assert.ok(hit(s), `long name in: ${s}`);
  // A shorter name only where neither neighbour is a letter.
  for (const s of ['quix', 'Quix!', 'the quix team', 'quix2026', 'quix-portal', 'quix_portal', '/quix/', 'getQuixData', 'QUIXData', 'QuixPortal'])
    assert.ok(hit(s), `short name in: ${s}`);
  for (const s of ['quixotic', 'aquix', 'Quixote', 'equixx'])
    assert.ok(!hit(s), `short name inside an ordinary word: ${s}`);
  // A two-word phrase with any run of non-letters, or none, between the words.
  for (const s of ['Vexo Dran', 'vexo-dran', 'vexo_dran', 'vexo  /  dran', 'VexoDran', 'vexodran', 'vexo2dran', 'VEXO DRAN'])
    assert.ok(hit(s), `phrase in: ${s}`);
  for (const s of ['convexo dran', 'vexo drank', 'vexotic dran', 'vexo and dran', 'vexo', 'dran'])
    assert.ok(!hit(s), `not the phrase: ${s}`);
  // Regex escapes (\b \B \s \S \w \W \d \D) count as a space, as written in
  // source or doubled inside a string literal.
  for (const s of ['/\\bquix\\b/i', "new RegExp('\\\\bquix\\\\b')", '/vexo\\sdran/', '/vexo\\s+dran/', '/vexo\\Wdran/', '/\\dquix\\D/', '/\\Squix\\S/'])
    assert.ok(hit(s), `regex form: ${s}`);
  // A billing code only with { codes: true }, and only between non-digits.
  for (const s of ['item 7391', 'SKU-7391-A', 'x7391', '"7391"']) {
    assert.ok(!hit(s), `code without { codes: true }: ${s}`);
    assert.ok(hit(s, { codes: true }), `code in: ${s}`);
  }
  for (const s of ['17391', '73910', '173910']) assert.ok(!hit(s, { codes: true }), `code inside a longer number: ${s}`);
  // Comments are not terms, and | separates terms.
  for (const s of ['A comment line', 'with a separator, ignored', 'an indented comment']) assert.ok(!hit(s), `comment: ${s}`);
  // Only line numbers come back: one per line that holds a term, a phrase
  // across a line break on both lines.
  assert.deepEqual(m.confidentialLines('first\nZorblatt here\nthird\nvexo\n  dran\nquixotic'), [2, 4, 5]);
  assert.deepEqual(m.confidentialLines('nothing to see'), []);
  assert.ok(m.confidentialLines('quix 7391', { codes: true }).every(Number.isInteger));
  // The same rules for terms that arrive with | between them on one line.
  const piped = makeMatcher('zorblatt|quix|vexo dran|code:7391');
  assert.deepEqual(['zorblatt', 'quix', 'vexo-dran', '7391'].map(s => piped.confidentialLines(s, { codes: true }).length), [1, 1, 1, 1]);
  // Punctuation in a term is matched literally, never read as regex syntax.
  const odd = makeMatcher('code:qx-40\r\ncode:(9)\r\nzeta.q');
  assert.deepEqual(['ref qx-40.', 'qx-401', '(9)', 'zeta q'].map(s => odd.confidentialLines(s, { codes: true }).length), [1, 0, 1, 1]);
});

// A small PDF, written here, with invented words in its page text (one font
// with a ToUnicode map, one without), a link and the document details.
function samplePdf() {
  const cmap = '/CIDInit /ProcSet findresource begin 12 dict begin begincmap\n1 begincodespacerange\n<0000> <FFFF>\nendcodespacerange\n'
    + '1 beginbfchar\n<0010> <005A>\nendbfchar\n1 beginbfrange\n<0011> <0012> [<006F> <0072>]\nendbfrange\nendcmap end end';
  // "Z" and "or" through the ToUnicode map, then "blatt" in TJ pieces, a wide
  // gap, "Quix", and "vexo" and "dran" in separate Tj pieces.
  const page = 'BT /F1 12 Tf 1 0 0 1 72 700 Tm <0010> Tj 9 0 Td <00110012> Tj ET\n'
    + 'BT /F2 12 Tf 90 700 Td [(bl) -30 (att) -400 (Quix)] TJ 40 0 Td (vexo) Tj 30 0 Td (dran) Tj ET';
  const streams = { 5: Buffer.from(cmap, 'latin1'), 6: deflateSync(Buffer.from(page, 'latin1')) };
  const objs = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 /Resources << /Font << /F1 4 0 R /F2 7 0 R >> >> >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 6 0 R /Annots [8 0 R] >>',
    '<< /Type /Font /Subtype /Type0 /BaseFont /Sample /Encoding /Identity-H /ToUnicode 5 0 R >>',
    null,
    null,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    '<< /Type /Annot /Subtype /Link /A << /S /URI /URI (https://example.com/\\172ylphor) >> >>',
    '<< /Title <FEFF00570065006E0064007200690078> /Author (Nobody) >>',
  ];
  const parts = ['%PDF-1.4\n'];
  objs.forEach((o, i) => {
    const n = i + 1;
    if (o) parts.push(`${n} 0 obj\n${o}\nendobj\n`);
    else parts.push(`${n} 0 obj\n<< /Length ${streams[n].length}${n === 6 ? ' /Filter /FlateDecode' : ''} >>\nstream\n`, streams[n], '\nendstream\nendobj\n');
  });
  parts.push('trailer\n<< /Root 1 0 R /Info 9 0 R >>\n%%EOF\n');
  return Buffer.concat(parts.map(p => (Buffer.isBuffer(p) ? p : Buffer.from(p, 'latin1'))));
}

test('the PDF reader finds the words in page text, links and document details', () => {
  const text = pdfText(samplePdf());
  assert.match(text, /Zorblatt/, 'ToUnicode glyph codes and TJ pieces read as one word');
  assert.match(text, /Quix vexo dran/, 'a wide TJ gap and text moves read as spaces');
  assert.match(text, /Wendrix/, 'the UTF-16 document title');
  assert.match(text, /example\.com\/zylphor/, 'the link, with its octal escape decoded');
  for (const term of ['zorblatt', 'quix', 'vexo dran', 'wendrix', 'zylphor'])
    assert.ok(makeMatcher(term).confidentialLines(text).length > 0, `the name check finds invented term ${term} in the PDF`);
  // The published worksheet's own words come through, so the check reads
  // real text, not nothing.
  const sheet = pdfText(readFileSync(new URL('self-assessment.pdf', ROOT)));
  assert.match(sheet, /Where is your team losing hours\?/, 'self-assessment.pdf page text is readable');
  assert.match(sheet, /KHIPU\s*AI/, 'self-assessment.pdf names KHIPUAI');
});

test('no client name appears anywhere in the repository', { skip: SKIP_REASON }, () => {
  const found = [];
  for (const f of FILES) {
    if (confidentialLines(f).length) found.push(`${shownPath(f)}: the path names a client`);
    const buf = readFileSync(new URL(f, ROOT));
    if (/\.pdf$/i.test(f)) {
      if (confidentialLines(pdfText(buf)).length) found.push(`${shownPath(f)}: the PDF's text, links or details name a client`);
      if (confidentialLines(pdfLinks(f).join('\n')).length) found.push(`${shownPath(f)}: a link names a client`);
    } else if (isText(f, buf)) {
      const lines = confidentialLines(buf.toString('utf8'));
      if (lines.length) found.push(`${shownPath(f)}:${lines.join(',')}`);
    }
  }
  assert.deepEqual(found, [], 'Client names (terms from the CONFIDENTIAL_TERMS secret or tests/.confidential-terms) on these lines');
});

test('the list of confidential terms stays out of the repository', () => {
  // No list, plain or hashed: a hash of a short name or a 4-digit code is
  // reversed by brute force in minutes.
  const mod = read('tests/confidential.mjs');
  assert.doesNotMatch(mod, /\b[0-9a-f]{64}\b/i, 'tests/confidential.mjs holds no SHA-256 digests');
  assert.doesNotMatch(mod, /^\s*['"]?code:\d/m, 'tests/confidential.mjs lists no billing codes');
  assert.match(read('.gitignore'), /^tests\/\.confidential-terms$/m, '.gitignore keeps tests/.confidential-terms out of git');
  let tracked;
  try {
    tracked = execFileSync('git', ['ls-files', '--', TERMS_PATH], { cwd: fileURLToPath(ROOT), encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch { return; } // No git here: the .gitignore line above is the guard.
  assert.equal(tracked.trim(), '', `${TERMS_PATH} is tracked by git. Remove it from the index (git rm --cached) and from history.`);
});

test('nothing that ships links to a file on someone\'s computer', () => {
  // A path on someone's own computer: file:/// links, Windows and macOS user folders.
  const LOCAL = /file:\/\/\/|\b[A-Za-z]:[\\/]Users[\\/]|\/Users\/[^/\s"')]+\//;
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

// What pages.yml leaves out of the published site. Each must also be in
// UNPUBLISHED above.
const LEFT_OUT = ['AGENTS.md', 'README.md', 'demos/README.md', 'logos/SOURCES.md', 'docs/', 'edge/', 'tools/', 'tests/', 'portal/', 'shared/quote.js'];

test('the Pages workflow runs the tests before it deploys', () => {
  const wf = read('.github/workflows/pages.yml');
  assert.match(wf, /^  test:\n/m, 'a test job');
  assert.match(wf, /run: node --test (--test-reporter=spec )?tests\/\*\.test\.mjs/, 'the test job runs the site tests');
  assert.match(wf, /^  deploy:\n    needs: test\n/m, 'deploy waits for the tests');
  assert.match(wf, /^permissions:\n  contents: read\n\n/m, 'read-only token by default');
  // Each pages.yml exclude and UNPUBLISHED above must name the same paths.
  for (const p of LEFT_OUT) {
    assert.ok(wf.includes(`--exclude='${p}'`), `pages.yml leaves out ${p}`);
    assert.match(p.endsWith('/') ? `${p}x` : p, UNPUBLISHED, `UNPUBLISHED leaves out ${p}`);
  }
  // And pages.yml leaves out nothing else, so a new exclude cannot quietly drop
  // a published file (such as .well-known/security.txt) without this list and
  // UNPUBLISHED changing with it.
  const excludes = [...wf.matchAll(/--exclude(?:=|\s+)(?:'([^']*)'|"([^"]*)"|([^\s'"\\]+))/g)].map(m => m[1] ?? m[2] ?? m[3]);
  assert.deepEqual(excludes.sort(), ['.git*', '_site', ...LEFT_OUT].sort(), 'the excludes in pages.yml');
});

test('the client-name secret reaches the test step only', () => {
  for (const f of ['.github/workflows/pages.yml', '.github/workflows/tests.yml']) {
    const wf = read(f);
    const uses = wf.match(/secrets\.CONFIDENTIAL_TERMS/g) ?? [];
    assert.equal(uses.length, 1, `${f} names the secret once`);
    assert.match(wf, /- name: Run the site tests\n        env:\n          CONFIDENTIAL_TERMS: \$\{\{ secrets\.CONFIDENTIAL_TERMS \}\}\n        run: node --test /,
      `${f} passes CONFIDENTIAL_TERMS to the test step, in that step's env`);
    assert.doesNotMatch(wf, /^env:/m, `${f} has no workflow-wide env`);
    assert.doesNotMatch(wf, /pull_request_target/, `${f} never runs pull request code with secrets from a fork`);
  }
});

// Build your portal (portal/, es/portal/) is held back: its pricing is a
// draft the owner has not approved, so neither folder is published.
test('the held Build your portal pages are never published', () => {
  assert.ok(ROUTES.includes('/') && ROUTES.includes('/es/'), 'the homepages are published');
  for (const r of ['/portal/', '/es/portal/'])
    assert.deepEqual(ROUTES.filter(u => u.startsWith(r)), [], `${r} is not published`);
  for (const f of ['portal/index.html', 'portal/plans.js', 'es/portal/index.html']) assert.match(f, UNPUBLISHED, f);
  // The deploy's artifact check also stops a deploy that would ship either folder.
  const checked = artifactCheck();
  for (const p of ['portal', 'es/portal']) assert.ok(checked.includes(p), `the artifact check looks for ${p}`);
});

// The paths the deploy's artifact check refuses to ship (pages.yml).
const artifactCheck = () => (read('.github/workflows/pages.yml').match(/for p in ([^;\n]*); do/)?.[1] ?? '').trim().split(/\s+/);

// shared/quote.js, the quote engine, is used by no page (shared/kinetic.js
// only names it in a comment), and it holds placeholder prices, regional
// discounts the owner has not approved and internal notes. It stays out of
// the published site until a page uses it and the owner approves its numbers.
test('the unused quote engine (shared/quote.js) is never published', () => {
  for (const f of ['shared/quote.js', 'es/shared/quote.js']) assert.match(f, UNPUBLISHED, f);
  assert.ok(!ROUTES.includes('/shared/quote.js'), '/shared/quote.js is not published');
  assert.ok(artifactCheck().includes('shared/quote.js'), 'the artifact check looks for shared/quote.js');
  // No published page or module loads it, so leaving it out breaks nothing.
  const LOADS = /(?:\bimport\s*(?:[\w*{}\s,$]+\s*from\s*)?\(?\s*|\bsrc\s*=\s*|\bhref\s*=\s*)['"][^'"]*\bquote\.js\b/;
  const loaders = SHIPPED.filter(f => /\.(html?|m?js)$/i.test(f) && LOADS.test(read(f)));
  assert.deepEqual(loaders, [], 'pages or modules that load quote.js (publish it deliberately, with approved prices, before they do)');
});

// Every top-level file and folder that ships. A new one must be added here on
// purpose, or left out of the deploy in pages.yml (then LEFT_OUT and
// UNPUBLISHED above), so a stray file at the root never ships unnoticed.
const APPROVED_TOP_LEVEL = [
  '.nojekyll', '.well-known', '404.html', '404.md', 'CNAME',
  'about', 'audit', 'basic.css', 'basic.js', 'blog', 'contact', 'demos', 'es',
  'founder.jpg', 'google51701cb7c566b34e.html', 'icons', 'index.html', 'index.md',
  'labels.js', 'llms.txt', 'logos', 'og', 'og-image.png', 'page.css', 'pager.js',
  'privacy', 'privacy.html', 'projects.js', 'robots.txt', 'security',
  'self-assessment', 'self-assessment.pdf', 'self_assessment.html', 'shared',
  'sitemap.xml', 'solution-design', 'thank-you', 'thank-you.html', 'tone.js', 'work',
];

test('every top-level path that ships is on the approved list', () => {
  const top = [...new Set(SHIPPED.map(f => f.split('/')[0]))].sort();
  const unknown = top.filter(p => !APPROVED_TOP_LEVEL.includes(p));
  assert.deepEqual(unknown, [], 'These top-level paths would be published but are not approved. If one belongs on the site, add it to APPROVED_TOP_LEVEL in tests/security.test.mjs on purpose; otherwise exclude it in .github/workflows/pages.yml (and add it to LEFT_OUT and UNPUBLISHED) or delete it.');
  for (const p of ['index.html', 'es', 'shared', '.well-known']) assert.ok(top.includes(p), `${p} is published`);
});

// Files that should never be on a public site: secrets and keys, logs, data
// exports and office documents, archives, backups, editor swap files, browser
// network captures, OS folder files and local tool settings.
const RISKY = new RegExp([
  /^(\.env(\..*)?|\.dev\.vars|\.ds_store|thumbs\.db|settings\.local\.json)$/.source,
  /\.env$/.source,                                                     // prod.env and the like
  /^id_(rsa|dsa|ecdsa|ed25519)(\.pub)?$/.source,                       // SSH keys
  /^(credentials|service[-_]?account|secrets?)[^/]*\.(json|ya?ml)$/.source,
  /\.(pem|key|p12|pfx|jks|keystore|kdbx|asc|gpg|ovpn)$/.source,         // keys, keystores, password vaults
  /\.(log|sqlite|db|sql|dump|csv|tsv|xlsx?|ods|docx?|odt|pptx?|odp|eml|mbox|har)$/.source,   // data, documents, mail, captures
  /\.(zip|tar|gz|tgz|bz2|xz|7z|rar)$/.source,                           // archives
  /\.(bak|swp|orig|old)$|~$/.source,                                    // backups and editor leftovers
].join('|'), 'i');

test('nothing that ships has a risky file name or type', () => {
  for (const name of ['.env', '.env.production', '.dev.vars', 'id.pem', 'tls.key', 'cert.p12', 'cert.pfx', 'debug.log', 'data.sqlite', 'app.db',
    'leads.csv', 'leads.tsv', 'book.xls', 'book.xlsx', 'brief.doc', 'brief.docx', 'site.zip', 'site.tar', 'site.tar.gz', 'site.7z',
    'index.html.bak', '.index.html.swp', 'session.har', '.DS_Store', 'Thumbs.db', 'settings.local.json',
    'prod.env', 'id_rsa', 'id_ed25519.pub', 'credentials.json', 'service-account.json', 'secrets.yml', 'keystore.jks',
    'dump.sql', 'site-backup.tgz', 'site.rar', 'pitch.pptx', 'leads.ods', 'index.html.orig', 'basic.js~'])
    assert.match(name, RISKY, `the risky-name rule covers ${name}`);
  for (const name of ['index.html', 'basic.js', 'og-image.png', 'self-assessment.pdf', 'security.txt', 'environment.md', 'keys.js'])
    assert.doesNotMatch(name, RISKY, `${name} is an ordinary site file`);
  const risky = SHIPPED.filter(f => RISKY.test(f.split('/').at(-1)));
  assert.deepEqual(risky, [], 'These files would be published. Delete them, or keep them out of git (.gitignore) and out of the deploy (pages.yml).');
});

// Dot files (.npmrc, .netrc, .htpasswd, .envrc and the like) hold settings or
// secrets, and upload-pages-artifact v3 publishes them. Only .nojekyll and
// .well-known/ belong on the site (the edge worker blocks the rest too).
test('no dot file or dot folder ships except .nojekyll and .well-known/', () => {
  const dot = SHIPPED.filter(f => f.split('/').some((p, i, all) => p.startsWith('.')
    && !(i === 0 && (p === '.well-known' || (p === '.nojekyll' && all.length === 1)))));
  assert.deepEqual(dot, [], 'These dot files would be published. Delete them or keep them out of git (.gitignore).');
  const wf = read('.github/workflows/pages.yml');
  assert.match(wf, /find _site -name '\.\*'/, 'the deploy step also refuses dot files');
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
