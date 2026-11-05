// What the Meta Pixel and the self-assessment may send, checked against what
// the consent banner and the privacy pages (EN and ES) promise:
// - the Pixel starts with automatic collection off (autoConfig false, before
//   init), so it never records button clicks such as the Yes/No answers;
// - Meta hears of a viewed score and a booked call, never of an email request;
// - the visitor's result stays out of the booking link's href, where any tool
//   that records link addresses could read it, and joins the address only
//   when the Calendly popup (or its fallback) opens;
// - the email check refuses the addresses Gmail refuses.
// shared/meta-pixel.js runs in node:vm on a small fake page. quiz.js is
// imported (nothing at its top level needs a page) and mountQuiz runs on a
// fake of the self-assessment page.
// Run: node --test tests/privacy.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import vm from 'node:vm';
import { C } from '../shared/content.js';
import { mountQuiz, validEmail } from '../self-assessment/quiz.js';

const ROOT = new URL('../', import.meta.url);
const read = f => readFileSync(new URL(f, ROOT), 'utf8');
const PIXEL_JS = read('shared/meta-pixel.js');
const PIXEL_ID = '1112143148017821';
const CALENDLY_JS = 'https://assets.calendly.com/assets/external/widget.js';
const LEADS = 'https://script.google.com/macros/s/test/exec';
const tick = () => new Promise(resolve => setImmediate(resolve));

// The self-assessment's booking link after 15 answers of Yes, and the address
// Calendly receives when it opens: the href this link carried until
// 2026-11-05, unchanged.
const LINK = `${C.booking}?utm_source=khipuai_site&utm_medium=self_assessment&utm_campaign=self_assessment`;
const RESULT = { utmContent: 'score-24-high-reentry-approvals', a1: 'Self-assessment: 24/24 (High). Largest gaps: Data re-entry, Approvals and handoffs.' };
const FULL = `${LINK}&utm_content=score-24-high-reentry-approvals&a1=Self-assessment%3A+24%2F24+%28High%29.+Largest+gaps%3A+Data+re-entry%2C+Approvals+and+handoffs.`;

// shared/meta-pixel.js on a fake page, run up to DOMContentLoaded.
// consent: the choice saved earlier ('allowed', 'denied'), or null for none.
// gpc: navigator.globalPrivacyControl. calendly: Calendly's script is loaded.
function pixelPage({ consent = 'allowed', gpc = false, calendly = true } = {}) {
  const on = {};          // listeners, by 'document:click', 'window:message', ...
  const listen = where => (type, fn) => { (on[`${where}:${type}`] ??= []).push(fn); };
  const added = [];       // elements the script put on the page
  const popups = [];      // the addresses Calendly.initPopupWidget was given
  const store = new Map(consent ? [['khipuai-meta-measurement', consent]] : []);
  const page = {
    URL, URLSearchParams,
    navigator: { globalPrivacyControl: gpc },
    localStorage: { getItem: k => store.get(k) ?? null, setItem: (k, v) => { store.set(k, String(v)); }, removeItem: k => { store.delete(k); } },
    location: { href: 'https://khipuai.co/self-assessment/', reload() {} },
    addEventListener: listen('window'),
    document: {
      documentElement: { lang: 'en' },
      head: { append: el => { added.push(el); } },
      body: { append: el => { added.push(el); } },
      createElement: tag => ({ tag, dataset: {}, setAttribute() {}, addEventListener: listen(tag), remove() { this.removed = true; } }),
      getElementsByTagName: () => [{ parentNode: { insertBefore: el => { added.push(el); } } }],
      querySelector: () => null,
      getElementById: () => null,
      addEventListener: listen('document'),
    },
    ...(calendly ? { Calendly: { initPopupWidget: options => { popups.push(options.url); } } } : {}),
  };
  page.window = page;
  vm.runInContext(PIXEL_JS, vm.createContext(page), { filename: 'shared/meta-pixel.js' });
  for (const fn of on['document:DOMContentLoaded'] ?? []) fn();
  return {
    page, added, popups, store,
    // Every fbq call so far, in order. Before fbevents.js loads, the snippet queues them.
    calls: () => (page.fbq ? Array.from(page.fbq.queue, args => Array.from(args)) : []),
    banner: () => added.find(el => el.className === 'meta-consent' && !el.removed),
    choose(choice) { for (const fn of on['section:click'] ?? []) fn({ target: { closest: () => ({ dataset: { metaChoice: choice } }) } }); },
    // A click on link (href, target, dataset); keys: modifier keys or another button.
    click(link, keys = {}) {
      const event = { target: { closest: () => link }, button: 0, ctrlKey: false, metaKey: false, shiftKey: false, altKey: false,
        prevented: false, preventDefault() { this.prevented = true; }, ...keys };
      for (const fn of on['document:click'] ?? []) fn(event);
      return event;
    },
    message(origin, data) { for (const fn of on['window:message'] ?? []) fn({ origin, data }); },
  };
}

// mountQuiz on a fake of the self-assessment page: elements by id, made on
// first use, that keep what quiz.js sets and the listeners it adds. The
// page's globals are set for the run and removed after it.
async function quizPage(search, run) {
  const els = new Map();
  const el = id => {
    if (!els.has(id)) els.set(id, {
      id, hidden: false, disabled: false, checked: false, value: '', href: '#', textContent: '', innerHTML: '',
      dataset: {}, style: {}, on: {},
      addEventListener(type, fn) { (this.on[type] ??= []).push(fn); },
      setAttribute(name, value) { this[name] = String(value); },
      focus() {}, scrollIntoView() {}, before() {},
      replaceChildren(...nodes) { this.textContent = nodes.map(n => (typeof n === 'string' ? n : n.textContent)).join(''); },
      querySelector: selector => el(`${id} ${selector}`),
      querySelectorAll: () => [],
    });
    return els.get(id);
  };
  const form = el('leadform');
  const fields = ['name', 'email', 'company', 'website'].map(name => (form[name] = el(`leadform ${name}`)));
  form.querySelectorAll = () => fields;
  const posts = [], gtagCalls = [], metaCalls = [];
  const fakes = {
    document: { getElementById: el, createElement: tag => el(`new ${tag} ${els.size}`) },
    location: { search },
    // lead() is here only to show that quiz.js no longer calls it.
    window: { KHIPUAIMeta: { scoreViewed: () => metaCalls.push('scoreViewed'), lead: () => metaCalls.push('lead') } },
    addEventListener() {},
    fetch: async (url, options) => { posts.push({ url, ...options }); return {}; },
    gtag: (...args) => { gtagCalls.push(args); },
  };
  const saved = Object.keys(fakes).map(k => [k, Object.getOwnPropertyDescriptor(globalThis, k)]);
  for (const [k, value] of Object.entries(fakes)) Object.defineProperty(globalThis, k, { value, configurable: true, writable: true });
  try {
    mountQuiz({ ...C, leads: LEADS, turnstile: '' });
    // A click on a button. Answers move on after 180 ms; here, at once.
    const tap = id => {
      const later = globalThis.setTimeout;
      globalThis.setTimeout = fn => { fn(); return 0; };
      try { for (const fn of el(id).on.click ?? []) fn({}); } finally { globalThis.setTimeout = later; }
    };
    const answerAll = answer => { tap('start'); for (let i = 0; i < 15; i++) tap(`quiz .${answer}`); };
    const submit = email => { form.email.value = email; return Promise.all(form.on.submit.map(fn => fn({ preventDefault() {} }))); };
    await run({ el, tap, answerAll, submit, posts, gtagCalls, metaCalls });
  } finally {
    for (const [k, d] of saved) if (d) Object.defineProperty(globalThis, k, d); else delete globalThis[k];
  }
}

test('the Pixel starts with automatic collection off, set before init', () => {
  const p = pixelPage({ consent: 'allowed' });
  assert.deepEqual(p.calls(), [['set', 'autoConfig', false, PIXEL_ID], ['init', PIXEL_ID], ['track', 'PageView']]);
  assert.ok(p.added.some(el => el.src === 'https://connect.facebook.net/en_US/fbevents.js'), 'loads the Pixel');
});

test('the Pixel waits for the visitor\'s choice and honours Global Privacy Control', () => {
  const asked = pixelPage({ consent: null });
  assert.equal(asked.page.fbq, undefined, 'nothing before a choice');
  assert.ok(asked.banner(), 'the banner asks');
  asked.choose('allowed');
  assert.equal(asked.banner(), undefined, 'the banner closes');
  assert.equal(asked.store.get('khipuai-meta-measurement'), 'allowed');
  assert.deepEqual(asked.calls(), [['set', 'autoConfig', false, PIXEL_ID], ['init', PIXEL_ID], ['track', 'PageView']]);

  const declined = pixelPage({ consent: null });
  declined.choose('denied');
  assert.equal(declined.page.fbq, undefined, 'declined');
  assert.equal(pixelPage({ consent: 'denied' }).page.fbq, undefined, 'declined earlier');
  for (const consent of ['allowed', 'denied', null]) {
    const gpc = pixelPage({ consent, gpc: true });
    assert.equal(gpc.page.fbq, undefined, `GPC, choice ${consent}`);
    assert.equal(gpc.banner(), undefined, `GPC, choice ${consent}: no banner`);
  }
});

test('Meta hears of a viewed score and a booked call, never of an email request', () => {
  const p = pixelPage();
  assert.deepEqual(Object.keys(p.page.KHIPUAIMeta), ['scoreViewed'], 'no lead() for email requests');
  p.page.KHIPUAIMeta.scoreViewed();
  p.page.KHIPUAIMeta.scoreViewed();
  p.message('https://khipuai.co', { event: 'calendly.event_scheduled' });   // not from Calendly: ignored
  p.message('https://calendly.com', { event: 'calendly.event_scheduled' });
  p.message('https://calendly.com', { event: 'calendly.event_scheduled' });
  assert.deepEqual(p.calls().slice(3), [['trackCustom', 'AssessmentScoreViewed'], ['track', 'Lead']]);
});

test('only the consent script talks to the Pixel, and nothing asks it for an email Lead', () => {
  const SKIP = new Set(['.git', 'node_modules', '_site', 'tests']);
  const walk = (dir = '') => readdirSync(new URL(dir, ROOT), { withFileTypes: true }).flatMap(e =>
    e.isDirectory() ? (SKIP.has(e.name) ? [] : walk(`${dir}${e.name}/`)) : [`${dir}${e.name}`]);
  const code = walk().filter(f => /\.(m?js|html?|gs)$/i.test(f));
  assert.deepEqual(code.filter(f => /KHIPUAIMeta\s*\??\.\s*lead\b|KHIPUAIMeta\s*(\?\.)?\[\s*['"`]lead/.test(read(f))), [],
    'the consent banner covers visits, assessment views and booked calls, not email requests');
  assert.deepEqual(code.filter(f => /\bfbq\s*\(/.test(read(f))), ['shared/meta-pixel.js'],
    'only shared/meta-pixel.js may call fbq: it waits for consent and turns automatic collection off');
});

test('the Calendly popup and its fallback get the result from the link\'s data attributes', async () => {
  const booking = new URL(C.booking);
  assert.equal(booking.origin + booking.pathname, 'https://calendly.com/wmorapal/30min', 'the only address meta-pixel.js opens in the popup');
  const link = { href: LINK, target: '', dataset: { ...RESULT } };
  const p = pixelPage();
  assert.equal(p.click(link).prevented, true);
  await tick();
  assert.deepEqual(p.popups, [FULL]);
  assert.equal(link.href, LINK, 'the href itself stays plain');

  // Calendly's script cannot load: the page goes to the same full address.
  const down = pixelPage({ calendly: false });
  assert.equal(down.click(link).prevented, true);
  down.added.find(el => el.src === CALENDLY_JS).onerror(new Error('404'));
  await tick();
  assert.equal(down.page.location.href, FULL);

  // A booking link without a result (every other page) opens as it is.
  const plain = pixelPage();
  plain.click({ href: C.booking, target: '', dataset: {} });
  await tick();
  assert.deepEqual(plain.popups, [C.booking]);

  // The values are encoded, never spliced into the address.
  const odd = pixelPage();
  odd.click({ href: LINK, target: '', dataset: { utmContent: 'a&b=c', a1: 'x#y?z&a1=w' } });
  await tick();
  const sent = new URL(odd.popups[0]);
  assert.equal(sent.searchParams.get('utm_content'), 'a&b=c');
  assert.deepEqual(sent.searchParams.getAll('a1'), ['x#y?z&a1=w']);
  assert.equal(sent.hash, '');
});

test('modifier-key clicks, middle clicks and target=_blank are left to the browser (plain href)', async () => {
  const link = { href: LINK, target: '', dataset: { ...RESULT } };
  const p = pixelPage();
  for (const keys of [{ ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { altKey: true }, { button: 1 }])
    assert.equal(p.click(link, keys).prevented, false, JSON.stringify(keys));
  assert.equal(p.click({ ...link, target: '_blank' }).prevented, false, 'target=_blank');
  assert.equal(p.click({ ...link, href: 'https://calendly.com/someone-else/30min' }).prevented, false, 'another Calendly page');
  await tick();
  assert.deepEqual(p.popups, []);
  assert.equal(p.page.location.href, 'https://khipuai.co/self-assessment/');
});

test('the self-assessment keeps the result out of the booking link\'s href', async () => {
  await quizPage('', async ({ el, tap, answerAll, metaCalls }) => {
    const book = el('bookbtn');
    answerAll('yes');
    assert.equal(book.href, LINK, 'campaign values only');
    assert.deepEqual({ ...book.dataset }, RESULT);
    assert.ok(metaCalls.includes('scoreViewed'));

    // The same link, clicked: Calendly receives the result as before.
    const p = pixelPage();
    p.click({ href: book.href, target: '', dataset: book.dataset });
    await tick();
    assert.deepEqual(p.popups, [FULL]);

    tap('r-restart');
    assert.deepEqual({ ...book.dataset }, {}, 'no result, nothing on the link');
    answerAll('no');
    assert.equal(book.href, LINK);
    assert.deepEqual({ ...book.dataset }, { utmContent: 'score-0-low', a1: 'Self-assessment: 0/24 (Low). Largest gaps: none flagged.' });
  });

  // A visitor who came from a campaign: its values stay; the page's own utm_content does not.
  await quizPage('?utm_source=newsletter&utm_medium=email&utm_campaign=fall&utm_content=issue-2', async ({ el, answerAll }) => {
    answerAll('yes');
    assert.equal(el('bookbtn').href, `${C.booking}?utm_source=newsletter&utm_medium=email&utm_campaign=fall`);
    assert.equal(el('bookbtn').dataset.utmContent, RESULT.utmContent);
  });
});

const ACCEPTED = ['jane.doe@example.co.uk', "o'neil@example.com", 'ana@example.com', 'A.B@Example.COM', 'first+tag@sub.example.org'];
const REFUSED = ['real.prospect@company..com', 'x@.b.com', 'a,b@x.com', 'a..b@x.com', '.a@x.com', 'a.@x.com',
  '', 'name', 'a@b', 'a@b.c', 'a b@x.com', '<a>@x.com', 'a@x.com.', 'a@@x.com', 'a;b@x.com', 'a@x_y.com'];

test('the email check refuses the addresses Gmail refuses', () => {
  for (const email of ACCEPTED) assert.equal(validEmail(email), true, email);
  for (const email of REFUSED) assert.equal(validEmail(email), false, email);
  // Older Safari cannot parse lookbehind; one would stop the whole script.
  for (const f of ['self-assessment/quiz.js', 'shared/meta-pixel.js']) assert.doesNotMatch(read(f), /\(\?<[=!]/, f);
});

test('the email form refuses a bad address, and a good one reaches Google Analytics but not Meta', async () => {
  await quizPage('', async ({ el, answerAll, submit, posts, gtagCalls, metaCalls }) => {
    answerAll('yes');
    for (const email of REFUSED) {
      el('lf-msg').textContent = '';
      await submit(email);
      assert.equal(el('lf-msg').textContent, 'Please check the email address.', email);
    }
    assert.deepEqual(posts, [], 'nothing sent');

    await submit('  jane.doe@example.co.uk ');
    assert.equal(posts.length, 1);
    assert.equal(posts[0].url, LEADS);
    assert.equal(JSON.parse(posts[0].body).email, 'jane.doe@example.co.uk');
    assert.match(el('lf-msg').textContent, /^Your result is on its way to jane\.doe@example\.co\.uk\./);
    assert.deepEqual(gtagCalls, [['event', 'generate_lead', { method: 'self_assessment_email' }]]);
    assert.ok(!metaCalls.includes('lead'), 'no Meta Lead for an email request');
  });
});
