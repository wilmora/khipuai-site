/* A plain, one-screen trial of the homepage, built only to compare against
   the Kinetic one. Not linked from the live site and marked noindex.

   On a laptop the whole page is one screen: the offer on the left, every
   other section in a tab panel on the right, and the booking button fixed in
   the top bar. On a phone the same pieces stack and the page scrolls.

   Every sentence comes from shared/content.js / shared/content.es.js, or from
   a heading or section label the live homepage already uses (passed in as L).
   Nothing here is new copy, so the comparison is about layout alone. */
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const h2 = (h, em) => `<h2>${esc(h)}${em ? ` <em>${esc(em)}</em>` : ''}</h2>`;
const cards = items => items.map(([t, d]) => `<div class="card"><h3>${esc(t)}</h3><p>${esc(d)}</p></div>`).join('');

export function render(C, L) {
  document.title = L.title;
  const top = document.getElementById('book-top');
  top.href = C.booking;
  top.textContent = L.bookShort;

  // id = the live homepage's section id, so a shared #portfolio-style link
  // means the same thing on both. Labels are the live homepage's own.
  const tabs = [
    ['problem', L.tabs.problem, `
      ${h2(L.problem[0], L.problem[1])}
      <p>${esc(C.problem.lead)}</p>
      <ul class="ticks">${C.problem.items.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
      <p class="strong">${esc(C.problem.close)}</p>`],
    ['ai', L.tabs.ai, `
      ${h2(C.ai.title, C.ai.titleEm)}
      <p>${esc(C.ai.lead)}</p>
      <div class="grid g3">${cards(C.ai.points)}</div>`],
    ['process', L.tabs.process, `
      ${h2(L.steps[0], L.steps[1])}
      <ol class="steps">${C.steps.map(([t, d]) => `<li><h3>${esc(t)}</h3><p>${esc(d)}</p></li>`).join('')}</ol>
      <p class="note">${esc(C.legal)}</p>`],
    ['get', L.tabs.get, `
      ${h2(L.get[1], L.get[2])}
      <div class="grid g3">${cards(C.deliverables)}</div>
      <ul class="nolines">${C.noLines.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`],
    ['work', L.tabs.work, `
      ${h2(C.portfolio.title, C.portfolio.titleEm)}
      <table class="pf">
        <thead><tr>${C.portfolio.cols.map(c => `<th scope="col">${esc(c)}</th>`).join('')}</tr></thead>
        <tbody>${C.portfolio.items.map(w => `<tr><th scope="row">${esc(w.t)}</th>
          <td data-label="${esc(C.portfolio.cols[1])}">${esc(w.d)}</td>
          <td data-label="${esc(C.portfolio.cols[2])}">${esc(w.who)}</td></tr>`).join('')}</tbody>
      </table>
      <p class="note">${esc(C.portfolio.note)}</p>
      <p class="callout">${esc(C.portfolio.next)} <a href="${C.booking}">${esc(C.portfolio.nextLink)} &rarr;</a></p>`],
    ['tools', L.tabs.tools, `
      ${h2(C.tools.title, C.tools.titleEm)}
      <ul class="tools">${C.tools.items.map(([t, d]) => `<li><strong>${esc(t)}</strong><span>${esc(d)}</span></li>`).join('')}</ul>
      <p class="note">${esc(C.tools.note)}</p>`],
    ['security', L.tabs.security, `
      ${h2(C.security.title, C.security.titleEm)}
      <div class="grid g3">${cards(C.security.points)}</div>
      <p class="more"><a href="${L.securityHref}">${esc(C.security.link)} &rarr;</a></p>`],
    ['fit', L.tabs.fit, `
      ${h2(L.fit[1], L.fit[2])}
      <div class="grid g2">
        <div class="card yes"><h3>${esc(C.fit.forTitle)}</h3><ul>${C.fit.forYou.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
        <div class="card no"><h3>${esc(C.fit.notTitle)}</h3><ul>${C.fit.notForYou.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
      </div>`],
    ['questions', L.tabs.questions, `
      ${h2(L.faq[0], L.faq[1])}
      <div class="faq">${C.faq.map(([q, a]) => `<details name="faq"><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>`],
    ['operator', L.tabs.operator, `
      <h2>${esc(L.aboutKick)}</h2>
      <blockquote>&ldquo;${esc(C.founder.quote)}&rdquo;</blockquote>
      <div class="grid g2 team">
        <div class="member"><img src="/shared/assets/founder.jpg" alt="${esc(L.founderAlt)}" width="64" height="64">
          <div><h3>${esc(C.founder.name)}</h3><p class="role">${esc(C.founder.role)}</p><p>${esc(C.founder.bio)}</p></div></div>
        <div class="member"><img src="/shared/assets/alex.jpg" alt="${esc(L.alex.alt)}" width="64" height="64">
          <div><h3>Alex Pena</h3><p class="role">${esc(L.alex.role)}</p><p>${esc(L.alex.bio)}</p></div></div>
      </div>
      <p class="more"><a href="${L.aboutHref}">${esc(L.aboutLink)} &rarr;</a></p>`],
  ];

  document.getElementById('main').innerHTML = `
  <section class="hero" aria-labelledby="h1">
    <p class="kick">${esc(C.hero.eyebrow)}</p>
    <h1 id="h1">${esc(C.hero.headline)} <em>${esc(C.hero.headlineEm)}</em></h1>
    <p class="lede">${esc(C.hero.sub)}</p>
    <div class="ctas">
      <a class="btn" href="${C.booking}">${esc(C.hero.cta)}</a>
      <a class="btn line" href="/self-assessment/">${esc(C.hero.ctaAlt)}</a>
    </div>
    <ul class="trust">${C.trust.map(([t, d]) => `<li><strong>${esc(t)}</strong><span>${esc(d)}</span></li>`).join('')}</ul>
  </section>

  <section class="sections" aria-label="${esc(L.tabsLabel)}">
    <div class="tablist" role="tablist" aria-label="${esc(L.tabsLabel)}">
      ${tabs.map(([id, label], i) => `<button type="button" role="tab" id="tab-${id}" aria-controls="panel-${id}"
        aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${esc(label)}</button>`).join('')}
    </div>
    ${tabs.map(([id, , html], i) => `<div class="panel" role="tabpanel" id="panel-${id}" aria-labelledby="tab-${id}"
      tabindex="0"${i === 0 ? '' : ' hidden'}>${html}</div>`).join('')}
  </section>`;

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
