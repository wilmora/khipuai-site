/* ACA Filing miniature: the staff app (Dashboard, Clients, one client, and a
   filing's workspace with its Data, Codes, Forms and IRS e-file tabs) and the
   client portal (Home, Filings, one tax year to review and approve), redrawn
   as static HTML with the app's own Tailwind classes and made-up data.
   The Workspace panel (the person's control in the header, or the SANDBOX
   chip in the portal) switches between the team screens and the client
   portal, as in the real app. Anything that would upload, download, send or
   file shows a note instead. */
import { mini, esc, svg } from '../mini.js';
import { I } from './icons.js';
import {
  YEAR, NOW, DEADLINE, DAYS_LEFT, SSN, VERSION, STAFF, CLIENT_USER, STEPS, STATUS, CLIENTS, ACTIVITY,
  EMPLOYEES, EXCEPTIONS, HOW_IT_DECIDES, MEANINGS, UPLOADS,
} from './data.js';

const ic = (n, size = 16, cls = '', stroke = 2) => svg(I[n], { size, cls, stroke });
const REAL = what => `In the real product this would ${what}`;
const real = what => `data-real="${esc(REAL(what))}"`;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MAIN = 'bramblewood';
const plural = (n, one, many = one + 's') => `${n} ${n === 1 ? one : many}`;

/* ---------- state ---------- */
const S = {
  route: [], collapsed: false, panel: false, search: '', searchOpen: false, bell: false,
  dQ: '', dFilter: 'all', dFilterOpen: false, attnAll: false,
  cFilter: 'all', cSort: 'updated', cView: 'list', cQ: '',
  steps: Object.fromEntries(CLIENTS.map(c => [c.key, c.step])),
  retired: Object.fromEntries(CLIENTS.map(c => [c.key, Boolean(c.retired)])),
  history: {}, histOpen: new Set(), back: null, backNote: '', newYear: '',
  released: { at: 'Feb 9, 2026, 10:16 AM', by: STAFF.email, version: VERSION },
  approval: null, built: null, flash: '', openEmp: new Set(), rules: false, receipt: '',
  agreed: false, reporting: false, pFlash: '', door: 'team',
};
const client = k => CLIENTS.find(c => c.key === k);
const stepOf = k => S.steps[k];
const statusKey = k => STEPS[stepOf(k) - 1]?.key ?? '';
const fStatus = () => statusKey(MAIN);
const setMain = key => { S.steps[MAIN] = STEPS.findIndex(s => s.key === key) + 1; };

/* ---------- shared components (components/ui.tsx, pageKit.tsx) ---------- */
const TONE = {
  info: ['text-info-fg', 'bg-info-bg', 'border-info-border', 'bg-info-solid'],
  success: ['text-success-fg', 'bg-success-bg', 'border-success-border', 'bg-success-solid'],
  warning: ['text-warning-fg', 'bg-warning-bg', 'border-warning-border', 'bg-warning-solid'],
  critical: ['text-critical-fg', 'bg-critical-bg', 'border-critical-border', 'bg-critical-solid'],
  neutral: ['text-neutral-fg', 'bg-neutral-bg', 'border-neutral-border', 'bg-neutral-solid'],
  demo: ['text-demo-fg', 'bg-demo-bg', 'border-demo-border', 'bg-demo-solid'],
};
const badge = (tone, text, dot = false, cls = '') => { const [fg, bg, bd, solid] = TONE[tone];
  return `<span class="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 text-caption font-medium ${bg} ${bd} ${fg} ${cls}">${dot ? `<span aria-hidden="true" class="h-1.5 w-1.5 shrink-0 rounded-full ${solid}"></span>` : ''}${text}</span>`; };
function banner(kind, body, { title = '', action = '', cls = '' } = {}) {
  const tone = { safe: 'success', note: 'info', warn: 'warning', critical: 'critical' }[kind];
  const icon = { safe: 'CheckCircle2', note: 'Info', warn: 'AlertTriangle', critical: 'AlertCircle' }[kind];
  const [fg, bg, bd] = TONE[tone];
  return `<div ${kind === 'warn' || kind === 'critical' ? 'role="alert"' : ''} class="mb-5 flex items-start gap-3 rounded-card border px-4 py-3 text-body-sm text-ink ${bd} ${bg} ${cls}">
    ${ic(icon, 16, `mt-0.5 shrink-0 ${fg}`)}<div class="min-w-0 flex-1">${title ? `<div class="font-semibold text-ink">${title}</div>` : ''}<div class="${title ? 'mt-0.5 text-ink-muted' : ''}">${body}</div></div>
    ${action ? `<div class="shrink-0 self-center">${action}</div>` : ''}</div>`;
}
const card = (body, cls = '') => `<div class="rounded-card bg-surface shadow-e4 ${cls}">${body}</div>`;
const sectionHeader = (title, { count, desc = '', action = '', cls = '' } = {}) =>
  `<div class="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 ${cls}"><div class="min-w-0">
    <h2 class="flex items-center gap-2 text-section text-ink">${title}${count !== undefined ? `<span class="rounded-full bg-tile-slate px-2 py-0.5 text-caption font-semibold tabular-nums text-ink-muted">${count}</span>` : ''}</h2>
    ${desc ? `<p class="mt-0.5 text-body-sm text-ink-subtle">${desc}</p>` : ''}</div>${action ? `<div class="shrink-0 text-body-sm">${action}</div>` : ''}</div>`;
const BTN_KIND = {
  primary: 'bg-brand text-white shadow-e1 hover:bg-brand-dark',
  secondary: 'border border-line-strong bg-surface text-ink shadow-e1 hover:bg-subtle',
  ghost: 'text-ink-muted hover:bg-muted hover:text-ink',
};
const btn = (inner, { kind = 'primary', size = 'md', attrs = '', cls = '', disabled = false, type = 'button' } = {}) =>
  `<button type="${type}" ${attrs} ${disabled ? 'disabled' : ''} class="inline-flex items-center justify-center whitespace-nowrap rounded-control font-semibold transition-colors duration-120 disabled:cursor-not-allowed disabled:opacity-50 ${size === 'sm' ? 'min-h-8 gap-1.5 px-3 py-1.5 text-caption' : 'min-h-10 gap-2 px-4 py-2 text-body-sm'} ${BTN_KIND[kind]} ${cls}">${inner}</button>`;
const helpLink = (label = 'How this screen works') =>
  `<button type="button" ${real('play the how-to video for this screen.')} title="${esc(label)} (video)" class="inline-flex min-h-9 items-center gap-1.5 whitespace-nowrap rounded-control border border-line-strong bg-surface px-3 py-1.5 text-body-sm font-medium text-ink-muted shadow-e1 transition-colors duration-120 hover:bg-subtle hover:text-ink">${ic('CirclePlay', 15)}${esc(label)}</button>`;
const FIELD_INPUT = 'w-full rounded-control border border-line-strong bg-surface px-3 py-2 text-body text-ink shadow-e1 placeholder:text-ink-faint transition-colors duration-120 hover:border-ink-faint focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 disabled:cursor-not-allowed disabled:bg-subtle disabled:text-ink-subtle';
const FIELD_LABEL = 'block text-body-sm font-medium text-ink-muted';
function tabBar(label, tabs, value, attr) {
  return `<div role="tablist" aria-label="${esc(label)}" class="mb-6 flex max-w-full gap-1 overflow-x-auto px-1 pt-1 shadow-[inset_0_-1px_0_#e4e8ee]">${tabs.map(t => {
    const on = t.key === value;
    return `<button type="button" role="tab" aria-selected="${on}" tabindex="${on ? 0 : -1}" ${t.real ? real(t.real) : `${attr}="${t.key}"`} class="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-t-control border-b-2 px-3 pb-2.5 pt-1.5 text-body-sm font-semibold transition-colors duration-120 ${on ? 'border-brand text-brand-dark' : 'border-transparent text-ink-muted hover:text-ink'}">${t.icon ? ic(t.icon, 14) : ''}${esc(t.label)}</button>`; }).join('')}</div>`;
}
function stepTrack(step, steps = 8, label = '', compact = false) {
  const done = Math.max(0, Math.min(step, steps));
  return `<div class="min-w-0"><div role="progressbar" aria-valuemin="1" aria-valuemax="${steps}" aria-valuenow="${done}" aria-valuetext="Step ${done} of ${steps}: ${esc(label)}" class="flex gap-1">${
    Array.from({ length: steps }, (_, i) => `<span class="h-1.5 flex-1 rounded-full ${i < done ? (done === steps ? 'bg-success-solid' : 'bg-brand') : 'bg-muted'}"></span>`).join('')}</div>
    ${compact ? '' : `<div class="mt-1.5 text-caption text-ink-subtle">Step ${done} of ${steps}: <span class="font-medium text-ink">${esc(label)}</span></div>`}</div>`;
}
const DOT = { neutral: 'bg-neutral-solid', info: 'bg-info-solid', warning: 'bg-warning-solid', success: 'bg-success-solid', critical: 'bg-critical-solid', teal: 'bg-teal-solid', violet: 'bg-demo-solid', brand: 'bg-brand' };
const TILE_ICON = { neutral: 'bg-neutral-bg text-neutral-fg', info: 'bg-info-bg text-info-fg', warning: 'bg-warning-bg text-warning-fg', success: 'bg-success-bg text-success-fg', critical: 'bg-critical-bg text-critical-fg', teal: 'bg-teal-bg text-teal-fg', violet: 'bg-demo-bg text-demo-fg', brand: 'bg-brand-soft text-brand-dark' };
const statusDot = (tone, text) => `<span class="inline-flex items-center gap-2 whitespace-nowrap text-[0.75rem] font-semibold uppercase tracking-[0.04em] text-ink-muted"><span aria-hidden="true" class="h-2 w-2 shrink-0 rounded-full ${DOT[tone]}"></span>${text}</span>`;
const miniChip = (on, text) => `<span class="inline-flex items-center rounded-md border px-1.5 py-0.5 text-[0.75rem] xl:text-[0.6875rem] font-semibold ${on ? 'border-line-strong bg-muted text-ink' : 'border-line bg-surface text-ink-faint'}">${text}</span>`;
const none = () => '<span class="text-ink-faint">-</span>';
const miniSteps = (step, label) => `<span class="inline-flex flex-col gap-1" role="progressbar" aria-valuemin="1" aria-valuemax="8" aria-valuenow="${step}" aria-valuetext="Step ${step} of 8: ${esc(label)}"><span class="flex gap-0.5" aria-hidden="true">${
  Array.from({ length: 8 }, (_, i) => `<span class="h-1.5 w-3 rounded-full ${i < step ? 'bg-brand' : 'bg-line'}"></span>`).join('')}</span><span class="text-caption text-ink-muted">${step}. ${esc(label)}</span></span>`;
const sectionCard = (eyebrow, title, { desc = '', action = '', body = '', flush = false, tone = 'brand' } = {}) =>
  `<section class="rounded-card border border-line bg-surface shadow-e1"><div class="flex flex-wrap items-start gap-3 px-5 pt-5"><div class="min-w-0 flex-1">
    <div class="flex items-center gap-1.5 text-[0.75rem] xl:text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-ink-subtle"><span aria-hidden="true" class="h-1.5 w-1.5 rounded-full ${DOT[tone]}"></span>${eyebrow}</div>
    <h2 class="mt-1 text-title text-ink">${title}</h2>${desc ? `<p class="mt-0.5 text-body-sm text-ink-muted">${desc}</p>` : ''}</div>${action ? `<div class="shrink-0">${action}</div>` : ''}</div>
    <div class="${flush ? 'mt-4' : 'px-5 pb-5 pt-4'}">${body}</div></section>`;

/* ---------- the rows the dashboard and the client list share (dashboard/data.ts) ---------- */
function rowOf(c) {
  const step = stepOf(c.key), retired = S.retired[c.key];
  const reasons = [];
  if (c.missing.length) reasons.push(`${c.missing.length} profile answers missing`);
  if (!c.contacts.length && !retired) reasons.push('No portal contact');
  let status = step === 0 ? (reasons.length ? 'attention' : 'no_filing') : step <= 2 ? 'waiting' : step <= 4 ? 'in_progress' : step === 5 ? 'with_client' : step === 6 ? 'ready' : step === 7 ? 'filed' : 'accepted';
  if (reasons.length && step < 5) status = 'attention';
  return { c, step, retired, reasons, status, label: STEPS[step - 1]?.label ?? '' };
}
const activeRows = () => CLIENTS.filter(c => !S.retired[c.key]).map(rowOf);
function attention() {
  const rows = activeRows(), filings = rows.filter(r => r.step > 0), unfiled = filings.filter(r => r.step < 7).length, out = [];
  if (unfiled) out.push({ id: 'deadline', sev: 'medium', title: 'Approaching deadline', body: `${unfiled} ${YEAR} filings are not filed and the e-file deadline is ${DAYS_LEFT} days away.`, at: 'Feb 10, 2026', to: '#/clients' });
  rows.filter(r => r.c.missing.length).forEach(r => out.push({ id: 'm' + r.c.key, sev: r.step ? 'high' : 'medium', title: 'Missing profile answers', body: `${r.c.name}: ${r.c.missing.slice(0, 2).join(', ')}${r.c.missing.length > 2 ? ` and ${r.c.missing.length - 2} more` : ''}.`, at: r.c.updated, to: `#/clients/${r.c.key}` }));
  rows.filter(r => !r.c.contacts.length).forEach(r => out.push({ id: 'c' + r.c.key, sev: 'medium', title: 'No portal contact', body: `Nobody at ${r.c.name} can sign in to review or approve their forms yet.`, at: r.c.updated, to: `#/clients/${r.c.key}` }));
  rows.filter(r => !r.step).forEach(r => out.push({ id: 'n' + r.c.key, sev: 'info', title: `No ${YEAR} filing started`, body: `${r.c.name} has no filing for the ${YEAR} season yet.`, at: r.c.updated, to: `#/clients/${r.c.key}/filings` }));
  const filed = rows.filter(r => r.step >= 7).length;
  if (filed) out.push({ id: 'filed', sev: 'success', title: 'Filings complete', body: `${filed} clients have been filed for the ${YEAR} season.`, at: 'Feb 3, 2026', to: '#/clients' });
  return out;
}

/* ---------- the frame: rail and top bar (Shell.tsx, PortalRail.tsx, railStyles.ts) ---------- */
const NAV = [
  { label: 'Dashboard', icon: 'House', to: '#/', on: r => !r[0] },
  { label: 'Clients', icon: 'Building2', to: '#/clients', on: r => r[0] === 'clients' },
  { label: 'Filings', icon: 'FileStack', real: "open the filings board, every client's filing by step." },
  { label: 'Reports', icon: 'BarChart3', real: 'open the season reports.' },
  { label: 'Activity', icon: 'History', real: 'open the full activity log.' },
  { label: 'How-To', icon: 'MonitorPlay', real: 'open the how-to chapters and videos.' },
  { label: 'Settings', icon: 'Settings', real: 'open the admin settings and users.' },
];
const PORTAL_NAV = [
  { label: 'Home', icon: 'Home', to: '#/portal', on: r => !r[1] },
  { label: 'Profile', icon: 'ClipboardList', real: "open the company's profile questionnaire." },
  { label: 'Filings', icon: 'FileText', to: '#/portal/filings', on: r => r[1] === 'filings' },
  { label: 'How-To', icon: 'MonitorPlay', real: 'open the how-to videos for clients.' },
];
const ROW = 'group relative flex min-h-[44px] items-center gap-2.5 rounded-[9px] py-2 text-[0.86rem] transition-[background-color,color] duration-120 lg:[@media(pointer:fine)]:min-h-0 lg:[@media(pointer:fine)]:py-[7px] ';
const railRow = (on, iconOnly) => ROW + (iconOnly ? 'justify-center px-0 ' : 'px-3 ') + (on ? 'bg-rail-raised font-bold text-white shadow-[inset_0_0_0_1px_rgba(138,180,255,0.16)]' : 'font-medium text-rail-text hover:bg-rail-hover hover:text-white');
const railIcon = on => 'shrink-0 opacity-80 transition-colors duration-120 ' + (on ? 'text-white' : 'text-rail-icon group-hover:text-white');
const lockup = small => small
  ? `<span class="flex h-7 w-7 items-center justify-center rounded-[8px] bg-brand text-white" role="img" aria-label="ACA Filing">${ic('FileCheck2', 16)}</span>`
  : `<div class="flex items-center gap-2.5"><span class="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-[7px] bg-brand text-white">${ic('FileCheck2', 15)}</span><span class="text-[0.95rem] font-bold tracking-[0.01em] text-white">ACA Filing</span></div>`;
function rail(portal) {
  const items = portal ? PORTAL_NAV : NAV, small = S.collapsed;
  const nav = items.map(n => { const on = n.on?.(S.route) ?? false;
    const lab = small ? `title="${n.label}" aria-label="${n.label}"` : '';
    return n.to ? `<a href="${n.to}" ${lab} ${on ? 'aria-current="page"' : ''} class="${railRow(on, small)}">${ic(n.icon, small ? 19 : 17, railIcon(on), small ? 2 : 2.2)}${small ? '' : n.label}</a>`
      : `<button type="button" ${lab} ${real(n.real)} class="${railRow(false, small)} w-full text-left">${ic(n.icon, small ? 19 : 17, railIcon(false), small ? 2 : 2.2)}${small ? '' : n.label}</button>`; }).join('');
  const foot = portal
    ? `<div class="shrink-0 border-t border-rail-line px-6 py-4"><p class="flex items-center gap-2 text-body-sm font-medium text-white">${ic('Building2', 16, 'shrink-0 text-rail-icon')}<span class="min-w-0 truncate">${esc(client(MAIN).name)}</span></p></div>`
    : `<div class="flex shrink-0 items-center border-t border-rail-line py-3.5 pl-6 pr-3"><div class="flex flex-wrap items-center gap-x-3 gap-y-1">
        <button type="button" ${real('open the Terms of Service.')} class="rounded-sm text-caption font-medium text-rail-muted transition-colors duration-120 hover:text-white">Terms</button><span aria-hidden="true" class="h-3 w-px bg-rail-line"></span>
        <button type="button" ${real('open the Privacy Policy.')} class="rounded-sm text-caption font-medium text-rail-muted transition-colors duration-120 hover:text-white">Privacy</button></div></div>`;
  return `<aside aria-label="Main navigation" class="sticky top-0 flex h-screen shrink-0 flex-col overflow-hidden isolate bg-gradient-to-b from-rail to-rail-to text-rail-text font-rail ${small ? 'w-[72px]' : 'w-[264px]'}">
    <div class="flex h-topbar shrink-0 items-center ${small ? 'justify-center' : 'px-6'}">${lockup(small)}</div>
    <div class="min-h-0 flex-1 overflow-y-auto px-3 pb-3 pt-5"><nav aria-label="${portal ? 'Portal sections' : 'Sections'}"><div class="flex flex-col gap-1">${nav}</div></nav></div>
    ${small ? '' : foot}</aside>`;
}
const TB_BASE = 'relative flex shrink-0 items-center justify-center rounded-control border border-line bg-surface text-ink-muted transition-colors duration-120 hover:border-brand hover:text-brand';
const TB_ICON = `${TB_BASE} h-11 w-11 lg:h-9 lg:w-9`;
const collapseBtn = () => `<button type="button" data-act="collapse" aria-label="${S.collapsed ? 'Expand menu' : 'Collapse menu'}" aria-expanded="${!S.collapsed}" title="${S.collapsed ? 'Expand menu' : 'Collapse menu'}" class="${TB_ICON}">${ic('PanelLeft', 17)}</button>`;
function searchHits() {
  const t = S.search.trim().toLowerCase(); if (!t) return [];
  const out = [];
  CLIENTS.filter(c => c.name.toLowerCase().includes(t)).forEach(c => {
    out.push({ label: c.name, hint: S.retired[c.key] ? 'Client, retired' : 'Client', icon: 'Building2', to: `#/clients/${c.key}` });
    out.push({ label: `${c.name} filings`, hint: 'Filings', icon: 'FileStack', to: `#/clients/${c.key}/filings` });
  });
  NAV.filter(n => n.label.toLowerCase().includes(t)).forEach(n => out.push({ label: n.label, hint: 'Page', icon: n.icon, to: n.to, real: n.real }));
  return out.slice(0, 8);
}
function staffTopbar() {
  const hits = searchHits(), urgent = attention().filter(a => a.sev === 'high' || a.sev === 'medium');
  const results = S.searchOpen && S.search.trim() ? `<div id="header-search-results" role="listbox" class="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-card border border-line bg-surface p-1.5 shadow-e8">${hits.length ? hits.map(h =>
    `<button type="button" role="option" aria-selected="false" ${h.real ? real(h.real) : `data-href="${h.to}"`} class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors duration-120 hover:bg-brand-softer">${ic(h.icon, 16, 'shrink-0 text-ink-subtle')}<span class="min-w-0 flex-1 truncate text-body-sm text-ink">${esc(h.label)}</span><span class="text-caption text-ink-subtle">${h.hint}</span></button>`).join('')
    : `<p class="px-3 py-3 text-body-sm text-ink-subtle">Nothing matches "${esc(S.search.trim())}".</p>`}</div>` : '';
  const bell = S.bell ? `<div class="absolute right-0 top-full z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-card border border-line bg-surface shadow-e8">
    <div class="border-b border-line px-4 py-3 text-body-sm font-semibold text-ink">Needs attention</div>
    <ul class="max-h-80 divide-y divide-line overflow-y-auto">${urgent.slice(0, 6).map(a => `<li><a href="${a.to}" class="flex gap-3 px-4 py-3 transition-colors duration-120 hover:bg-subtle">${ic(a.sev === 'high' ? 'AlertCircle' : 'AlertTriangle', 17, `mt-0.5 shrink-0 ${a.sev === 'high' ? 'text-critical-fg' : 'text-warning-fg'}`)}<span class="min-w-0"><span class="block text-body-sm font-medium text-ink">${esc(a.title)}</span><span class="block text-caption leading-snug text-ink-subtle">${esc(a.body)}</span></span></a></li>`).join('')}</ul>
    <a href="#/" class="block border-t border-line px-4 py-2.5 text-center text-body-sm font-semibold text-brand-dark hover:bg-subtle">Open the dashboard</a></div>` : '';
  return `<div class="sticky top-0 z-40"><div class="mx-auto max-w-[1600px] px-4 pt-4 sm:px-8"><header class="glass flex items-center gap-2 rounded-card border border-line/80 px-2.5 py-2 shadow-float sm:px-3">
    <div class="flex min-w-0 flex-1 items-center gap-2">${collapseBtn()}
      <div class="relative hidden min-w-0 max-w-xl flex-1 md:block" data-searchbox><label class="relative block"><span class="sr-only">Search clients, filings, or companies</span>${ic('Search', 15, 'pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint')}
        <input id="hsearch" data-input="search" value="${esc(S.search)}" role="combobox" aria-expanded="${S.searchOpen && Boolean(S.search.trim())}" aria-controls="header-search-results" aria-autocomplete="list" placeholder="Search clients, filings, or companies..." class="h-11 w-full rounded-control border border-line bg-surface pl-9 pr-16 text-[0.84rem] text-ink transition duration-120 placeholder:text-ink-faint focus:border-brand focus:outline-none lg:h-9">
        <kbd aria-hidden="true" class="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-md border border-line bg-subtle px-1.5 py-0.5 font-sans text-[0.68rem] font-semibold text-ink-subtle lg:block">⌘K</kbd></label>${results}</div></div>
    <div class="ml-auto flex shrink-0 items-center gap-1 min-[360px]:gap-1.5 sm:gap-2">
      <span title="Sandbox: a separate test copy with its own data." class="hidden h-9 shrink-0 items-center gap-1.5 rounded-control border border-line bg-subtle/80 px-3 text-[0.74rem] font-semibold text-ink-muted xl:inline-flex"><span aria-hidden="true" class="h-2 w-2 rounded-full bg-warning-solid"></span>Sandbox</span>
      <span aria-hidden="true" class="mx-0.5 hidden h-6 w-px shrink-0 bg-line xl:block"></span>
      <div class="relative" data-bellbox><button type="button" data-act="bell" aria-expanded="${S.bell}" aria-label="Notifications, ${urgent.length} need attention" class="${TB_ICON}">${ic('Bell', 17)}${urgent.length ? '<span aria-hidden="true" class="absolute right-2 top-2 h-2 w-2 rounded-full bg-brand ring-2 ring-surface lg:right-1.5 lg:top-1.5"></span>' : ''}</button>${bell}</div>
      <span aria-hidden="true" class="mx-0.5 hidden h-6 w-px shrink-0 bg-line sm:block"></span>
      <button type="button" data-act="panel" aria-haspopup="dialog" aria-expanded="${S.panel}" aria-label="Account and views: ${STAFF.name}, Sandbox" class="flex h-11 shrink-0 items-center gap-2 rounded-control border border-line bg-surface pl-1.5 pr-1.5 text-[0.8rem] font-semibold text-ink transition-colors duration-120 hover:border-brand hover:text-brand sm:pr-2.5 lg:h-9 lg:pl-1">
        <span aria-hidden="true" class="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] bg-brand text-[0.66rem] font-extrabold text-white">${STAFF.initials}</span>
        <span class="flex min-w-0 flex-col text-left leading-tight"><span class="hidden max-w-[140px] truncate text-[0.78rem] sm:block">${STAFF.name}</span><span class="flex items-center gap-1 whitespace-nowrap text-[0.68rem] font-medium text-ink-subtle"><span aria-hidden="true" class="h-1.5 w-1.5 shrink-0 rounded-full bg-warning-solid"></span><span>Sandbox</span></span></span>
        ${ic('ChevronDown', 14, 'hidden -rotate-90 text-ink-subtle sm:block')}</button></div></header></div></div>`;
}
function portalTopbar() {
  return `<div class="sticky top-0 z-40"><div class="px-4 pt-4 sm:px-8"><header class="glass flex items-center gap-2 rounded-card border border-line/80 px-2.5 py-2 shadow-float sm:px-3">
    <div class="flex min-w-0 flex-1 items-center gap-2">${collapseBtn()}<span class="min-w-0 truncate text-[0.86rem] font-semibold text-ink-muted">ACA Filing portal</span></div>
    <div class="ml-auto flex shrink-0 items-center gap-1 min-[360px]:gap-1.5 sm:gap-2">
      <button type="button" data-act="panel" aria-haspopup="dialog" aria-expanded="${S.panel}" aria-label="Workspace: Sandbox. Open for detail." class="flex h-11 shrink-0 items-center gap-1.5 rounded-control border border-warning-border bg-warning-bg px-2.5 text-warning-fg transition-colors duration-120 hover:border-warning-solid lg:h-9">${ic('FlaskConical', 14, 'shrink-0')}<span class="text-label uppercase">Sandbox</span></button>
      <span class="hidden h-9 items-center gap-2 px-1 text-[0.8rem] font-semibold text-ink sm:flex">${ic('Building2', 16, 'text-ink-faint')} ${esc(client(MAIN).name)}</span></div></header></div></div>`;
}
/* The Workspace panel (components/Workspace.tsx, ModeSwitcher.tsx): the
   environment, and the view: the team screens or the client portal. */
function panel(portal) {
  if (!S.panel) return '';
  const ROWC = 'relative flex min-h-[40px] w-full items-center gap-2.5 whitespace-nowrap rounded-control border px-3 py-2 text-left text-body-sm font-medium transition-colors duration-120';
  const ON = 'border-brand/40 bg-brand-softer font-semibold text-ink', OFF = 'border-line bg-surface text-ink-muted hover:bg-subtle hover:text-ink';
  const LINK = 'flex w-full items-center gap-2.5 rounded-control px-2 py-2 text-body-sm text-ink transition-colors duration-120 hover:bg-subtle';
  const view = (on, label, icon, to, sub) => `<a href="${to}" ${on ? 'aria-current="page"' : ''} data-close-panel class="${ROWC} ${on ? ON : OFF}">${ic(icon, 15, 'shrink-0')}<span class="flex-1">${label}${sub ? `<span class="block whitespace-normal text-caption font-normal text-ink-subtle">${sub}</span>` : ''}</span>${on ? ic('Check', 15, 'shrink-0 text-brand-dark') : ''}</a>`;
  return `<div class="fixed inset-0 z-[60] flex justify-end"><button type="button" aria-label="Close" data-act="panel-close" class="absolute inset-0 bg-ink/20"></button>
    <div role="dialog" aria-modal="true" aria-label="Workspace" class="relative flex h-full w-[22rem] max-w-[92vw] animate-rise flex-col overflow-y-auto bg-surface shadow-e8">
      <div class="flex items-center gap-3 border-b border-line px-5 py-4">${portal ? '<span class="text-title text-ink">Workspace</span>' : `
        <span aria-hidden="true" class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-soft text-caption font-semibold text-brand-dark">${STAFF.initials}</span>
        <span class="min-w-0"><span class="block truncate text-body-sm font-semibold text-ink">${STAFF.name}</span><span class="block truncate text-caption text-ink-subtle">${STAFF.email}</span><span class="mt-0.5 flex items-center gap-1 text-caption text-ink-muted">${ic('Shield', 12)} Admin</span></span>`}
        <button type="button" id="panel-close" data-act="panel-close" aria-label="Close" class="ml-auto rounded-control p-1.5 text-ink-subtle transition-colors duration-120 hover:bg-muted hover:text-ink">${ic('X', 16)}</button></div>
      <div class="flex flex-col gap-6 px-5 py-5">
        <div><div class="mb-2 text-label uppercase text-ink-subtle">Environment</div><div class="flex flex-col gap-1.5">
          <div class="flex items-center gap-3 rounded-control border border-warning-border bg-warning-bg px-3 py-3"><span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface text-warning-fg">${ic('FlaskConical', 16)}</span><span class="min-w-0 flex-1"><span class="block text-body-sm font-semibold text-ink">Sandbox</span><span class="block text-caption text-ink-subtle">Current environment</span></span>${ic('Check', 16, 'shrink-0 text-warning-fg')}</div>
          <button type="button" ${real('open the Production server: a different address with the real filings.')} class="flex items-center gap-3 rounded-control border border-line bg-surface px-3 py-3 text-left text-ink transition-colors duration-120 hover:border-line-strong hover:bg-subtle"><span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-subtle text-ink-subtle">${ic('Rocket', 16)}</span><span class="min-w-0 flex-1"><span class="block text-body-sm font-semibold">Production</span><span class="block text-caption font-normal text-ink-subtle">Open in this tab</span></span>${ic('ArrowRight', 15, 'shrink-0 opacity-60')}</button></div></div>
        <div><div class="mb-2 text-label uppercase text-ink-subtle">View</div><div class="flex flex-col gap-1.5">
          <div class="mb-1.5 mt-1 text-caption font-medium text-ink-subtle">This server</div>
          ${view(!portal, 'Team portal', 'LayoutDashboard', '#/', '')}
          ${view(portal, 'Client portal', 'MonitorSmartphone', '#/portal', `As ${esc(client(MAIN).name)} sees it`)}</div></div>
      </div>
      <div class="mt-auto border-t border-line px-3 py-3">
        <a href="#/signin" data-close-panel class="${LINK}">${ic('Eye', 15, 'shrink-0 text-ink-subtle')} Preview the sign-in page</a>
        <button type="button" ${real('open the Terms of Service.')} class="${LINK}">${ic('FileText', 15, 'shrink-0 text-ink-subtle')} Terms of Service</button>
        <button type="button" ${real('open the Privacy Policy.')} class="${LINK}">${ic('FileText', 15, 'shrink-0 text-ink-subtle')} Privacy Policy</button>
        <div class="mx-2 my-2 h-px bg-line"></div>
        <a href="#/signin" data-close-panel class="${LINK}">${ic('LogOut', 15, 'shrink-0 text-ink-subtle')} Sign out</a></div></div></div>`;
}

/* ---------- Dashboard (dashboard/DashboardPage.tsx) ---------- */
const CARD = 'rounded-card border border-line/80 bg-surface shadow-[0_1px_2px_rgba(15,23,42,0.04),0_1px_3px_rgba(15,23,42,0.03)]';
const TONE_BADGE = { neutral: 'bg-neutral-bg text-neutral-fg', info: 'bg-info-bg text-info-fg', warning: 'bg-warning-bg text-warning-fg', success: 'bg-success-bg text-success-fg', teal: 'bg-teal-bg text-teal-fg', violet: 'bg-demo-bg text-demo-fg' };
const TONE_DOT = { neutral: 'bg-neutral-solid', info: 'bg-info-solid', warning: 'bg-warning-solid', success: 'bg-success-solid', teal: 'bg-teal-solid', violet: 'bg-demo-solid' };
const statusPill = s => `<span class="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-caption font-medium ${TONE_BADGE[STATUS[s].tone]}"><span aria-hidden="true" class="h-1.5 w-1.5 rounded-full ${TONE_DOT[STATUS[s].tone]}"></span>${STATUS[s].label}</span>`;
const cardLink = (to, text) => `<a href="${to}" class="group inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-sm text-body-sm font-semibold text-brand-dark transition-colors duration-120 hover:text-brand">${text}${ic('ArrowRight', 14, 'transition-transform duration-120 group-hover:translate-x-0.5')}</a>`;
const iconTile = (icon, tone) => `<span aria-hidden="true" class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${{ blue: 'bg-tile-blue text-tile-blue-fg', green: 'bg-success-bg text-success-fg', amber: 'bg-warning-bg text-warning-fg', teal: 'bg-teal-bg text-teal-fg' }[tone]}">${ic(icon, 19, '', 1.75)}</span>`;
const heroArt = () => `<svg viewBox="0 0 560 250" preserveAspectRatio="xMaxYMid meet" class="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-[52%] max-w-[640px] xl:block" aria-hidden="true" focusable="false">
  <defs><linearGradient id="ha-wave" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#2D6FE0" stop-opacity="0"/><stop offset="0.35" stop-color="#2D6FE0" stop-opacity="0.55"/><stop offset="1" stop-color="#5062ED" stop-opacity="0.15"/></linearGradient>
  <linearGradient id="ha-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#8aa6f5" stop-opacity="0.55"/><stop offset="1" stop-color="#5062ED" stop-opacity="0"/></linearGradient>
  <linearGradient id="ha-shield" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#4f8df2"/><stop offset="1" stop-color="#3C3CC7"/></linearGradient>
  <radialGradient id="ha-glow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#c7d6fb" stop-opacity="0.9"/><stop offset="1" stop-color="#c7d6fb" stop-opacity="0"/></radialGradient>
  <filter id="ha-shadow" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#1e3a8a" flood-opacity="0.12"/></filter></defs>
  <circle cx="330" cy="110" r="150" fill="url(#ha-glow)"/><circle cx="250" cy="150" r="70" fill="#dfe7fd" opacity="0.7"/>
  <g fill="#9fb3ea" opacity="0.55">${Array.from({ length: 35 }, (_, n) => `<circle cx="${470 + (n % 7) * 11}" cy="${18 + Math.floor(n / 7) * 11}" r="1.3"/>`).join('')}</g>
  <path d="M0 230 C 90 225, 150 150, 250 190 S 420 250, 560 170" fill="none" stroke="url(#ha-wave)" stroke-width="1.5"/>
  <path d="M20 245 C 110 238, 170 175, 265 205 S 430 255, 560 195" fill="none" stroke="url(#ha-wave)" stroke-width="1.2" opacity="0.7"/>
  <path d="M60 250 C 140 190, 200 170, 280 200 S 450 230, 560 220 L 560 250 Z" fill="url(#ha-fill)" opacity="0.8"/>
  <g filter="url(#ha-shadow)"><rect x="222" y="22" width="150" height="104" rx="10" fill="#ffffff" stroke="#dbe3f3"/><rect x="236" y="36" width="70" height="7" rx="3.5" fill="#d7e2fb"/><rect x="236" y="50" width="110" height="5" rx="2.5" fill="#eaf0fc"/>
    <rect x="332" y="112" width="104" height="92" rx="10" fill="#ffffff" stroke="#dbe3f3"/><rect x="346" y="128" width="60" height="6" rx="3" fill="#d7e2fb"/><rect x="346" y="142" width="76" height="5" rx="2.5" fill="#eaf0fc"/><rect x="346" y="154" width="70" height="5" rx="2.5" fill="#eaf0fc"/>
    <rect x="206" y="64" width="190" height="128" rx="12" fill="#ffffff" stroke="#d3ddf2"/><text x="224" y="94" font-family="-apple-system, Segoe UI, sans-serif" font-size="15" font-weight="500" fill="#1f5dc8">1095-C</text>
    <rect x="326" y="84" width="16" height="4" rx="2" fill="#d7e2fb"/><rect x="346" y="84" width="30" height="4" rx="2" fill="#eaf0fc"/><rect x="224" y="108" width="154" height="68" rx="4" fill="#f6f8fd" stroke="#e1e8f6"/>
    <line x1="224" y1="130" x2="378" y2="130" stroke="#e1e8f6"/><line x1="224" y1="152" x2="378" y2="152" stroke="#e1e8f6"/><line x1="286" y1="108" x2="286" y2="176" stroke="#e1e8f6"/>
    <rect x="232" y="116" width="40" height="5" rx="2.5" fill="#d7e2fb"/><rect x="294" y="116" width="60" height="5" rx="2.5" fill="#e6ecf9"/><rect x="232" y="138" width="34" height="5" rx="2.5" fill="#e6ecf9"/><rect x="294" y="138" width="70" height="5" rx="2.5" fill="#e6ecf9"/><rect x="232" y="160" width="44" height="5" rx="2.5" fill="#e6ecf9"/><rect x="294" y="160" width="50" height="5" rx="2.5" fill="#e6ecf9"/></g>
  <g filter="url(#ha-shadow)"><path d="M372 34 L402 45 V70 C402 90 389 103 372 110 C355 103 342 90 342 70 V45 Z" fill="url(#ha-shield)"/><path d="M358 71 L368 81 L387 60" fill="none" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/></g>
  <g filter="url(#ha-shadow)"><rect x="430" y="62" width="118" height="100" rx="12" fill="#ffffff" stroke="#dbe3f3"/>${['1095-C', '1094-C', 'Compliance'].map((l, i) => `<g transform="translate(446 ${86 + i * 26})"><rect x="0" y="-9" width="14" height="14" rx="4" fill="#2D6FE0"/><path d="M3.5 -2 L6 0.8 L10.5 -4.5" fill="none" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><text x="22" y="2.5" font-family="-apple-system, Segoe UI, sans-serif" font-size="11.5" fill="#334155">${l}</text></g>`).join('')}</g>
  <g fill="#8ab4ff"><circle cx="420" cy="30" r="2"/><circle cx="196" cy="54" r="1.6" opacity="0.8"/><circle cx="452" cy="182" r="1.8" opacity="0.7"/></g></svg>`;
function dashboard() {
  const rows = activeRows(), filings = rows.filter(r => r.step > 0), filed = filings.filter(r => r.step >= 7).length;
  const progress = Math.round(filings.reduce((a, r) => a + r.step / 8, 0) / filings.length * 100);
  const complete = rows.filter(r => !r.c.missing.length).length, attn = rows.filter(r => r.reasons.length).length;
  const pct = (n, of) => (of ? Math.round(n / of * 100) : 0);
  const r = 42, circ = 2 * Math.PI * r;
  const hero = `<section class="relative overflow-hidden ${CARD} bg-[linear-gradient(105deg,#ffffff_0%,#f7f9ff_42%,#edf2ff_100%)]" aria-labelledby="dash-hero-title">
    <div class="relative z-10 max-w-[46rem] px-6 py-7 sm:px-8"><div class="text-label uppercase tracking-[0.12em] text-brand-dark">ACA Filing</div>
      <h1 id="dash-hero-title" class="mt-2 text-[1.85rem] font-bold leading-[1.15] tracking-[-0.015em] text-ink sm:text-[2.25rem]">Stay ahead of ACA compliance.</h1>
      <p class="mt-3 max-w-[35rem] text-body text-ink-muted">Manage your client filings, employee data and important deadlines all in one place. Keep your business compliant, simple and stress-free.</p>
      <div class="mt-6 flex flex-wrap gap-3">
        <a href="#/clients/${MAIN}/${YEAR}/codes" class="group inline-flex min-h-11 items-center gap-2 rounded-control bg-brand px-5 text-body-sm font-semibold text-white shadow-[0_1px_2px_rgba(15,23,42,0.1),0_4px_12px_-4px_rgba(45,111,224,0.45)] transition duration-120 hover:bg-brand-dark active:scale-[0.98]">${ic('FileText', 16)}Review filings${ic('ArrowRight', 15, 'transition-transform duration-120 group-hover:translate-x-0.5')}</a>
        <button type="button" ${real('open the new client setup wizard.')} class="inline-flex min-h-11 items-center gap-2 rounded-control border border-line-strong bg-surface px-5 text-body-sm font-semibold text-ink transition duration-120 hover:border-brand hover:text-brand-dark active:scale-[0.98]">${ic('Plus', 16)}Add client</button>
        ${helpLink('How this app works')}</div></div>${heroArt()}</section>`;
  const season = `<section class="${CARD} flex h-full flex-col p-5" aria-labelledby="season-title"><div class="flex items-start gap-3">${iconTile('CalendarDays', 'blue')}
      <div class="min-w-0 flex-1"><h2 id="season-title" class="text-title text-ink">${YEAR} Filing Season</h2><p class="text-caption text-ink-subtle">In progress · Due ${DEADLINE}</p></div>${cardLink('#/clients', 'View details')}</div>
    <div class="mt-5 flex flex-1 flex-col gap-5 sm:flex-row sm:items-center sm:gap-4">
      <div role="img" aria-label="${progress}% of the way through the ${YEAR} filing steps" class="flex justify-center sm:block"><div class="relative h-[100px] w-[100px] shrink-0">
        <svg viewBox="0 0 108 108" class="h-full w-full -rotate-90" aria-hidden="true"><circle cx="54" cy="54" r="${r}" fill="none" stroke="#e8eefb" stroke-width="10"/><circle cx="54" cy="54" r="${r}" fill="none" stroke="#2D6FE0" stroke-width="10" stroke-linecap="round" stroke-dasharray="${(progress / 100) * circ} ${circ}"/></svg>
        <div class="absolute inset-0 flex flex-col items-center justify-center"><span class="text-[1.5rem] font-bold leading-none tracking-[-0.02em] text-ink tabular-nums">${progress}%</span><span class="mt-1 text-[0.75rem] xl:text-[0.6875rem] text-ink-subtle">Complete</span></div></div></div>
      <dl class="grid min-w-0 max-w-2xl flex-1 grid-cols-2 gap-y-4 sm:grid-cols-[1fr_1fr_1.35fr] sm:gap-y-0 sm:divide-x sm:divide-line">
        <div class="pr-3 sm:px-4"><dd class="text-[1.35rem] font-bold leading-tight text-ink tabular-nums">${filed}</dd><dt class="mt-1 text-caption leading-snug text-ink-subtle sm:whitespace-nowrap">Filed<br>of ${filings.length} filings</dt></div>
        <div class="border-l border-line pl-4 sm:border-l-0 sm:px-4"><dd class="text-[1.35rem] font-bold leading-tight text-ink tabular-nums">${filings.length - filed}</dd><dt class="mt-1 text-caption leading-snug text-ink-subtle sm:whitespace-nowrap">Remaining<br>${rows.length > filings.length ? `${rows.length - filings.length} not started` : 'to file'}</dt></div>
        <div class="col-span-2 border-t border-line pt-4 sm:col-span-1 sm:border-t-0 sm:pl-4 sm:pt-0"><dt class="flex items-center gap-1.5 text-caption text-ink-subtle">${ic('CalendarDays', 13)} Filing deadline</dt><dd class="mt-1 whitespace-nowrap text-body-sm font-semibold text-ink">${DEADLINE}</dd><dd class="whitespace-nowrap text-caption leading-snug text-ink-subtle">TY ${YEAR}</dd></div></dl></div></section>`;
  const kpi = (icon, tone, label, value, detail, to) => `<a href="${to}" class="${CARD} group flex h-full flex-col p-4 transition duration-180 hover:-translate-y-px hover:border-line-strong hover:shadow-lift">${iconTile(icon, tone)}
    <div class="mt-4 text-body-sm font-medium text-ink-muted">${label}</div><div class="mt-1 flex items-center justify-between gap-2"><span class="text-[1.75rem] font-bold leading-tight tracking-[-0.02em] text-ink tabular-nums">${value}</span>${ic('ChevronRight', 18, 'text-ink-faint transition-transform duration-120 group-hover:translate-x-0.5 group-hover:text-ink-subtle')}</div>
    <div class="mt-1 text-caption text-ink-subtle">${detail}</div></a>`;
  const kpis = `<div class="grid h-full grid-cols-2 gap-4 md:grid-cols-4">
    ${kpi('Users', 'blue', 'Active clients', rows.length, `<span class="inline-flex items-center gap-1 text-success-fg">${ic('ArrowUpRight', 13)}1 new in 30 days</span>`, '#/clients')}
    ${kpi('ClipboardCheck', 'green', 'Profiles complete', complete, `${pct(complete, rows.length)}% of active clients`, '#/clients')}
    ${kpi('AlertTriangle', 'amber', 'Needs attention', attn, `${pct(attn, rows.length)}% of active clients`, '#/clients')}
    ${kpi('FileCheck2', 'teal', 'Filed', filed, `${pct(filed, filings.length)}% of ${YEAR} filings`, '#/clients')}</div>`;
  return `<div class="flex flex-col gap-5">${hero}<div class="grid gap-5 2xl:grid-cols-12"><div class="min-w-0 2xl:col-span-5">${season}</div><div class="min-w-0 2xl:col-span-7">${kpis}</div></div>
    <div class="grid items-start gap-5 2xl:grid-cols-[minmax(0,1fr)_27rem]"><div class="min-w-0">${clientTable(rows)}</div>
      <div class="grid min-w-0 items-start gap-5 lg:grid-cols-2 2xl:grid-cols-1">${attentionPanel()}${activityPanel()}</div></div></div>`;
}
const DFILTERS = [['all', 'All statuses'], ['attention', 'Needs attention'], ['no_filing', 'Not started'], ['waiting', 'Waiting on data'], ['in_progress', 'In progress'], ['with_client', 'With client'], ['ready', 'Ready to file'], ['filed', 'Filed'], ['accepted', 'Accepted']];
function clientTable(rows) {
  const t = S.dQ.trim().toLowerCase();
  const shown = rows.filter(r => (S.dFilter === 'all' || r.status === S.dFilter) && (!t || r.c.name.toLowerCase().includes(t)));
  const menu = S.dFilterOpen ? `<div role="menu" class="absolute right-0 top-11 z-20 w-52 rounded-card border border-line bg-surface p-1.5 shadow-e8">${DFILTERS.map(([k, l]) =>
    `<button type="button" role="menuitemradio" aria-checked="${S.dFilter === k}" data-dfilter="${k}" class="flex w-full items-center rounded-lg px-3 py-2 text-left text-body-sm transition-colors duration-120 ${S.dFilter === k ? 'bg-brand-softer font-semibold text-brand-dark' : 'text-ink hover:bg-subtle'}">${l}</button>`).join('')}</div>` : '';
  const body = !shown.length ? '<p class="border-t border-line px-6 py-10 text-center text-body-sm text-ink-subtle">No clients match.</p>'
    : `<div class="overflow-x-auto"><table class="w-full min-w-[640px] border-collapse text-left"><thead><tr class="border-y border-line bg-subtle text-caption font-medium text-ink-subtle">
      <th scope="col" class="py-2.5 pl-5 pr-3 font-medium">Client</th><th scope="col" class="px-3 py-2.5 font-medium">Employees / forms</th><th scope="col" class="px-3 py-2.5 font-medium">Status</th><th scope="col" class="px-3 py-2.5 font-medium">Last updated</th><th scope="col" class="w-10 py-2.5 pr-5"><span class="sr-only">Open</span></th></tr></thead>
      <tbody class="divide-y divide-line">${shown.map(r => `<tr data-href="#/clients/${r.c.key}" class="group cursor-pointer transition-colors duration-120 hover:bg-[#f7f9fd]">
        <td class="py-3 pl-5 pr-3"><a href="#/clients/${r.c.key}" class="text-body-sm font-semibold text-ink group-hover:text-brand-dark">${esc(r.c.name)}</a><div class="mt-0.5 text-caption text-ink-subtle">${esc(r.c.sector)} · ${r.step ? r.label : `No ${YEAR} filing`}</div></td>
        ${r.c.forms && r.step >= 4 ? `<td class="px-3 py-3 text-body-sm tabular-nums text-ink">${r.c.employees} / ${r.c.forms}${r.c.blocking ? `<div class="text-caption text-critical-fg">${r.c.blocking} blocking</div>` : ''}</td>` : '<td class="px-3 py-3 text-caption text-ink-subtle">Awaiting template</td>'}
        <td class="px-3 py-3">${statusPill(r.status)}${r.reasons.length ? `<div class="mt-1 text-caption text-warning-fg">${r.reasons[0]}</div>` : ''}</td>
        <td class="whitespace-nowrap px-3 py-3 text-body-sm text-ink-muted">${r.c.updated}</td>
        <td class="py-3 pr-5 text-right">${ic('ChevronRight', 17, 'inline text-ink-faint transition-transform duration-120 group-hover:translate-x-0.5 group-hover:text-ink-subtle')}</td></tr>`).join('')}</tbody></table></div>`;
  return `<section class="${CARD} flex flex-col" aria-labelledby="client-status-title"><div class="flex flex-wrap items-center gap-3 px-5 pb-4 pt-5">${ic('Users', 19, 'text-ink-muted', 1.75)}
    <h2 id="client-status-title" class="text-section text-ink">Client filing status</h2><div class="ml-auto flex items-center gap-2">
      <label class="relative block"><span class="sr-only">Search clients</span>${ic('Search', 15, 'pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint')}<input id="dq" data-input="dQ" value="${esc(S.dQ)}" placeholder="Search clients..." class="h-9 w-44 rounded-control border border-line bg-surface pl-9 pr-3 text-body-sm text-ink transition duration-120 placeholder:text-ink-faint hover:border-line-strong focus:w-56 focus:border-brand focus:outline-none sm:w-52"></label>
      <div class="relative" data-dfilterbox><button type="button" data-act="dfilter" aria-label="Filter by status" aria-expanded="${S.dFilterOpen}" class="flex h-9 w-9 items-center justify-center rounded-control border transition-colors duration-120 ${S.dFilter !== 'all' ? 'border-brand bg-brand-softer text-brand-dark' : 'border-line text-ink-muted hover:border-line-strong hover:text-ink'}">${ic('ListFilter', 16)}</button>${menu}</div></div></div>
    ${body}<div class="mt-auto flex items-center justify-between gap-3 border-t border-line px-5 py-3.5"><span class="text-caption text-ink-subtle">Employee and form counts appear once a client's ${YEAR} template is uploaded.</span>${cardLink('#/clients', 'View all clients')}</div></section>`;
}
const SEV = { high: ['AlertCircle', 'text-critical-fg', 'bg-critical-bg text-critical-fg', 'High'], medium: ['AlertTriangle', 'text-warning-fg', 'bg-warning-bg text-warning-fg', 'Medium'], info: ['Info', 'text-info-fg', 'bg-info-bg text-info-fg', 'Info'], success: ['CheckCircle2', 'text-success-fg', 'bg-success-bg text-success-fg', 'Done'] };
function attentionPanel() {
  const items = attention(), shown = S.attnAll ? items : items.slice(0, 4);
  return `<section class="${CARD}" aria-labelledby="attention-title"><div class="flex items-center gap-2.5 px-5 pb-3 pt-5">${ic('AlertTriangle', 18, 'text-ink-muted', 1.75)}<h2 id="attention-title" class="text-section text-ink">Needs attention</h2>
    ${items.length > 4 ? `<button type="button" data-act="attn" class="group ml-auto inline-flex items-center gap-1 text-body-sm font-semibold text-brand-dark hover:text-brand">${S.attnAll ? 'Show fewer' : `View all ${items.length}`}${ic('ArrowRight', 14, `transition-transform duration-120 ${S.attnAll ? '-rotate-90' : 'group-hover:translate-x-0.5'}`)}</button>` : ''}</div>
    <ul class="divide-y divide-line border-t border-line">${shown.map(a => { const [icon, icls, pill, lab] = SEV[a.sev];
      return `<li><a href="${a.to}" class="group flex gap-3 px-5 py-3.5 transition-colors duration-120 hover:bg-[#f7f9fd]">${ic(icon, 20, `mt-0.5 shrink-0 ${icls}`, 1.75)}<div class="min-w-0 flex-1"><div class="text-body-sm font-semibold text-ink">${esc(a.title)}</div><p class="mt-0.5 text-caption leading-snug text-ink-subtle">${esc(a.body)}</p></div>
        <div class="flex shrink-0 flex-col items-end gap-1.5"><span class="rounded-full px-2 py-0.5 text-[0.75rem] xl:text-[0.6875rem] font-semibold ${pill}">${lab}</span><span class="text-caption text-ink-subtle">${a.at}</span></div>${ic('ChevronRight', 16, 'mt-2 shrink-0 text-ink-faint transition-transform duration-120 group-hover:translate-x-0.5')}</a></li>`; }).join('')}</ul></section>`;
}
function events(key) {
  const extra = [];
  if (S.approval) extra.push({ at: '9:40 AM', when: NOW, client: MAIN, text: 'Client approved the forms', actor: CLIENT_USER.email });
  if (S.built) extra.push({ at: '9:40 AM', when: NOW, client: MAIN, text: 'IRS files built', actor: STAFF.email });
  return [...extra.reverse(), ...ACTIVITY].filter(e => !key || e.client === key);
}
function activityPanel() {
  const ev = events().slice(0, 6);
  return `<section class="${CARD}" aria-labelledby="activity-title"><div class="flex items-center gap-2.5 px-5 pb-3 pt-5">${ic('History', 18, 'text-ink-muted', 1.75)}<h2 id="activity-title" class="text-section text-ink">Recent activity</h2><span class="ml-auto"><button type="button" ${real('open the full activity log.')} class="group inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-sm text-body-sm font-semibold text-brand-dark transition-colors duration-120 hover:text-brand">View all${ic('ArrowRight', 14, 'transition-transform duration-120 group-hover:translate-x-0.5')}</button></span></div>
    <ol class="border-t border-line px-5 py-4">${ev.map((e, i) => `<li class="relative grid grid-cols-[4.25rem_1rem_minmax(0,1fr)] gap-x-2 pb-4 last:pb-0">${i < ev.length - 1 ? '<span aria-hidden="true" class="absolute bottom-0 left-[5.25rem] top-3 w-px -translate-x-1/2 bg-line-strong"></span>' : ''}
      <span class="pt-px text-caption text-ink-subtle tabular-nums">${e.at}</span><span class="relative flex justify-center" aria-hidden="true"><span class="relative z-10 mt-1 h-2 w-2 rounded-full bg-brand ring-4 ring-brand-softer"></span></span>
      <div class="min-w-0"><div class="break-words text-body-sm text-ink">${esc(e.text)}</div><div class="truncate text-caption text-ink-subtle">${esc(client(e.client).name)} · ${esc(e.actor)}</div></div></li>`).join('')}</ol></section>`;
}

/* ---------- Clients (pages/ClientsPage.tsx) ---------- */
const GTONE = { attention: 'warning', with_client: 'violet', ready: 'success', in_progress: 'info', waiting: 'neutral', no_filing: 'neutral', filed: 'teal', accepted: 'success', retired: 'neutral' };
const GROUPS = [['attention', 'Needs attention'], ['with_client', 'With the client'], ['ready', 'Ready to file'], ['in_progress', 'In progress'], ['waiting', 'Waiting on data'], ['no_filing', 'No filing this season'], ['filed', 'Filed'], ['accepted', 'Accepted by the IRS'], ['retired', 'Retired']];
const COLS = [['Status', '', '11.5rem'], ['Client', '', ''], ['Profile', 'hidden xl:table-cell', '8.5rem'], ['Portal', 'hidden xl:table-cell', '8rem'], [`${YEAR} filing`, 'hidden sm:table-cell', '12rem'], ['Updated', 'hidden lg:table-cell text-right', '12.5rem']];
const cell = i => `px-4 py-3 align-middle ${COLS[i][1]}`;
function clients() {
  const lines = CLIENTS.map(c => { const r = rowOf(c); return { ...r, group: r.retired ? 'retired' : r.status }; });
  const active = lines.filter(l => !l.retired);
  const count = { all: lines.length, attention: active.filter(l => l.reasons.length).length, underway: active.filter(l => l.step > 0 && l.step < 7).length, filed: active.filter(l => l.step >= 7).length, retired: lines.length - active.length };
  const t = S.cQ.trim().toLowerCase(), f = S.cFilter;
  const shown = lines.filter(l => f === 'all' ? true : f === 'retired' ? l.retired : f === 'attention' ? !l.retired && l.reasons.length : f === 'underway' ? l.step > 0 && l.step < 7 : l.step >= 7)
    .filter(l => !t || l.c.name.toLowerCase().includes(t) || l.c.sector.toLowerCase().includes(t))
    .sort((a, b) => S.cSort === 'name' ? a.c.name.localeCompare(b.c.name) : S.cSort === 'missing' ? b.c.missing.length - a.c.missing.length : CLIENTS.indexOf(a.c) - CLIENTS.indexOf(b.c));
  const tiles = [['all', 'Building2', count.all, 'Clients on record', 'Show every client.', 'brand'], ['attention', 'AlertTriangle', count.attention, 'Needs attention', 'Missing answers or no portal contact.', 'warning'],
    ['underway', 'FileStack', count.underway, 'Filing underway', `A ${YEAR} filing on its way.`, 'info'], ['filed', 'CheckCircle2', count.filed, 'Filed this season', 'Sent to the IRS.', 'success'], ['retired', 'Archive', count.retired, 'Retired', 'History kept, portal shut.', 'neutral']];
  const CONTROL = 'h-9 rounded-control border border-line-strong bg-surface text-body-sm text-ink shadow-e1 transition-colors duration-120 hover:border-ink-faint focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20';
  const head = `<div class="mb-6"><div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div class="min-w-0 max-w-3xl"><h1 class="text-page text-ink">Clients</h1>
    <p class="mt-2 text-body text-ink">Every company you file ACA forms for, and where each one stands this season.</p>
    <p class="mt-1.5 text-body-sm leading-relaxed text-ink-muted">Add a client with the setup wizard. Its profile, the people who can sign in to its portal, and its filings live on its own page.</p></div>
    <div class="flex shrink-0 flex-wrap items-center gap-2 lg:pt-1">${helpLink()}<button type="button" ${real('open the new client setup wizard.')} class="inline-flex min-h-10 items-center justify-center gap-2 whitespace-nowrap rounded-control bg-brand px-4 text-body-sm font-semibold text-white shadow-e1 transition-colors duration-120 hover:bg-brand-dark">${ic('Plus', 16)} Add client</button></div></div></div>`;
  const summary = `<p class="mb-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-body-sm text-ink-muted">${[[count.all, 'clients', ''], [active.length, 'active', 'success'], [count.attention, 'need attention', 'warning'], [count.retired, 'retired', 'neutral']].map(([v, l, tone]) =>
    `<span class="inline-flex items-center gap-1.5">${tone ? `<span aria-hidden="true" class="h-2 w-2 rounded-full ${DOT[tone]}"></span>` : ''}<span class="font-semibold tabular-nums text-ink">${v}</span> ${l}</span>`).join('')}</p>`;
  const tilesHtml = `<div class="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">${tiles.map(([k, icon, v, l, h, tone]) => { const on = S.cFilter === k;
    return `<button type="button" aria-pressed="${on}" data-cfilter="${k}" class="flex items-start gap-3 rounded-card border bg-surface p-4 shadow-e1 transition-colors duration-120 ${on ? 'border-brand ring-1 ring-brand' : 'border-line hover:border-line-strong hover:bg-subtle'}">
      <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${TILE_ICON[tone]}">${ic(icon, 18, '', 1.9)}</span><span class="min-w-0 text-left"><span class="block text-[1.5rem] font-bold leading-none tabular-nums text-ink">${v}</span>
      <span class="mt-1.5 flex items-center gap-1 text-body-sm font-semibold text-ink">${l}${on ? ic('Check', 14, 'text-brand-dark', 3) : ''}</span><span class="mt-0.5 block text-caption leading-snug text-ink-subtle">${h}</span></span></button>`; }).join('')}</div>`;
  const seg = `<div role="radiogroup" aria-label="View" class="inline-flex rounded-control border border-line bg-subtle p-0.5">${[['list', 'List', 'List'], ['tiles', 'Tiles', 'LayoutGrid']].map(([k, l, icon]) =>
    `<button type="button" role="radio" aria-checked="${S.cView === k}" data-cview="${k}" class="inline-flex h-8 items-center gap-1.5 rounded-[7px] px-3 text-body-sm font-medium transition-colors duration-120 ${S.cView === k ? 'bg-surface text-ink shadow-e1' : 'text-ink-muted hover:text-ink'}">${ic(icon, 14)}${l}</button>`).join('')}</div>`;
  const sort = `<label class="inline-flex items-center gap-2 text-body-sm text-ink-muted"><span class="font-medium">Sort</span><span class="relative"><select id="csort" data-input="cSort" aria-label="Sort" class="${CONTROL} appearance-none pl-3 pr-8">${[['updated', 'Recently updated'], ['name', 'Name, A to Z'], ['missing', 'Most answers missing']].map(([v, l]) => `<option value="${v}" ${S.cSort === v ? 'selected' : ''}>${l}</option>`).join('')}</select>${ic('ChevronDown', 14, 'pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-subtle')}</span></label>`;
  const toolbar = `<div class="mb-4 flex flex-col gap-3 md:flex-row md:items-center"><div class="flex min-w-0 flex-1 flex-wrap items-center gap-2"><label class="relative block w-full sm:w-72"><span class="sr-only">Search clients or sectors</span>${ic('Search', 15, 'pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint')}<input id="cq" type="search" data-input="cQ" value="${esc(S.cQ)}" placeholder="Search clients or sectors" class="${CONTROL} w-full pl-9 pr-3 placeholder:text-ink-faint"></label></div>
    <div class="flex shrink-0 flex-wrap items-center gap-2">${seg}${sort}</div></div>`;
  const groups = !shown.length ? `<div class="rounded-card border border-dashed border-line-strong bg-surface px-6 py-10 text-center text-body-sm text-ink-subtle">No client matches${t ? ` "${esc(S.cQ.trim())}"` : ' this filter'}.</div>`
    : GROUPS.map(([g, title]) => { const inG = shown.filter(l => l.group === g); if (!inG.length) return '';
      const lab = l => l.retired ? 'Retired' : STATUS[l.group].label;
      const list = S.cView === 'tiles' ? `<div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">${inG.map(l => `<a href="#/clients/${l.c.key}" class="flex flex-col gap-3 rounded-card border border-line bg-surface p-4 shadow-e1 transition-colors duration-120 hover:border-brand">
          <div class="flex items-start justify-between gap-3"><div class="min-w-0"><div class="truncate text-body font-semibold text-ink">${esc(l.c.name)}</div><div class="text-caption text-ink-subtle">${esc(l.c.sector)}</div></div>${statusDot(GTONE[l.group], lab(l))}</div>
          <div class="flex flex-wrap gap-1.5">${miniChip(!l.c.missing.length, l.c.missing.length ? `${l.c.missing.length} answers missing` : 'Profile')}${miniChip(l.c.contacts.length > 0, l.c.contacts.length ? plural(l.c.contacts.length, 'portal contact') : 'No portal contact')}${miniChip(l.step > 0, l.step ? `${YEAR} filing` : `No ${YEAR} filing`)}</div>
          ${l.step ? miniSteps(l.step, l.label) : ''}</a>`).join('')}</div>`
        : `<div class="overflow-hidden rounded-card border border-line bg-surface shadow-e1"><div class="overflow-x-auto"><table class="w-full table-fixed border-collapse text-body-sm" aria-label="${title}"><thead><tr class="border-b border-line bg-subtle">${COLS.map(([l, h, w]) =>
          `<th scope="col" ${w ? `style="width:${w}"` : ''} class="px-4 py-2.5 text-left text-[0.75rem] xl:text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-ink-subtle ${h}">${l}</th>`).join('')}</tr></thead>
          <tbody class="divide-y divide-line">${inG.map(l => `<tr data-href="#/clients/${l.c.key}" class="cursor-pointer transition-colors duration-120 hover:bg-subtle">
            <td class="${cell(0)}">${statusDot(GTONE[l.group], lab(l))}</td>
            <td class="${cell(1)}"><a href="#/clients/${l.c.key}" class="font-semibold text-ink hover:text-brand-dark">${esc(l.c.name)}</a><div class="text-caption text-ink-subtle">${esc(l.c.sector)}</div></td>
            <td class="${cell(2)}">${l.retired ? none() : l.c.missing.length ? `<span class="font-medium text-warning-fg">${l.c.missing.length} missing</span>` : miniChip(true, 'Complete')}</td>
            <td class="${cell(3)}">${l.c.contacts.length ? `<span class="text-ink">${plural(l.c.contacts.length, 'contact')}</span>` : none()}</td>
            <td class="${cell(4)}">${l.step ? miniSteps(l.step, l.label) : none()}</td>
            <td class="${cell(5)} text-caption text-ink-subtle">${l.c.updated}</td></tr>`).join('')}</tbody></table></div></div>`;
      return `<section aria-label="${title}" class="mb-6"><div class="mb-2 flex items-center gap-2"><span aria-hidden="true" class="h-2 w-2 rounded-full ${DOT[GTONE[g]]}"></span><h2 class="text-body font-semibold text-ink">${title}</h2><span class="rounded-full bg-muted px-2 py-0.5 text-caption font-semibold tabular-nums text-ink-muted">${inG.length}</span></div>${list}</section>`; }).join('');
  return head + summary + tilesHtml + toolbar + groups;
}

/* ---------- One client (pages/ClientDetailPage.tsx, FilingsTab.tsx) ---------- */
const HERO_PRIMARY = 'inline-flex min-h-10 items-center gap-1.5 rounded-control bg-white px-4 text-body-sm font-semibold text-[#0b1f3a] shadow-e1 transition-colors duration-120 hover:bg-brand-soft';
const HERO_QUIET = 'inline-flex min-h-9 items-center gap-1.5 rounded-control border border-white/30 px-3 text-body-sm font-medium text-white transition-colors duration-120 hover:bg-white/10 disabled:opacity-60';
const heroPill = (tone, text) => `<span class="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[0.75rem] xl:text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-white ring-1 ring-white/25"><span aria-hidden="true" class="h-1.5 w-1.5 rounded-full ${DOT[tone]}"></span>${text}</span>`;
const heroLines = () => `<svg aria-hidden="true" viewBox="0 0 420 200" class="pointer-events-none absolute -right-6 bottom-0 hidden h-full w-[26rem] opacity-[0.16] md:block" fill="none" stroke="white" stroke-width="1.4">
  <rect x="170" y="36" width="150" height="190" rx="10" transform="rotate(-6 245 131)"/><rect x="230" y="20" width="150" height="190" rx="10" transform="rotate(4 305 115)"/>
  <path d="M252 58h96M252 76h70M252 104h110M252 118h110M252 132h110M252 146h110M288 104v56M324 104v56" transform="rotate(4 305 115)"/><circle cx="356" cy="50" r="11" transform="rotate(4 305 115)"/><path d="M351 50l4 4 7-8" transform="rotate(4 305 115)"/>
  <path d="M0 190C80 160 140 150 210 170S330 200 420 160"/><path d="M0 200C90 178 150 172 220 186S340 206 420 184"/></svg>`;
const openFiling = (key, label, cls) => key === MAIN ? `<a href="#/clients/${key}/${YEAR}/data" class="${cls}">${label}</a>` : `<button type="button" ${real(`open this client's ${YEAR} filing workspace. In this demo, ${client(MAIN).name} has one.`)} class="${cls}">${label}</button>`;
function clientPage(key, tab) {
  const c = client(key); if (!c) return notFound();
  const r = rowOf(c), retired = S.retired[key], step = r.step, contacts = c.contacts.length;
  const next = retired ? null : c.missing.length ? { label: 'Fill in the profile', why: `${plural(c.missing.length, 'answer')} the forms still need.`, real: "open the client's profile questionnaire." }
    : !contacts ? { label: 'Add a portal contact', why: 'Nobody at the company can sign in to review or approve their forms yet.', to: '#portal-contacts' }
      : !step ? { label: `Start the ${YEAR} filing`, why: `There is no filing for the ${YEAR} season yet.`, to: `#/clients/${key}/filings` }
        : { label: `Open the ${YEAR} filing`, why: `Step ${step} of 8: ${r.label}.`, filing: true };
  const nextBtn = (n, cls, inner) => n.filing ? openFiling(key, inner, cls) : n.real ? `<button type="button" ${real(n.real)} class="${cls}">${inner}</button>` : n.to === '#portal-contacts' ? `<button type="button" data-act="to-contacts" class="${cls}">${inner}</button>` : `<a href="${n.to}" class="${cls}">${inner}</a>`;
  const hero = `<section class="relative mb-5 overflow-hidden rounded-card bg-[linear-gradient(120deg,#0b1f3a_0%,#12305c_55%,#1f4f9a_100%)] px-6 py-6 text-white shadow-e2 sm:px-8">${heroLines()}
    <div class="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between"><div class="min-w-0">
      <nav aria-label="Where this is" class="mb-2 flex flex-wrap items-center gap-1 text-caption text-white/70"><span class="inline-flex items-center gap-1"><a href="#/clients" class="underline-offset-2 hover:text-white hover:underline">Clients</a></span><span class="inline-flex items-center gap-1"><span aria-hidden="true">/</span><span>${esc(c.name)}</span></span></nav>
      <h1 class="flex flex-wrap items-center gap-3 text-[1.875rem] font-bold leading-tight tracking-[-0.02em]">${esc(c.name)}${retired ? heroPill('neutral', 'Retired') : heroPill('success', 'Active')}</h1>
      <p class="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-body-sm text-white/80"><span>${plural(contacts, 'portal contact')}</span><span>${c.missing.length ? `${plural(c.missing.length, 'profile answer')} missing` : 'Profile complete'}</span><span>${step ? `${YEAR} filing: ${r.label}` : `No ${YEAR} filing yet`}</span></p>
      ${next && tab === 'overview' ? `<div class="mt-4">${nextBtn(next, HERO_PRIMARY, `${next.label} ${ic('ArrowRight', 15)}`)}</div>` : ''}</div>
      <div class="flex shrink-0 flex-wrap items-center gap-2">${helpLink()}<button type="button" data-act="retire" class="${HERO_QUIET}">${retired ? 'Reactivate' : 'Retire client'}</button></div></div></section>`;
  const tabs = tabBar('Client sections', [{ key: 'overview', label: 'Overview', icon: 'LayoutGrid' }, { key: 'profile', label: 'Profile', icon: 'ClipboardList', real: "open the client's ACA profile: the plan, the rate table and the answers the forms need." }, { key: 'filings', label: 'Filings', icon: 'FileStack' }], tab, 'data-ctab');
  if (tab === 'filings') return hero + tabs + filingsTab(key);
  const stage = (n, done, title, sub) => `<li class="flex items-start gap-3"><span class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-caption font-semibold ${done ? 'bg-success-solid text-white' : 'border border-line-strong bg-surface text-ink-muted'}">${done ? ic('Check', 13, '', 3) : n}</span><span><span class="block text-body-sm font-semibold text-ink">${title}</span><span class="block text-caption text-ink-subtle">${sub}</span></span></li>`;
  const todo = sectionCard('Where this stands', 'What to do next', { desc: 'The next thing this client needs, and how far setting it up has come.', body:
    (next ? `<div class="rounded-control border border-line bg-subtle p-4"><div class="text-[0.75rem] xl:text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-ink-subtle">Recommended next step</div><div class="mt-1 text-body font-semibold text-ink">${next.label}</div><p class="text-body-sm text-ink-muted">${next.why}</p>
      ${nextBtn(next, 'mt-3 flex min-h-10 w-full items-center justify-center gap-1.5 rounded-control bg-brand text-body-sm font-semibold text-white shadow-e1 transition-colors duration-120 hover:bg-brand-dark', `Continue ${ic('ArrowRight', 15)}`)}</div>`
      : '<p class="text-body-sm text-ink-muted">Nothing: the client is retired.</p>')
    + `<ol class="mt-5 flex flex-col gap-3">${stage(1, !c.missing.length, 'Profile', c.missing.length ? `${c.missing.length} answers still needed` : 'Everything the forms need is answered')}${stage(2, contacts > 0, 'Portal access', contacts ? `${plural(contacts, 'contact')} can sign in` : 'Nobody can sign in yet')}${stage(3, step >= 7, `${YEAR} filing`, step ? `Step ${step} of 8: ${r.label}` : 'Not started')}</ol>` });
  const people = sectionCard('Portal access', 'Portal contacts', { flush: true, desc: "The people who can sign in to this company's client portal. Each email can belong to one company only.", body:
    (!contacts ? '<p class="border-t border-line px-5 py-5 text-body-sm text-ink-subtle">Nobody can sign in to this portal yet.</p>'
      : `<ul class="divide-y divide-line border-t border-line">${c.contacts.map(p => `<li class="flex flex-wrap items-center gap-4 px-5 py-3.5"><span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand-dark">${ic('Mail', 16)}</span>
        <div class="min-w-0 flex-1"><div class="truncate text-body-sm font-semibold text-ink">${esc(p.name)}</div><div class="break-words text-caption text-ink-subtle sm:truncate">${esc(p.email)} · Added ${p.added} by ${STAFF.email}</div></div>
        ${btn(`${ic('Trash2', 14)} Remove`, { kind: 'ghost', size: 'sm', attrs: real('remove this person, so they can no longer sign in to the portal.') })}</li>`).join('')}</ul>`)
    + (retired ? '' : `<form class="flex flex-col gap-4 rounded-b-card border-t border-line bg-subtle px-5 py-4 lg:flex-row lg:items-end" data-form="contact"><label class="min-w-0 flex-1"><span class="${FIELD_LABEL}">Name</span><input id="cn" class="${FIELD_INPUT} mt-1" placeholder="Who this is" maxlength="120"></label>
        <label class="min-w-0 flex-1"><span class="${FIELD_LABEL}">Email</span><input id="ce" class="${FIELD_INPUT} mt-1" type="email" placeholder="name@company.com"></label>
        ${btn(`${ic('UserPlus', 16)} Add contact`, { attrs: real('add this person as a portal contact, so they can sign in and approve the forms.') })}</form>`) });
  const ev = events(key);
  const hist = sectionCard('History', 'Recent activity', { action: `<button type="button" ${real('open the full activity log.')} class="text-body-sm font-medium text-brand-dark hover:underline">All activity</button>`, body: !ev.length ? '<p class="text-body-sm text-ink-subtle">Nothing yet.</p>'
    : `<ol class="relative flex flex-col gap-4 border-l border-line pl-4">${ev.map(e => `<li class="relative"><span aria-hidden="true" class="absolute -left-[1.3rem] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-surface bg-brand"></span><div class="text-body-sm font-medium text-ink">${esc(e.text)}</div><div class="text-caption text-ink-subtle">${e.when} · ${esc(e.actor)}</div></li>`).join('')}</ol>` });
  return hero + tabs + (retired ? banner('note', 'Retired. Its history stays here, and nobody can sign in to its portal.') : '')
    + `<div class="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]"><div class="flex min-w-0 flex-col gap-5">${todo}<div id="portal-contacts" class="scroll-mt-24">${people}</div></div>${hist}</div>`;
}
const WHO = { staff: 'Set by the team', system: 'Set by the app when it happens', client: "Set only by the client's approval" };
function filingsOf(key) {
  const out = [];
  if (stepOf(key)) out.push({ year: YEAR, step: stepOf(key) });
  if (key === MAIN || ['larkspur', 'pinecrest', 'quarrylane'].includes(key)) out.push({ year: YEAR - 1, step: 8 });
  return out;
}
function histFor(key, year, step) {
  const by = s => (s === 6 ? (key === MAIN ? CLIENT_USER.email : 'client') : STAFF.email);
  const dates = ['Jan 6', 'Jan 8', 'Jan 21', 'Jan 21', 'Feb 9', 'Feb 10', 'Feb 12', 'Mar 4'];
  const base = year === YEAR ? dates.map(d => `${d}, 2026`) : dates.map(d => `${d}, 2025`);
  return Array.from({ length: step }, (_, i) => ({ label: STEPS[i].label, at: base[i], by: by(i + 1), note: S.history[`${key}:${year}:${i}`] || '' }));
}
function filingsTab(key) {
  const fs = filingsOf(key), retired = S.retired[key];
  const row = f => { const here = STEPS[f.step - 1], nx = STEPS[f.step], pv = STEPS[f.step - 2], id = `${key}:${f.year}`, may = !retired && here.who === 'staff' && f.year === YEAR;
    return `<li class="px-6 py-5"><div class="flex flex-col gap-4 md:flex-row md:items-center"><div class="w-28 shrink-0"><div class="text-label uppercase text-ink-subtle">Tax year</div><div class="text-title text-ink">${f.year}</div></div>
      <div class="min-w-0 flex-1">${stepTrack(f.step, 8, here.label)}</div>
      <div class="flex flex-wrap items-center gap-2 md:w-[26rem] md:justify-end">
        ${f.year === YEAR ? openFiling(key, `Open workspace ${ic('ArrowRight', 13)}`, 'inline-flex items-center gap-1 rounded-control bg-brand px-3 py-1.5 text-caption font-semibold text-white shadow-e1 hover:bg-brand-dark') : `<button type="button" ${real(`open the ${f.year} filing as it was filed.`)} class="inline-flex items-center gap-1 rounded-control bg-brand px-3 py-1.5 text-caption font-semibold text-white shadow-e1 hover:bg-brand-dark">Open workspace ${ic('ArrowRight', 13)}</button>`}
        ${may && nx?.who === 'staff' ? btn(`Mark: ${nx.label}`, { size: 'sm', attrs: `data-mark="${key}"` }) : ''}
        ${may && nx && nx.who !== 'staff' ? `<span class="text-caption text-ink-subtle">Next: ${nx.label}. ${WHO[nx.who]}.</span>` : ''}
        ${may && pv && S.back !== id ? btn(`${ic('RotateCcw', 14)} Step back`, { kind: 'ghost', size: 'sm', attrs: `data-back="${id}"` }) : ''}
        ${btn(`${ic(S.histOpen.has(id) ? 'ChevronUp' : 'ChevronDown', 14)} History`, { kind: 'ghost', size: 'sm', attrs: `data-hist="${id}" aria-expanded="${S.histOpen.has(id)}"` })}</div></div>
      ${S.back === id && pv ? `<form data-form="back" data-key="${key}" class="mt-4 flex flex-col gap-3 rounded-control border border-line bg-subtle p-4 md:flex-row md:items-end"><label class="min-w-0 flex-1"><span class="${FIELD_LABEL}">Why is it going back to "${pv.label}"?</span><input id="backnote" data-input="backNote" value="${esc(S.backNote)}" class="${FIELD_INPUT} mt-1" maxlength="300"></label>
        <div class="flex gap-2">${btn('Step back', { kind: 'secondary', type: 'submit', disabled: !S.backNote.trim() })}${btn('Cancel', { kind: 'ghost', attrs: 'data-act="back-cancel"' })}</div></form>` : ''}
      ${S.histOpen.has(id) ? `<ol class="mt-4 flex flex-col gap-2 border-l border-line pl-4">${histFor(key, f.year, f.step).reverse().map(h => `<li class="text-body-sm"><span class="font-medium text-ink">${h.label}</span><span class="text-ink-subtle"> · ${h.at} · ${h.by}</span>${h.note ? `<div class="text-caption text-ink-muted">"${esc(h.note)}"</div>` : ''}</li>`).join('')}</ol>` : ''}</li>`; };
  const free = !fs.some(f => f.year === YEAR);
  return `<div class="flex flex-col gap-6">${card(`<div class="px-6 pt-5">${sectionHeader('Filings', { count: fs.length, desc: "One per tax year. The team marks the first steps; the app and the client's approval move the rest." })}</div>
    ${fs.length ? `<ul class="divide-y divide-line border-t border-line">${fs.map(row).join('')}</ul>` : `<div class="border-t border-line p-6"><div class="rounded-card border border-dashed border-line-strong bg-surface px-6 py-10 text-center"><div aria-hidden="true" class="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted text-ink-faint">${ic('CalendarPlus', 28, '', 1.75)}</div><div class="text-title text-ink">No filings yet</div><div class="mx-auto mt-1 max-w-md text-body-sm text-ink-subtle">Start one for the tax year you are filing.</div></div></div>`}
    ${!retired && free ? `<form data-form="newyear" data-key="${key}" class="flex flex-col gap-3 border-t border-line bg-subtle px-6 py-5 sm:flex-row sm:items-end"><label class="sm:w-48"><span class="${FIELD_LABEL}">Tax year</span><select id="newyear" data-input="newYear" class="${FIELD_INPUT} mt-1"><option value="">Choose a year</option><option value="${YEAR}" ${S.newYear === String(YEAR) ? 'selected' : ''}>${YEAR}</option></select></label>${btn(`${ic('CalendarPlus', 16)} Start filing`, { type: 'submit', disabled: !S.newYear })}</form>` : ''}`, 'overflow-hidden')}
    ${card(`${sectionHeader('The eight steps', { desc: 'Who can move each one.' })}<ol class="grid gap-2 md:grid-flow-col md:grid-cols-2 md:grid-rows-4">${STEPS.map((s, i) => `<li class="flex items-baseline gap-3 text-body-sm"><span class="w-5 shrink-0 text-right font-semibold text-ink-subtle">${i + 1}.</span><span class="text-ink">${s.label}</span><span class="text-caption text-ink-subtle">${WHO[s.who]}</span></li>`).join('')}</ol>`, 'p-6')}</div>`;
}

/* ---------- The filing workspace (filing/FilingWorkspace.tsx and its tabs) ---------- */
const FTABS = [{ key: 'data', label: 'Data', icon: 'FileSpreadsheet' }, { key: 'codes', label: 'Codes', icon: 'Grid3x3' }, { key: 'forms', label: 'Forms', icon: 'FileCheck2' }, { key: 'efile', label: 'IRS e-file', icon: 'Send' }];
const required = () => EMPLOYEES.filter(e => e.required);
function workspace(key, tab) {
  if (key !== MAIN) return notFound();
  const c = client(key), step = stepOf(key), label = STEPS[step - 1].label, frozen = step >= 7;
  return `<nav aria-label="Breadcrumb" class="mb-4 flex min-w-0 items-center gap-2"><ol class="flex min-w-0 items-center gap-1.5 text-body-sm">
      <li class="flex min-w-0 shrink items-center gap-1.5"><a href="#/clients" class="truncate rounded-sm font-medium text-ink-subtle transition-colors duration-120 hover:text-ink">Clients</a></li>
      <li class="flex min-w-0 items-center gap-1.5">${ic('ChevronRight', 14, 'shrink-0 text-ink-faint')}<span aria-current="page" class="truncate font-semibold text-ink">${esc(c.name)}, ${YEAR}</span></li></ol></nav>
    <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div class="min-w-0"><h1 class="text-page text-ink"><span class="flex flex-wrap items-center gap-3">${esc(c.name)} <span class="text-ink-subtle">${YEAR}</span>${frozen ? badge('success', label, true) : ''}</span></h1>
      <div class="mt-2 text-body text-ink-muted"><span class="block max-w-2xl">${stepTrack(step, 8, label)}</span></div></div>
      <div class="flex shrink-0 items-center gap-2 sm:pt-6">${helpLink()}<a href="#/clients/${key}/filings" class="text-body-sm font-medium text-brand-dark hover:underline">All this client's filings</a></div></div>
    ${tabBar('Filing sections', FTABS, tab, 'data-ftab')}
    ${{ data: dataTab, codes: codesTab, forms: formsTab, efile: efileTab }[tab]()}`;
}
const fileDrop = (label, disabled = false) => `<button type="button" ${real('let you drop or choose the filled ACA data template (.xlsx) to upload. It is checked and stored encrypted.')} aria-label="${esc(label)}" ${disabled ? 'aria-disabled="true"' : ''} class="flex min-h-[88px] flex-1 cursor-pointer items-center gap-3 rounded-control border-2 border-dashed px-4 py-3 text-left transition-colors duration-120 focus-within:ring-2 focus-within:ring-brand ${disabled ? 'cursor-not-allowed border-line bg-subtle opacity-70' : 'border-line-strong bg-surface hover:bg-subtle'}">
  ${ic('UploadCloud', 22, 'shrink-0 text-ink-faint')}<span class="min-w-0 flex-1"><span class="block text-body-sm font-semibold text-ink">Drag the template here, or <span class="text-brand-dark underline">choose a file</span></span><span class="block text-caption text-ink-subtle">.xlsx, up to 10 MB</span></span></button>`;
function dataTab() {
  const frozen = stepOf(MAIN) >= 7;
  return `<div class="flex flex-col gap-6">
    ${frozen ? '' : card(`${sectionHeader("Upload the client's template", { desc: 'The ACA data template, filled for the whole year (.xlsx, up to 10 MB). It is checked, stored encrypted, and the codes are worked out straight away. The client can also upload it from their portal.' })}
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center">${fileDrop('Template file')}${btn(`${ic('Upload', 16)} Upload and generate codes`, { attrs: real('upload the template, check it and work out the codes.') })}</div>
      ${btn(`${ic('Download', 14)} Download the blank template (v10, with the Dependents tab)`, { kind: 'ghost', size: 'sm', cls: 'mt-3', attrs: real('download the blank ACA data template (.xlsx).') })}`, 'p-6')}
    ${card(`${sectionHeader('What has arrived', { action: frozen ? '' : btn(`${ic('RefreshCw', 14)} Generate codes again`, { kind: 'secondary', size: 'sm', attrs: 'data-act="regen"' }) })}
      <dl class="grid gap-x-8 gap-y-3 text-body-sm sm:grid-cols-2"><div><dt class="text-ink-subtle">Latest upload</dt><dd class="text-ink">Version 2, Feb 9, 2026, 9:58 AM by ${STAFF.email}</dd></div>
        <div><dt class="text-ink-subtle">Rows read</dt><dd class="text-ink">264</dd></div><div><dt class="text-ink-subtle">Codes</dt><dd class="text-ink">Version ${VERSION}, Feb 9, 2026, 10:02 AM (new upload)</dd></div>
        <div><dt class="text-ink-subtle">Result</dt><dd class="text-ink">${EMPLOYEES.length} employees, ${required().length} forms, 0 blocking, 2 warnings</dd></div></dl>
      ${S.flash === 'regen' ? banner('safe', `Codes generated again: version ${VERSION}, unchanged. Nothing in the data moved, so the preview and any approval stand.`, { cls: 'mt-4 mb-0' }) : ''}`, 'p-6')}
    ${card(`${sectionHeader('Earlier uploads', { desc: 'Every version is kept. An approval always names the exact version it was given on.' })}<ul class="divide-y divide-line text-body-sm">${UPLOADS.map(v => `<li class="flex flex-wrap gap-x-4 py-2"><span class="font-medium text-ink">Version ${v.version}</span><span class="text-ink-subtle">${v.at} by ${esc(v.by)}</span><span class="text-ink-subtle">${esc(v.note)}</span></li>`).join('')}</ul>`, 'p-6')}</div>`;
}
function cellClass(line, v, e, i) {
  if (line === 'l14') return v === '1H' ? 'text-ink-subtle' : 'font-semibold text-brand-dark';
  if (line === 'l15') return v ? 'text-ink' : 'text-ink-faint';
  if (v === '2C') return 'font-semibold text-success-fg';
  if (v === '2D') return 'text-ink';
  if (e.l16_blank[i] === 'correct') return 'bg-warning-bg text-caption italic text-warning-fg';
  return 'text-ink';
}
const TH = 'max-xl:sticky max-xl:left-0 max-xl:z-[1] max-xl:bg-surface whitespace-nowrap px-3 py-1.5 text-left text-caption font-medium text-ink-muted';
function empBlock(e, n) {
  const open = S.openEmp.has(n);
  const lines = [['l14', '14 Offer'], ['l15', '15 Share'], ['l16', '16 Relief']];
  return `<tbody class="border-t border-line"><tr class="bg-subtle/60"><th scope="rowgroup" colspan="14" class="px-3 py-2 text-left"><div class="flex flex-wrap items-center gap-x-3 gap-y-1">
      <span class="text-body-sm font-semibold text-ink">${e.first} ${e.last}</span><span class="text-caption text-ink-subtle">${e.ssn}</span>
      <span class="text-caption text-ink-subtle">Hired ${e.hired}${e.terminated ? `, left ${e.terminated}` : ''}${e.rehired ? `, rehired ${e.rehired}` : ''}</span>
      ${e.required ? badge('success', '1095-C') : badge('neutral', `No form: ${e.required_reason.toLowerCase()}`)}
      <button type="button" data-emp="${n}" aria-expanded="${open}" class="ml-auto inline-flex items-center gap-1 text-caption font-medium text-brand-dark hover:underline">${ic(open ? 'ChevronUp' : 'ChevronDown', 13)} ${open ? 'Hide' : 'Hours and status'}</button></div></th></tr>
    ${lines.map(([k, l]) => `<tr><th scope="row" class="${TH}">${l}</th><td class="px-2 py-1.5 text-center text-caption text-ink-subtle">${e.all12[k]}</td>${e[k].map((v, i) =>
      `<td ${k === 'l16' ? `title="${esc(e.why[i] + (e.l16_blank[i] ? ' Blank is the IRS answer: no Line 16 code applies. See the warning for this employee.' : ''))}"` : ''} class="px-2 py-1.5 text-center text-body-sm tabular-nums ${cellClass(k, v, e, i)}">${v || (k === 'l16' && e.l16_blank[i] ? 'blank' : '')}</td>`).join('')}</tr>`).join('')}
    ${open ? `<tr><th scope="row" class="${TH}">Hours</th><td></td>${e.hours.map((h, i) => `<td class="px-2 py-1.5 text-center text-caption tabular-nums ${e.ft[i] ? 'font-semibold text-ink' : 'text-ink-subtle'}">${h}</td>`).join('')}</tr>
      <tr><th scope="row" class="${TH}">Status</th><td></td>${e.employed.map((s, i) => `<td class="px-2 py-1.5 text-center text-caption text-ink-subtle">${s === 'none' ? 'gone' : e.enrolled[i] ? 'enrolled' : e.offered[i] ? 'offered' : e.lnap[i] ? 'LNAP' : s === 'part' ? 'part' : e.ft[i] ? 'FT' : 'PT'}</td>`).join('')}</tr>
      <tr><th scope="row" class="max-xl:sticky max-xl:left-0 max-xl:z-[1] max-xl:bg-surface px-3 py-1.5 text-left text-caption font-medium text-ink-muted">Why</th><td colspan="13" class="px-2 py-1.5 text-caption text-ink-subtle">${esc(e.why.map((w, i) => `${MONTHS[i]}: ${w}`).join(' '))}</td></tr>` : ''}</tbody>`;
}
function codesTab() {
  const ftCount = MONTHS.map((_, i) => EMPLOYEES.filter(e => e.ft[i] && e.employed[i] !== 'none').length);
  const total = MONTHS.map((_, i) => EMPLOYEES.filter(e => e.employed[i] !== 'none').length);
  const SEVX = { warning: ['AlertTriangle', 'text-warning-fg', 'warning', 'Warning'], info: ['Info', 'text-info-fg', 'info', 'Note'] };
  return `<div class="flex flex-col gap-6">
    ${banner('safe', 'Every month is coded. 2 warnings below show the calls the engine made on messy data; read them before releasing the preview.', { title: 'No blocking exceptions', cls: 'mb-0' })}
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">${[['Employees', EMPLOYEES.length, '0 contractors left out'], ['Forms 1095-C', required().length, 'employees full-time in at least one month'], ['Rows read', 264, 'all rows readable'], ['Version', VERSION, 'Feb 9, 2026, 10:02 AM']].map(([l, v, h]) =>
      card(`<div class="text-caption text-ink-subtle">${l}</div><div class="mt-1 text-title tabular-nums text-ink">${v}</div><div class="text-caption text-ink-subtle">${h}</div>`, 'p-4')).join('')}</div>
    ${card(`<div class="px-6 pt-5">${sectionHeader('Exceptions', { count: EXCEPTIONS.length, desc: 'Blocking first. Each one names the person, the month and the IRS text behind it.' })}</div>
      <ul class="divide-y divide-line border-t border-line">${EXCEPTIONS.map(x => { const [icon, cls, tone, lab] = SEVX[x.severity];
        return `<li class="flex gap-3 px-6 py-3">${ic(icon, 17, `mt-0.5 shrink-0 ${cls}`)}<div class="min-w-0 flex-1"><div class="flex flex-wrap items-center gap-2 text-body-sm">${badge(tone, lab)}<span class="font-medium text-ink">${x.name}</span>${x.month ? `<span class="text-ink-subtle">${MONTHS[x.month - 1]}</span>` : ''}</div>
          <p class="mt-1 text-body-sm text-ink">${esc(x.message)}</p><p class="mt-0.5 text-caption text-ink-subtle">${esc(x.cite)}</p></div></li>`; }).join('')}</ul>`, 'overflow-hidden')}
    ${card(`<div class="px-6 pt-5">${sectionHeader('Codes by month', { desc: 'Line 14 offer, Line 15 employee share, Line 16 relief. Hover a Line 16 cell for the reason; a ? is a full-time month with no code, which needs a look.' })}</div>
      <div class="overflow-x-auto border-t border-line"><table class="w-full min-w-[56rem] text-body-sm"><thead><tr class="text-caption text-ink-subtle"><th scope="col" class="max-xl:sticky max-xl:left-0 max-xl:z-[1] max-xl:bg-surface px-3 py-2 text-left">Line</th><th scope="col" class="px-2 py-2">All 12</th>${MONTHS.map(m => `<th scope="col" class="px-2 py-2">${m}</th>`).join('')}</tr></thead>
      ${EMPLOYEES.map(empBlock).join('')}</table></div>`, 'overflow-hidden')}
    ${card(`<div class="px-6 pt-5">${sectionHeader('Form 1094-C, Part III', { desc: 'Monthly counts. Column (c) counts employees on the first day of each month.' })}</div>
      <div class="overflow-x-auto border-t border-line"><table class="w-full min-w-[40rem] text-body-sm"><thead><tr class="text-caption text-ink-subtle"><th scope="col" class="px-3 py-2 text-left">Column</th>${MONTHS.map(m => `<th scope="col" class="px-2 py-2">${m}</th>`).join('')}</tr></thead><tbody>
        <tr><th scope="row" class="px-3 py-1.5 text-left font-medium text-ink-muted">(a) MEC offered to 95%</th>${MONTHS.map(() => '<td class="px-2 py-1.5 text-center">Yes</td>').join('')}</tr>
        <tr><th scope="row" class="px-3 py-1.5 text-left font-medium text-ink-muted">(b) Full-time employees</th>${ftCount.map(v => `<td class="px-2 py-1.5 text-center tabular-nums">${v}</td>`).join('')}</tr>
        <tr><th scope="row" class="px-3 py-1.5 text-left font-medium text-ink-muted">(c) Total employees</th>${total.map(v => `<td class="px-2 py-1.5 text-center tabular-nums">${v}</td>`).join('')}</tr>
        <tr><th scope="row" class="px-3 py-1.5 text-left font-medium text-ink-muted">(d) Aggregated group</th>${MONTHS.map(() => '<td class="px-2 py-1.5 text-center"></td>').join('')}</tr></tbody></table></div>`, 'overflow-hidden')}
    ${card(`${sectionHeader('How the engine decides', { desc: "The calls the IRS instructions leave to the filer. These are what the firm's ACA reviewer signs off on.", action: `<button type="button" data-act="rules" aria-expanded="${S.rules}" class="font-medium text-brand-dark hover:underline">${S.rules ? 'Hide' : 'Show'}</button>` })}
      ${S.rules ? `<dl class="grid gap-4 md:grid-cols-2">${HOW_IT_DECIDES.map(([t, r]) => `<div><dt class="text-body-sm font-semibold text-ink">${t}</dt><dd class="mt-0.5 text-body-sm text-ink-muted">${esc(r)}</dd><dd class="mt-0.5 text-caption text-ink-subtle">${YEAR} Instructions for Forms 1094-C and 1095-C</dd></div>`).join('')}</dl>` : ''}`, 'p-6')}</div>`;
}
function formsTab() {
  const st = fStatus(), filed = stepOf(MAIN) >= 7, mayRelease = st === 'codes_generated' || st === 'preview_sent', forms = required();
  const rel = S.released ? `${S.released.at} by ${S.released.by}, version ${S.released.version}` : 'Not yet';
  const appr = S.approval ? `${S.approval.at} by ${S.approval.by}, version ${S.approval.version}` : 'Not yet';
  return `<div class="flex flex-col gap-6">
    ${card(`${sectionHeader('Where the forms stand', { desc: filed ? 'Filed with the IRS. These are the forms as sent, without a watermark.' : 'Until the forms are filed, every copy carries a PREVIEW watermark.' })}
      <dl class="grid gap-x-8 gap-y-3 text-body-sm sm:grid-cols-3"><div><dt class="text-ink-subtle">Preview released</dt><dd class="text-ink">${rel}</dd></div><div><dt class="text-ink-subtle">Client approval</dt><dd class="text-ink">${appr}</dd></div><div><dt class="text-ink-subtle">Codes version</dt><dd class="text-ink">${VERSION}, Feb 9, 2026, 10:02 AM</dd></div></dl>
      ${mayRelease ? `<div class="mt-5 flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-center">${btn(`${ic('Send', 16)} ${st === 'preview_sent' ? 'Release the preview again' : 'Release preview to the client'}`, { attrs: 'data-act="release"' })}<span class="text-body-sm text-ink-subtle">The client will be able to review every form in their portal and approve them.</span></div>` : ''}
      ${S.flash === 'released' ? banner('safe', 'Released. The client can now review and approve.', { cls: 'mt-4 mb-0', action: '<a href="#/portal/filings/2025" class="font-medium text-brand-dark underline">See it in the client portal</a>' }) : ''}`, 'p-6')}
    ${card(`<div class="px-6 pt-5">${sectionHeader('Form 1094-C and the packet', { action: `<span class="flex flex-wrap gap-2">${btn(`${ic('Eye', 14)} 1094-C`, { kind: 'secondary', size: 'sm', attrs: real('open the Form 1094-C on the official IRS PDF, with a PREVIEW watermark until it is filed.') })}${btn(`${ic('Download', 14)} Whole packet`, { kind: 'secondary', size: 'sm', attrs: real('download the 1094-C and every 1095-C as one PDF.') })}</span>` })}</div>
      <div class="border-t border-line px-6 py-4 text-body-sm text-ink-muted">The transmittal plus ${forms.length} Forms 1095-C, in one PDF, in the order the IRS file lists them.</div>`, 'overflow-hidden')}
    ${card(`<div class="px-6 pt-5">${sectionHeader('Forms 1095-C', { count: forms.length, desc: 'One per employee who was full-time in at least one month. The employee copy is the four-page IRS form with its instructions and a truncated SSN.' })}</div>
      <ul class="divide-y divide-line border-t border-line">${forms.map(e => { const off = e.offered.filter(Boolean).length, enr = e.enrolled.filter(Boolean).length;
        return `<li class="flex flex-col gap-2 px-6 py-3 sm:flex-row sm:items-center sm:gap-4"><div class="min-w-0 flex-1"><div class="text-body-sm font-medium text-ink">${e.first} ${e.last} <span class="font-normal text-ink-subtle">${e.ssn}</span></div>
          <div class="text-caption text-ink-subtle">${e.all12.l14 ? `Line 14 ${e.all12.l14} all year` : `${off} months offered`}${e.all12.l16 ? `, Line 16 ${e.all12.l16}` : `, ${enr} months enrolled`}</div></div>
          <div class="flex gap-2">${btn(`${ic('Eye', 14)} ${filed ? 'Filed copy' : 'Preview'}`, { kind: 'ghost', size: 'sm', attrs: real(`open ${e.first} ${e.last}'s Form 1095-C as a PDF.`) })}${btn(`${ic('Download', 14)} Employee copy`, { kind: 'ghost', size: 'sm', attrs: real(`download the employee copy of ${e.first} ${e.last}'s Form 1095-C, with a truncated SSN.`) })}</div></li>`; }).join('')}</ul>`, 'overflow-hidden')}</div>`;
}
const ready = (on, yes, no) => `<span class="inline-flex items-center gap-1.5 ${on ? 'text-success-fg' : 'text-ink-muted'}">${ic(on ? 'CheckCircle2' : 'CircleSlash', 15)}${on ? yes : no}</span>`;
function efileTab() {
  const approved = stepOf(MAIN) >= 6, b = S.built;
  return `<div class="flex flex-col gap-6">
    ${card(`${sectionHeader('Ready to send?', { desc: 'What the IRS needs before a transmission can be built. An admin sees the full list of IRS settings under Settings.' })}
      <dl class="grid gap-x-8 gap-y-3 text-body-sm sm:grid-cols-2"><div><dt class="text-ink-subtle">Client approval</dt><dd>${ready(approved, `Approved ${S.approval?.at ?? 'Feb 10, 2026'} by ${S.approval?.name ?? CLIENT_USER.name}`, 'Not approved yet. The IRS files are built only after the client approves.')}</dd></div>
        <div><dt class="text-ink-subtle">The firm's IRS settings</dt><dd>${ready(true, 'TCC and Software ID set (test files)', '')}</dd></div>
        <div><dt class="text-ink-subtle">Direct transmission (A2A)</dt><dd>${ready(false, '', 'Not set up: upload the files on the IRS AIR site by hand')}</dd></div>
        <div><dt class="text-ink-subtle">Schema years in the app</dt><dd class="text-ink">2023, 2024, 2025</dd></div></dl>`, 'p-6')}
    ${card(`${sectionHeader('1. Build the IRS files', { desc: "The Manifest and the Form Data File, checked against the IRS's own schemas. Kept encrypted; every build is a new version.", action: approved ? btn(`${ic('Hammer', 14)} ${b ? 'Build again' : 'Build'}`, { size: 'sm', attrs: 'data-act="build"' }) : '' })}
      ${!b ? `<p class="text-body-sm text-ink-subtle">${approved ? 'Not built yet.' : "Waiting for the client's approval."}</p>`
        : `<dl class="grid gap-x-8 gap-y-3 text-body-sm sm:grid-cols-2"><div><dt class="text-ink-subtle">Built</dt><dd class="text-ink">${b.at} by ${STAFF.email}, from codes version ${VERSION}</dd></div>
          <div><dt class="text-ink-subtle">Contents</dt><dd class="text-ink">${required().length} Forms 1095-C, type Original, TEST file</dd></div>
          <div><dt class="text-ink-subtle">Schema check</dt><dd>${badge('success', 'Valid', true)}</dd></div><div><dt class="text-ink-subtle">Transmission id</dt><dd class="break-all text-caption text-ink">${b.utid}</dd></div></dl>
          <ul class="mt-3 list-disc pl-5 text-caption text-ink-subtle"><li>Build ${b.n}. Each build keeps the earlier ones.</li></ul>
          <div class="mt-4">${btn(`${ic('Download', 14)} Download the two files (zip)`, { kind: 'secondary', size: 'sm', attrs: real('download the Manifest and the Form Data File as a zip, to upload on the IRS AIR site.') })}</div>`}`, 'p-6')}
    ${card(`${sectionHeader('2. Send to the IRS', { desc: "Either upload the two files on the IRS AIR site with the firm's TCC and record the Receipt ID here, or send directly once A2A is set up. Full access only: this is the step with legal weight." })}
      ${!b ? '<p class="text-body-sm text-ink-subtle">Build the files first.</p>' : `<div class="flex flex-col gap-4"><form data-form="receipt" class="flex flex-col gap-3 sm:flex-row sm:items-end"><label class="sm:w-80"><span class="${FIELD_LABEL}">Receipt ID from the IRS site</span><input id="receipt" data-input="receipt" value="${esc(S.receipt)}" class="${FIELD_INPUT} mt-1" placeholder="1094C-26-00000000"></label>
          ${btn(`${ic('FileUp', 16)} Record as sent`, { disabled: !S.receipt.trim(), attrs: real('record the filing as sent to the IRS under this Receipt ID, which moves it to Filed with the IRS.') })}</form>
        <div class="flex items-center gap-3">${btn(`${ic('Send', 16)} Send directly (A2A)`, { kind: 'secondary', disabled: true })}<span class="text-caption text-ink-subtle">Needs the certificate and endpoints in Settings.</span></div></div>`}`, 'p-6')}
    ${card(`${sectionHeader("3. The IRS's answer", { desc: 'Load the status file the IRS site offers for download, or pick the status it shows. Accepted closes the filing; anything else lists what to correct.' })}<p class="text-body-sm text-ink-subtle">Waiting for the transmission.</p>`, 'p-6')}
    ${!approved && !b ? `<div class="rounded-card border border-dashed border-line-strong bg-surface px-6 py-10 text-center"><div class="text-title text-ink">Nothing to send yet</div><div class="mx-auto mt-1 max-w-md text-body-sm text-ink-subtle">The IRS files are built from the codes the client approved. Release the preview, get the approval, then come back here.</div>
      <div class="mt-4 flex justify-center"><a href="#/portal/filings/2025" class="font-medium text-brand-dark underline">Open the client portal to approve</a></div></div>` : ''}</div>`;
}

/* ---------- The client portal (pages/PortalHome.tsx) ---------- */
const runs = arr => { const out = []; arr.forEach((v, i) => { const last = out[out.length - 1]; if (last && last.v === v && last.to === i - 1) last.to = i; else out.push({ v, from: i, to: i }); });
  return out.map(r => `${r.v || 'blank'} ${r.from === r.to ? MONTHS[r.from] : `${MONTHS[r.from]}-${MONTHS[r.to]}`}`).join(', '); };
const LINES = [['l14', 'Line 14, offer'], ['l15', 'Line 15, employee share'], ['l16', 'Line 16, relief']];
const codeRuns = e => `<dl class="mt-1 grid gap-x-6 gap-y-0.5 text-caption sm:grid-cols-3">${LINES.map(([k, l]) => `<div class="min-w-0"><dt class="text-ink-subtle">${l}</dt><dd class="text-ink">${runs(e[k])}</dd></div>`).join('')}</dl>`;
function filingSection(year) {
  const cur = year === YEAR, step = cur ? stepOf(MAIN) : 8, st = STEPS[step - 1].key, label = STEPS[step - 1].label;
  const reviewable = ['preview_sent', 'approved', 'filed', 'accepted'].includes(st), uploadable = cur && step <= 5;
  const forms = cur ? required() : required().filter(e => e.hired < '2025');
  const upload = uploadable ? `<div class="rounded-control border border-line bg-subtle p-4"><div class="text-body-sm font-semibold text-ink">${st === 'preview_sent' ? 'Need to send corrected data?' : 'Send us your completed template'}</div>
      <p class="mt-1 text-body-sm text-ink-muted">The ACA data template for the whole of ${year}, as an Excel file (.xlsx, up to 10 MB). It is stored encrypted the moment it arrives.${st === 'preview_sent' ? ' A new file replaces the preview you were sent.' : ''}</p>
      <div class="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">${fileDrop(`Template file for ${year}`)}${btn(`${ic('Upload', 16)} Upload`, { attrs: real('upload the corrected template. It replaces the preview, and the team reviews it and sends the forms back to approve.') })}</div>
      ${btn(`${ic('Download', 14)} Download the blank template`, { kind: 'ghost', size: 'sm', cls: 'mt-2', attrs: real('download the blank ACA data template (.xlsx).') })}</div>` : '';
  const sumOf = e => cur ? codeRuns(e) : codeRuns({ l14: Array(12).fill('1E'), l15: Array(12).fill('150.00'), l16: Array(12).fill('2C') });
  const review = reviewable ? `<div class="rounded-control border border-line p-4"><div class="flex flex-wrap items-center gap-3"><div class="text-body-sm font-semibold text-ink">${st === 'preview_sent' ? 'Your forms are ready to review' : st === 'approved' ? 'Approved, waiting to be filed' : 'Filed with the IRS'}</div>
      ${step < 7 ? badge('info', 'Preview copies') : ''}${btn(`${ic('Download', 14)} All forms (one PDF)`, { kind: 'secondary', size: 'sm', cls: 'ml-auto', attrs: real(`download all your ${year} forms as one PDF.`) })}</div>
    <ul class="mt-3 divide-y divide-line">${forms.map(e => `<li class="flex items-start gap-3 py-2 text-body-sm">${ic('FileText', 16, 'mt-0.5 shrink-0 text-ink-faint')}<div class="min-w-0 flex-1"><div class="break-words text-ink sm:truncate">${e.first} ${e.last} <span class="text-ink-subtle">${SSN}</span></div>${sumOf(e)}</div>
      ${btn(`${ic('Eye', 14)} View`, { kind: 'ghost', size: 'sm', attrs: real(`open ${e.first} ${e.last}'s Form 1095-C as a PDF.`) })}</li>`).join('')}</ul>
    ${cur ? `<details class="mt-4 rounded-control border border-line bg-subtle px-4 py-3"><summary class="cursor-pointer text-body-sm font-semibold text-ink">What the codes on your forms mean</summary><dl class="mt-3 flex flex-col gap-2.5">${MEANINGS.map(([c, m, cite]) =>
      `<div class="flex gap-3 text-body-sm"><dt class="w-16 shrink-0 font-semibold text-brand-dark">${c}</dt><dd class="min-w-0"><span class="text-ink">${esc(m)}</span><span class="mt-0.5 block text-caption text-ink-subtle">IRS: ${cite}, ${YEAR} Instructions for Forms 1094-C and 1095-C.</span></dd></div>`).join('')}</dl></details>` : ''}
    ${st === 'preview_sent' ? `<div class="mt-4 border-t border-line pt-4"><label class="flex items-start gap-3 text-body-sm text-ink"><input type="checkbox" id="agree" data-act="agree" class="mt-1" ${S.agreed ? 'checked' : ''}><span>I have reviewed these ${forms.length} Forms 1095-C and the Form 1094-C for ${year} and approve filing them with the IRS as shown. If anything is wrong, I will report a problem or send corrected data instead.</span></label>
      <div class="mt-3 flex items-center gap-3">${btn(`${ic('CheckCircle2', 16)} Approve for filing`, { disabled: !S.agreed, attrs: 'data-act="approve"' })}<span class="text-caption text-ink-subtle">Your name, the time and the exact version (${VERSION}) are recorded.</span></div></div>
      ${S.reporting ? `<form data-form="problem" class="mt-3 flex flex-col gap-3 rounded-control border border-line bg-subtle p-4"><div class="text-body-sm font-semibold text-ink">Report a problem with these forms</div>
        <label class="flex flex-col gap-1 text-body-sm text-ink">Which form?<select id="pwhich" class="min-h-10 rounded-control border border-line-strong bg-surface px-3 text-body-sm text-ink"><option value="">The whole filing</option>${forms.map(e => `<option>${e.first} ${e.last}</option>`).join('')}</select></label>
        <label class="flex flex-col gap-1 text-body-sm text-ink">What is wrong?<textarea id="pwhat" rows="4" maxlength="2000" placeholder="For example: coverage for this employee ended in June, not May." class="rounded-control border border-line-strong bg-surface px-3 py-2 text-body-sm text-ink"></textarea></label>
        <div class="flex flex-wrap items-center gap-3">${btn(`${ic('MessageSquare', 16)} Send to your filing team`, { attrs: real('send the problem to the filing team. Approval waits until they answer and resolve it.') })}${btn('Cancel', { kind: 'ghost', attrs: 'data-act="report-cancel"' })}<span class="text-caption text-ink-subtle">Nothing is filed while a problem is open.</span></div></form>`
      : `<div class="mt-3 flex flex-wrap items-center gap-2 text-body-sm text-ink-muted">${ic('AlertTriangle', 15, 'text-warning-fg')} Something wrong? ${btn('Report a problem', { kind: 'secondary', size: 'sm', attrs: 'data-act="report"' })}</div>`}` : ''}
    ${st !== 'preview_sent' ? `<p class="mt-3 text-caption text-ink-subtle">Approved ${cur ? S.approval?.at ?? '' : 'Feb 14, 2025, 11:20 AM'} by ${CLIENT_USER.name}${cur ? `, version ${VERSION}` : ''}.</p>` : ''}
    ${cur && S.pFlash === 'approved' ? banner('safe', 'Approved. Your filing team will file these forms with the IRS; nothing changes on them now.', { cls: 'mt-3 mb-0' }) : ''}</div>` : '';
  return `<li class="flex flex-col gap-5 px-6 py-5"><div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6"><div class="w-28 shrink-0"><div class="text-label uppercase text-ink-subtle">Tax year</div><div class="text-title text-ink">${year}</div></div><div class="min-w-0 flex-1">${stepTrack(step, 8, label)}</div></div>${upload}${review}</li>`;
}
function portalHome() {
  const name = client(MAIN).name;
  return banner('note', `What ${esc(name)} would see in its portal. The company and its employees are invented, so you can review and approve here: nothing is filed and nothing reaches a real client.`, { title: 'Client demo', cls: 'mb-6', action: '<a href="#/" class="font-medium text-brand-dark underline">Back to the team screens</a>' })
    + `<h1 class="text-page text-ink">Welcome, ${CLIENT_USER.first}</h1><p class="mt-2 text-body text-ink-muted">You are signed in for <strong class="font-semibold text-ink">${esc(name)}</strong>.</p>
    <div class="mt-8 flex flex-col gap-4 rounded-card bg-surface p-6 shadow-e4 sm:flex-row sm:items-center"><span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand-dark">${ic('ClipboardList', 20)}</span>
      <div class="min-w-0 flex-1"><h2 class="text-section text-ink">Your profile</h2><p class="mt-0.5 text-body-sm text-ink-muted">Everything your forms need is answered. You can review or update it any time.</p></div>
      <button type="button" ${real("open the company's profile questionnaire.")} class="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-control border border-line-strong bg-surface px-4 text-body-sm font-semibold text-ink transition-colors duration-120 hover:bg-subtle">Review or update ${ic('ArrowRight', 15)}</button></div>
    <div class="mt-8 overflow-hidden rounded-card bg-surface shadow-e4"><h2 class="px-6 pt-5 text-section text-ink">Your filings</h2><ul class="mt-4 divide-y divide-line border-t border-line">${filingSection(YEAR)}${filingSection(YEAR - 1)}</ul></div>`;
}
function portalFilings() {
  const name = client(MAIN).name;
  return `<h1 class="text-page text-ink">Filings</h1><p class="mt-2 text-body text-ink-muted">Each year your filing team files for ${esc(name)}, and where it stands.</p>
    <div class="mt-8 overflow-hidden rounded-card bg-surface shadow-e4"><ul class="divide-y divide-line">${[[YEAR, stepOf(MAIN)], [YEAR - 1, 8]].map(([y, s]) => `<li><a href="#/portal/filings/${y}" class="flex items-center gap-4 px-6 py-4 transition-colors duration-120 hover:bg-subtle">${ic('FileText', 18, 'shrink-0 text-ink-faint')}
      <span class="min-w-0 flex-1"><span class="block text-body font-semibold text-ink">Tax year ${y}</span><span class="block text-body-sm text-ink-muted">Step ${s} of 8: ${STEPS[s - 1].label}</span></span>${ic('ArrowRight', 16, 'shrink-0 text-ink-faint')}</a></li>`).join('')}</ul></div>`;
}
function portalYear(y) {
  if (![YEAR, YEAR - 1].includes(y)) return `<h1 class="text-page text-ink">Tax year ${esc(y)}</h1>${card('<div class="text-title text-ink">No filing for this year</div>', 'mt-8 p-6')}`;
  return `<h1 class="text-page text-ink">Tax year ${y}</h1><p class="mt-2 text-body text-ink-muted">${esc(client(MAIN).name)}</p><div class="mt-8 overflow-hidden rounded-card bg-surface shadow-e4"><ul class="divide-y divide-line">${filingSection(y)}</ul></div>`;
}
const notFound = () => `<div class="rounded-card border border-dashed border-line-strong bg-surface px-6 py-10 text-center"><div class="text-title text-ink">Nothing here</div><div class="mx-auto mt-1 max-w-md text-body-sm text-ink-subtle">Go back to the client list and pick it from there.</div><div class="mt-4 flex justify-center"><a href="#/clients" class="font-medium text-brand-dark underline">Back to clients</a></div></div>`;


/* ---------- Sign-in (pages/SignInLanding.tsx, signInLayout.tsx) ----------
   The real page has a photo of a desk under the headline; it carries the
   firm's branding, so the miniature leaves it out and keeps the drawn parts. */
const NAVY = 'text-[#0b1f3a]';
const msMark = () => '<svg width="16" height="16" viewBox="0 0 21 21" aria-hidden="true"><rect x="1" y="1" width="9" height="9" fill="#f25022"/><rect x="11" y="1" width="9" height="9" fill="#7fba00"/><rect x="1" y="11" width="9" height="9" fill="#00a4ef"/><rect x="11" y="11" width="9" height="9" fill="#ffb900"/></svg>';
const gMark = () => '<svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>';
const authBtn = primary => 'group flex min-h-[50px] w-full items-center gap-3 rounded-xl px-4 text-[0.9375rem] font-semibold transition duration-150 ease-out hover:-translate-y-px active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 '
  + (primary ? 'bg-brand text-white shadow-[0_8px_18px_-8px_rgba(45,111,224,0.7)] hover:bg-brand-dark hover:shadow-[0_12px_22px_-10px_rgba(45,111,224,0.75)]' : 'border border-line-strong/80 bg-white text-[#0b1f3a] shadow-e1 hover:border-brand/40 hover:bg-brand-softer');
const btnIcon = (inner, onBrand) => `<span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${onBrand ? 'bg-white' : ''}">${inner}</span>`;
const btnArrow = onBrand => ic('ArrowRight', 16, `ml-auto shrink-0 transition-transform duration-150 group-hover:translate-x-0.5 ${onBrand ? 'text-white/90' : 'text-ink-faint'}`);
const markTile = (h = 'h-7 w-7') => `<span class="flex ${h} shrink-0 items-center justify-center rounded-[8px] bg-brand text-white">${ic('FileCheck2', 16)}</span>`;
function signin() {
  const LINK = 'font-semibold text-brand-dark underline-offset-2 transition-colors duration-120 hover:underline';
  const doors = [['team', 'Filing team', 'Building2'], ['client', 'Client', 'Users']].map(([k, l, icon]) => { const on = S.door === k;
    return `<button type="button" role="radio" aria-checked="${on}" data-door="${k}" class="flex min-h-[42px] items-center justify-center gap-2 rounded-[10px] text-body-sm font-semibold transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${on ? 'bg-white text-brand-dark shadow-[0_1px_3px_rgba(45,111,224,0.18)] ring-1 ring-brand/50' : 'text-ink-muted hover:text-[#0b1f3a]'}">${ic(icon, 15)}${l}</button>`; }).join('');
  const team = `<a href="#/" class="${authBtn(true)}">${btnIcon(msMark(), true)}Sign in with Microsoft${btnArrow(true)}</a>
    <p class="mt-3 text-caption leading-snug text-ink-subtle">Uses your work account. Your access is set by an administrator.</p>`;
  const clientDoor = `<div class="grid gap-3"><a href="#/portal" class="${authBtn(true)}">${btnIcon(msMark(), true)}Continue with Microsoft${btnArrow(true)}</a>
      <button type="button" ${real('send you to Google to sign in, then into your company’s portal.')} class="${authBtn(false)}">${btnIcon(gMark())}Continue with Google${btnArrow(false)}</button>
      <button type="button" ${real('email a one-time sign-in code to the address your filing team invited.')} class="${authBtn(false)}">${btnIcon(ic('Mail', 16, 'text-ink-muted'))}Email me a sign-in code${btnArrow(false)}</button></div>
    <p class="mt-3 text-caption leading-snug text-ink-subtle">No access yet? Ask your filing team contact to invite you.</p>`;
  const card = `<section aria-labelledby="signin-title" class="mx-auto w-full max-w-[456px] rounded-[22px] border border-[#e6ecf5] bg-white p-7 shadow-[0_2px_4px_rgba(15,23,42,0.03),0_40px_90px_-36px_rgba(30,50,120,0.42)] sm:p-10 lg:mr-0">
    ${markTile()}<h2 id="signin-title" class="mt-4 text-[1.625rem] font-bold leading-tight tracking-[-0.015em] ${NAVY}">ACA Filing</h2><p class="mt-1.5 text-body text-ink-muted">Sign in to access your ACA filing portal</p>
    <div class="mt-7"><div class="text-[0.75rem] xl:text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-ink-subtle">Who are you signing in as?</div>
      <div role="radiogroup" aria-label="Who are you signing in as?" class="mt-2.5 grid grid-cols-2 gap-1 rounded-xl bg-[#f1f4fa] p-1">${doors}</div>
      <div class="mt-6">${S.door === 'team' ? team : clientDoor}</div>
      <p class="mt-6 flex items-start gap-2 text-caption leading-snug text-ink-muted">${ic('ShieldCheck', 14, 'mt-0.5 shrink-0 text-success-fg')}<span>Secure sign-in. Your password is never stored here.</span></p>
      <p class="mt-2 text-caption leading-snug text-ink-subtle">By signing in you agree to our <button type="button" ${real('open the Terms of Service.')} class="${LINK}">Terms of Service</button> and <button type="button" ${real('open the Privacy Policy.')} class="${LINK}">Privacy Policy</button>.</p></div></section>`;
  const benefits = [['ShieldCheck', 'Stay Compliant', 'Avoid penalties and meet IRS requirements.'], ['Clock', 'Save Time', 'Automate and streamline your ACA process.'], ['BarChart3', 'Get Peace of Mind', 'Accurate, secure, and reliable reporting.']];
  const formStack = `<div aria-hidden="true" class="pointer-events-none absolute bottom-[56%] left-[31.5rem] hidden w-[180px] select-none min-[1440px]:block">
    <div class="absolute inset-0 translate-x-7 translate-y-5 rotate-[-2deg] rounded-[14px] bg-white/70 shadow-[0_24px_48px_-26px_rgba(60,70,160,0.5)] ring-1 ring-white/80"></div>
    <div class="relative rotate-[-3deg] rounded-[14px] bg-white/95 p-4 pb-5 shadow-[0_30px_60px_-28px_rgba(60,70,160,0.6)] ring-1 ring-[#e6ebf6]">
      <div class="flex items-start justify-between"><span class="mt-1 text-[1.05rem] font-medium tracking-[-0.01em] ${NAVY}">1095-C</span><span class="flex h-7 w-7 items-center justify-center rounded-full bg-[#4fc9a4] text-white shadow-[0_4px_10px_-3px_rgba(16,185,129,0.6)]">${ic('Check', 15, '', 3)}</span></div>
      <div class="mt-3 h-[7px] w-[72%] rounded bg-[#e6ebf5]"></div><div class="mt-2 h-[7px] w-[52%] rounded bg-[#e6ebf5]"></div>
      <div class="mt-5 overflow-hidden rounded-md ring-1 ring-[#e6ebf5]"><div class="h-3 bg-[#eef2f9]"></div>${[0, 1, 2].map(() => `<div class="grid grid-cols-5 border-t border-[#eef2f9]">${[0, 1, 2, 3, 4].map(() => '<div class="flex h-[18px] items-center justify-center border-l border-[#eef2f9] first:border-l-0"><div class="h-[4px] w-[55%] rounded-sm bg-[#d9e0ee]"></div></div>').join('')}</div>`).join('')}</div>
      <div class="mt-6 h-[6px] w-[62%] rounded bg-[#edf1f8]"></div><div class="mt-2 h-[6px] w-full rounded bg-[#edf1f8]"></div>
      <div class="mt-5 flex justify-between"><div class="h-[6px] w-[45%] rounded bg-[#edf1f8]"></div><div class="h-[6px] w-[20%] rounded bg-[#edf1f8]"></div></div></div>
    <div class="absolute bottom-[26%] left-[-4.25rem] flex items-center gap-2 whitespace-nowrap rounded-[10px] bg-white px-3 py-2 text-[0.8125rem] font-medium text-brand-dark shadow-[0_14px_30px_-14px_rgba(11,31,58,0.45)] ring-1 ring-[#e3e9f3]"><span class="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#5b8def] text-white">${ic('Check', 11, '', 3.2)}</span>Compliance ready</div></div>`;
  return `<div class="relative flex min-h-screen flex-col overflow-x-hidden bg-[linear-gradient(180deg,#f3f7fe_0%,#ebf2fc_100%)]">
    <div aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden"><div class="absolute -right-40 -top-48 h-[640px] w-[640px] rounded-full bg-[radial-gradient(circle,rgba(45,111,224,0.10),transparent_65%)]"></div>
      <svg class="absolute bottom-0 right-0 hidden h-[74%] w-[76%] lg:block" viewBox="0 0 1330 640" preserveAspectRatio="none"><defs>
        <linearGradient id="signin-wave" x1="0" y1="0.6" x2="1" y2="0.4"><stop offset="0" stop-color="#c3cbf8" stop-opacity="0.75"/><stop offset="0.42" stop-color="#a4a3fa" stop-opacity="0.9"/><stop offset="0.72" stop-color="#bfd0fd" stop-opacity="0.6"/><stop offset="1" stop-color="#dfe9fd" stop-opacity="0.4"/></linearGradient>
        <linearGradient id="signin-sheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity="0.55"/><stop offset="1" stop-color="#ffffff" stop-opacity="0.10"/></linearGradient>
        <filter id="signin-soft" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="3"/></filter></defs>
        <path filter="url(#signin-soft)" fill="url(#signin-wave)" d="M0 640 C 140 560, 250 430, 330 330 C 420 220, 520 90, 660 70 C 860 45, 1060 150, 1330 250 L1330 640 Z"/>
        <path filter="url(#signin-soft)" fill="url(#signin-sheen)" d="M150 640 C 280 520, 390 340, 530 260 C 650 190, 780 200, 920 270 C 1060 340, 1200 420, 1330 395 L1330 640 Z"/>
        <path fill="none" stroke="#ffffff" stroke-opacity="0.6" stroke-width="1.5" d="M40 640 C 170 545, 270 420, 350 325 C 440 215, 540 100, 670 82"/></svg></div>
    <header class="relative z-20 border-b border-[#e3eaf5]/80 bg-white/70 backdrop-blur-sm"><div class="mx-auto flex h-[72px] max-w-[1800px] items-center gap-4 px-5 sm:px-10 lg:px-[5vw]">
      ${markTile('h-8 w-8')}<span aria-hidden="true" class="h-6 w-px bg-line"></span><span class="text-[1.05rem] font-medium ${NAVY}">ACA Filing</span>
      <span class="ml-auto hidden items-center gap-2 rounded-lg border border-[#e3e9f3] bg-white px-3.5 py-1.5 text-caption text-ink-muted shadow-e1 md:flex">${ic('ShieldCheck', 15, 'text-[#0b1f3a]')}Secure · Compliant · Trusted</span></div></header>
    <main id="main" tabindex="-1" class="relative z-10 mx-auto flex w-full max-w-[1800px] flex-1 px-[var(--gutter)] pt-8 outline-none [--gutter:1.25rem] sm:[--gutter:2.5rem] lg:pt-10 lg:[--gutter:5vw] xl:[--gutter:7.5vw]">
      <div class="grid w-full gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,1fr)_456px] xl:gap-x-16"><div class="relative flex flex-col lg:col-start-1 lg:row-start-1">
        <div class="text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-brand-dark">Welcome</div>
        <h1 class="mt-3 text-[2.25rem] font-medium leading-[1.12] tracking-[-0.02em] sm:text-[2.75rem] xl:text-[3.1rem] ${NAVY}">Simplify your<br>ACA compliance</h1>
        <p class="mt-4 max-w-[28rem] text-[1.0625rem] leading-[1.6] text-ink-muted">An ACA filing solution that helps you manage employee data, track deadlines, and stay compliant, all in one place.</p>
        <ul class="mt-8 grid max-w-[34rem] gap-5 sm:grid-cols-3 sm:gap-6 lg:mb-6 xl:max-w-[29rem] xl:gap-5">${benefits.map(([icon, t, x]) => `<li><span class="flex h-10 w-10 items-center justify-center rounded-[10px] bg-white shadow-[0_6px_16px_-8px_rgba(30,50,120,0.35)] ring-1 ring-[#e3e9f3]">${ic(icon, 19, 'text-brand')}</span><div class="mt-3 text-body-sm font-semibold ${NAVY}">${t}</div><p class="mt-1 text-caption leading-[1.5] text-ink-muted">${x}</p></li>`).join('')}</ul>
        <div aria-hidden="true" class="relative hidden select-none lg:mt-auto lg:block lg:min-h-[230px] lg:flex-1 lg:self-stretch">${formStack}</div></div>
      <div class="lg:col-start-2 lg:row-start-1 lg:self-center lg:pb-12">${card}</div></div></main></div>`;
}

/* ---------- routing and render ---------- */
const app = document.getElementById('app');
const parse = () => { const h = location.hash.replace(/^#\/?/, ''); return h ? h.split('/').map(decodeURIComponent) : []; };
function page() {
  const r = S.route;
  if (r[0] === 'portal') return r[1] === 'filings' ? (r[2] ? portalYear(Number(r[2])) : portalFilings()) : portalHome();
  if (!r[0]) return dashboard();
  if (r[0] === 'clients') {
    if (!r[1]) return clients();
    if (r[2] === String(YEAR)) return workspace(r[1], FTABS.some(t => t.key === r[3]) ? r[3] : 'data');
    return clientPage(r[1], r[2] === 'filings' ? 'filings' : 'overview');
  }
  return notFound();
}
function render() {
  const a = document.activeElement, id = a?.id, sel = a && 'selectionStart' in a ? [a.selectionStart, a.selectionEnd] : null;
  const portal = S.route[0] === 'portal';
  if (S.route[0] === 'signin') { app.innerHTML = signin(); } else
  app.innerHTML = `<div class="flex min-h-screen">${rail(portal)}<div class="min-w-0 flex-1">${portal ? portalTopbar() : staffTopbar()}
    <main id="main" tabindex="-1" class="${portal ? 'mx-auto max-w-[1100px] px-4 py-8 sm:px-8' : 'mx-auto max-w-[1600px] px-4 py-6 sm:px-8'} outline-none">${page()}</main></div></div>${panel(portal)}`;
  document.title = `ACA Filing: working demo | KHIPUAI`;
  if (id) { const el = document.getElementById(id); if (el) { el.focus({ preventScroll: true }); if (sel && el.setSelectionRange && el.type !== 'checkbox' && el.type !== 'email') try { el.setSelectionRange(...sel); } catch { /* not a text field */ } } }
}
function route() {
  const was = S.route.join('/');
  S.route = parse(); S.search = ''; S.searchOpen = false; S.bell = false; S.panel = false; S.dFilterOpen = false; S.flash = ''; S.pFlash = S.pFlash && was.startsWith('portal') ? S.pFlash : '';
  render();
  if (was !== S.route.join('/')) { window.scrollTo(0, 0); document.getElementById('main')?.focus({ preventScroll: true }); }
}
const go = h => { if (location.hash === h) route(); else location.hash = h; };

app.addEventListener('click', e => {
  const t = e.target.closest('button, [data-href], a'); if (!t || t.closest('[data-real]')) return;
  if (t.tagName === 'A') { if (t.hasAttribute('data-close-panel')) { S.panel = false; if (t.getAttribute('href') === (location.hash || '#/')) { e.preventDefault(); render(); } } return; }
  if (t.disabled) return;
  const d = t.dataset;
  if (d.href) { if (e.target.closest('a')) return; return go(d.href); }
  const act = d.act;
  if (act === 'collapse') S.collapsed = !S.collapsed;
  else if (act === 'panel') { S.panel = true; render(); document.getElementById('panel-close')?.focus(); return; }
  else if (act === 'panel-close') { S.panel = false; render(); app.querySelector('[data-act="panel"]')?.focus(); return; }
  else if (act === 'bell') { S.bell = !S.bell; S.searchOpen = false; }
  else if (act === 'dfilter') S.dFilterOpen = !S.dFilterOpen;
  else if (d.dfilter) { S.dFilter = d.dfilter; S.dFilterOpen = false; }
  else if (act === 'attn') S.attnAll = !S.attnAll;
  else if (d.cfilter) S.cFilter = S.cFilter === d.cfilter ? 'all' : d.cfilter;
  else if (d.cview) S.cView = d.cview;
  else if (d.ctab) return go(`#/clients/${S.route[1]}${d.ctab === 'filings' ? '/filings' : ''}`);
  else if (d.ftab) return go(`#/clients/${S.route[1]}/${YEAR}/${d.ftab}`);
  else if (act === 'retire') { const k = S.route[1]; S.retired[k] = !S.retired[k]; }
  else if (act === 'to-contacts') { document.getElementById('portal-contacts')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); document.getElementById('cn')?.focus({ preventScroll: true }); return; }
  else if (d.mark) { S.steps[d.mark] += 1; S.back = null; }
  else if (d.back) { S.back = d.back; S.backNote = ''; render(); document.getElementById('backnote')?.focus(); return; }
  else if (act === 'back-cancel') S.back = null;
  else if (d.hist) S.histOpen.has(d.hist) ? S.histOpen.delete(d.hist) : S.histOpen.add(d.hist);
  else if (d.emp) { const n = Number(d.emp); S.openEmp.has(n) ? S.openEmp.delete(n) : S.openEmp.add(n); }
  else if (act === 'rules') S.rules = !S.rules;
  else if (act === 'regen') S.flash = 'regen';
  else if (act === 'release') { S.released = { at: NOW, by: STAFF.email, version: VERSION }; setMain('preview_sent'); S.flash = 'released'; }
  else if (act === 'approve') { if (!S.agreed) return; S.approval = { at: NOW, by: CLIENT_USER.email, name: CLIENT_USER.name, version: VERSION }; setMain('approved'); S.agreed = false; S.reporting = false; S.pFlash = 'approved'; }
  else if (act === 'report') { S.reporting = true; render(); document.getElementById('pwhich')?.focus(); return; }
  else if (act === 'report-cancel') S.reporting = false;
  else if (act === 'build') { const n = (S.built?.n ?? 0) + 1; S.built = { at: NOW, n, utid: `1094C-DEMO-${String(n).padStart(4, '0')}-7c1e-09ab53d2f46e` }; }
  else if (act === 'agree') { S.agreed = t.checked; }
  else if (t.closest('[data-searchbox] [role="option"]')) return;
  else return;
  render();
});
app.addEventListener('change', e => {
  const t = e.target;
  if (t.dataset.act === 'agree') { S.agreed = t.checked; render(); }
  else if (t.tagName === 'SELECT' && t.dataset.input) { S[t.dataset.input] = t.value; render(); }
});
app.addEventListener('input', e => {
  const t = e.target, k = t.dataset.input; if (!k || t.tagName === 'SELECT') return;
  S[k] = t.value; if (k === 'search') S.searchOpen = true; render();
});
app.addEventListener('focusin', e => { if (e.target.id === 'hsearch' && !S.searchOpen) { S.searchOpen = true; if (S.search) render(); } });
app.addEventListener('submit', e => {
  const f = e.target, kind = f.dataset.form;
  if (kind === 'back' && S.backNote.trim()) { const k = f.dataset.key; S.steps[k] -= 1; S.history[`${k}:${YEAR}:${S.steps[k] - 1}`] = S.backNote.trim(); S.back = null; S.backNote = ''; render(); }
  else if (kind === 'newyear' && S.newYear) { S.steps[f.dataset.key] = 1; S.newYear = ''; render(); }
});
document.addEventListener('click', e => {
  // Clicks outside a dropdown close it, as useDismiss does in the app.
  let changed = false;
  if (S.searchOpen && !e.target.closest('[data-searchbox]')) { S.searchOpen = false; changed = true; }
  if (S.bell && !e.target.closest('[data-bellbox]')) { S.bell = false; changed = true; }
  if (S.dFilterOpen && !e.target.closest('[data-dfilterbox]')) { S.dFilterOpen = false; changed = true; }
  if (changed) render();
});
document.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { const s = document.getElementById('hsearch'); if (s) { e.preventDefault(); s.focus(); s.select(); } return; }
  if (e.key !== 'Escape' || document.querySelector('.mini-note.on')) return;
  if (S.panel) { S.panel = false; render(); app.querySelector('[data-act="panel"]')?.focus(); }
  else if (S.bell || S.searchOpen || S.dFilterOpen) { S.bell = S.searchOpen = S.dFilterOpen = false; render(); }
});
app.addEventListener('keydown', e => {
  // Tabs move with the arrow keys, as TabBar does.
  const tab = e.target.closest('[role="tab"]'); if (!tab || !['ArrowRight', 'ArrowLeft'].includes(e.key)) return;
  const all = [...tab.parentElement.querySelectorAll('[role="tab"]')], i = all.indexOf(tab);
  all[(i + (e.key === 'ArrowRight' ? 1 : -1) + all.length) % all.length].focus(); e.preventDefault();
});
window.addEventListener('hashchange', route);
mini({ label: 'Demo, made-up data', ok: 'OK' });
S.route = parse();
render();
