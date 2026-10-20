/* Trial copy of the live self-assessment (/self-assessment/), one question at
   a time. The questions, weights, bands, area notes and every line of text
   are the live page's, unchanged. What is different:
   - one question per card, with Back, Next and Start over;
   - NOTHING IS SENT. There is no fetch, no Meta Pixel, no gtag, and C.leads
     is never read. The email form validates like the live one and then shows
     a trial note instead of posting. */

const PARTS = [
  { id:'reentry', kick:'Part one', head:'Data re-entry, <em>the silent hours.</em>', q:[
    [2,'Does anyone retype information from PDFs, emails, or one system into another?'],
    [2,'Do you enter the same customer, vendor, or client data into more than one system?'],
    [1,'Do people download data from one tool just to upload or paste it into another?'],
  ]},
  { id:'approvals', kick:'Part two', head:'Approvals <em>and handoffs.</em>', q:[
    [2,'Do approvals (invoices, time off, purchases, onboarding) live in email or chat instead of a tracked workflow?'],
    [1,'Has work ever stalled because someone did not know it was waiting on them?'],
    [2,'When a new client or employee is onboarded, does the same information get handed between people and re-keyed?'],
  ]},
  { id:'reporting', kick:'Part three', head:'Reporting, <em>and who waits for it.</em>', q:[
    [2,'Does someone rebuild the same report (weekly, monthly) by hand from multiple sources?'],
    [1,'Do leaders wait on a person to assemble numbers before they can see how the business is doing?'],
    [1,'Have you ever made a decision on a stale number because the fresh one was too much work to pull?'],
  ]},
  { id:'accuracy', kick:'Part four', head:'Reconciliation <em>and accuracy.</em>', q:[
    [2,'Does anyone reconcile two systems or spreadsheets line by line to catch mismatches?'],
    [2,'Do billing or invoicing errors slip through and get caught later (or by the client)?'],
    [1,'Is there a &ldquo;person who just knows&rdquo; how a critical process works, with little written down?'],
  ]},
  { id:'tells', kick:'Part five', head:'The tells.', q:[
    [2,'Do you have a process everyone agrees is painful but &ldquo;that&rsquo;s just how we do it&rdquo;?'],
    [1,'Have you looked at an AI or automation tool, felt it could help, but not known where to start?'],
    [2,'If your busiest person took two weeks off, would routine work pile up because only they can do it?'],
  ]},
];

const BANDS = [
  { max:6,        name:'Low',     copy:'Your back office is in good shape. A quick win or two, but automation is not urgent.' },
  { max:14,       name:'Moderate',  copy:'You have several clear opportunities to cut repetitive work. Solution Design puts real hours and dollars on them and shows what to fix first.' },
  { max:Infinity, name:'High', copy:'Manual work is holding the business back, with real cost and risk (errors, key-person dependency). Worth mapping soon, starting with the areas below.' },
];

const LEAK = {
  reentry:  ['Data re-entry', 'people retype the same information into more than one system. Usually the first thing worth automating: the system moves it, a person checks it.'],
  approvals:['Approvals and handoffs', 'work waits in inboxes and chats. A tracked approval flow with reminders removes most of the chasing.'],
  reporting:['Reporting', 'numbers get rebuilt by hand before anyone can decide. Reports can assemble themselves from the systems you already use.'],
  accuracy: ['Reconciliation and accuracy', 'mismatches get caught late, by hand. Automatic checks can flag them before a client does.'],
  tells:    ['Key-person dependency', 'routine work lives in one person’s head. Writing it down and automating the routine part protects you when they are away.'],
};

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));

// Flat list of the 15 questions: { part, w, t }.
const QS = PARTS.flatMap(p => p.q.map(([w, t]) => ({ part: p, w, t })));
const TOTAL = QS.reduce((s, q) => s + q.w, 0);
const PARTNAME = Object.fromEntries(PARTS.map(p => [p.id, LEAK[p.id][0]]));

export function mountQuiz(C) {
  const $ = id => document.getElementById(id);
  const quiz = $('quiz'), result = $('result');
  const yes = quiz.querySelector('.yes'), no = quiz.querySelector('.no');
  const back = $('q-back'), next = $('q-next');

  // Answers live only in this variable: no storage, as on the live page.
  let answers = QS.map(() => null);
  let at = 0;
  let lastResult = null;

  $('design-book').href = C.booking;
  $('design-book').textContent = C.hero.cta;
  $('legal').textContent = C.legal;

  const score = () => QS.reduce((s, q, i) => s + (answers[i] === 'yes' ? q.w : 0), 0);

  function show(i, focus = true) {
    at = i;
    const q = QS[i];
    result.hidden = true;
    quiz.hidden = false;
    $('q-count').textContent = `Question ${i + 1} of ${QS.length}`;
    $('q-bar').style.width = `${(answers.filter(Boolean).length / QS.length) * 100}%`;
    $('q-kick').textContent = q.part.kick;
    $('q-part').innerHTML = q.part.head;
    $('q-text').innerHTML = q.t;
    yes.setAttribute('aria-pressed', String(answers[i] === 'yes'));
    no.setAttribute('aria-pressed', String(answers[i] === 'no'));
    next.disabled = !answers[i];
    $('tallynum').textContent = score();
    if (focus) { $('q-text').focus({ preventScroll: true }); quiz.scrollIntoView({ block: 'start' }); }
  }

  function answer(a) {
    answers[at] = a;
    render();
    show(at, false);
    // Move on once answered, like turning the page.
    setTimeout(() => (at < QS.length - 1 ? show(at + 1) : showResult()), 180);
  }

  function showResult() {
    render();
    quiz.hidden = true;
    result.hidden = false;
    result.focus({ preventScroll: true });
    result.scrollIntoView({ block: 'start' });
  }

  /* The call link carries the result, as on the live page. */
  function bookingUrl(sc, band, top) {
    const u = new URL(C.booking);
    const here = new URLSearchParams(location.search);
    u.searchParams.set('utm_source', here.get('utm_source') || 'khipuai_site');
    u.searchParams.set('utm_medium', here.get('utm_medium') || 'self_assessment');
    u.searchParams.set('utm_campaign', here.get('utm_campaign') || 'self_assessment');
    u.searchParams.set('utm_content', `score-${sc}-${band.toLowerCase()}${top.length ? '-' + top.join('-') : ''}`);
    u.searchParams.set('a1', `Self-assessment: ${sc}/${TOTAL} (${band}). Largest gaps: ${top.length ? top.map(id => PARTNAME[id]).join(', ') : 'none flagged'}.`);
    return u.toString();
  }

  function render() {
    const done = answers.filter(Boolean).length;
    const sc = score();
    $('tallynum').textContent = sc;
    $('scorenum').textContent = sc;
    if (done < QS.length) {
      lastResult = null;
      $('resband').textContent = 'Answer all 15 questions to see your result.';
      $('leaks').hidden = true;
      $('rescta').hidden = true;
      $('scorenote').textContent = `${done} of ${QS.length} answered. Your answers stay in this browser unless you book a call or ask for your result by email.`;
      return;
    }
    const band = BANDS.find(b => sc <= b.max);
    $('resband').innerHTML = `<b>${esc(band.name)}.</b> ${esc(band.copy)}`;
    // Top leak areas: share of each part's points answered yes; up to two, strongest first.
    const byPart = PARTS.map(p => {
      const idx = QS.map((q, i) => i).filter(i => QS[i].part === p);
      const got = idx.reduce((s, i) => s + (answers[i] === 'yes' ? QS[i].w : 0), 0);
      const max = idx.reduce((s, i) => s + QS[i].w, 0);
      return { id: p.id, share: got / max };
    }).filter(x => x.share > 0).sort((a, b) => b.share - a.share);
    const top = byPart.filter((x, i) => i === 0 || x.share >= 0.4).slice(0, 2).map(x => x.id);
    $('leaks').innerHTML = top.length
      ? top.map(id => `<li><b>${esc(LEAK[id][0])}:</b> ${esc(LEAK[id][1])}</li>`).join('')
      : `<li><b>No major gaps identified.</b> Your answers indicate a well-organized back office.</li>`;
    $('leaks').hidden = false;
    $('rescta').hidden = false;
    $('bookbtn').href = bookingUrl(sc, band.name, top);
    lastResult = { score: sc, band: band.name.toLowerCase(), top };
    $('scorenote').textContent = `All ${QS.length} answered. Your answers stay in this browser unless you book a call or ask for your result by email.`;
  }

  $('start').addEventListener('click', () => {
    if (answers.every(Boolean)) showResult();
    else show(Math.max(0, answers.findIndex(a => !a)));
    (result.hidden ? quiz : result).scrollIntoView({ block: 'start' });
  });
  yes.addEventListener('click', () => answer('yes'));
  no.addEventListener('click', () => answer('no'));
  back.addEventListener('click', () => {
    if (at > 0) show(at - 1);
    else { quiz.hidden = true; $('start').focus(); }
  });
  next.addEventListener('click', () => {
    if (!answers[at]) return;
    at < QS.length - 1 ? show(at + 1) : showResult();
  });
  $('r-back').addEventListener('click', () => show(QS.length - 1));
  $('r-restart').addEventListener('click', () => {
    answers = QS.map(() => null);
    render();
    show(0);
  });
  render();

  /* ---- result by email: SWITCHED OFF on this trial page ------------------
     Same fields and the same checks as the live form, then a trial note.
     No request of any kind is made, and the page does not navigate. */
  const form = $('leadform');
  const msg = $('lf-msg');
  form.addEventListener('submit', event => {
    event.preventDefault();
    msg.classList.remove('trial-off');
    const email = form.email.value.trim();
    if (!lastResult) { msg.textContent = 'Answer all 15 questions first, then your result can be sent.'; return; }
    if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)) { msg.textContent = 'Please check the email address.'; form.email.focus(); return; }
    msg.textContent = 'Trial page: this form is switched off here. On the live site it sends your result by email.';
    msg.classList.add('trial-off');
  });
}
