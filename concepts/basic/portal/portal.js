/* Build your portal: a short configurator. Pick a starting template, turn
   its main features on or off, pick a region and a size, and the plan and
   draft price update as you go (rules and amounts from plans.js). It ends
   with Book a call and a one-page summary to print or download.

   Nothing is sent or stored: there is no form, no request and no storage;
   the summary is built in the browser and saved by the visitor. */
import { TEMPLATES, REGIONS, PRICING, estimate, clampCount } from './plans.js';
import { TEXT } from './text.js';

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

export function mountPortal(root, lang, booking, bookLabel) {
  const T = TEXT[lang];
  const state = { template: TEMPLATES[0].key, features: [], region: REGIONS[0], users: 10, locations: 1 };
  const defaults = key => TEMPLATES.find(t => t.key === key).features.filter(f => f.on).map(f => f.key);
  state.features = defaults(state.template);

  const step = (i, body) => `<fieldset class="pb-step"><legend><span class="pb-num">0${i + 1}</span>${esc(T.steps[i])}</legend>
    <p class="pb-hint">${esc(T.stepHints[i])}</p>${body}</fieldset>`;
  const draftTag = `<span class="pb-draft">${esc(T.draft)}</span>`;

  root.innerHTML = `<div class="pb">
    <div class="pb-steps">
      ${step(0, `<div class="pb-tpls">${TEMPLATES.map(t => `<label class="pb-tpl">
        <input type="radio" name="pb-tpl" value="${t.key}"${t.key === state.template ? ' checked' : ''}>
        <strong>${esc(T.templates[t.key][0])}</strong><span>${esc(T.templates[t.key][1])}</span></label>`).join('')}</div>`)}
      ${step(1, '<ul class="pb-feats" id="pb-feats"></ul>')}
      ${step(2, `<div class="pb-size">
        <fieldset class="pb-region"><legend>${esc(T.region)}</legend>${REGIONS.map(r => `<label class="pb-opt">
          <input type="radio" name="pb-region" value="${r}"${r === state.region ? ' checked' : ''}> ${esc(T.regions[r])}</label>`).join('')}</fieldset>
        <div class="pb-count"><label for="pb-users">${esc(T.users)}</label>
          <input id="pb-users" type="number" inputmode="numeric" min="${PRICING.limits.users[0]}" max="${PRICING.limits.users[1]}" step="1" value="${state.users}"></div>
        <div class="pb-count"><label for="pb-locations">${esc(T.locations)}</label>
          <input id="pb-locations" type="number" inputmode="numeric" min="${PRICING.limits.locations[0]}" max="${PRICING.limits.locations[1]}" step="1" value="${state.locations}"></div>
      </div><p class="pb-hint">${esc(T.sizeNote(PRICING.enterprise))}</p>`)}
    </div>
    <aside class="pb-sum" aria-labelledby="pb-sum-h">
      <h2 id="pb-sum-h">${esc(T.yours)}</h2>
      <div id="pb-plan"></div>
      <p class="pb-note">${esc(T.note)}</p>
      <p class="visually-hidden" id="pb-live" aria-live="polite"></p>
    </aside>
  </div>
  <section class="pb-plans" aria-labelledby="pb-plans-h">
    <h2 id="pb-plans-h">${esc(T.planList)}</h2>
    <ul>${T.planCards.map(([name, row, desc]) => `<li><h3>${esc(name)}</h3>
      <p class="pb-amt">${esc(row === 'setup' ? T.from(PRICING.setupFrom, PRICING.currency.us) + ' / ' + PRICING.currency.ca
        : row === 'monthly' ? T.monthlyTbc : row === 'custom' ? T.quoted : T.contact)} ${draftTag}</p>
      <p>${esc(desc)}</p></li>`).join('')}</ul>
  </section>
  <section class="pb-next" aria-labelledby="pb-next-h">
    <h2 id="pb-next-h">${esc(T.next)}</h2>
    <p>${esc(T.nextLede)}</p>
    <div class="cta-row">
      <a class="btn" href="${esc(booking)}">${esc(bookLabel)}</a>
      <button type="button" class="btn line" id="pb-download">${esc(T.download)}</button>
      <button type="button" class="btn line" id="pb-print">${esc(T.print)}</button>
    </div>
  </section>
  <div class="pb-sheet" id="pb-sheet" aria-hidden="true"></div>`;

  const feats = root.querySelector('#pb-feats');
  const drawFeatures = () => {
    const t = TEMPLATES.find(x => x.key === state.template);
    feats.innerHTML = t.features.map(f => `<li><label class="pb-chk">
      <input type="checkbox" value="${f.key}"${state.features.includes(f.key) ? ' checked' : ''}>
      <span>${esc(T.features[f.key])}</span>${f.custom ? `<em class="pb-tag">${esc(T.customTag)}</em>` : ''}</label></li>`).join('');
  };

  // The plan's lines, shared by the screen, the printout and the download.
  const lines = e => {
    const rows = [];
    if (e.plan === 'enterprise') rows.push([T.rows.enterprise, T.contact]);
    else rows.push([T.rows.setup, T.from(e.setupFrom, e.currency)]);
    rows.push([T.rows.monthly, T.monthlyTbc]);
    if (e.custom.length) rows.push([T.rows.custom, `${T.quoted} (${e.custom.map(k => T.features[k]).join(', ')})`]);
    return rows;
  };

  const plan = root.querySelector('#pb-plan'), live = root.querySelector('#pb-live'), sheet = root.querySelector('#pb-sheet');
  const draw = () => {
    const e = estimate(state), [name, sub] = T.plans[e.plan];
    plan.innerHTML = `<p class="pb-name">${esc(name)}</p><p class="pb-sub">${esc(sub)}</p>
      <dl class="pb-rows">${lines(e).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)} ${draftTag}</dd></div>`).join('')}</dl>
      <p class="pb-choice">${esc(T.templates[e.template][0])} &middot; ${esc(T.regions[e.region])} &middot; ${esc(T.sizeLine(e.users, e.locations))}</p>`;
    live.textContent = `${name}. ${lines(e).map(([k, v]) => `${k}: ${v}`).join('. ')}. ${T.draft}.`;
    sheet.innerHTML = sheetHTML(e);
  };

  const summary = e => {
    const [name, sub] = T.plans[e.plan];
    return {
      name, sub,
      template: T.templates[e.template][0],
      features: e.features.length ? e.features.map(k => T.features[k] + (e.custom.includes(k) ? ` (${T.customTag})` : '')) : [T.none],
      region: T.regions[e.region], size: T.sizeLine(e.users, e.locations),
      rows: lines(e), date: new Date().toLocaleDateString(lang === 'es' ? 'es' : 'en-CA', { year: 'numeric', month: 'long', day: 'numeric' }),
    };
  };
  const sheetHTML = e => {
    const s = summary(e);
    return `<p class="pb-sheet-brand">KHIPUAI</p><p class="pb-sheet-title">${esc(T.sheetTitle)}</p><p class="pb-sheet-date">${esc(T.sheetDate)}: ${esc(s.date)}</p>
      <dl><div><dt>${esc(T.yours)}</dt><dd>${esc(s.name)}: ${esc(s.sub)}</dd></div>
      <div><dt>${esc(T.sheetTemplate)}</dt><dd>${esc(s.template)}</dd></div>
      <div><dt>${esc(T.sheetFeatures)}</dt><dd><ul>${s.features.map(f => `<li>${esc(f)}</li>`).join('')}</ul></dd></div>
      <div><dt>${esc(T.region)}</dt><dd>${esc(s.region)}</dd></div>
      <div><dt>${esc(T.sheetSize)}</dt><dd>${esc(s.size)}</dd></div>
      ${s.rows.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)} (${esc(T.draft)})</dd></div>`).join('')}</dl>
      <p class="pb-sheet-note">${esc(T.note)}</p><p class="pb-sheet-note">${esc(bookLabel)}: ${esc(booking)}</p>`;
  };
  const sheetText = () => {
    const s = summary(estimate(state));
    return [T.sheetTitle, `${T.sheetDate}: ${s.date}`, '',
      `${T.yours}: ${s.name}: ${s.sub}`, `${T.sheetTemplate}: ${s.template}`, `${T.sheetFeatures}:`, ...s.features.map(f => `  - ${f}`),
      `${T.region}: ${s.region}`, `${T.sheetSize}: ${s.size}`, ...s.rows.map(([k, v]) => `${k}: ${v} (${T.draft})`), '',
      T.note, `${bookLabel}: ${booking}`, ''].join('\r\n');
  };

  root.addEventListener('change', ev => {
    const el = ev.target;
    if (el.name === 'pb-tpl') { state.template = el.value; state.features = defaults(el.value); drawFeatures(); }
    else if (el.name === 'pb-region') state.region = el.value;
    else if (el.type === 'checkbox') state.features = [...feats.querySelectorAll('input:checked')].map(i => i.value);
    else if (el.id === 'pb-users' || el.id === 'pb-locations') {
      const key = el.id.slice(3);
      state[key] = clampCount(el.value, PRICING.limits[key]);
      el.value = state[key];
    }
    draw();
  });
  // Counts update while typing too, without rewriting the field mid-entry.
  root.addEventListener('input', ev => {
    const el = ev.target;
    if (el.id !== 'pb-users' && el.id !== 'pb-locations' || el.value === '') return;
    state[el.id.slice(3)] = clampCount(el.value, PRICING.limits[el.id.slice(3)]);
    draw();
  });

  root.querySelector('#pb-print').addEventListener('click', () => window.print());
  root.querySelector('#pb-download').addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob(['﻿' + sheetText()], { type: 'text/plain;charset=utf-8' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: T.file });
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  drawFeatures();
  draw();
}
