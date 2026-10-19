/* Shared engine for the portfolio click-through demos (concepts/basic only).

   Each demo is a small imitation of one product: a few tabs of made-up data
   and buttons that change what is on screen. Nothing is saved, sent or
   fetched, and nothing leaves the page. A button that would create something
   in the real product (a report, an email, a file, a filing) shows a note
   saying what it would do instead of doing it.

   A demo module exports { key, tabs, t: {en, es}, init(), view: {tab: fn},
   act: {name: fn} }. Views return HTML from the state; actions change the
   state and may return a tab id to switch to. Markup hooks:
     data-act="name" data-arg="x"   runs act.name(state, x), then redraws
     data-input="name"              runs act.name(state, value) on change
     data-real="key"                shows t.real[key], changes nothing
   Every demo loads only when its Learn more dialog opens. */

export const KIT = {
  en: {
    badge: 'Demo, made-up data',
    tabs: 'Demo screens',
    hint: 'Click through the tabs. Nothing here is real, saved or sent.',
    ok: 'OK',
  },
  es: {
    badge: 'Demo, datos inventados',
    tabs: 'Pantallas de la demo',
    hint: 'Recorre las pestañas. Nada de esto es real, se guarda ni se envía.',
    ok: 'Entendido',
  },
};

export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// Fills {name} placeholders in a translated string.
export const fmt = (s, v = {}) => String(s).replace(/\{(\w+)\}/g, (_, k) => v[k] ?? '');
export const money = (n, lang) => (n < 0 ? '-' : '') + '$' + Math.abs(n).toLocaleString(lang === 'es' ? 'es-PE' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Small building blocks the demo views share.
export const ui = {
  tiles: items => `<div class="dm-tiles">${items.map(([label, value, sub]) =>
    `<div class="dm-tile"><span>${esc(label)}</span><b>${esc(value)}</b>${sub ? `<small>${esc(sub)}</small>` : ''}</div>`).join('')}</div>`,
  chip: (text, kind = 'info') => `<span class="dm-chip ${kind}">${esc(text)}</span>`,
  btn: (label, act, arg = '', { kind = '', pressed, disabled, expanded, controls } = {}) =>
    `<button type="button" class="dm-btn ${kind}" data-act="${act}" data-arg="${esc(arg)}"${pressed === undefined ? '' : ` aria-pressed="${pressed}"`}${expanded === undefined ? '' : ` aria-expanded="${expanded}"`}${controls ? ` aria-controls="${controls}"` : ''}${disabled ? ' disabled' : ''}>${esc(label)}</button>`,
  real: (label, key, kind = '') => `<button type="button" class="dm-btn ${kind}" data-real="${key}">${esc(label)}</button>`,
  select: (label, name, options, value) => `<label class="dm-field"><span>${esc(label)}</span><select data-input="${name}">${options.map(([v, text]) =>
    `<option value="${esc(v)}"${v === value ? ' selected' : ''}>${esc(text)}</option>`).join('')}</select></label>`,
  table: (caption, head, rows, { numeric = [] } = {}) => `<div class="dm-scroll"><table class="dm-table"><caption class="dm-vh">${esc(caption)}</caption>
    <thead><tr>${head.map((h, i) => `<th scope="col"${numeric.includes(i) ? ' class="num"' : ''}>${esc(h)}</th>`).join('')}</tr></thead>
    <tbody>${rows.map(r => `<tr${r.cls ? ` class="${r.cls}"` : ''}>${r.cells.map((c, i) => `<td${numeric.includes(i) ? ' class="num"' : ''}>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`,
  h: text => `<h4 class="dm-h">${esc(text)}</h4>`,
  p: (text, cls = '') => `<p class="dm-p ${cls}">${esc(text)}</p>`,
  steps: (labels, done) => `<ol class="dm-steps">${labels.map((l, i) =>
    `<li class="${i < done ? 'done' : i === done ? 'now' : ''}"${i === done ? ' aria-current="step"' : ''}><span aria-hidden="true">${i < done ? '&#10003;' : i + 1}</span>${esc(l)}</li>`).join('')}</ol>`,
};

export function mount(root, def, lang) {
  const t = def.t[lang], k = KIT[lang], uid = 'dm-' + def.key;
  const state = def.init(lang);
  let tab = def.tabs[0], draws = 0;
  root.innerHTML = `<div class="dm" data-demo="${def.key}">
    <div class="dm-bar"><span class="dm-app">${esc(t.app)}</span><span class="dm-badge">${esc(k.badge)}</span></div>
    <p class="dm-hint">${esc(k.hint)}</p>
    <div class="dm-tabs" role="tablist" aria-label="${esc(t.app)}: ${esc(k.tabs)}">${def.tabs.map((id, i) =>
      `<button type="button" role="tab" id="${uid}-t-${id}" aria-controls="${uid}-p" data-tab="${id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${esc(t.tabs[id])}</button>`).join('')}</div>
    <div class="dm-panel" role="tabpanel" id="${uid}-p" tabindex="0"></div>
    <div class="dm-note" role="status"></div></div>`;
  const frame = root.querySelector('.dm'), panel = root.querySelector('.dm-panel'), note = root.querySelector('.dm-note');
  const tabs = [...root.querySelectorAll('[role="tab"]')];

  const hideNote = () => { note.innerHTML = ''; note.classList.remove('on'); };
  const draw = focus => {
    panel.setAttribute('aria-labelledby', `${uid}-t-${tab}`);
    panel.innerHTML = def.view[tab](state, t, lang);
    frame.dataset.demoState = `${tab}:${++draws}`;
    // Keep keyboard focus on the control that was used, when it still exists.
    if (focus) (panel.querySelector(focus) || panel).focus({ preventScroll: true });
  };
  const select = (id, focusTab) => {
    tab = id; hideNote();
    tabs.forEach(b => { const on = b.dataset.tab === id; b.setAttribute('aria-selected', on); b.tabIndex = on ? 0 : -1; if (on && focusTab) b.focus(); });
    draw();
  };
  const run = (name, value, el, focus) => {
    const next = def.act[name](state, value, el);
    hideNote();
    if (next && next !== tab) select(next); else draw(focus);
  };

  root.addEventListener('click', e => {
    const tb = e.target.closest('[role="tab"]');
    if (tb) return select(tb.dataset.tab, true);
    if (e.target.closest('.dm-ok')) { const back = note._from; hideNote(); back?.focus(); return; }
    const real = e.target.closest('[data-real]');
    if (real) {
      note.innerHTML = `<p>${esc(t.real[real.dataset.real])}</p><button type="button" class="dm-btn dm-ok">${esc(k.ok)}</button>`;
      note._from = real; note.classList.add('on'); frame.dataset.demoState = `${tab}:${++draws}`;
      return;
    }
    const a = e.target.closest('[data-act]');
    if (a && !a.disabled) run(a.dataset.act, a.dataset.arg, a, `[data-act="${a.dataset.act}"][data-arg="${CSS.escape(a.dataset.arg)}"]`);
  });
  root.addEventListener('change', e => {
    const f = e.target.closest('[data-input]');
    if (f) run(f.dataset.input, f.type === 'checkbox' ? f.checked : f.value, f, `[data-input="${f.dataset.input}"]${f.type === 'radio' ? `[value="${CSS.escape(f.value)}"]` : ''}`);
  });
  // Arrow keys move between tabs (the ARIA tabs pattern).
  root.querySelector('.dm-tabs').addEventListener('keydown', e => {
    const i = tabs.indexOf(document.activeElement); if (i < 0) return;
    const j = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
    if (j === undefined) return;
    e.preventDefault();
    select(tabs[(j + tabs.length) % tabs.length].dataset.tab, true);
  });
  draw();
}
