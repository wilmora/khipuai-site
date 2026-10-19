/* A plain, one-screen trial of the homepage, built only to compare against
   the Kinetic one. Not linked from the live site and marked noindex.

   Layout: a top bar with grouped section links on the right and the booking
   button; each section fills the screen below in the same layout.
   Overview pairs the offer with a diagram of the three steps; AI shows the
   work before and after. On a phone the same pieces stack and the page
   scrolls.

   Every sentence comes from shared/content.js / shared/content.es.js, or from
   a heading or section label the live homepage already uses (passed in as L),
   except the trial-only project details in projects.js (draft, marked NEW).
   The diagrams use only that wording plus the site's own line icons, and no
   numbers that are not already in the copy. */
import { featureIcon } from '/shared/kinetic.js';
import { PROJECTS, shown } from './projects.js';

// Screens and logos live next to this file, so the Spanish page (one folder
// down) loads the same files.
const ASSET = new URL('./', import.meta.url).href;
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const h2 = (h, em) => `<h2>${esc(h)}${em ? ` <em>${esc(em)}</em>` : ''}</h2>`;
const ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg>';

export function render(C, L) {
  const PJ = PROJECTS[L.lang];
  document.title = L.title;
  const top = document.getElementById('book-top');
  top.href = C.booking;
  top.textContent = L.bookShort;

  // ids match the live homepage's section ids, so #work or #security means
  // the same thing on both. Labels are the live homepage's own.
  //
  // Every tab uses the same section layout: a left column with the section
  // label, heading and one supporting line or action, and a right column with
  // the content as open, ruled rows. Same top line, same grid, same rules on
  // every tab, so they read as sections of one page rather than as slides.
  const book = `<a class="btn" href="${C.booking}">${esc(C.hero.cta)}</a>`;
  const sec = (id, head, body) => `<div class="sec sec-${id}"><div class="sec-head">${head}</div><div class="sec-body">${body}</div></div>`;
  const head = (kick, h, em, extra = '') => `${kick ? `<p class="kick">${esc(kick)}</p>` : ''}${h2(h, em)}${extra}`;
  const rows = (items, group, numbered) => `<ol class="rows">${items.map(([t, d], i) =>
    `<li>${numbered ? `<b class="num">0${i + 1}</b>` : featureIcon(group, i)}<h3>${esc(t)}</h3><p>${esc(d)}</p></li>`).join('')}</ol>`;

  const projects = PJ.items.map(x => {
    const base = x.from === undefined ? {} : C.portfolio.items[x.from];
    return { key: x.key, shots: x.shots, alt: x.alt || [], t: shown(x.t ?? base.t), d: shown(x.d ?? base.d), who: shown(x.who ?? base.who), why: shown(x.why) };
  });

  const tabs = [
    ['start', L.tabs.start, sec('start', `
        <p class="kick">${esc(C.hero.eyebrow)}</p>
        <h1>${esc(C.hero.headline)} <em>${esc(C.hero.headlineEm)}</em></h1>
        <p class="lede">${esc(C.hero.sub)}</p>
        <div class="ctas">${book}<a class="btn line" href="/self-assessment/">${esc(C.hero.ctaAlt)}</a></div>
        <ul class="trust">${C.trust.map(([t, d]) => `<li><strong>${esc(t)}</strong><span>${esc(d)}</span></li>`).join('')}</ul>`, `
        <figure class="flow" aria-labelledby="flow-h">
          <figcaption id="flow-h">${h2(L.steps[0], L.steps[1])}</figcaption>
          <ol class="timeline">
            ${C.steps.map(([t, d], i) => `<li><span class="node"><b>0${i + 1}</b></span>
              <div><h3>${esc(t)}</h3><p>${esc(d)}</p></div></li>`).join('')}
            <li class="end"><span class="node">${featureIcon('deliverable', 5)}</span>
              <div><h3>${esc(C.deliverables[5][0])}</h3><p>${esc(C.deliverables[5][1])}</p></div></li>
          </ol>
          <p class="note">${esc(C.legal)}</p>
        </figure>`)],

    // Patterns and AI as one picture: the manual work today on the left, the
    // same work once the code is built, with a person approving, on the right.
    ['ai', L.tabs.ai, sec('ai',
      head(C.ai.kick, L.problem[0], L.problem[1], `<p class="intro">${esc(C.ai.lead)}</p>`), `
        <div class="ba">
          <section class="before" aria-labelledby="ba-before">
            <h3 id="ba-before">${esc(C.problem.lead)}</h3>
            <ul>${C.problem.items.map((x, i) => `<li>${featureIcon('problem', i)}<span>${esc(x)}</span></li>`).join('')}</ul>
          </section>
          <span class="ba-arrow">${ARROW}</span>
          <section class="after" aria-labelledby="ba-after">
            <h3 id="ba-after">${esc(C.ai.title)} ${esc(C.ai.titleEm)}</h3>
            <ul>${C.ai.points.map(([t, d], i) => `<li>${featureIcon('ai', i)}<span><strong>${esc(t)}</strong> ${esc(d)}</span></li>`).join('')}</ul>
          </section>
        </div>`)],

    ['get', L.tabs.get, sec('get',
      head(L.get[0], L.get[1], L.get[2], `<ul class="nolines">${C.noLines.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`),
      rows(C.deliverables, 'deliverable', true))],

    // Portfolio as project cards, like GeoSolv's project summaries: a screen,
    // a title, two lines, and "Learn more" for the full summary. Eight cards
    // fill two rows of four, so the next-step link sits in the header.
    ['work', L.tabs.work, `<div class="sec-work">
        <div class="work-head"><div>${head(C.portfolio.kick, C.portfolio.title, C.portfolio.titleEm)}</div><p class="work-side"><span class="note">${esc(C.portfolio.note)}</span>
          <span class="work-next">${esc(C.portfolio.next)} <a href="${C.booking}">${esc(C.portfolio.nextLink)} &rarr;</a></span></p></div>
        <ul class="pcards">${projects.map(p => `<li class="pc">
          <div class="pc-img">${p.shots.length ? `<img src="${ASSET}shots/${p.shots[0]}" alt="" loading="lazy">` : `<span class="pc-ph">${featureIcon('ai', 0)}</span>`}</div>
          <div class="pc-body"><h3>${esc(p.t)}</h3><p>${esc(p.d)}</p>
            <button type="button" class="pc-more" data-p="${p.key}" aria-haspopup="dialog">${esc(PJ.learn)}<span class="visually-hidden">: ${esc(p.t)}</span> &rarr;</button></div></li>`).join('')}
        </ul></div>`],

    ['security', L.tabs.security, sec('security',
      head(C.security.kick, C.security.title, C.security.titleEm,
        `<p class="more"><a href="${L.securityHref}">${esc(C.security.link)} &rarr;</a></p>`),
      rows(C.security.points, 'security', false))],

    ['fit', L.tabs.fit, sec('fit',
      head(L.fit[0], L.fit[1], L.fit[2], `<div class="ctas">${book}</div>`), `
        <div class="fit">
          <div class="yes"><h3>${esc(C.fit.forTitle)}</h3><ul>${C.fit.forYou.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
          <div class="no"><h3>${esc(C.fit.notTitle)}</h3><ul>${C.fit.notForYou.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
        </div>`)],

    ['questions', L.tabs.questions, sec('questions',
      head(L.tabs.questions, L.faq[0], L.faq[1], `<div class="ctas">${book}</div>`), `
        <div class="faq">${C.faq.map(([q, a]) => `<details name="faq"><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>`)],

    ['operator', L.tabs.operator, sec('operator',
      `<h2>${esc(L.aboutKick)}</h2><blockquote class="quote"><p>&ldquo;${esc(C.founder.quote)}&rdquo;</p><footer>${esc(C.founder.name)}, ${esc(C.founder.role)}</footer></blockquote>`, `
        <div class="team">
          <div class="member"><img src="/shared/assets/founder.jpg" alt="${esc(L.founderAlt)}" width="96" height="96">
            <div><h3>${esc(C.founder.name)}</h3><p class="role">${esc(C.founder.role)}</p><p>${esc(C.founder.bio)}</p></div></div>
          <div class="member"><img src="/shared/assets/alex.jpg" alt="${esc(L.alex.alt)}" width="96" height="96">
            <div><h3>Alex Pena</h3><p class="role">${esc(L.alex.role)}</p><p>${esc(L.alex.bio)}</p></div></div>
        </div>
        <ul class="principles">${C.trust.map(([t, d]) => `<li><strong>${esc(t)}</strong><span>${esc(d)}</span></li>`).join('')}</ul>
        <p class="more"><a href="${L.aboutHref}">${esc(L.aboutLink)} &rarr;</a></p>`)],
  ];

  // Navigation after BotLogix and Fractional AI: the logo on the left, a few
  // grouped links on the right, menus that open on click or keyboard (never
  // hover only), and the booking button at the far right. Menu titles and
  // their one-line descriptions are the sections' own headings.
  const groups = [
    { label: L.nav.services, items: [
      ['ai', C.ai.kick, C.ai.title],
      ['get', L.get[0], `${L.get[1]} ${L.get[2]}`],
      ['fit', L.fit[0], `${L.fit[1]} ${L.fit[2]}`] ] },
    { id: 'work', label: L.tabs.work },
    { id: 'security', label: L.tabs.security },
    { label: L.tabs.operator, items: [
      ['operator', L.aboutKick, L.nav.team],
      ['questions', L.tabs.questions, `${L.faq[0]} ${L.faq[1]}`] ] },
  ];
  document.getElementById('nav').innerHTML = `
    <button type="button" class="nav-toggle" aria-expanded="false" aria-controls="nav-list">${esc(L.nav.menu)}</button>
    <ul class="nav-list" id="nav-list">${groups.map((g, i) => g.items ? `<li class="nav-group">
      <button type="button" class="nav-top" aria-expanded="false" aria-controls="menu-${i}">${esc(g.label)}<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 4.5 6 8l3.5-3.5"/></svg></button>
      <ul class="nav-menu" id="menu-${i}">${g.items.map(([id, t, d]) => `<li><a href="#${id}" data-sec="${id}"><strong>${esc(t)}</strong><span>${esc(d)}</span></a></li>`).join('')}</ul></li>`
      : `<li><a class="nav-top" href="#${g.id}" data-sec="${g.id}">${esc(g.label)}</a></li>`).join('')}</ul>`;

  // The page's small print (trial note, privacy, contact) moves from the
  // footer into the strip, so the footer row can carry the tool logos alone.
  const fine = [...document.querySelectorAll('.ft .wrap > p')].map(n => n.innerHTML).join(' &middot; ');
  document.querySelectorAll('.ft .wrap > p').forEach(n => n.remove());
  document.querySelector('.ft').insertAdjacentHTML('beforebegin', `<aside class="band" aria-label="${esc(C.hero.cta)}">
    <div class="wrap"><div><p>${esc(C.problem.close)}</p><p class="band-fine">${fine}</p></div>${book}</div></aside>`);
  document.getElementById('main').innerHTML = tabs.map(([id, label, html], i) =>
    `<section class="panel" id="panel-${id}" aria-label="${esc(label)}" tabindex="-1"${i === 0 ? '' : ' hidden'}>${html}</section>`).join('');

  mountNav(tabs.map(([id]) => id));
  mountLogos(C, L);
  mountProjects(projects, PJ, C, L.lang);
}

/* The tool logos, GeoSolv-style, as a row near the bottom of every tab. The
   Tools tab's wording (each tool's line and the trademark note) sits behind
   the row's label so nothing from it is lost. FOR TESTING: logo permission is
   pending for every company (see logos/SOURCES.md); Microsoft's four products
   show as names because Microsoft's icon terms do not cover this use. */
const LOGOS = ['', '', '', 'zendesk.svg', 'monday.png', 'google.svg', 'meta.svg', 'anthropic.svg'];
function mountLogos(C, L) {
  const items = C.tools.items.map(([name], i) => {
    const f = LOGOS[i];
    const img = f ? `<img src="${ASSET}logos/${f}" alt="${esc(name)}" height="20" class="lg-${f.split('.')[0]}">` : '';
    const label = !f ? `<span class="lg-name">${esc(name)}</span>`
      : (f === 'zendesk.svg' ? `<span class="lg-name" aria-hidden="true">${esc(name)}</span>`
      : f === 'google.svg' ? `<span class="lg-name" aria-hidden="true">Search Console</span>` : '');
    return `<li title="${esc(name)}">${img}${label}</li>`;
  }).join('');
  document.querySelector('.ft .wrap').insertAdjacentHTML('afterbegin', `<div class="logos">
    <details class="tools-more"><summary>${esc(C.tools.kick)}</summary>
      <div class="tools-pop"><ul>${C.tools.items.map(([t, d]) => `<li><strong>${esc(t)}</strong> ${esc(d)}</li>`).join('')}</ul>
      <p>${esc(C.tools.note)}</p></div></details>
    <ul class="logo-row" aria-label="${esc(C.tools.kick)}">${items}</ul></div>`);
  const det = document.querySelector('.tools-more');
  document.addEventListener('click', e => { if (det.open && !det.contains(e.target)) det.open = false; });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && det.open) { det.open = false; det.querySelector('summary').focus(); } });
}

/* "Learn more": the project's full summary in a modal dialog (focus is held
   inside it, Escape and the Close button return to the card). */
// Learn more opens a dialog with the project summary and, beside it, a small
// click-through demo of the product (made-up data, nothing saved or sent) and
// its screenshots. A demo's code and styles load only when its dialog opens.
let demoCss;
const loadDemoCss = () => demoCss ||= new Promise(done => {
  const link = Object.assign(document.createElement('link'), { rel: 'stylesheet', href: `${ASSET}demos/demo.css` });
  link.onload = link.onerror = done;
  document.head.append(link);
});

function mountProjects(projects, PJ, C, lang) {
  document.body.insertAdjacentHTML('beforeend', `<dialog class="pd" id="pd" aria-labelledby="pd-h">
    <div class="pd-in"><div class="pd-media">
      <div class="pd-switch" id="pd-switch" role="group" aria-label="${esc(PJ.view)}">
        <button type="button" data-view="demo" aria-pressed="true">${esc(PJ.demoView)}</button>
        <button type="button" data-view="shots" aria-pressed="false">${esc(PJ.shotsView)}</button></div>
      <div id="pd-demo"></div><div id="pd-shots" hidden></div></div>
    <div class="pd-text"><h2 id="pd-h"></h2><dl>
      <dt>${esc(C.portfolio.cols[1])}</dt><dd id="pd-d"></dd>
      <dt>${esc(PJ.why)}</dt><dd id="pd-why"></dd>
      <dt>${esc(C.portfolio.cols[2])}</dt><dd id="pd-who"></dd></dl>
      <p class="note">${esc(C.portfolio.note)}</p>
      <button type="button" class="btn line" id="pd-close">${esc(PJ.close)}</button></div></div></dialog>`);
  const dlg = document.getElementById('pd'), $ = id => document.getElementById(id);
  const sw = $('pd-switch'), demo = $('pd-demo'), shots = $('pd-shots');
  let opener = null, current = '';
  const view = v => {
    sw.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.view === v)));
    demo.hidden = v !== 'demo'; shots.hidden = v !== 'shots';
  };
  const open = (key, btn) => {
    const p = projects.find(x => x.key === key); if (!p) return;
    opener = btn; current = key;
    $('pd-h').textContent = p.t;
    $('pd-d').textContent = p.d;
    $('pd-why').textContent = p.why;
    $('pd-who').textContent = p.who;
    shots.innerHTML = p.shots.map((f, i) => `<img src="${ASSET}shots/${f}" alt="${esc(p.alt[i] || p.t)}" loading="lazy">`).join('') + `<p class="note">${esc(PJ.shotNote)}</p>`;
    sw.querySelector('[data-view="shots"]').hidden = !p.shots.length;
    sw.hidden = !p.shots.length;
    demo.innerHTML = `<p class="pd-load">${esc(PJ.loading)}</p>`;
    view('demo');
    dlg.showModal();
    Promise.all([import(`${ASSET}demos/kit.js`), import(`${ASSET}demos/${key}.js`), loadDemoCss()])
      .then(([kit, mod]) => { if (current === key && dlg.open) kit.mount(demo, mod.default, lang); })
      .catch(() => { if (current === key) demo.innerHTML = `<div class="pd-ph">${featureIcon('ai', 0)}<p>${esc(PJ.demoFailed)}</p></div>`; });
  };
  document.querySelectorAll('.pc-more').forEach(b => b.addEventListener('click', () => open(b.dataset.p, b)));
  sw.addEventListener('click', e => { const b = e.target.closest('[data-view]'); if (b) view(b.dataset.view); });
  $('pd-close').addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('close', () => { current = ''; demo.innerHTML = ''; opener && opener.focus(); });
}

/* Sections are shown one at a time by address: #work, #security and so on,
   so every menu item is an ordinary link and the back button works. Menus
   follow the disclosure pattern: a button with aria-expanded, opened by click,
   Enter or Space; Escape or a click outside closes it and returns focus. */
function mountNav(ids) {
  const nav = document.getElementById('nav');
  const tops = [...nav.querySelectorAll('button.nav-top')];
  const toggle = nav.querySelector('.nav-toggle');
  // On phones the language switch lives inside the Menu panel, so the header
  // stays one row; a copy sits there and CSS shows whichever fits.
  nav.querySelector('.nav-list').insertAdjacentHTML('beforeend', `<li class="nav-lang">${document.querySelector('.hd .lang').innerHTML}</li>`);
  const close = (btn, focus) => { btn.setAttribute('aria-expanded', 'false'); if (focus) btn.focus(); };
  const closeAll = () => { tops.forEach(b => close(b)); toggle.setAttribute('aria-expanded', 'false'); };
  tops.forEach(b => b.addEventListener('click', () => {
    const open = b.getAttribute('aria-expanded') === 'true';
    tops.forEach(o => close(o));
    b.setAttribute('aria-expanded', String(!open));
    if (!open) b.nextElementSibling.querySelector('a').focus();
  }));
  toggle.addEventListener('click', () => toggle.setAttribute('aria-expanded', String(toggle.getAttribute('aria-expanded') !== 'true')));
  document.addEventListener('click', e => { if (!nav.contains(e.target)) closeAll(); });
  nav.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    const open = tops.find(b => b.getAttribute('aria-expanded') === 'true');
    if (open) close(open, true); else if (toggle.getAttribute('aria-expanded') === 'true') { toggle.setAttribute('aria-expanded', 'false'); toggle.focus(); }
  });
  // Safari does not focus a link or button when it is clicked, so focus
  // leaves the menu on pointer down. Without this guard the menu closed
  // before the click landed, and its links did nothing there.
  let pressing = false;
  nav.addEventListener('pointerdown', () => { pressing = true; });
  window.addEventListener('pointerup', () => setTimeout(() => { pressing = false; }));
  nav.addEventListener('focusout', e => { if (!pressing && !nav.contains(e.relatedTarget)) tops.forEach(b => close(b)); });

  const show = (id, moveFocus) => {
    for (const other of ids) document.getElementById('panel-' + other).hidden = other !== id;
    nav.querySelectorAll('[data-sec]').forEach(a => a.toggleAttribute('aria-current', a.dataset.sec === id));
    nav.querySelectorAll('[data-sec]').forEach(a => { if (a.hasAttribute('aria-current')) a.setAttribute('aria-current', 'page'); });
    tops.forEach(b => b.classList.toggle('is-current', !!b.nextElementSibling.querySelector(`[data-sec="${id}"]`)));
    if (moveFocus) document.getElementById('panel-' + id).focus({ preventScroll: true });
  };
  // Laptop one-screen layout: a section designed to fit the smallest laptop
  // window left a lot of empty space on taller ones. Each section is zoomed up
  // to the largest size that still fits without scrolling (at most 1.25x), and
  // fitted again when the window changes or a question is opened.
  const oneScreen = matchMedia('(min-width:900px) and (min-height:560px)');
  const fit = () => {
    const p = ids.map(id => document.getElementById('panel-' + id)).find(x => !x.hidden);
    if (!p) return;
    p.style.zoom = '';
    if (!oneScreen.matches) return;
    const doc = document.documentElement;
    const fits = z => { p.style.zoom = z; return p.scrollHeight <= p.clientHeight + 1 && doc.scrollHeight <= innerHeight + 1; };
    if (!fits(1)) { p.style.zoom = ''; return; }
    let lo = 1, hi = 1.25;
    for (let n = 0; n < 7; n++) { const mid = (lo + hi) / 2; if (fits(mid)) lo = mid; else hi = mid; }
    p.style.zoom = String(Math.floor(lo * 100) / 100);
    if (!fits(p.style.zoom)) p.style.zoom = '';
  };
  let raf = 0;
  const refit = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(fit); };
  addEventListener('resize', refit);
  document.getElementById('main').addEventListener('toggle', refit, true);
  document.fonts?.ready.then(refit);

  const fromHash = moveFocus => {
    const id = location.hash.slice(1);
    show(ids.includes(id) ? id : ids[0], moveFocus && ids.includes(id));
    fit();
  };
  window.addEventListener('hashchange', () => { closeAll(); fromHash(true); });
  fromHash(false);
}
