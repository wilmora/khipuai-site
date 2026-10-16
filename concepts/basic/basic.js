/* A plain, scroll-down trial of the homepage, built only to compare against
   the Kinetic one. Not linked from the live site and marked noindex.

   Every sentence comes from shared/content.js / shared/content.es.js, or from
   a heading the live homepage already uses (passed in as L). Nothing here is
   new copy, so the comparison is about layout alone. */
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const head = (kick, h, em) =>
  `${kick ? `<p class="kick">${esc(kick)}</p>` : ''}<h2>${esc(h)}${em ? ` <em>${esc(em)}</em>` : ''}</h2>`;

export function render(C, L) {
  document.title = L.title;
  document.getElementById('book-top').href = C.booking;
  document.getElementById('book-top').textContent = L.bookShort;

  const book = (cls = 'btn') => `<a class="${cls}" href="${C.booking}">${esc(C.hero.cta)}</a>`;
  const assess = (cls = 'btn line') => `<a class="${cls}" href="/self-assessment/">${esc(C.hero.ctaAlt)}</a>`;

  document.getElementById('main').innerHTML = `
  <section class="hero" id="top"><div class="wrap">
    <p class="kick">${esc(C.hero.eyebrow)}</p>
    <h1>${esc(C.hero.headline)} <em>${esc(C.hero.headlineEm)}</em></h1>
    <p class="lede">${esc(C.hero.sub)}</p>
    <div class="ctas">${book()}${assess()}</div>
    <ul class="trust">${C.trust.map(([t, d]) => `<li><strong>${esc(t)}</strong><span>${esc(d)}</span></li>`).join('')}</ul>
  </div></section>

  <section id="problem"><div class="wrap narrow">
    ${head('', L.problem[0], L.problem[1])}
    <p>${esc(C.problem.lead)}</p>
    <ul class="ticks">${C.problem.items.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
  </div></section>

  <section class="alt" id="ai"><div class="wrap">
    ${head(C.ai.kick, C.ai.title, C.ai.titleEm)}
    <p class="intro">${esc(C.ai.lead)}</p>
    <div class="grid g3">${C.ai.points.map(([t, d]) => `<div class="card"><h3>${esc(t)}</h3><p>${esc(d)}</p></div>`).join('')}</div>
  </div></section>

  <section id="how"><div class="wrap">
    ${head('', L.steps[0], L.steps[1])}
    <ol class="steps">${C.steps.map(([t, d]) => `<li><h3>${esc(t)}</h3><p>${esc(d)}</p></li>`).join('')}</ol>
    <div class="ctas">${book()}</div>
  </div></section>

  <section class="alt" id="get"><div class="wrap">
    ${head(L.get[0], L.get[1], L.get[2])}
    <div class="grid g3">${C.deliverables.map(([t, d]) => `<div class="card"><h3>${esc(t)}</h3><p>${esc(d)}</p></div>`).join('')}</div>
    <ul class="nolines">${C.noLines.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
  </div></section>

  <section id="portfolio"><div class="wrap">
    ${head(C.portfolio.kick, C.portfolio.title, C.portfolio.titleEm)}
    <table class="pf">
      <thead><tr>${C.portfolio.cols.map(c => `<th scope="col">${esc(c)}</th>`).join('')}</tr></thead>
      <tbody>${C.portfolio.items.map(w => `<tr><th scope="row">${esc(w.t)}</th>
        <td data-label="${esc(C.portfolio.cols[1])}">${esc(w.d)}</td>
        <td data-label="${esc(C.portfolio.cols[2])}">${esc(w.who)}</td></tr>`).join('')}</tbody>
    </table>
    <p class="note">${esc(C.portfolio.note)}</p>
    <p class="callout">${esc(C.portfolio.next)} <a href="${C.booking}">${esc(C.portfolio.nextLink)} &rarr;</a></p>
  </div></section>

  <section class="alt" id="tools"><div class="wrap">
    ${head(C.tools.kick, C.tools.title, C.tools.titleEm)}
    <ul class="tools">${C.tools.items.map(([t, d]) => `<li><strong>${esc(t)}</strong><span>${esc(d)}</span></li>`).join('')}</ul>
    <p class="note">${esc(C.tools.note)}</p>
  </div></section>

  <section id="security"><div class="wrap">
    ${head(C.security.kick, C.security.title, C.security.titleEm)}
    <div class="grid g3">${C.security.points.map(([t, d]) => `<div class="card"><h3>${esc(t)}</h3><p>${esc(d)}</p></div>`).join('')}</div>
    <p class="more"><a href="${L.securityHref}">${esc(C.security.link)} &rarr;</a></p>
  </div></section>

  <section class="alt" id="fit"><div class="wrap">
    ${head(L.fit[0], L.fit[1], L.fit[2])}
    <div class="grid g2">
      <div class="card yes"><h3>${esc(C.fit.forTitle)}</h3><ul>${C.fit.forYou.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
      <div class="card no"><h3>${esc(C.fit.notTitle)}</h3><ul>${C.fit.notForYou.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
    </div>
  </div></section>

  <section id="faq"><div class="wrap narrow">
    ${head('', L.faq[0], L.faq[1])}
    <div class="faq">${C.faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>
  </div></section>

  <section class="alt" id="about"><div class="wrap">
    <h2>${esc(L.aboutKick)}</h2>
    <blockquote>&ldquo;${esc(C.founder.quote)}&rdquo;</blockquote>
    <div class="grid g2 team">
      <div class="member"><img src="/shared/assets/founder.jpg" alt="${esc(L.founderAlt)}" width="96" height="96">
        <div><h3>${esc(C.founder.name)}</h3><p class="role">${esc(C.founder.role)}</p><p>${esc(C.founder.bio)}</p></div></div>
      <div class="member"><img src="/shared/assets/alex.jpg" alt="${esc(L.alex.alt)}" width="96" height="96">
        <div><h3>Alex Pena</h3><p class="role">${esc(L.alex.role)}</p><p>${esc(L.alex.bio)}</p></div></div>
    </div>
    <p class="more"><a href="${L.aboutHref}">${esc(L.aboutLink)} &rarr;</a></p>
  </div></section>

  <section class="final" id="start"><div class="wrap narrow">
    <h2>${esc(C.problem.close)}</h2>
    <div class="ctas">${book()}${assess('btn line light')}</div>
  </div></section>`;

  document.getElementById('legal').textContent = C.legal;
}
