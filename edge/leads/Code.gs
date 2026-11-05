/* KHIPUAI self-assessment leads: Google Apps Script web app.

   The site is static (GitHub Pages), so this script is the one place a lead
   lands. For each request it:
     1. appends a row to the "Leads" tab of the spreadsheet it is bound to,
     2. emails the visitor their result (the thing they asked for),
     3. emails the owner of this script a "new lead" notice.

   Abuse limits: the visitor email is built ONLY from text held here. The
   site sends a score, a band id and up to two area ids, never free text that
   ends up in an email body, so nobody can use this endpoint to mail arbitrary
   content to arbitrary addresses. The first name keeps only letters (any
   alphabet, with accents), spaces, apostrophes and hyphens, so no link,
   address, number or formula survives in it, and it is capped. One result
   per email address per 10 minutes, and a daily cap well below the Gmail
   quota. The owner notices and the sheet rows are capped per day as well, so
   a flood of fake submissions cannot fill the inbox, burn the mail quota, or
   grow the sheet without limit. Every typed value is written to the sheet as
   text, never as a formula.

   Optional bot check: when the script property TURNSTILE_SECRET is set, a
   request must carry a Cloudflare Turnstile token (field cf) that Cloudflare
   confirms, before anything is counted, saved or sent.

   Setup and redeploy steps: edge/leads/README.md. No secrets live here. */

const SHEET = 'Leads';
const DAILY_CAP = 60;     // result emails to visitors per day (UTC)
const NOTICE_CAP = 40;    // "new lead" notices to the owner per day; one warning when reached
const ROW_CAP = 200;      // rows saved per day; past this, requests are dropped unwritten
const REPLY_TO = 'wil@khipuai.co';
const SENDER_NAME = 'Wil Mora, KHIPUAI';
const BOOKING = 'https://calendly.com/wmorapal/30min';
const PDF = 'https://khipuai.co/self-assessment.pdf';
const TOTAL = 24;
const NAME_MAX = 40;      // characters kept of the first name
const TURNSTILE_VERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const TURNSTILE_HOSTS = ['khipuai.co', 'www.khipuai.co'];

/* Same wording as the site (self-assessment/index.html, BANDS and LEAK). */
const BANDS = {
  lean:     ['Lean', 'Your back office is in good shape. A quick win or two, but automation is not urgent.'],
  leaking:  ['Leaking', 'You have several clear opportunities to cut repetitive work. An audit puts real hours and dollars on them and shows what to fix first.'],
  bleeding: ['Bleeding', 'Manual work is holding the business back, with real cost and risk (errors, key-person dependency). Worth mapping soon, starting with the areas below.'],
};
const LEAK = {
  reentry:   ['Data re-entry', 'people retype the same information into more than one system. Usually the first thing worth automating: the system moves it, a person checks it.'],
  approvals: ['Approvals and handoffs', 'work waits in inboxes and chats. A tracked approval flow with reminders removes most of the chasing.'],
  reporting: ['Reporting', 'numbers get rebuilt by hand before anyone can decide. Reports can assemble themselves from the systems you already use.'],
  accuracy:  ['Reconciliation and accuracy', 'mismatches get caught late, by hand. Automatic checks can flag them before a client does.'],
  tells:     ['Key-person dependency', 'routine work lives in one person’s head. Writing it down and automating the routine part protects you when they are away.'],
};

const HEADERS = ['Received', 'First name', 'Email', 'Company', 'Score', 'Band', 'Top areas',
  'OK to follow up', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'Result emailed'];

function doPost(e) {
  try {
    const d = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (d.hp) return reply_(true);                       // honeypot: pretend success
    if (!human_(d.cf)) return reply_(false, 'challenge'); // Turnstile, when on: before anything is counted, saved or sent

    const email = String(d.email || '').trim().toLowerCase().slice(0, 120);
    if (!/^[^\s@<>"]+@[^\s@<>"]+\.[a-z]{2,}$/i.test(email)) return reply_(false, 'email');

    const name = name_(d.name);
    const company = clean_(d.company, 80);
    const score = Math.round(Number(d.score));
    if (!(score >= 0 && score <= TOTAL)) return reply_(false, 'score');
    // Own keys only, so "constructor" or "__proto__" is not taken for a band or an area.
    const band = has_(BANDS, String(d.band)) ? BANDS[String(d.band)] : null;
    if (!band) return reply_(false, 'band');
    const top = [];                                      // the first two different known areas
    for (const raw of Array.isArray(d.top) ? d.top : []) {
      const id = String(raw);
      if (has_(LEAK, id) && top.indexOf(id) === -1) top.push(id);
      if (top.length === 2) break;
    }
    const followUp = d.followUp === true;
    const utm = d.utm || {};
    // Cleaned once, for the sheet and the owner notice alike.
    const from = { source: clean_(utm.source, 60), medium: clean_(utm.medium, 60),
      campaign: clean_(utm.campaign, 60), content: clean_(utm.content, 80) };

    const cache = CacheService.getScriptCache();
    const key = 'e:' + Utilities.base64EncodeWebSafe(email);
    const dupe = !!cache.get(key);
    const day = Utilities.formatDate(new Date(), 'UTC', 'yyyyMMdd');

    /* Counting and writing happen under the lock, so two requests landing
       together cannot both slip under a cap. */
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    let canMail, canNotify, warn;
    try {
      const c = counters_(day);
      if (c.rows >= ROW_CAP) return reply_(false, 'busy');   // flood: drop it, write nothing
      canMail = !dupe && c.results < DAILY_CAP;
      canNotify = c.notices < NOTICE_CAP;
      warn = c.notices === NOTICE_CAP;                       // first one past the cap sends one warning
      // The name and the address go through the formula guard here only; the
      // greeting and the address the result is sent to stay as they are.
      sheet_().appendRow([new Date(), cell_(name), cell_(email), company, score, band[0],
        top.map(id => LEAK[id][0]).join(', '), followUp ? 'yes' : 'no',
        from.source, from.medium, from.campaign, from.content,
        canMail ? 'yes' : (dupe ? 'no (repeat within 10 min)' : 'no (daily cap)')]);
      c.rows += 1;
      if (canMail) c.results += 1;
      if (canNotify || warn) c.notices += 1;
      saveCounters_(c);
    } finally {
      lock.releaseLock();
    }

    if (canMail) {
      MailApp.sendEmail({
        to: email,
        replyTo: REPLY_TO,
        name: SENDER_NAME,
        subject: 'Your self-assessment result: ' + score + ' of ' + TOTAL + ' (' + band[0] + ')',
        body: visitorBody_(name, score, band, top),
      });
      cache.put(key, '1', 600);
    }

    const owner = Session.getEffectiveUser().getEmail();
    const sheetUrl = SpreadsheetApp.getActiveSpreadsheet().getUrl();
    if (canNotify) {
      MailApp.sendEmail({
        to: owner,
        subject: 'New KHIPUAI lead: ' + (company || email) + ' scored ' + score + '/' + TOTAL,
        body: [
          'Name: ' + (name || '(not given)'),
          'Email: ' + email,
          'Company: ' + (company || '(not given)'),
          'Score: ' + score + '/' + TOTAL + ' (' + band[0] + ')',
          'Top areas: ' + (top.length ? top.map(id => LEAK[id][0]).join(', ') : 'none flagged'),
          'OK to follow up: ' + (followUp ? 'YES' : 'no, result only'),
          'Came from: ' + [from.source, from.medium, from.campaign].filter(Boolean).join(' / '),
          'Result emailed: ' + (canMail ? 'yes' : 'no'),
          '',
          'Sheet: ' + sheetUrl,
        ].join('\n'),
      });
    } else if (warn) {
      MailApp.sendEmail({
        to: owner,
        subject: 'KHIPUAI lead notices paused for today: ' + NOTICE_CAP + ' submissions since midnight UTC',
        body: [
          'More than ' + NOTICE_CAP + ' submissions came in today, so the per-lead notices are paused until tomorrow (UTC).',
          'Every submission is still saved to the sheet, up to ' + ROW_CAP + ' rows a day; past that, requests are dropped.',
          'If these are not real leads, check the sheet for junk rows.',
          '',
          'Sheet: ' + sheetUrl,
        ].join('\n'),
      });
    }

    return reply_(true);
  } catch (err) {
    console.error(err);
    return reply_(false, 'server');
  }
}

/* Lets you open the web app URL in a browser to confirm it is live. */
function doGet() {
  return reply_(true, 'alive');
}

function visitorBody_(name, score, band, top) {
  const lines = [
    'Hi ' + (name || 'there') + ',',
    '',
    'Thanks for taking the KHIPUAI back-office self-assessment. Here is your result.',
    '',
    'Score: ' + score + ' of ' + TOTAL,
    band[0] + '. ' + band[1],
    '',
  ];
  if (top.length) {
    lines.push('Where your team is most likely losing hours:');
    top.forEach(id => lines.push('- ' + LEAK[id][0] + ': ' + LEAK[id][1]));
  } else {
    lines.push('No big leaks flagged. Your answers point to a tidy back office.');
  }
  lines.push(
    '',
    'The worksheet as a PDF, to score with the people who do the work:',
    PDF,
    '',
    'If you want to put real hours and dollars on it, book a 30-minute fit call. We go through your answers together and pick the first thing worth fixing:',
    BOOKING,
    '',
    'Or just reply to this email with a question.',
    '',
    'Wil Mora',
    'Founder, KHIPUAI',
    'khipuai.co',
    '',
    'You received this because you asked for your result on khipuai.co. To have your details deleted, reply with "delete".'
  );
  return lines.join('\n');
}

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET);
  if (!sh) {
    sh = ss.insertSheet(SHEET);
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
  }
  return sh;
}

/* Daily counters (UTC) in script properties, so the caps hold all day instead
   of expiring with the cache. Call only while holding the script lock. */
function counters_(day) {
  let c = {};
  try {
    c = JSON.parse(PropertiesService.getScriptProperties().getProperty('counters') || '{}');
  } catch (e) {
    c = {};
  }
  if (c.day !== day) c = { day: day, results: 0, rows: 0, notices: 0 };
  return c;
}

function saveCounters_(c) {
  PropertiesService.getScriptProperties().setProperty('counters', JSON.stringify(c));
}

/* Cloudflare Turnstile. Off (true, and nothing is fetched) until the script
   property TURNSTILE_SECRET is set in Project Settings > Script properties.
   On: true only when Cloudflare confirms that the token in cf was solved on
   khipuai.co. A missing token costs no call; if Cloudflare cannot be reached
   or answers anything else, the request is refused (fails closed). */
function human_(token) {
  const secret = String(PropertiesService.getScriptProperties().getProperty('TURNSTILE_SECRET') || '').trim();
  if (!secret) return true;
  if (typeof token !== 'string' || !token || token.length > 2048) return false;   // tokens are at most 2048 characters
  try {
    const res = UrlFetchApp.fetch(TURNSTILE_VERIFY, {
      method: 'post',
      payload: { secret: secret, response: token },
      muteHttpExceptions: true,
    });
    const v = JSON.parse(res.getContentText());
    if (!v || v.success !== true) {
      console.warn('Turnstile refused a request: ' + JSON.stringify((v && v['error-codes']) || []));
      return false;
    }
    if (v.hostname && TURNSTILE_HOSTS.indexOf(String(v.hostname).toLowerCase()) === -1) {
      console.warn('Turnstile token from another site: ' + String(v.hostname).slice(0, 100));
      return false;
    }
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}

/* The first name, for the greeting and the sheet. Only letters of any
   alphabet and their accents (combining marks), spaces, apostrophes (' and ’)
   and hyphens stay. Digits, dots, slashes, @ and everything else go, so a
   name cannot carry a link (example.co/claim), an address or a formula into
   an email KHIPUAI sends. Line breaks and other spaces become one space;
   capped at NAME_MAX whole characters. With no letter left it is empty, and
   the email says "Hi there,". */
function name_(v) {
  const s = String(v == null ? '' : v)
    .slice(0, 400)                                       // plenty for 40 characters; bounds the work
    .normalize('NFC')
    .replace(/\s+/g, ' ')
    .replace(/[^\p{L}\p{M} '\u2019-]+/gu, '')
    .replace(/ {2,}/g, ' ')
    .trim();
  const capped = Array.from(s).slice(0, NAME_MAX).join('').trim();
  return /\p{L}/u.test(capped) ? capped : '';
}

/* Single line, no markup or links, capped. Also defuses spreadsheet formulas. */
function clean_(v, max) {
  const s = String(v == null ? '' : v)
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/https?:\/\/\S+|www\.\S+|[<>]/gi, '')
    .trim()
    .slice(0, max);
  return cell_(s);
}

/* A sheet cell that stays text: a leading =, +, - or @ would make Sheets (or
   Excel, after a download) read it as a formula, so it gets a ' in front. */
function cell_(s) {
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function has_(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

function reply_(ok, detail) {
  return ContentService.createTextOutput(JSON.stringify({ ok: ok, detail: detail || '' }))
    .setMimeType(ContentService.MimeType.JSON);
}

/* Run once from the editor (Run > testSetup) to create the Leads tab and grant
   the permissions, before deploying. Sends nothing. Run it again after
   pasting a new version: Google then asks for any new permission (this
   version adds "Connect to an external service", for Turnstile). */
function testSetup() {
  sheet_();
  const turnstile = String(PropertiesService.getScriptProperties().getProperty('TURNSTILE_SECRET') || '').trim();
  console.log('Leads tab ready in ' + SpreadsheetApp.getActiveSpreadsheet().getName() +
    '; notices will go to ' + Session.getEffectiveUser().getEmail() +
    '; Turnstile check ' + (turnstile ? 'ON (TURNSTILE_SECRET is set)' : 'off (no TURNSTILE_SECRET)'));
}

/* Run from the editor after setting TURNSTILE_SECRET, to check the secret
   without a real visitor. Cloudflare is asked about a dummy token:
   "invalid-input-response" means the secret is right (only the dummy token
   was refused); "invalid-input-secret" means the secret is wrong. Sends no
   email and logs no secret. */
function testTurnstile() {
  const secret = String(PropertiesService.getScriptProperties().getProperty('TURNSTILE_SECRET') || '').trim();
  if (!secret) {
    console.log('TURNSTILE_SECRET is not set, so the Turnstile check is off.');
    return;
  }
  const res = UrlFetchApp.fetch(TURNSTILE_VERIFY, {
    method: 'post',
    payload: { secret: secret, response: 'dummy-token' },
    muteHttpExceptions: true,
  });
  console.log('Cloudflare answered ' + res.getResponseCode() + ': ' + res.getContentText().slice(0, 300));
}
