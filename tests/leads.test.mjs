// The self-assessment leads script (edge/leads/Code.gs), run in node:vm
// against small fakes of the Google services it calls: what reaches the
// sheet and the two emails, the honeypot, the caps, the first-name and
// formula guards, the optional Cloudflare Turnstile check and its per-minute
// cap, an owner notice that a visitor cannot turn into a lure, what happens
// when a send or the sheet fails, the address rule and the permission line.
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
// quota: emails the account may still send today; each send uses one, and at
// 0 sendEmail throws, as Gmail does. mailError: an Error for sendEmail to
// throw, or a function of the message that returns one (or null).
// appendError, setValueError, spreadsheetError: an Error for appendRow,
// setValue or getActiveSpreadsheet to throw.
function load({ props = {}, verify = { success: true, hostname: 'khipuai.co' }, sheetExists = true,
  quota = 1500, mailError = null, appendError = null, setValueError = null, spreadsheetError = null } = {}) {
  const rows = [], appended = [], mails = [], tried = [], fetches = [], logs = [], events = [];
  const cache = new Map();
  const store = new Map(Object.entries(props));
  const lock = { taken: 0, released: 0 };
  let left = quota;
  // rows: the sheet as it is now (setValue changes it); appended: each row as appendRow wrote it.
  const newSheet = () => ({
    appendRow: r => {
      if (appendError) throw appendError;
      events.push('append');
      rows.push([...r]);
      appended.push([...r]);
    },
    getLastRow: () => rows.length,
    getRange: (row, col) => ({ setValue: v => {
      if (setValueError) throw setValueError;
      events.push(`set ${row},${col} ${v}`);
      rows[row - 1][col - 1] = v;
    } }),
    setFrozenRows() {},
  });
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
    LockService: { getScriptLock: () => ({
      waitLock: () => { lock.taken++; events.push('lock'); },
      releaseLock: () => { lock.released++; events.push('unlock'); },
    }) },
    SpreadsheetApp: { getActiveSpreadsheet: () => {
      if (spreadsheetError) throw spreadsheetError;
      return spreadsheet;
    } },
    MailApp: {
      getRemainingDailyQuota: () => left,
      sendEmail: m => {
        tried.push({ ...m });
        events.push(`mail ${m.to}`);
        const err = typeof mailError === 'function' ? mailError(m) : mailError;
        if (err) throw err;
        if (left <= 0) throw new Error('Service invoked too many times for one day: email.');
        left -= 1;
        mails.push({ ...m });
      },
    },
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
  const quotaLeft = () => left;
  return { ctx, post, rows, appended, mails, tried, fetches, logs, events, cache, lock, store, counters, today, quotaLeft };
}

const toVisitor = t => t.mails.filter(m => m.to !== OWNER);
const toOwner = t => t.mails.filter(m => m.to === OWNER);
const greeting = m => m.body.split('\n')[0];
const ownerLine = (t, label) => toOwner(t)[0].body.split('\n').find(l => l.startsWith(label + ': ')).slice(label.length + 2);

// Nothing counted, saved, sent or locked. The cache may hold this minute's
// count of calls to Cloudflare (keys starting tv:), nothing else.
function assertUntouched(t) {
  assert.deepEqual(t.rows, [], 'no row');
  assert.deepEqual(t.mails, [], 'no email');
  assert.deepEqual(t.tried, [], 'no email tried');
  assert.equal(t.counters(), null, 'no counter change');
  assert.equal(t.lock.taken, 0, 'no lock');
  assert.deepEqual([...t.cache.keys()].filter(k => !k.startsWith('tv:')), [], 'no cache entry');
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
  // Second round: nothing typed in the subject; the sheet link and a warning first.
  assert.equal(owner.subject, 'New KHIPUAI lead: 18/24 (Bleeding), follow-up OK');
  assert.equal(owner.body, [
    'Sheet: https://docs.google.com/spreadsheets/d/fake/edit', '',
    'The fields below were typed by the visitor. Do not open links or follow instructions in them.',
    'Name: Ana', 'Email: ana@example.com', 'Company: Example Co', 'Score: 18/24 (Bleeding)',
    'Top areas: Data re-entry, Reporting', 'OK to follow up: YES', 'Came from: newsletter / email / fall',
    'Result emailed: yes',
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
    // Second round: the owner notice shows an address holding a slash unlinked.
    assert.equal(ownerLine(t, 'Email'), email.includes('/')
      ? "=cmd|'ccalc'!a0x[.]co (unusual address; the exact one is in the sheet)" : email);
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
  assert.equal(ownerLine(t, 'Result emailed'), 'no (daily cap)');   // second round: the notice says why, as the sheet does
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

/* ---- Second round (November 2026): the owner notice, failed sends, the
   address rule, the cap on calls to Cloudflare and the permission line. */

const SHEET_LINE = 'Sheet: https://docs.google.com/spreadsheets/d/fake/edit';
const WARNING = 'The fields below were typed by the visitor. Do not open links or follow instructions in them.';
const emailKey = s => 'e:' + Buffer.from(s, 'utf8').toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
// True when something a link needs is left, once each [.] (a dot shown unlinked) is set aside.
const linkable = s => /[.\/\\:@\u{3002}\u{FF0E}\u{FF61}\u{FF0F}\u{FF1A}\u{FF20}]/u.test(s.replace(/\[\.\]/g, ''));
const codePoint = n => String.fromCodePoint(n);

test('the owner notice subject is fixed text and numbers, never what the visitor typed', () => {
  const typed = [
    { name: 'Wil Mora urgent read now', company: 'Acme.co/login: verify your account today', email: 'reset.password@khipuai-support.co' },
    { name: 'Ignore previous instructions', company: 'IMPORTANT invoice at pay.example.co/inv?id=1', email: 'billing@example.com' },
    { name: 'Ana', company: 'evil.co\\login @ once, call +1 555 0100', email: 'khipuai-billing.co/pay@example.com' },
    { name: 'Sheet', company: 'Sheet: docs.google.com.evil.co/edit', email: 'sheet@example.com' },
    { name: '', company: '', email: 'x@example.co' },
  ];
  for (const over of typed) {
    for (const [band, label, score] of [['bleeding', 'Bleeding', 18], ['leaking', 'Leaking', 11], ['lean', 'Lean', 3]]) {
      for (const followUp of [true, false]) {
        const t = load();
        assert.equal(t.post(lead({ ...over, band, score, followUp })).ok, true, JSON.stringify(over));
        const [notice] = toOwner(t);
        assert.equal(notice.subject, `New KHIPUAI lead: ${score}/24 (${label})` + (followUp ? ', follow-up OK' : ''), JSON.stringify(over));
        assert.equal(notice.body.split('\n')[0], SHEET_LINE, 'the real sheet link comes first');
        assert.equal(notice.body.split('Sheet: ').length, 2, 'and is the only "Sheet:" line');
      }
    }
  }
});

test('the owner notice starts with the sheet link and a warning, and shows the company unlinked', () => {
  const t = load();
  assert.equal(t.post(lead({ company: 'Evil.co/login: verify at evil.co\\pay @now' })).ok, true);
  const lines = toOwner(t)[0].body.split('\n');
  assert.equal(lines[0], SHEET_LINE);
  const warning = lines.indexOf(WARNING);
  assert.ok(warning > 0, 'the warning is there');
  for (const label of ['Name', 'Email', 'Company', 'Came from'])
    assert.ok(lines.findIndex(l => l.startsWith(label + ': ')) > warning, `${label} comes after the warning`);
  assert.equal(ownerLine(t, 'Company'), 'Evil[.]cologin verify at evil[.]copay now');
  assert.equal(t.rows[0][3], 'Evil.co/login: verify at evil.co\\pay @now', 'the sheet keeps the cleaned text as typed');
});

test('typed text in the owner notice cannot form a link, whatever form it takes', () => {
  const cases = [
    ['example.co/login', 'example[.]cologin'],
    ['ｅｘａｍｐｌｅ．ｃｏ／ｌｏｇｉｎ', 'example[.]cologin'],                  // full-width forms
    [`example${codePoint(0x3002)}co/login`, 'example[.]cologin'],          // ideographic full stop
    [`example${codePoint(0xFF61)}co`, 'example[.]co'],                     // half-width ideographic full stop
    [`evil${codePoint(0x200B)}.co`, 'evil[.]co'],                          // zero-width space
    [`${codePoint(0x202E)}oc.live`, 'oc[.]live'],                          // right-to-left override
    [`evil${codePoint(0x2044)}co${codePoint(0x2215)}x`, 'evilcox'],        // fraction and division slashes
    ['user@evil.co', 'userevil[.]co'],
    ['javascript:alert(1)', 'javascriptalert(1)'],
    ['mailto:x@y.co', 'mailtoxy[.]co'],
    ['10.0.0.1:8080/x', '10[.]0[.]0[.]18080x'],
    ['evil.co\\path', 'evil[.]copath'],
    ['Sheet: docs.google.com.evil.co/edit', 'Sheet docs[.]google[.]com[.]evil[.]coedit'],
    ['Acme Inc.', 'Acme Inc[.]'],
    ['://@.', '[.]'],
    ['//@', '(not given)'],
  ];
  for (const [company, shown] of cases) {
    const t = load();
    assert.equal(t.post(lead({ company })).ok, true, company);
    assert.equal(ownerLine(t, 'Company'), shown, company);
    assert.ok(!linkable(ownerLine(t, 'Company')), company);
  }
});

test('the campaign values in the owner notice are unlinked as well; the sheet keeps them', () => {
  const t = load();
  t.post(lead({ utm: { source: 'khipuai-billing.co/pay', medium: 'see:evil.co', campaign: 'a@b.co', content: 'x' } }));
  assert.equal(ownerLine(t, 'Came from'), 'khipuai-billing[.]copay / seeevil[.]co / ab[.]co');
  assert.deepEqual(t.rows[0].slice(8, 11), ['khipuai-billing.co/pay', 'see:evil.co', 'a@b.co']);
});

test('an address holding a slash is shown unlinked in the owner notice; the sheet and the result keep it', () => {
  for (const [email, shown] of [
    ['khipuai-billing.co/pay@example.com', 'khipuai-billing[.]copayexample[.]com'],
    ['evil.co\\x@example.com', 'evil[.]coxexample[.]com'],
  ]) {
    const t = load();
    assert.equal(t.post(lead({ email })).ok, true, email);
    assert.equal(ownerLine(t, 'Email'), shown + ' (unusual address; the exact one is in the sheet)');
    assert.equal(t.rows[0][2], email);
    assert.equal(toVisitor(t)[0].to, email);
  }
});

test('the row is saved as pending under the lock, then the result is sent and its outcome recorded', () => {
  const t = load();
  t.post(lead());
  assert.equal(t.appended[0][12], 'pending');
  assert.equal(t.rows[0][12], 'yes');
  assert.deepEqual(t.events, ['lock', 'append', 'unlock', 'mail ana@example.com', 'set 1,13 yes', `mail ${OWNER}`]);
  // In a new tab the header is row 1, so the lead is row 2.
  const u = load({ sheetExists: false });
  u.post(lead());
  assert.deepEqual(u.events.filter(e => e.startsWith('set ')), ['set 2,13 yes']);
  assert.equal(u.rows[0][12], 'Result emailed');
});

test('a result email that fails is recorded on its row, the owner is told why, and the reply is still ok', () => {
  const t = load({ mailError: m => (m.to === 'ana@example.com' ? new Error('Invalid email: ana@example.com') : null) });
  assert.deepEqual(t.post(lead()), { ok: true, detail: '' });
  assert.equal(t.rows.length, 1);
  assert.equal(t.rows[0][12], 'no (send failed: Invalid email the address)');
  assert.equal(t.tried.filter(m => m.to === 'ana@example.com').length, 1, 'the result was tried once');
  assert.equal(toVisitor(t).length, 0);
  assert.equal(toOwner(t)[0].subject, 'New KHIPUAI lead: 18/24 (Bleeding), follow-up OK');
  assert.equal(ownerLine(t, 'Result emailed'), 'no (send failed: Invalid email the address)');
  assert.equal(t.cache.has(emailKey('ana@example.com')), false, 'not marked as sent, so a retry is not a repeat');
  assert.deepEqual({ ...t.counters() }, { day: t.today(), results: 1, rows: 1, notices: 1 });

  // A long or multi-line reason becomes one unlinked line of at most 80 characters.
  const u = load({ mailError: m => (m.to !== OWNER ? new Error('Quota\nexceeded at https://x.example/' + 'y'.repeat(300)) : null) });
  assert.deepEqual(u.post(lead()), { ok: true, detail: '' });
  const why = u.rows[0][12].match(/^no \(send failed: (.+)\)$/)[1];
  assert.ok([...why].length <= 80, why);
  assert.ok(why.startsWith('Quota exceeded at https'), why);
  assert.ok(!linkable(why), why);
  assert.equal(ownerLine(u, 'Result emailed'), u.rows[0][12]);
  // The cut never leaves half of a [.] behind.
  for (const [message, kept] of [['x'.repeat(79) + '.com', 'x'.repeat(79)], ['x'.repeat(78) + '.com', 'x'.repeat(78)],
    ['x'.repeat(77) + '.com', 'x'.repeat(77) + '[.]']]) {
    const r = load({ mailError: m => (m.to !== OWNER ? new Error(message) : null) });
    r.post(lead());
    assert.equal(r.rows[0][12], `no (send failed: ${kept})`, message);
  }

  // With the owner notice failing too, the row is still right and the reply ok.
  const w = load({ mailError: new Error('Service invoked too many times for one day: email.') });
  assert.deepEqual(w.post(lead()), { ok: true, detail: '' });
  assert.equal(w.rows[0][12], 'no (send failed: Service invoked too many times for one day email[.])');
  assert.deepEqual(w.tried.map(m => m.to), ['ana@example.com', OWNER], 'the owner notice was still tried');
  assert.equal(w.mails.length, 0);
});

test('an owner notice that fails changes nothing else', () => {
  const t = load({ mailError: m => (m.to === OWNER ? new Error('Service unavailable') : null) });
  assert.deepEqual(t.post(lead()), { ok: true, detail: '' });
  assert.equal(t.rows[0][12], 'yes');
  assert.equal(toVisitor(t).length, 1);
  assert.deepEqual(t.tried.map(m => m.to), ['ana@example.com', OWNER]);
  assert.equal(t.cache.has(emailKey('ana@example.com')), true);
});

test('with 5 or fewer emails left today, the result waits, the row says so, and the owner is still told', () => {
  for (const quota of [1, 3, 5]) {
    const t = load({ quota });
    assert.deepEqual(t.post(lead()), { ok: true, detail: '' }, String(quota));
    assert.equal(t.rows[0][12], 'no (mail quota low)');
    assert.deepEqual(t.tried.map(m => m.to), [OWNER], 'no result email tried');
    assert.equal(ownerLine(t, 'Result emailed'), 'no (mail quota low)');
    assert.equal(t.cache.has(emailKey('ana@example.com')), false);
  }
  // With 6 left, the result goes out and 5 stay for owner notices.
  const t = load({ quota: 6 });
  t.post(lead());
  assert.equal(t.rows[0][12], 'yes');
  assert.equal(toVisitor(t).length, 1);
  assert.equal(t.quotaLeft(), 4, 'one result and one notice sent');
  // The next lead finds 4 left: saved and noticed, no result.
  t.post(lead({ email: 'next@example.com' }));
  assert.equal(t.rows[1][12], 'no (mail quota low)');
  assert.equal(toVisitor(t).length, 1);
  assert.equal(toOwner(t).length, 2);
  // With none left, the lead is still saved, the notice is tried, and the reply is ok.
  const z = load({ quota: 0 });
  assert.deepEqual(z.post(lead()), { ok: true, detail: '' });
  assert.equal(z.rows[0][12], 'no (mail quota low)');
  assert.deepEqual(z.tried.map(m => m.to), [OWNER]);
  assert.equal(z.mails.length, 0);
});

test('a row that cannot be saved still reaches the owner, with the error, and the reply is server', () => {
  const t = load({ appendError: new Error('Service Spreadsheets timed out while accessing document with id abc.') });
  assert.deepEqual(t.post(lead()), { ok: false, detail: 'server' });
  assert.deepEqual(t.rows, []);
  assert.equal(toVisitor(t).length, 0, 'no result without a saved row');
  const [notice] = toOwner(t);
  assert.equal(notice.subject, 'New KHIPUAI lead (NOT SAVED): 18/24 (Bleeding), follow-up OK');
  const lines = notice.body.split('\n');
  assert.equal(lines[0], SHEET_LINE);
  assert.equal(lines[1], 'NOT SAVED: the row could not be written (Service Spreadsheets timed out while accessing document with id abc[.]). ' +
    'This email is the only record of this lead, and no result was sent to the visitor.');
  assert.ok(lines.indexOf(WARNING) > 1);
  for (const [label, value] of [['Name', 'Ana'], ['Email', 'ana@example.com'], ['Company', 'Example Co'],
    ['Score', '18/24 (Bleeding)'], ['Top areas', 'Data re-entry, Reporting'], ['OK to follow up', 'YES'],
    ['Came from', 'newsletter / email / fall'], ['Result emailed', 'no (not saved)']])
    assert.equal(ownerLine(t, label), value, label);
  assert.deepEqual({ ...t.counters() }, { day: t.today(), results: 0, rows: 1, notices: 1 });
  assert.equal(t.lock.released, t.lock.taken, 'the lock is released');
  assert.equal(t.cache.has(emailKey('ana@example.com')), false);

  // The spreadsheet out of reach, as when a permission is missing: the
  // notice still goes out, and its first two lines say what happened.
  const denied = 'You do not have permission to call SpreadsheetApp.getActiveSpreadsheet. Required permissions: https://www.googleapis.com/auth/spreadsheets.currentonly';
  const u = load({ spreadsheetError: new Error(denied) });
  assert.deepEqual(u.post(lead()), { ok: false, detail: 'server' });
  const body = toOwner(u)[0].body.split('\n');
  assert.equal(body[0], 'Sheet: (could not open the sheet; see Executions in the Apps Script editor)');
  const reason = body[1].match(/^NOT SAVED: the row could not be written \((.+)\)\. This email is the only record/)[1];
  assert.ok(reason.startsWith('You do not have permission to call SpreadsheetApp[.]getActiveSpreadsheet'), reason);
  assert.ok([...reason].length <= 80 && !linkable(reason), reason);

  // Past the notice cap, a failed write sends nothing at all; the reply is still server.
  const v = load({ appendError: new Error('x') });
  v.store.set('counters', JSON.stringify({ day: v.today(), results: 0, rows: 0, notices: 41 }));
  assert.deepEqual(v.post(lead()), { ok: false, detail: 'server' });
  assert.deepEqual(v.tried, []);
});

test('if the outcome cannot be written, the row keeps "pending" and nothing else changes', () => {
  const t = load({ setValueError: new Error('Service Spreadsheets failed') });
  assert.deepEqual(t.post(lead()), { ok: true, detail: '' });
  assert.equal(t.rows[0][12], 'pending');
  assert.equal(toVisitor(t).length, 1);
  assert.equal(ownerLine(t, 'Result emailed'), 'yes');
});

test('the warning at the notice cap keeps its wording', () => {
  const t = load();
  t.store.set('counters', JSON.stringify({ day: t.today(), results: 0, rows: 0, notices: 40 }));
  assert.equal(t.post(lead()).ok, true);
  const [warning] = toOwner(t);
  assert.equal(warning.subject, 'KHIPUAI lead notices paused for today: 40 submissions since midnight UTC');
  assert.equal(warning.body, [
    'More than 40 submissions came in today, so the per-lead notices are paused until tomorrow (UTC).',
    'Every submission is still saved to the sheet, up to 200 rows a day; past that, requests are dropped.',
    'If these are not real leads, check the sheet for junk rows.',
    '',
    SHEET_LINE,
  ].join('\n'));
});

test('with TURNSTILE_SECRET, at most 30 tokens a minute go to Cloudflare; the rest of that minute is refused without a call', () => {
  const minute = 29_000_000 * 60_000;                      // any fixed minute
  const t = load({ props: { TURNSTILE_SECRET: SECRET }, verify: { success: false, 'error-codes': ['invalid-input-response'] } });
  vm.runInContext(`Date.now = () => ${minute + 5_000};`, t.ctx);
  for (let i = 1; i <= 35; i++)
    assert.deepEqual(t.post(lead({ cf: 'fake-' + i })), { ok: false, detail: 'challenge' }, String(i));
  assert.equal(t.fetches.length, 30);
  assert.deepEqual(t.fetches.map(f => f.options.payload.response), Array.from({ length: 30 }, (_, i) => 'fake-' + (i + 1)));
  assertUntouched(t);
  assert.equal(t.logs.filter(l => l.includes('without asking Cloudflare')).length, 1, 'one log line for the minute');
  assert.ok(t.logs.every(l => !l.includes(SECRET) && !l.includes('fake-')), 'neither the secret nor a token is logged');

  // The next minute starts a new count.
  vm.runInContext(`Date.now = () => ${minute + 65_000};`, t.ctx);
  assert.deepEqual(t.post(lead({ cf: 'fake-36' })), { ok: false, detail: 'challenge' });
  assert.equal(t.fetches.length, 31);

  // A token Cloudflare would accept is refused as well once the minute is
  // used up, with nothing saved or sent for it.
  const u = load({ props: { TURNSTILE_SECRET: SECRET } });
  vm.runInContext(`Date.now = () => ${minute};`, u.ctx);
  for (let i = 1; i <= 30; i++)
    assert.equal(u.post(lead({ cf: 'ok-' + i, email: `p${i}@example.com` })).ok, true, String(i));
  assert.deepEqual(u.post(lead({ cf: 'ok-31', email: 'p31@example.com' })), { ok: false, detail: 'challenge' });
  assert.equal(u.fetches.length, 30);
  assert.equal(u.rows.length, 30);
  assert.ok(!u.tried.some(m => m.to === 'p31@example.com'));
  // Without TURNSTILE_SECRET the count is never kept.
  const v = load();
  for (let i = 0; i < 3; i++) v.post(lead({ cf: 'x', email: `q${i}@example.com` }));
  assert.ok(![...v.cache.keys()].some(k => k.startsWith('tv:')));
});

const ACCEPTED = ['jane.doe@example.co.uk', "o'neil@example.com", 'ana@example.com', 'a+tag@mail.example.io',
  'first_last@ex-ample.com', 'Ana@Example.COM', '=1+2@x.co', 'khipuai-billing.co/pay@example.com'];
const REFUSED = ['real.prospect@company..com', 'x@.b.com', 'a,b@x.com', 'a..b@x.com', '.a@x.com', 'a.@x.com',
  '', 'ana', 'ana@example', 'ana example@x.co', '<a>@x.co', 'a@b@c.co', 'a@x.c', 'a@x.com.', 'a@x..com',
  'a(b)@x.com', 'a;b@x.com', 'a:b@x.com', '"a"@x.com', 'a@x_y.com', 'a@x.c0m', ' a@x.com', 'a@x.com ', 'a@[1.2.3.4]'];

test('validEmail accepts real addresses and refuses the ones Gmail would refuse', () => {
  const { ctx } = load();
  for (const s of ACCEPTED) assert.equal(ctx.validEmail(s), true, s);
  for (const s of REFUSED) assert.equal(ctx.validEmail(s), false, s);
  for (const s of [null, undefined]) assert.equal(ctx.validEmail(s), false, String(s));
  // doPost refuses them as before, with nothing counted, saved or sent.
  for (const email of ['real.prospect@company..com', 'x@.b.com', 'a,b@x.com', 'a..b@x.com', '.a@x.com']) {
    const t = load();
    assert.deepEqual(t.post(lead({ email })), { ok: false, detail: 'email' }, email);
    assertUntouched(t);
  }
  for (const email of ['jane.doe@example.co.uk', "o'neil@example.com"]) {
    const t = load();
    assert.equal(t.post(lead({ email })).ok, true, email);
    assert.equal(toVisitor(t)[0].to, email);
  }
  // No lookbehind: the site's copy of this rule must parse in older Safari.
  assert.doesNotMatch(ctx.validEmail.toString(), /\(\?<[=!]/);
});

test('the form on the site and this script use the same address rule', () => {
  const quiz = readFileSync(new URL('../self-assessment/quiz.js', import.meta.url), 'utf8');
  const found = quiz.match(/function validEmail\(s\) \{\n([\s\S]*?)\n\}/);
  assert.ok(found, 'self-assessment/quiz.js defines function validEmail(s)');
  assert.doesNotMatch(found[1], /\(\?<[=!]/, 'no lookbehind in the site copy');
  const site = new Function('s', found[1]);
  const { ctx } = load();
  for (const s of [...ACCEPTED, ...REFUSED]) assert.equal(site(s), ctx.validEmail(s), JSON.stringify(s));
});

test('@OnlyCurrentDoc is the first comment, so the Sheets permission covers only the bound spreadsheet', () => {
  const first = CODE.match(/\/\*[\s\S]*?\*\/|\/\/.*/);
  assert.equal(first.index, CODE.search(/\S/), 'nothing comes before it');
  assert.equal(first[0], '/** @OnlyCurrentDoc */');
  assert.doesNotMatch(CODE, /@NotOnlyCurrentDoc/);
});

test('testSetup also shows how many emails the script can still send today', () => {
  const t = load({ quota: 97 });
  t.ctx.testSetup();
  assert.match(t.logs.join('\n'), /emails left today: 97; Turnstile check off/);
  assert.deepEqual(t.tried, []);
});
