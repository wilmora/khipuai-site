/* A plain, one-screen trial of the homepage, built only to compare against
   the Kinetic one. Not linked from the live site and marked noindex.

   Layout: a top bar with grouped section links on the right and the booking
   button; each section fills the screen below in the same layout.
   Overview pairs the offer with a diagram of the four steps; AI shows the
   work before and after. On a phone the same pieces stack and the page
   scrolls.

   Every sentence comes from shared/content.js / shared/content.es.js, or from
   a heading or section label the live homepage already uses (passed in as L),
   except the trial-only project details in projects.js (draft, marked NEW).
   The diagrams use only that wording plus the site's own line icons, and no
   numbers that are not already in the copy. */
import { featureIcon } from '/shared/kinetic.js';
import { PROJECTS, shown } from './projects.js';
import { tone } from './tone.js';
import { mountPager } from './pager.js';

// Screens and logos live next to this file, so the Spanish page (one folder
// down) loads the same files.
const ASSET = new URL('./', import.meta.url).href;
// Held back for now (Alex and Wil, 2026-10-21); the code stays ready.
const SHOW_INTEGRATIONS = false;   // the Integrations row (logos and list)
const SHOW_PORTAL = false;         // Build your portal: menu item and links
const SHOW_SHOTS = false;          // the screenshots view in Learn more
// Client work is shown by name, a plain picture and a description only, with no
// screenshots or demos until each client gives permission (Alex, 2026-10-26).
// KHIPUAI's own products keep their live demo.
const OWN_PRODUCTS = new Set(['support']);
// The plain picture for each client project: one line icon on the dark card.
const CARD_ICON = { payroll: ['work', 1], aca: ['deliverable', 0], hub: ['work', 0], review: ['work', 3], materials: ['problem', 0], whatsapp: ['work', 2] };
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const h2 = (h, em) => `<h2>${esc(h)}${em ? ` <em>${esc(em)}</em>` : ''}</h2>`;
const ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg>';

export function render(C, L) {
  C = tone(C, L.lang);
  // The welcome screen follows the device's light or dark mode in CSS. For
  // checking, ?welcome=a forces the light look and ?welcome=b the dark one.
  const look = new URLSearchParams(location.search).get('welcome');
  if (look === 'a' || look === 'b') document.documentElement.classList.add('wl-' + look);
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

  // English card titles capitalize every word (Alex, 2026-10-19); Spanish keeps
  // its normal sentence capitals. Letters already capitalized (AI, WhatsApp) stay.
  const title = t => L.lang === 'en' ? t.replace(/(^|[\s-])(\p{Ll})/gu, (m, a, b) => a + b.toUpperCase()) : t;
  const projects = PJ.items.filter(x => !x.hidden).map(x => {
    const base = x.from === undefined ? {} : C.portfolio.items[x.from];
    return { key: x.key, own: OWN_PRODUCTS.has(x.key), home: x.home || '', card: x.card, app: x.app, shots: SHOW_SHOTS ? x.shots : [], alt: x.alt || [], t: title(shown(x.t ?? base.t)), d: shown(x.d ?? base.d), who: shown(x.who ?? base.who), why: shown(x.why) };
  });

  const tabs = [
    // The welcome screen (Alex, 2026-10-19): the logo, who we are in the
    // site's own approved words, and two ways in. The Overview follows it.
    ['home', L.tabs.home, `<div class="wl">
        <div class="wl-in">
          <p class="kick">${esc(L.welcome.kick)}</p>
          <h1 class="wl-name"><img src="/shared/assets/mark.svg" alt="" width="112" height="112"><span>KHIPUAI</span></h1>
          <p class="wl-line">${esc(C.hero.eyebrow)}</p>
          <p class="wl-sub">${esc(C.legal)}</p>
          <div class="ctas wl-ctas"><a class="btn" href="#start">${esc(L.welcome.see)}</a><a class="btn line" href="${C.booking}">${esc(L.bookShort)}</a></div>
        </div>
        <a class="wl-cue" href="#start" aria-label="${esc(L.welcome.see)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></a>
      </div>`],

    ['start', L.tabs.start, sec('start', `
        <p class="kick">${esc(C.hero.eyebrow)}</p>
        <h2 class="hl">${esc(C.hero.headline)} <em>${esc(C.hero.headlineEm)}</em></h2>
        <p class="lede">${esc(C.hero.sub)}</p>
        <div class="ctas">${book}<a class="btn line" href="/concepts/basic/self-assessment/">${esc(C.hero.ctaAlt)}</a></div>
        <ul class="trust">${C.trust.map(([t, d]) => `<li><strong>${esc(t)}</strong><span>${esc(d)}</span></li>`).join('')}</ul>`, `
        <figure class="flow" aria-labelledby="flow-h">
          <figcaption id="flow-h">${h2(L.steps[0], L.steps[1])}</figcaption>
          <ol class="timeline">
            ${L.flow.map(([t, d], i) => `<li><span class="node"><b>0${i + 1}</b></span>
              <div><h3>${esc(t)}</h3><p>${esc(d)}</p></div></li>`).join('')}
            <li class="end"><span class="node">${featureIcon('deliverable', 5)}</span>
              <div><h3>${esc(L.own[0])}</h3><p>${esc(L.own[1])}</p></div></li>
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
    // a title, two lines, and "Learn more" for the full summary. Seven cards
    // fill two rows of four, so the next-step link sits in the header.
    ['work', L.tabs.work, `<div class="sec-work">
        <div class="work-head"><div>${head(C.portfolio.kick, C.portfolio.title, C.portfolio.titleEm)}</div><p class="work-side"><span class="note">${esc(C.portfolio.note)}</span>
          <span class="work-next">${esc(C.portfolio.next)}</span></p></div>
        <ul class="pcards">${projects.map((p, i) => `<li class="pc">
          ${p.own ? `<div class="pc-img" data-k="${p.key}"><iframe src="${ASSET}demos/${p.key}/index.html${p.home}" title="" aria-hidden="true" tabindex="-1" loading="lazy" width="${APP_W}" height="${APP_H}"></iframe></div>`
            : `<div class="pc-img pc-ph" aria-hidden="true">${featureIcon(...(CARD_ICON[p.key] || ['work', i]))}</div>`}
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
  document.getElementById('nav').innerHTML = navHTML(C, L, '');

  // The page's small print (trial note, privacy, contact) moves from the
  // footer into the strip, so the footer row can carry the tool logos alone.
  mountBand(C, book);
  document.getElementById('main').innerHTML = tabs.map(([id, label, html], i) =>
    `<section class="panel" id="panel-${id}" aria-label="${esc(label)}" tabindex="-1"${i === 0 ? '' : ' hidden'}>${html}</section>`).join('');

  mountLogos(C, L);
  let edge = () => false;
  const pager = mountPager({ labels: L.pager, onEdge: d => edge(d) });
  edge = mountNav(tabs.map(([id]) => id), pager);
  mountProjects(projects, PJ, C);
  mountPreviews();
}

/* Card pictures: each miniature's Home screen, live, drawn at laptop size and
   scaled to the card's width. They cannot be clicked or reached by Tab (the
   card's Learn more opens the same screen), and screen readers skip them. */
function mountPreviews() {
  const ro = new ResizeObserver(es => es.forEach(e => {
    const f = e.target.querySelector('iframe');
    if (f) f.style.transform = `scale(${e.contentRect.width / APP_W})`;
  }));
  document.querySelectorAll('.pc-img').forEach(b => ro.observe(b));
}

// Navigation after BotLogix and Fractional AI: the logo on the left, a few
// grouped links on the right, menus that open on click or keyboard (never
// hover only), and the booking button at the far right. Menu titles and
// their one-line descriptions are the sections' own headings. On the trial's
// other pages (about, security...) the same menu links back to the trial
// homepage's sections: home is that page's address.
function navHTML(C, L, home) {
  const groups = [
    { label: L.nav.services, items: [
      ['ai', C.ai.kick, C.ai.title],
      ['get', L.get[0], `${L.get[1]} ${L.get[2]}`],
      ['fit', L.fit[0], `${L.fit[1]} ${L.fit[2]}`.trim()],
      // Pages of their own, not homepage sections.
      ['solution-design', L.design.nav, L.design.desc, `${home}solution-design/`],
      ...(SHOW_PORTAL ? [['portal', L.portal.nav, L.portal.desc, `${home}portal/`]] : []) ] },
    { id: 'work', label: L.tabs.work },
    { id: 'security', label: L.tabs.security },
    { label: L.tabs.operator, items: [
      ['operator', L.aboutKick, L.nav.team],
      ['questions', L.tabs.questions, `${L.faq[0]} ${L.faq[1]}`] ] },
  ];
  return `
    <button type="button" class="nav-toggle" aria-expanded="false" aria-controls="nav-list">${esc(L.nav.menu)}</button>
    <ul class="nav-list" id="nav-list">${groups.map((g, i) => g.items ? `<li class="nav-group">
      <button type="button" class="nav-top" aria-expanded="false" aria-controls="menu-${i}">${esc(g.label)}<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 4.5 6 8l3.5-3.5"/></svg></button>
      <ul class="nav-menu" id="menu-${i}">${g.items.map(([id, t, d, href]) => `<li><a href="${href || `${home}#${id}`}" ${href ? `data-page="${id}"${location.pathname.endsWith(`/${id}/`) ? ' aria-current="page"' : ''}` : `data-sec="${id}"`}><strong>${esc(t)}</strong><span>${esc(d)}</span></a></li>`).join('')}</ul></li>`
      : `<li><a class="nav-top" href="${home}#${g.id}" data-sec="${g.id}">${esc(g.label)}</a></li>`).join('')}</ul>`;
}

// The page's small print (trial note, privacy, contact) moves from the
// footer into the strip, so the footer row can carry the tool logos alone.
function mountBand(C, book) {
  const fine = [...document.querySelectorAll('.ft .wrap > p')].map(n => n.innerHTML).join(' &middot; ');
  document.querySelectorAll('.ft .wrap > p').forEach(n => n.remove());
  document.querySelector('.ft').insertAdjacentHTML('beforebegin', `<aside class="band" aria-label="${esc(C.hero.cta)}">
    <div class="wrap"><div><p>${esc(C.problem.close)}</p><p class="band-fine">${fine}</p></div>${book}</div></aside>`);
}

/* The trial's other pages (How KHIPUAI works, Security, Contact...): the same
   header with its menus, the same band and footer, around the page's own
   content, which scrolls normally. home is the trial homepage's address. */
export function page(C, L, home) {
  C = tone(C, L.lang);
  const top = document.getElementById('book-top');
  top.href = C.booking;
  top.textContent = L.bookShort;
  document.getElementById('nav').innerHTML = navHTML(C, L, home);
  mountMenus(document.getElementById('nav'));
  // A page in a menu (Build your portal) marks that menu as the current one.
  document.querySelector('#nav [data-page][aria-current]')?.closest('.nav-group')?.querySelector('.nav-top')?.classList.add('is-current');
  mountBand(C, `<a class="btn" href="${C.booking}">${esc(C.hero.cta)}</a>`);
  mountLogos(C, L);
  // Visuals in place of long text (Alex and Wil, 2026-10-21): lists marked
  // data-icons="group" get the site's line icons (data-icon="n" picks one),
  // and a step timeline ends on the deliverable mark.
  document.querySelectorAll('[data-icons]').forEach(list => [...list.children].forEach((li, i) =>
    li.insertAdjacentHTML('afterbegin', featureIcon(list.dataset.icons, li.dataset.icon ? +li.dataset.icon : i))));
  document.querySelectorAll('.node-own').forEach(n => { n.innerHTML = featureIcon('deliverable', 5); });
  // Pages instead of scrolling, except where the page asks to scroll
  // (Privacy and Terms carry class="doc scroll").
  if (!document.documentElement.classList.contains('scroll')) mountPager({ labels: L.pager });
}

/* The tool logos, GeoSolv-style, as a row near the bottom of every tab. The
   Tools tab's wording (each tool's line and the trademark note) sits behind
   the row's label so nothing from it is lost. FOR TESTING: logo permission is
   pending for every company (see logos/SOURCES.md); Microsoft's four products
   show as names because Microsoft's icon terms do not cover this use. */
const LOGOS = ['', '', '', 'zendesk.svg', 'monday.png', 'google.svg', 'meta.svg', 'anthropic.svg'];
function mountLogos(C, L) {
  // Integrations are on hold (Alex and Wil, 2026-10-21): nothing is drawn
  // until SHOW_INTEGRATIONS is switched on. The list and logos stay ready.
  if (!SHOW_INTEGRATIONS) return;
  C = { ...C, tools: { ...C.tools, items: [...C.tools.items, ...(L.integrations || [])] } };
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
  if (!det) return;
  document.addEventListener('click', e => { if (det.open && !det.contains(e.target)) det.open = false; });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && det.open) { det.open = false; det.querySelector('summary').focus(); } });
}

/* "Learn more": the project's full summary in a modal dialog (focus is held
   inside it, Escape and the Close button return to the card). */
// Learn more opens a dialog with a working miniature of the real app: a static
// copy of its screens in its own look, with made-up data (demos/<key>/). It is
// drawn at a laptop size in an iframe and scaled to fit, so it looks like the
// app shrunk into a browser window. Nothing in it is saved or sent. The page
// loads only when the dialog opens. The screenshots stay one click away.
const APP_W = 1280, APP_H = 800;

function mountProjects(projects, PJ, C) {
  document.body.insertAdjacentHTML('beforeend', `<dialog class="pd" id="pd" aria-labelledby="pd-h">
    <div class="pd-in"><div class="pd-media">
      <div class="pd-bar"><span class="pd-dots" aria-hidden="true"><i></i><i></i><i></i></span>
        <span class="pd-addr" id="pd-addr"></span><span class="pd-tag">${esc(PJ.frameLabel)}</span>
        <div class="pd-switch" id="pd-switch" role="group" aria-label="${esc(PJ.view)}">
          <button type="button" data-view="demo" aria-pressed="true">${esc(PJ.demoView)}</button>
          <button type="button" data-view="shots" aria-pressed="false">${esc(PJ.shotsView)}</button></div></div>
      <div class="pd-stage" id="pd-stage"><div class="pd-scale" id="pd-scale"></div></div>
      <div id="pd-shots" class="pd-shots" hidden></div>
      <p class="pd-under"><span>${esc(PJ.frameNote)}</span> <a id="pd-full" href="#" target="_blank" rel="noopener">${esc(PJ.openFull)} &rarr;</a></p></div>
    <div class="pd-text"><h2 id="pd-h"></h2><dl>
      <dt>${esc(C.portfolio.cols[1])}</dt><dd id="pd-d"></dd>
      <dt>${esc(PJ.why)}</dt><dd id="pd-why"></dd>
      <dt>${esc(C.portfolio.cols[2])}</dt><dd id="pd-who"></dd></dl>
      <p class="note">${esc(C.portfolio.note)}</p>
      <button type="button" class="btn line" id="pd-close">${esc(PJ.close)}</button></div></div></dialog>`);
  const dlg = document.getElementById('pd'), $ = id => document.getElementById(id);
  const sw = $('pd-switch'), stage = $('pd-stage'), box = $('pd-scale'), shots = $('pd-shots');
  let opener = null;
  // Fit the app's laptop-size page into the stage. On a phone it keeps a
  // readable scale and the stage scrolls instead.
  // Laptops and desktops: scale the app by whichever of width or height runs
  // out first, then size the dialog to the scaled app exactly, so there is no
  // blank band around it. The summary column scrolls if it is ever taller.
  // Phones: the app keeps a readable scale and scrolls inside the frame.
  const media = stage.parentElement, text = dlg.querySelector('.pd-text'), TEXT_W = 300, MAX_K = 1.25;
  const fit = () => {
    const frame = box.querySelector('iframe'); if (!frame || !dlg.open) return;
    const phone = matchMedia('(max-width: 899px), (max-height: 559px)').matches;
    let k;
    if (phone) {
      dlg.style.width = dlg.style.height = text.style.maxHeight = '';
      k = Math.max(0.5, Math.min(1, stage.clientWidth / APP_W));
      stage.style.height = `${Math.round(Math.min(innerHeight * 0.62, APP_H * k))}px`;
    } else {
      const pad = parseFloat(getComputedStyle(media).paddingLeft) * 2;
      // Everything in the frame column that is not the app: browser bar, line under it, padding, gaps.
      for (let pass = 0; pass < 2; pass++) {
        const chrome = media.offsetHeight - stage.offsetHeight;
        const maxW = Math.min(1840, innerWidth * 0.96) - TEXT_W - pad, maxH = innerHeight * 0.94 - chrome;
        k = Math.min(MAX_K, maxW / APP_W, maxH / APP_H);
        dlg.style.width = `${Math.floor(APP_W * k + pad + TEXT_W)}px`;
        stage.style.height = `${Math.round(APP_H * k)}px`;
      }
      text.style.maxHeight = `${media.offsetHeight}px`;
    }
    shots.style.height = stage.style.height;
    frame.style.transform = `scale(${k})`;
    box.style.width = `${Math.round(APP_W * k)}px`; box.style.height = `${Math.round(APP_H * k)}px`;
  };
  addEventListener('resize', () => requestAnimationFrame(fit));
  const view = v => {
    sw.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.view === v)));
    stage.hidden = v !== 'demo'; shots.hidden = v !== 'shots';
  };
  const open = (key, btn) => {
    const p = projects.find(x => x.key === key); if (!p) return;
    opener = btn;
    $('pd-h').textContent = p.t;
    $('pd-d').textContent = p.d;
    $('pd-why').textContent = p.why;
    $('pd-who').textContent = p.who;
    shots.innerHTML = p.shots.map((f, i) => `<img src="${ASSET}shots/${f}" alt="${esc(p.alt[i] || p.t)}" loading="lazy">`).join('') + `<p class="note">${esc(PJ.shotNote)}</p>`;
    const url = `${ASSET}demos/${key}/index.html${p.home}`;
    $('pd-addr').textContent = p.app || p.t;
    $('pd-full').href = url;
    sw.querySelector('[data-view="shots"]').hidden = !p.shots.length;
    sw.hidden = !p.shots.length;
    // Client work: the description only, no demo (no permission yet).
    dlg.classList.toggle('pd-textonly', !p.own);
    media.hidden = !p.own;
    text.style.maxHeight = '';
    box.innerHTML = p.own ? `<iframe src="${url}" title="${esc(fmtTitle(PJ.frameTitle, p.app || p.t))}" width="${APP_W}" height="${APP_H}"></iframe>` : '';
    view('demo');
    dlg.showModal();
    fit();
  };
  const fmtTitle = (s, name) => s.replace('{app}', name);
  document.querySelectorAll('.pc-more').forEach(b => b.addEventListener('click', () => open(b.dataset.p, b)));
  sw.addEventListener('click', e => { const b = e.target.closest('[data-view]'); if (b) view(b.dataset.view); });
  $('pd-close').addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
  // Focus goes back to the Learn more button. After a mouse close it comes
  // back quietly (Safari would draw the ring); the ring returns with the
  // next key press, so keyboard users still see where they are.
  let byPointer = false;
  dlg.addEventListener('pointerdown', () => { byPointer = true; });
  dlg.addEventListener('keydown', () => { byPointer = false; });
  dlg.addEventListener('close', () => {
    box.innerHTML = '';
    if (!opener) return;
    if (byPointer) {
      const o = opener; o.classList.add('quiet-focus');
      const done = () => { o.classList.remove('quiet-focus'); removeEventListener('keydown', done, true); o.removeEventListener('blur', done); };
      addEventListener('keydown', done, true); o.addEventListener('blur', done);
    }
    byPointer = false;
    opener.focus();
  });
}

/* Sections are shown one at a time by address: #work, #security and so on,
   so every menu item is an ordinary link and the back button works. Menus
   follow the disclosure pattern: a button with aria-expanded, opened by click,
   Enter or Space; Escape or a click outside closes it and returns focus. */
function mountMenus(nav) {
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
  return { tops, closeAll };
}

function mountNav(ids, pager) {
  const nav = document.getElementById('nav');
  const { tops, closeAll } = mountMenus(nav);

  let shown = null;
  const show = (id, moveFocus) => {
    // Between the welcome screen and the Overview the new screen slides in
    // from the direction of travel (no motion with reduced motion).
    const panel = document.getElementById('panel-' + id), dir = shown === 'home' && id === 'start' ? 'enter-up' : shown === 'start' && id === 'home' ? 'enter-down' : '';
    shown = id;
    panel.classList.remove('enter-up', 'enter-down');
    // Added after the zoom fit has measured, so the slide never skews it.
    if (dir) requestAnimationFrame(() => panel.classList.add(dir));
    for (const other of ids) document.getElementById('panel-' + other).hidden = other !== id;
    document.documentElement.classList.toggle('at-home', id === 'home');
    document.documentElement.classList.toggle('at-work', id === 'work');
    nav.querySelectorAll('[data-sec]').forEach(a => a.toggleAttribute('aria-current', a.dataset.sec === id));
    nav.querySelectorAll('[data-sec]').forEach(a => { if (a.hasAttribute('aria-current')) a.setAttribute('aria-current', 'page'); });
    tops.forEach(b => b.classList.toggle('is-current', !!b.nextElementSibling.querySelector(`[data-sec="${id}"]`)));
    if (moveFocus) document.getElementById('panel-' + id).focus({ preventScroll: true });
  };
  // Laptop: a section is zoomed to the largest size that still fits the
  // window (0.9x to 1.25x), so it fills a tall screen and still fits a short
  // one; when it cannot fit even at 0.9x it keeps its normal size and the
  // pager cuts it into pages. Fitted again when the window changes or a
  // question is opened. Phones keep the normal size and page.
  const oneScreen = matchMedia('(min-width:900px) and (min-height:560px)');
  const fit = keep => {
    const p = ids.map(id => document.getElementById('panel-' + id)).find(x => !x.hidden);
    if (!p) return;
    p.style.zoom = '';
    if (p.id !== 'panel-home' && oneScreen.matches) {
      pager.prepare();
      const W = pager.window, inner = pager.inner;
      const fits = z => { p.style.zoom = z; return inner.scrollHeight <= W.clientHeight + 1; };
      const best = (lo, hi) => { for (let n = 0; n < 7; n++) { const mid = (lo + hi) / 2; if (fits(mid)) lo = mid; else hi = mid; } return Math.floor(lo * 100) / 100; };
      const z = fits(1) ? best(1, 1.25) : fits(0.9) ? best(0.9, 1) : 0;
      p.style.zoom = z && fits(z) ? String(z) : '';
    }
    if (keep) pager.layout(); else pager.reset();
  };
  let raf = 0;
  const refit = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => fit(true)); };
  addEventListener('resize', refit);
  document.getElementById('main').addEventListener('toggle', refit, true);
  document.fonts?.ready.then(refit);

  const fromHash = moveFocus => {
    const id = location.hash.slice(1);
    show(ids.includes(id) ? id : ids[0], moveFocus && ids.includes(id));
    fit(false);
  };
  window.addEventListener('hashchange', () => { closeAll(); fromHash(true); });
  fromHash(false);
  // Past the welcome screen's last page, the next gesture opens the Overview
  // (the arrow's move, Alex 2026-10-20); before the Overview's first page,
  // it goes back to the welcome screen.
  const at = () => ids.find(id => !document.getElementById('panel-' + id).hidden);
  return d => {
    if (at() === 'home' && d > 0) { location.hash = 'start'; return true; }
    if (at() === 'start' && d < 0) { location.hash = 'home'; return true; }
    return false;
  };
}
