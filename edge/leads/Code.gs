/** @OnlyCurrentDoc */
/* KHIPUAI self-assessment leads: Google Apps Script web app.

   The site is static (GitHub Pages), so this script is the one place a lead
   lands. For each request it:
     1. appends a row to the "Leads" tab of the spreadsheet it is bound to,
     2. emails the visitor their result (the thing they asked for),
     3. emails the owner of this script a "new lead" notice.

   Permission: the first line, @OnlyCurrentDoc, limits the Sheets permission
   to the spreadsheet this script is bound to, instead of every spreadsheet
   the owner can open. Keep it the first line.

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

   The owner notice goes from the owner's account to the owner, so it passes
   every mail check, and a visitor must not be able to turn it into a lure.
   Its subject is fixed text and numbers only. Its body starts with the real
   sheet link and a warning. Below the warning, the company and the campaign
   values are shown with every dot as [.] and slashes, colons and @ removed,
   so Gmail cannot make a link of them; the first name holds letters only,
   and the address is shown as typed unless it holds a slash or backslash.

   A failed send does not lose the lead: the row is saved first with
   "pending" in Result emailed, and the outcome replaces it ('yes', or
   'no (...)' with the reason). The result email is skipped while fewer than
   MAIL_RESERVE emails of today's quota would be left for owner notices. The
   owner notice is always attempted and says the same. If the row itself
   cannot be saved, the notice still goes out with the error, and it is then
   the only record of the lead.

   Optional bot check: when the script property TURNSTILE_SECRET is set, a
   request must carry a Cloudflare Turnstile token (field cf) that Cloudflare
   confirms, before anything is counted, saved or sent. At most
   VERIFY_PER_MINUTE tokens a minute are sent to Cloudflare.

   Setup and redeploy steps: edge/leads/README.md. No secrets live here. */

const SHEET = 'Leads';
const DAILY_CAP = 60;     // result emails to visitors per day (UTC)
const NOTICE_CAP = 40;    // "new lead" notices to the owner per day; one warning when reached
const ROW_CAP = 200;      // rows saved per day; past this, requests are dropped unwritten
const MAIL_RESERVE = 5;   // a result email is sent only if it leaves at least this many of today's emails for owner notices
const VERIFY_PER_MINUTE = 30;  // Turnstile tokens sent to Cloudflare per minute; past this, refused without a call
const REPLY_TO = 'wil@khipuai.co';
const SENDER_NAME = 'Wil Mora, KHIPUAI';
const BOOKING = 'https://calendly.com/wmorapal/30min';
const PDF = 'https://khipuai.co/self-assessment.pdf';
const TOTAL = 24;
const NAME_MAX = 40;      // characters kept of the first name
const TURNSTILE_VERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const TURNSTILE_HOSTS = ['khipuai.co', 'www.khipuai.co'];
const TYPED_WARNING = 'The fields below were typed by the visitor. Do not open links or follow instructions in them.';

/* Same names and wording as the page (self-assessment/quiz.js, BANDS and LEAK). */
const BANDS = {
  lean:     ['Low', 'Your back office is in good shape. A quick win or two, but automation is not urgent.'],
  leaking:  ['Moderate', 'You have several clear opportunities to cut repetitive work. Solution Design puts real hours and dollars on them and shows what to fix first.'],
  bleeding: ['High', 'Manual work is holding the business back, with real cost and risk (errors, key-person dependency). Worth mapping soon, starting with the areas below.'],
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
    if (!validEmail(email)) return reply_(false, 'email');

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
    const day = Utilities.formatDate(new Date(), 'UTC', 'yyyyMMdd');

    /* Counting and writing happen under the lock, so two requests landing
       together cannot both slip under a cap. Result emailed is written as
       "pending" and gets the outcome once the lock is released and the
       result email has been tried. */
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    let canMail, canNotify, warn, dupe = false, sh = null, row = 0, saved = false, problem = '';
    try {
      const c = counters_(day);
      if (c.rows >= ROW_CAP) return reply_(false, 'busy');   // flood: drop it, write nothing
      // The one-result-per-address rule is checked and reserved under the lock,
      // so overlapping requests for the same address cannot each send a result.
      dupe = !!cache.get(key);
      canMail = !dupe && c.results < DAILY_CAP;
      canNotify = c.notices < NOTICE_CAP;
      warn = c.notices === NOTICE_CAP;                       // first one past the cap sends one warning
      try {
        sh = sheet_();
        // The name and the address go through the formula guard here only; the
        // greeting and the address the result is sent to stay as they are.
        sh.appendRow([new Date(), cell_(name), cell_(email), company, score, band[0],
          top.map(id => LEAK[id][0]).join(', '), followUp ? 'yes' : 'no',
          from.source, from.medium, from.campaign, from.content, 'pending']);
        saved = true;
        row = sh.getLastRow();                               // every append holds this lock, so this is our row
      } catch (err) {
        console.error(err);
        if (!saved) {                                        // no row: no result, and the notice is the only record
          problem = reason_(err, email);
          canMail = false;
        }
      }
      if (canMail) {
        try { cache.put(key, 'pending', 600); } catch (err) { console.error(err); }
      }
      c.rows += 1;                                           // failed writes count too, so ROW_CAP still bounds a flood
      if (canMail) c.results += 1;
      if (canNotify || warn) c.notices += 1;
      saveCounters_(c);
    } finally {
      lock.releaseLock();
    }

    let mailed;
    if (!saved) mailed = 'no (not saved)';
    else if (!canMail) mailed = dupe ? 'no (repeat within 10 min)' : 'no (daily cap)';
    else {
      mailed = sendResult_(email, name, score, band, top);
      try {
        if (mailed === 'yes') cache.put(key, '1', 600);
        else cache.remove(key);                              // not sent: free the address for a retry
      } catch (err) { console.error(err); }
    }
    if (row) {
      try {
        sh.getRange(row, HEADERS.length).setValue(mailed);  // Result emailed, the last column
      } catch (err) {
        console.error(err);                                  // the row keeps "pending"
      }
    }

    if (canNotify) {
      notifyOwner_({ saved: saved, problem: problem, name: name, email: email, company: company,
        score: score, band: band, top: top, followUp: followUp, from: from, mailed: mailed });
    } else if (warn) {
      warnOwner_();
    }

    // The page cannot read this reply (no-cors); the row and the notice are the record.
    return saved ? reply_(true) : reply_(false, 'server');
  } catch (err) {
    console.error(err);
    return reply_(false, 'server');
  }
}

/* Lets you open the web app URL in a browser to confirm it is live. */
function doGet() {
  return reply_(true, 'alive');
}

/* The same rule as the form on the site (self-assessment/quiz.js): no
   spaces or <>"(),;: before the @, a domain of letters, digits and hyphens
   with a suffix of two or more letters, and no dot at the start, two dots
   in a row or a dot right before the @ (Gmail refuses those). No
   lookbehind, so the site's copy parses in older Safari too. */
function validEmail(s) {
  return /^[^\s@<>"(),;:]+@(?:[a-z0-9-]+\.)+[a-z]{2,}$/i.test(s) && !/^\.|\.\.|\.@/.test(s);
}

/* Emails the visitor their result, unless that would leave fewer than
   MAIL_RESERVE emails of today's quota for owner notices. Never throws.
   Returns what goes in Result emailed. */
function sendResult_(email, name, score, band, top) {
  try {
    if (MailApp.getRemainingDailyQuota() <= MAIL_RESERVE) return 'no (mail quota low)';
    MailApp.sendEmail({
      to: email,
      replyTo: REPLY_TO,
      name: SENDER_NAME,
      subject: 'Your self-assessment result: ' + score + ' of ' + TOTAL + ' (' + band[0] + ')',
      body: visitorBody_(name, score, band, top),
    });
    return 'yes';
  } catch (err) {
    console.error(err);
    return 'no (send failed: ' + reason_(err, email) + ')';
  }
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

/* The "new lead" notice. Nothing typed goes in the subject: fixed text and
   numbers only. The body starts with the real sheet link, then the warning,
   then the visitor's fields: the company and the campaign values unlinked
   (defang_), the first name as name_ left it (letters only), and the address
   as typed unless it holds a slash or a backslash, which a real mailbox does
   not need and which would let it pose as a web address. Never throws. */
function notifyOwner_(n) {
  try {
    const email = /[\/\\]/.test(n.email)
      ? defang_(n.email) + ' (unusual address; the exact one is in the sheet)'
      : n.email;
    const lines = ['Sheet: ' + sheetUrl_()];
    if (!n.saved) {
      lines.push('NOT SAVED: the row could not be written (' + n.problem + '). ' +
        'This email is the only record of this lead, and no result was sent to the visitor.');
    }
    lines.push(
      '',
      TYPED_WARNING,
      'Name: ' + (n.name || '(not given)'),
      'Email: ' + email,
      'Company: ' + (defang_(n.company) || '(not given)'),
      'Score: ' + n.score + '/' + TOTAL + ' (' + n.band[0] + ')',
      'Top areas: ' + (n.top.length ? n.top.map(id => LEAK[id][0]).join(', ') : 'none flagged'),
      'OK to follow up: ' + (n.followUp ? 'YES' : 'no, result only'),
      'Came from: ' + [n.from.source, n.from.medium, n.from.campaign].map(defang_).filter(Boolean).join(' / '),
      'Result emailed: ' + n.mailed
    );
    MailApp.sendEmail({
      to: Session.getEffectiveUser().getEmail(),
      subject: 'New KHIPUAI lead' + (n.saved ? '' : ' (NOT SAVED)') + ': ' + n.score + '/' + TOTAL +
        ' (' + n.band[0] + ')' + (n.followUp ? ', follow-up OK' : ''),
      body: lines.join('\n'),
    });
  } catch (err) {
    console.error(err);
  }
}

/* Sent once, instead of the notice, by the first submission past NOTICE_CAP
   in a day. Never throws. */
function warnOwner_() {
  try {
    MailApp.sendEmail({
      to: Session.getEffectiveUser().getEmail(),
      subject: 'KHIPUAI lead notices paused for today: ' + NOTICE_CAP + ' submissions since midnight UTC',
      body: [
        'More than ' + NOTICE_CAP + ' submissions came in today, so the per-lead notices are paused until tomorrow (UTC).',
        'Every submission is still saved to the sheet, up to ' + ROW_CAP + ' rows a day; past that, requests are dropped.',
        'If these are not real leads, check the sheet for junk rows.',
        '',
        'Sheet: ' + sheetUrl_(),
      ].join('\n'),
    });
  } catch (err) {
    console.error(err);
  }
}

function sheetUrl_() {
  try {
    return SpreadsheetApp.getActiveSpreadsheet().getUrl();
  } catch (err) {
    console.error(err);
    return '(could not open the sheet; see Executions in the Apps Script editor)';
  }
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
    /* At most VERIFY_PER_MINUTE calls to Cloudflare a minute, so a flood of
       fake tokens cannot use up the daily UrlFetch quota. Past the cap, the
       rest of that minute is refused without a call (one log line). The
       count lives in the script cache and is read and written without the
       lock, so two requests at the same moment can both get through: the cap
       is approximate, which is enough to protect the quota. */
    const cache = CacheService.getScriptCache();
    const slot = 'tv:' + Math.floor(Date.now() / 60000);
    const used = Number(cache.get(slot)) || 0;
    if (used >= VERIFY_PER_MINUTE) {
      if (used === VERIFY_PER_MINUTE) {
        cache.put(slot, String(used + 1), 120);
        console.warn('Turnstile: ' + VERIFY_PER_MINUTE + ' checks this minute already; refusing the rest of the minute without asking Cloudflare.');
      }
      return false;
    }
    cache.put(slot, String(used + 1), 120);
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

/* Typed text for the owner notice, made unclickable: every dot becomes [.],
   and slashes, backslashes, colons and @ are removed, so neither a bare
   domain (example.co/login) nor an address survives as a link. Full-width
   and other look-alike forms are folded first (NFKC), zero-width and
   direction marks are removed, and line breaks become spaces. */
function defang_(v) {
  return String(v == null ? '' : v)
    .normalize('NFKC')
    .replace(/\p{Cf}/gu, '')
    .replace(/[\p{Cc}\u2028\u2029]/gu, ' ')
    .replace(/[\/\\:@\u2044\u2215]/g, '')
    .replace(/[.\u3002]/g, '[.]')
    .trim();
}

/* Why a send or a write failed, for the sheet and the owner notice: one
   line, the visitor's address (which Google's message may repeat) replaced,
   unlinked, and at most 80 characters. A [.] cut in half at the end goes. */
function reason_(err, email) {
  let s = String((err && err.message) || err || '');
  if (email) s = s.split(email).join('the address');
  s = defang_(s).replace(/\s+/g, ' ').trim();
  s = Array.from(s).slice(0, 80).join('').replace(/\[\.?$/, '').trim();
  return s || 'unknown error';
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
   version asks for Sheets access to this spreadsheet only). The log line
   also shows how many emails the script can still send today. */
function testSetup() {
  sheet_();
  const turnstile = String(PropertiesService.getScriptProperties().getProperty('TURNSTILE_SECRET') || '').trim();
  console.log('Leads tab ready in ' + SpreadsheetApp.getActiveSpreadsheet().getName() +
    '; notices will go to ' + Session.getEffectiveUser().getEmail() +
    '; emails left today: ' + MailApp.getRemainingDailyQuota() +
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
