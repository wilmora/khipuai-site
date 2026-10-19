/* A plain, one-screen trial of the homepage, built only to compare against
   the Kinetic one. Not linked from the live site and marked noindex.

   Layout: the section tabs sit in the top bar beside the booking button, and
   each tab fills the screen below in the same two-column section layout.
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
    // a title, two lines, and "Learn more" for the full summary.
    ['work', L.tabs.work, `<div class="sec-work">
        <div class="work-head"><div>${head(C.portfolio.kick, C.portfolio.title, C.portfolio.titleEm)}</div><p class="note">${esc(C.portfolio.note)}</p></div>
        <ul class="pcards">${projects.map(p => `<li class="pc">
          <div class="pc-img">${p.shots.length ? `<img src="${ASSET}shots/${p.shots[0]}" alt="" loading="lazy">` : `<span class="pc-ph">${featureIcon('ai', 0)}</span>`}</div>
          <div class="pc-body"><h3>${esc(p.t)}</h3><p>${esc(p.d)}</p>
            <button type="button" class="pc-more" data-p="${p.key}" aria-haspopup="dialog">${esc(PJ.learn)}<span class="visually-hidden">: ${esc(p.t)}</span> &rarr;</button></div></li>`).join('')}
          <li class="pc pc-cta"><div class="pc-body"><p>${esc(C.portfolio.next)}</p><a class="btn" href="${C.booking}">${esc(C.portfolio.nextLink)}</a></div></li>
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
      `<h2>${esc(L.aboutKick)}</h2><blockquote>&ldquo;${esc(C.founder.quote)}&rdquo;</blockquote>`, `
        <div class="team">
          <div class="member"><img src="/shared/assets/founder.jpg" alt="${esc(L.founderAlt)}" width="72" height="72">
            <div><h3>${esc(C.founder.name)}</h3><p class="role">${esc(C.founder.role)}</p><p>${esc(C.founder.bio)}</p></div></div>
          <div class="member"><img src="/shared/assets/alex.jpg" alt="${esc(L.alex.alt)}" width="72" height="72">
            <div><h3>Alex Pena</h3><p class="role">${esc(L.alex.role)}</p><p>${esc(L.alex.bio)}</p></div></div>
        </div>
        <p class="more"><a href="${L.aboutHref}">${esc(L.aboutLink)} &rarr;</a></p>`)],
  ];

  document.getElementById('tabs').innerHTML = tabs.map(([id, label], i) =>
    `<button type="button" role="tab" id="tab-${id}" aria-controls="panel-${id}"
      aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${esc(label)}</button>`).join('');
  // The closing strip under every tab: the page's own closing line and the
  // booking button, so each tab ends like a finished page rather than a slide.
  // The page's small print (trial note, privacy, contact) moves from the
  // footer into the strip, so the footer row can carry the tool logos alone.
  const fine = [...document.querySelectorAll('.ft .wrap > p')].map(n => n.innerHTML).join(' &middot; ');
  document.querySelectorAll('.ft .wrap > p').forEach(n => n.remove());
  document.querySelector('.ft').insertAdjacentHTML('beforebegin', `<aside class="band" aria-label="${esc(C.hero.cta)}">
    <div class="wrap"><div><p>${esc(C.problem.close)}</p><p class="band-fine">${fine}</p></div>${book}</div></aside>`);
  document.getElementById('main').innerHTML = tabs.map(([id, , html], i) =>
    `<div class="panel" role="tabpanel" id="panel-${id}" aria-labelledby="tab-${id}" tabindex="0"${i === 0 ? '' : ' hidden'}>${html}</div>`).join('');

  mountTabs(tabs.map(([id]) => id));
  mountLogos(C, L);
  mountProjects(projects, PJ, C);
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
function mountProjects(projects, PJ, C) {
  document.body.insertAdjacentHTML('beforeend', `<dialog class="pd" id="pd" aria-labelledby="pd-h">
    <div class="pd-in"><div class="pd-media" id="pd-media"></div>
    <div class="pd-text"><h2 id="pd-h"></h2><dl>
      <dt>${esc(C.portfolio.cols[1])}</dt><dd id="pd-d"></dd>
      <dt>${esc(PJ.why)}</dt><dd id="pd-why"></dd>
      <dt>${esc(C.portfolio.cols[2])}</dt><dd id="pd-who"></dd></dl>
      <p class="note">${esc(C.portfolio.note)}</p>
      <button type="button" class="btn line" id="pd-close">${esc(PJ.close)}</button></div></div></dialog>`);
  const dlg = document.getElementById('pd');
  let opener = null;
  const open = (key, btn) => {
    const p = projects.find(x => x.key === key); if (!p) return;
    opener = btn;
    document.getElementById('pd-h').textContent = p.t;
    document.getElementById('pd-d').textContent = p.d;
    document.getElementById('pd-why').textContent = p.why;
    document.getElementById('pd-who').textContent = p.who;
    document.getElementById('pd-media').innerHTML = p.shots.length
      ? p.shots.map((f, i) => `<img src="${ASSET}shots/${f}" alt="${esc(p.alt[i] || p.t)}">`).join('') + `<p class="note">${esc(PJ.shotNote)}</p>`
      : `<div class="pd-ph">${featureIcon('ai', 0)}<p>${esc(PJ.pending)}</p></div>`;
    dlg.showModal();
  };
  document.querySelectorAll('.pc-more').forEach(b => b.addEventListener('click', () => open(b.dataset.p, b)));
  document.getElementById('pd-close').addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('close', () => opener && opener.focus());
}

/* Standard tab behaviour: click or Enter/Space selects, arrow keys move
   between tabs, Home/End jump to the ends. The hash follows the open tab, so
   #work or #security opens straight to that section. */
function mountTabs(ids) {
  const tab = id => document.getElementById('tab-' + id);
  const show = (id, focus) => {
    for (const other of ids) {
      const on = other === id;
      tab(other).setAttribute('aria-selected', String(on));
      tab(other).tabIndex = on ? 0 : -1;
      document.getElementById('panel-' + other).hidden = !on;
    }
    if (focus) tab(id).focus();
    if (location.hash.slice(1) !== id) history.replaceState(null, '', '#' + id);
  };
  for (const [i, id] of ids.entries()) {
    tab(id).addEventListener('click', () => show(id, false));
    tab(id).addEventListener('keydown', e => {
      const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      let next = null;
      if (step) next = ids[(i + step + ids.length) % ids.length];
      if (e.key === 'Home') next = ids[0];
      if (e.key === 'End') next = ids[ids.length - 1];
      if (next) { e.preventDefault(); show(next, true); }
    });
  }
  const fromHash = () => { const id = location.hash.slice(1); if (ids.includes(id)) show(id, false); };
  window.addEventListener('hashchange', fromHash);
  fromHash();
}
