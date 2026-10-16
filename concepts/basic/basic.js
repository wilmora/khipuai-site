/* A plain, one-screen trial of the homepage, built only to compare against
   the Kinetic one. Not linked from the live site and marked noindex.

   Layout: the section tabs sit in the top bar beside the booking button, and
   each tab fills the screen below in the same two-column section layout.
   Overview pairs the offer with a diagram of the three steps; AI shows the
   work before and after. On a phone the same pieces stack and the page
   scrolls.

   Every sentence comes from shared/content.js / shared/content.es.js, or from
   a heading or section label the live homepage already uses (passed in as L).
   The diagrams use only that wording plus the site's own line icons, and no
   numbers that are not already in the copy. */
import { featureIcon } from '/shared/kinetic.js';

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const h2 = (h, em) => `<h2>${esc(h)}${em ? ` <em>${esc(em)}</em>` : ''}</h2>`;
const ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg>';

export function render(C, L) {
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

    ['work', L.tabs.work, sec('work',
      head(C.portfolio.kick, C.portfolio.title, C.portfolio.titleEm,
        `<p class="intro">${esc(C.portfolio.next)}</p><p class="more"><a href="${C.booking}">${esc(C.portfolio.nextLink)} &rarr;</a></p>`), `
        <table class="pf">
          <thead><tr>${C.portfolio.cols.map(c => `<th scope="col">${esc(c)}</th>`).join('')}</tr></thead>
          <tbody>${C.portfolio.items.map(w => `<tr><th scope="row">${esc(w.t)}</th>
            <td data-label="${esc(C.portfolio.cols[1])}">${esc(w.d)}</td>
            <td data-label="${esc(C.portfolio.cols[2])}">${esc(w.who)}</td></tr>`).join('')}</tbody>
        </table>
        <p class="note">${esc(C.portfolio.note)}</p>`)],

    // Names as text, not logos: each brand's guidelines require a licence or
    // written permission before a third party shows its logo.
    ['tools', L.tabs.tools, sec('tools',
      head(C.tools.kick, C.tools.title, C.tools.titleEm, `<p class="intro">${esc(C.tools.note)}</p>`), `
        <ul class="tools">${C.tools.items.map(([t, d]) => `<li><strong>${esc(t)}</strong><span>${esc(d)}</span></li>`).join('')}</ul>`)],

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
  document.querySelector('.ft').insertAdjacentHTML('beforebegin', `<aside class="band" aria-label="${esc(C.hero.cta)}">
    <div class="wrap"><p>${esc(C.problem.close)}</p>${book}</div></aside>`);
  document.getElementById('main').innerHTML = tabs.map(([id, , html], i) =>
    `<div class="panel" role="tabpanel" id="panel-${id}" aria-labelledby="tab-${id}" tabindex="0"${i === 0 ? '' : ' hidden'}>${html}</div>`).join('');

  mountTabs(tabs.map(([id]) => id));
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
