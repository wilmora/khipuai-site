// The self-assessment leads script (edge/leads/Code.gs), run in node:vm
// against small fakes of the Google services it calls: what reaches the
// sheet and the two emails, the honeypot, the caps, the first-name and
// formula guards, and the optional Cloudflare Turnstile check.
// Run: node --test tests/leads.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const CODE = readFileSync(new URL('../edge/leads/Code.gs', import.meta.url), 'utf8');
const OWNER = 'owner@example.com';
const SECRET = 'fake-turnstile-secret';
const SITEVERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const HEADERS = ['Received', 'First name', 'Email', 'Company', 'Score', 'Band', 'Top areas',
  'OK to follow up', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'Result emailed'];

const LEAD = Object.freeze({
  name: 'Ana', email: 'ana@example.com', company: 'Example Co', followUp: true, hp: '',
  score: 18, band: 'bleeding', top: ['reentry', 'reporting'],
  utm: { source: 'newsletter', medium: 'email', campaign: 'fall', content: 'issue-2' },
});
const lead = (over = {}) => ({ ...LEAD, ...over });

// A fresh copy of the script with fresh fakes. props: script properties.
// verify: what Cloudflare's siteverify answers, as an object (sent as JSON),
// a string (sent as it is) or an Error (thrown by UrlFetchApp.fetch).
function load({ props = {}, verify = { success: true, hostname: 'khipuai.co' }, sheetExists = true } = {}) {
  const rows = [], mails = [], fetches = [], logs = [];
  const cache = new Map();
  const store = new Map(Object.entries(props));
  const lock = { taken: 0, released: 0 };
  const newSheet = () => ({ appendRow: r => { rows.push([...r]); }, setFrozenRows() {} });
  let sheet = sheetExists ? newSheet() : null;
  const spreadsheet = {
    getSheetByName: n => (n === 'Leads' ? sheet : null),
    insertSheet: () => { sheet = newSheet(); return sheet; },
    getUrl: () => 'https://docs.google.com/spreadsheets/d/fake/edit',
    getName: () => 'KHIPUAI Leads',
  };
  const log = kind => (...a) => { logs.push(`${kind}: ${a.map(String).join(' ')}`); };
  const ctx = vm.createContext({
    console: { log: log('log'), warn: log('warn'), error: log('error') },
    ContentService: {
      MimeType: { JSON: 'JSON' },
      createTextOutput: text => ({ text, mime: null, setMimeType(m) { this.mime = m; return this; } }),
    },
    CacheService: { getScriptCache: () => ({ get: k => (cache.has(k) ? cache.get(k) : null), put: (k, v) => { cache.set(k, v); } }) },
    LockService: { getScriptLock: () => ({ waitLock: () => { lock.taken++; }, releaseLock: () => { lock.released++; } }) },
    SpreadsheetApp: { getActiveSpreadsheet: () => spreadsheet },
    MailApp: { sendEmail: m => { mails.push({ ...m }); } },
    Session: { getEffectiveUser: () => ({ getEmail: () => OWNER }) },
    Utilities: {
      formatDate: date => date.toISOString().slice(0, 10).replace(/-/g, ''),   // only 'yyyyMMdd' in UTC is used
      base64EncodeWebSafe: s => Buffer.from(String(s), 'utf8').toString('base64').replace(/\+/g, '-').replace(/\//g, '_'),
    },
    PropertiesService: { getScriptProperties: () => ({
      getProperty: k => (store.has(k) ? store.get(k) : null),
      setProperty: (k, v) => { store.set(k, String(v)); },
    }) },
    UrlFetchApp: { fetch: (url, options) => {
      fetches.push({ url, options: JSON.parse(JSON.stringify(options)) });
      if (verify instanceof Error) throw verify;
      const body = typeof verify === 'string' ? verify : JSON.stringify(verify);
      return { getContentText: () => body, getResponseCode: () => 200 };
    } },
  });
  vm.runInContext(CODE, ctx, { filename: 'edge/leads/Code.gs' });
  const post = body => {
    const out = ctx.doPost({ postData: { contents: typeof body === 'string' ? body : JSON.stringify(body) } });
    assert.equal(out.mime, 'JSON');
    return JSON.parse(out.text);
  };
  const counters = () => JSON.parse(store.get('counters') ?? 'null');
  const today = () => new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return { ctx, post, rows, mails, fetches, logs, cache, lock, store, counters, today };
}

const toVisitor = t => t.mails.filter(m => m.to !== OWNER);
const toOwner = t => t.mails.filter(m => m.to === OWNER);
const greeting = m => m.body.split('\n')[0];
const ownerLine = (t, label) => toOwner(t)[0].body.split('\n').find(l => l.startsWith(label + ': ')).slice(label.length + 2);

// Nothing counted, saved, sent or locked.
function assertUntouched(t) {
  assert.deepEqual(t.rows, [], 'no row');
  assert.deepEqual(t.mails, [], 'no email');
  assert.equal(t.counters(), null, 'no counter change');
  assert.equal(t.lock.taken, 0, 'no lock');
  assert.equal(t.cache.size, 0, 'no cache entry');
}

test('a valid lead saves one row, emails the result and notifies the owner', () => {
  const t = load();
  assert.deepEqual(t.post(lead()), { ok: true, detail: '' });
  assert.equal(t.rows.length, 1);
  const [received, ...rest] = t.rows[0];
  assert.equal(typeof received.getTime, 'function', 'a date first');
  assert.deepEqual(rest, ['Ana', 'ana@example.com', 'Example Co', 18, 'Bleeding', 'Data re-entry, Reporting', 'yes',
    'newsletter', 'email', 'fall', 'issue-2', 'yes']);
  assert.equal(t.mails.length, 2);
  const [visitor] = toVisitor(t), [owner] = toOwner(t);
  assert.equal(visitor.to, 'ana@example.com');
  assert.equal(visitor.replyTo, 'wil@khipuai.co');
  assert.equal(visitor.name, 'Wil Mora, KHIPUAI');
  assert.equal(visitor.subject, 'Your self-assessment result: 18 of 24 (Bleeding)');
  assert.equal(owner.subject, 'New KHIPUAI lead: Example Co scored 18/24');
  assert.equal(owner.body, [
    'Name: Ana', 'Email: ana@example.com', 'Company: Example Co', 'Score: 18/24 (Bleeding)',
    'Top areas: Data re-entry, Reporting', 'OK to follow up: YES', 'Came from: newsletter / email / fall',
    'Result emailed: yes', '', 'Sheet: https://docs.google.com/spreadsheets/d/fake/edit',
  ].join('\n'));
  assert.deepEqual({ ...t.counters() }, { day: t.today(), results: 1, rows: 1, notices: 1 });
  assert.equal(t.lock.taken, 1);
  assert.equal(t.lock.released, 1);
  assert.equal(t.fetches.length, 0);
  assert.deepEqual(t.logs, []);
});

test('the result email keeps its wording', () => {
  const t = load();
  t.post(lead());
  assert.equal(toVisitor(t)[0].body, [
    'Hi Ana,',
    '',
    'Thanks for taking the KHIPUAI back-office self-assessment. Here is your result.',
    '',
    'Score: 18 of 24',
    'Bleeding. Manual work is holding the business back, with real cost and risk (errors, key-person dependency). Worth mapping soon, starting with the areas below.',
    '',
    'Where your team is most likely losing hours:',
    '- Data re-entry: people retype the same information into more than one system. Usually the first thing worth automating: the system moves it, a person checks it.',
    '- Reporting: numbers get rebuilt by hand before anyone can decide. Reports can assemble themselves from the systems you already use.',
    '',
    'The worksheet as a PDF, to score with the people who do the work:',
    'https://khipuai.co/self-assessment.pdf',
    '',
    'If you want to put real hours and dollars on it, book a 30-minute fit call. We go through your answers together and pick the first thing worth fixing:',
    'https://calendly.com/wmorapal/30min',
    '',
    'Or just reply to this email with a question.',
    '',
    'Wil Mora',
    'Founder, KHIPUAI',
    'khipuai.co',
    '',
    'You received this because you asked for your result on khipuai.co. To have your details deleted, reply with "delete".',
  ].join('\n'));
  const u = load();
  u.post(lead({ email: 'lean@example.com', score: 3, band: 'lean', top: [] }));
  const body = toVisitor(u)[0].body.split('\n');
  assert.equal(body[5], 'Lean. Your back office is in good shape. A quick win or two, but automation is not urgent.');
  assert.equal(body[7], 'No big leaks flagged. Your answers point to a tidy back office.');
});

test('a new Leads tab starts with the same headers', () => {
  const t = load({ sheetExists: false });
  assert.equal(t.post(lead()).ok, true);
  assert.deepEqual(t.rows[0], HEADERS);
  assert.equal(t.rows.length, 2);
  assert.equal(t.rows[1][2], 'ana@example.com');
});

test('the honeypot pretends success and does nothing else, Turnstile on or off', () => {
  for (const props of [{}, { TURNSTILE_SECRET: SECRET }]) {
    const t = load({ props });
    assert.deepEqual(t.post(lead({ hp: 'https://spam.example' })), { ok: true, detail: '' });
    assertUntouched(t);
    assert.equal(t.fetches.length, 0, 'no call to Cloudflare');
  }
});

test('a first name cannot carry a link, an address, a number or a formula', () => {
  const cases = [
    ['Visit example.co/claim now', 'Visit examplecoclaim now'],
    ['=HYPERLINK(1)', 'HYPERLINK'],
    ['evil@x.y', 'evilxy'],
    ['http://evil.example/login', 'httpevilexamplelogin'],
    ['www.evil.example', 'wwwevilexample'],
    ['Ann\r\nBcc: spam@x.co', 'Ann Bcc spamxco'],
    ['<a href=x>Bo</a>', 'a hrefxBoa'],
    ['ｅｖｉｌ．ｃｏｍ', 'ｅｖｉｌｃｏｍ'],              // full-width letters stay, the full-width dot goes
    ['Ann‮gnp.exe', 'Anngnpexe'],              // right-to-left override
    ['Bob​.com', 'Bobcom'],                    // zero-width space
    ['José@evil.co', 'Joséevilco'],
  ];
  for (const [typed, kept] of cases) {
    const t = load();
    assert.equal(t.post(lead({ name: typed })).ok, true, typed);
    const visitor = toVisitor(t)[0];
    assert.equal(greeting(visitor), `Hi ${kept},`, typed);
    assert.equal(t.rows[0][1], kept, typed);
    assert.equal(ownerLine(t, 'Name'), kept, typed);
    for (const shown of [greeting(visitor), t.rows[0][1], ownerLine(t, 'Name')])
      assert.doesNotMatch(shown, /[.\/@\d=:<>‮​]/, typed);
  }
});

test('accented and non-Latin first names come through intact', () => {
  for (const name of ["José-María O'Neil", 'D’Angelo', 'Zoë', 'Łukasz', 'Ngọc Anh', 'Наталья', '李小龙', 'أحمد', 'अनिल']) {
    const t = load();
    assert.equal(t.post(lead({ name })).ok, true, name);
    assert.equal(greeting(toVisitor(t)[0]), `Hi ${name},`);
    assert.equal(t.rows[0][1], name);
  }
  // A decomposed accent (e + combining acute) is stored composed.
  const t = load();
  t.post(lead({ name: 'José' }));
  assert.equal(t.rows[0][1], 'José');
});

test('a first name with no letter left greets "Hi there"', () => {
  for (const name of ['12345', '...', '@@', '-', "'", '   ', '+1 (555) 010-9999', '', null, undefined, 42]) {
    const t = load();
    assert.equal(t.post(lead({ name })).ok, true, String(name));
    assert.equal(greeting(toVisitor(t)[0]), 'Hi there,', String(name));
    assert.equal(t.rows[0][1], '', String(name));
    assert.equal(ownerLine(t, 'Name'), '(not given)');
  }
});

test('the first name is capped at 40 whole characters, with spaces collapsed', () => {
  const cases = [
    ['A'.repeat(60), 'A'.repeat(40)],
    ['A'.repeat(39) + ' Bee', 'A'.repeat(39)],          // no trailing space after the cut
    ['Ann' + ' '.repeat(10) + 'Lee', 'Ann Lee'],
    ['Mary\tJane', 'Mary Jane'],
    ['  Ann  ', 'Ann'],
  ];
  for (const [typed, kept] of cases) {
    const t = load();
    t.post(lead({ name: typed }));
    assert.equal(t.rows[0][1], kept, JSON.stringify(typed));
  }
  // Letters outside the Basic Multilingual Plane are never cut in half.
  const t = load();
  t.post(lead({ name: '\u{1D400}'.repeat(50) }));
  const kept = t.rows[0][1];
  assert.equal([...kept].length, 40);
  assert.ok(kept.isWellFormed(), 'no lone surrogate');
});

test('the address is written to the sheet as text; the result still goes to the real address', () => {
  const cases = [
    ['=1+2@x.co', "'=1+2@x.co"],
    ['+tag@example.com', "'+tag@example.com"],
    ['-dash@example.com', "'-dash@example.com"],
    ["=cmd|'/ccalc'!a0@x.co", "'=cmd|'/ccalc'!a0@x.co"],
    ['ana@example.com', 'ana@example.com'],
  ];
  for (const [email, cell] of cases) {
    const t = load();
    assert.equal(t.post(lead({ email })).ok, true, email);
    assert.equal(t.rows[0][2], cell, email);
    assert.equal(toVisitor(t)[0].to, email, 'sent to the address as typed');
    assert.equal(ownerLine(t, 'Email'), email);
  }
  // A name that starts with a hyphen gets the same guard in the sheet only.
  const t = load();
  t.post(lead({ name: '-Ann' }));
  assert.equal(t.rows[0][1], "'-Ann");
  assert.equal(greeting(toVisitor(t)[0]), 'Hi -Ann,');
  // The other typed fields keep their guard.
  const u = load();
  u.post(lead({ company: '=IMPORTXML(1)', utm: { source: '@x', medium: '+y', campaign: '-z', content: '=w' } }));
  assert.deepEqual(u.rows[0].slice(3, 4).concat(u.rows[0].slice(8, 12)), ["'=IMPORTXML(1)", "'@x", "'+y", "'-z", "'=w"]);
});

test('without TURNSTILE_SECRET nothing is sent to Cloudflare, token or not', () => {
  for (const extra of [{}, { cf: 'some-token' }]) {
    const t = load();
    assert.deepEqual(t.post(lead(extra)), { ok: true, detail: '' });
    assert.equal(t.fetches.length, 0);
    assert.equal(t.rows.length, 1);
    assert.equal(t.mails.length, 2);
  }
  // A blank secret counts as not set.
  const t = load({ props: { TURNSTILE_SECRET: '   ' } });
  assert.equal(t.post(lead()).ok, true);
  assert.equal(t.fetches.length, 0);
});

test('with TURNSTILE_SECRET, a missing or unusable token is refused before any call, count, row or email', () => {
  for (const cf of [undefined, '', null, 123, ['tok'], { t: 'tok' }, 'x'.repeat(2049)]) {
    const t = load({ props: { TURNSTILE_SECRET: SECRET } });
    const body = lead();
    if (cf !== undefined) body.cf = cf;
    assert.deepEqual(t.post(body), { ok: false, detail: 'challenge' }, JSON.stringify(cf)?.slice(0, 20));
    assertUntouched(t);
    assert.equal(t.fetches.length, 0, 'no call to Cloudflare');
  }
});

test('with TURNSTILE_SECRET, a token Cloudflare rejects is refused, and the call is made as Cloudflare documents it', () => {
  for (const verify of [
    { success: false, 'error-codes': ['invalid-input-response'] },
    { success: false, 'error-codes': ['timeout-or-duplicate'] },
    { success: 'true', hostname: 'khipuai.co' },          // only a real true counts
    {},
  ]) {
    const t = load({ props: { TURNSTILE_SECRET: SECRET }, verify });
    assert.deepEqual(t.post(lead({ cf: 'tok-1' })), { ok: false, detail: 'challenge' }, JSON.stringify(verify));
    assertUntouched(t);
    assert.deepEqual(t.fetches, [{ url: SITEVERIFY,
      options: { method: 'post', payload: { secret: SECRET, response: 'tok-1' }, muteHttpExceptions: true } }]);
    assert.ok(t.logs.every(l => !l.includes(SECRET) && !l.includes('tok-1')), 'neither the secret nor the token is logged');
  }
});

test('with TURNSTILE_SECRET, a token solved on another site is refused', () => {
  for (const hostname of ['evil.example', 'khipuai.co.evil.example', 'notkhipuai.co', 'khipuai.com']) {
    const t = load({ props: { TURNSTILE_SECRET: SECRET }, verify: { success: true, hostname } });
    assert.deepEqual(t.post(lead({ cf: 'tok-1' })), { ok: false, detail: 'challenge' }, hostname);
    assertUntouched(t);
  }
});

test('with TURNSTILE_SECRET, an unreachable Cloudflare or a garbled answer fails closed', () => {
  for (const verify of [new Error('Address unavailable'), '<html>502 Bad Gateway</html>', 'null', '']) {
    const t = load({ props: { TURNSTILE_SECRET: SECRET }, verify });
    assert.deepEqual(t.post(lead({ cf: 'tok-1' })), { ok: false, detail: 'challenge' }, String(verify));
    assertUntouched(t);
    assert.equal(t.fetches.length, 1);
  }
});

test('with TURNSTILE_SECRET, a token Cloudflare accepts for khipuai.co lets the lead through', () => {
  for (const verify of [
    { success: true, hostname: 'khipuai.co' },
    { success: true, hostname: 'www.khipuai.co' },
    { success: true, hostname: 'KHIPUAI.CO' },
    { success: true },                                     // no hostname reported
  ]) {
    const t = load({ props: { TURNSTILE_SECRET: SECRET }, verify });
    assert.deepEqual(t.post(lead({ cf: 'tok-ok' })), { ok: true, detail: '' }, JSON.stringify(verify));
    assert.equal(t.fetches.length, 1);
    assert.equal(t.rows.length, 1);
    assert.equal(t.mails.length, 2);
    assert.deepEqual({ ...t.counters() }, { day: t.today(), results: 1, rows: 1, notices: 1 });
    const saved = JSON.stringify(t.rows) + JSON.stringify(t.mails);
    assert.ok(!saved.includes('tok-ok') && !saved.includes(SECRET), 'the token and the secret are not stored or mailed');
  }
});

test('with TURNSTILE_SECRET, the check comes before any validation', () => {
  const t = load({ props: { TURNSTILE_SECRET: SECRET } });
  assert.deepEqual(t.post(lead({ email: 'not-an-address', band: 'nope', score: 99 })), { ok: false, detail: 'challenge' });
  assertUntouched(t);
  const u = load({ props: { TURNSTILE_SECRET: SECRET }, verify: { success: true, hostname: 'khipuai.co' } });
  assert.deepEqual(u.post(lead({ cf: 'tok-ok', email: 'not-an-address' })), { ok: false, detail: 'email' });
});

test('unknown band and area ids are still refused or dropped', () => {
  for (const band of ['nope', 'Bleeding', '__proto__', 'constructor', 'toString', 'hasOwnProperty', '', undefined]) {
    const t = load();
    assert.deepEqual(t.post(lead({ band })), { ok: false, detail: 'band' }, String(band));
    assertUntouched(t);
  }
  const t = load();
  t.post(lead({ top: ['nope', 'constructor', '__proto__', 'reentry', 'reentry', 'toString', 'tells', 'accuracy'] }));
  assert.equal(t.rows[0][6], 'Data re-entry, Key-person dependency');
  const body = toVisitor(t)[0].body;
  assert.match(body, /^- Data re-entry: /m);
  assert.match(body, /^- Key-person dependency: /m);
  assert.equal(body.match(/^- /gm).length, 2);
  assert.doesNotMatch(body + toOwner(t)[0].body, /undefined|\[object/);
  // The ids the site sends are the ones the script knows.
  assert.equal(vm.runInContext('JSON.stringify([Object.keys(BANDS), Object.keys(LEAK)])', t.ctx),
    JSON.stringify([['lean', 'leaking', 'bleeding'], ['reentry', 'approvals', 'reporting', 'accuracy', 'tells']]));
  for (const [band, label] of [['lean', 'Lean'], ['leaking', 'Leaking'], ['bleeding', 'Bleeding']]) {
    const u = load();
    assert.equal(u.post(lead({ band })).ok, true);
    assert.equal(toVisitor(u)[0].subject, `Your self-assessment result: 18 of 24 (${label})`);
  }
  const u = load();
  u.post(lead({ top: 'reentry' }));
  assert.equal(u.rows[0][6], '');
});

test('oversized lists and names cost little work', () => {
  // 100,000 unknown ids, then 100,000 copies of a known one: a dedupe that
  // looked back through the whole list would take seconds (about 8 on a
  // laptop); the script stops at the second area it knows.
  const top = Array(100000).fill('nope').concat(Array(100000).fill('reentry'), ['tells']);
  const t = load();
  const started = Date.now();
  assert.equal(t.post(lead({ top, name: 'Ann ' + 'b'.repeat(1_000_000) })).ok, true);
  assert.ok(Date.now() - started < 3000, `took ${Date.now() - started} ms`);
  assert.equal(t.rows[0][6], 'Data re-entry, Key-person dependency');
  assert.equal(t.rows[0][1], 'Ann ' + 'b'.repeat(36));
});

test('the score and the address are checked as before', () => {
  for (const score of [25, -1, 'abc', undefined]) {
    const t = load();
    assert.deepEqual(t.post(lead({ score })), { ok: false, detail: 'score' }, String(score));
    assertUntouched(t);
  }
  for (const score of [0, 24, 23.6]) assert.equal(load().post(lead({ score })).ok, true, String(score));
  for (const email of ['', 'ana', 'ana@example', 'ana example@x.co', '<a>@x.co', 'a@b@c.co']) {
    const t = load();
    assert.deepEqual(t.post(lead({ email })), { ok: false, detail: 'email' }, email);
    assertUntouched(t);
  }
});

test('the daily caps and the 10-minute repeat rule still hold', () => {
  // Result emails: past 60 a day the lead is saved and the owner told, but no result is sent.
  let t = load();
  t.store.set('counters', JSON.stringify({ day: t.today(), results: 60, rows: 5, notices: 5 }));
  assert.equal(t.post(lead()).ok, true);
  assert.equal(t.rows[0][12], 'no (daily cap)');
  assert.deepEqual(t.mails.map(m => m.to), [OWNER]);
  assert.equal(ownerLine(t, 'Result emailed'), 'no');
  assert.deepEqual({ ...t.counters() }, { day: t.today(), results: 60, rows: 6, notices: 6 });

  // Rows: past 200 a day nothing is written or sent.
  t = load();
  t.store.set('counters', JSON.stringify({ day: t.today(), results: 0, rows: 200, notices: 0 }));
  assert.deepEqual(t.post(lead()), { ok: false, detail: 'busy' });
  assert.deepEqual(t.rows, []);
  assert.deepEqual(t.mails, []);
  assert.equal(t.lock.released, t.lock.taken, 'the lock is released');

  // Owner notices: one warning at 40, then quiet.
  t = load();
  t.store.set('counters', JSON.stringify({ day: t.today(), results: 0, rows: 0, notices: 40 }));
  t.post(lead());
  assert.deepEqual(toOwner(t).map(m => m.subject), ['KHIPUAI lead notices paused for today: 40 submissions since midnight UTC']);
  assert.equal(toVisitor(t).length, 1);
  t.post(lead({ email: 'second@example.com' }));
  assert.equal(toOwner(t).length, 1, 'no second warning');
  assert.equal(t.counters().notices, 41);

  // The same address twice within 10 minutes gets one result email.
  t = load();
  t.post(lead());
  t.post(lead({ email: ' ANA@example.com ' }));
  assert.equal(t.rows[1][12], 'no (repeat within 10 min)');
  assert.equal(toVisitor(t).length, 1);
  assert.equal(toOwner(t).length, 2);

  // A new day starts the counters again.
  t = load();
  t.store.set('counters', JSON.stringify({ day: '19990101', results: 60, rows: 200, notices: 99 }));
  assert.equal(t.post(lead()).ok, true);
  assert.deepEqual({ ...t.counters() }, { day: t.today(), results: 1, rows: 1, notices: 1 });
});

test('the owner notice shows the same cleaned campaign values as the sheet', () => {
  const t = load();
  t.post(lead({ utm: { source: 'x\r\nhttp://evil.example/login now', medium: 'mail', campaign: 'c'.repeat(100), content: '' } }));
  const line = ownerLine(t, 'Came from');
  assert.doesNotMatch(line, /http|evil\.example|\n/);
  assert.equal(line, [t.rows[0][8], t.rows[0][9], t.rows[0][10]].join(' / '));
  assert.equal(t.rows[0][10].length, 60);
});

test('a malformed request gets the server reply and changes nothing', () => {
  for (const raw of ['not json', 'null', '[1', '"text"']) {
    const t = load();
    const reply = t.post(raw);
    if (raw === '"text"') assert.deepEqual(reply, { ok: false, detail: 'email' });   // a string has no fields
    else assert.deepEqual(reply, { ok: false, detail: 'server' }, raw);
    assertUntouched(t);
  }
});

test('doGet still answers that the script is live', () => {
  const out = load().ctx.doGet();
  assert.deepEqual(JSON.parse(out.text), { ok: true, detail: 'alive' });
});

test('testSetup creates the tab, says whether Turnstile is on, and sends nothing', () => {
  let t = load({ sheetExists: false });
  t.ctx.testSetup();
  assert.deepEqual(t.rows, [HEADERS]);
  assert.deepEqual(t.mails, []);
  assert.match(t.logs.join('\n'), /Turnstile check off/);
  t = load({ props: { TURNSTILE_SECRET: SECRET } });
  t.ctx.testSetup();
  assert.match(t.logs.join('\n'), /Turnstile check ON/);
  assert.ok(!t.logs.join('\n').includes(SECRET));
  assert.equal(t.fetches.length, 0);
});

test('testTurnstile asks Cloudflare about a dummy token and logs the answer, not the secret', () => {
  let t = load();
  t.ctx.testTurnstile();
  assert.equal(t.fetches.length, 0);
  assert.match(t.logs.join('\n'), /not set/);
  t = load({ props: { TURNSTILE_SECRET: SECRET }, verify: { success: false, 'error-codes': ['invalid-input-response'] } });
  t.ctx.testTurnstile();
  assert.deepEqual(t.fetches[0].options.payload, { secret: SECRET, response: 'dummy-token' });
  assert.match(t.logs.join('\n'), /invalid-input-response/);
  assert.ok(!t.logs.join('\n').includes(SECRET));
  assert.deepEqual(t.mails, []);
});
