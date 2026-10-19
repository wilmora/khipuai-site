/* Certified Payroll miniature: the app's navy rail, floating top bar and pages
   redrawn as static HTML with the app's own Tailwind classes, filled with
   made-up data. Working screens: Dashboard, Clients (list and a client page
   with its five tabs), Filed reports, Federal filings and the Wage
   Determinations lookup. Everything that would save, send, file, download or
   reach an outside service shows a note instead. */
import { mini, esc, svg } from '../mini.js';
import { I } from './icons.js';
import { CLIENTS, WD_ALERTS, WEEKS_TO_CONFIRM, US_STATES, CONSTRUCTION_TYPES, TODAY, TODAY_LABEL, countiesFor, lookup } from './data.js';

const ic = (n, size = 16, cls = '', stroke = 2) => svg(I[n], { size, cls, stroke });
const REAL = what => `In the real product this would ${what}`;
const money = v => v.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
const attr = s => esc(s);

/* ---------- dates ---------- */
const D = iso => new Date(iso + 'T00:00:00');
const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const addDays = (s, n) => { const d = D(s); d.setDate(d.getDate() + n); return iso(d); };
const short = s => D(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
const dayLabel = s => D(s).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
const WEEK0 = (() => { let d = TODAY; while (D(d).getDay() !== 6) d = addDays(d, -1); return d; })(); // Saturday

/* ---------- state ---------- */
const S = {
  route: 'dashboard', door: 'team', client: '', tab: 'overview', collapsed: false, groups: {},
  review: new Set(), siteOpen: new Set(), rateOpen: new Set(['copperleaf|library']), empOpen: new Set(),
  workers: Object.fromEntries(CLIENTS.map(c => [c.key, c.workers.map(w => ({ ...w }))])),
  filed: 'stonebrook|wtp',
  pSel: '', pQ: '', pBack: 0, pWeeks: 1,
  wd: { state: '', county: '', ctype: '', results: null, searched: null, open: null, q: '', trades: new Set() },
};
const client = k => CLIENTS.find(c => c.key === k);
const jobs = () => CLIENTS.flatMap(c => c.projects.map(p => ({ c, p })));
const ready = c => c.projects.length > 0 && c.missing.length === 0 && c.details_confirmed && c.projects.every(p => !p.missing.length);

/* ---------- the rail (components/Shell.tsx, railStyles.ts) ---------- */
const NAV = [
  { go: 'dashboard', href: '#/', label: 'Dashboard', icon: 'House' },
  { label: 'Accounts', icon: 'Briefcase', items: [
    { go: 'clients', href: '#/clients', label: 'Clients', icon: 'Building2' },
    { label: 'Portal accounts', icon: 'Users', real: 'open the client portal accounts: who at each client can sign in and send hours.' },
    { go: 'reports', href: '#/reports', label: 'Filed reports', icon: 'Archive' },
  ] },
  { label: 'Produce reports', icon: 'CalendarDays', items: [
    { go: 'produce', href: '#/this-week', label: 'Federal filings', icon: 'CalendarDays' },
    { label: 'State filings', icon: 'FileSpreadsheet', real: 'open State filings: the Illinois monthly file and the Missouri weekly payroll record and completion affidavit for a job site.' },
  ] },
  { go: 'wd', href: '#/wage-determinations', label: 'Wage Determinations', icon: 'Scale' },
  { label: 'Learning Centre', icon: 'BookOpen', real: 'open the Learning Centre: short articles on prevailing wage, the WH-347 and the Statement of Compliance.' },
  { label: 'How-To', icon: 'MonitorPlay', real: 'open the How-To manual and its videos for every screen.' },
  { label: 'Settings', icon: 'Settings', isNew: true, items: [
    { label: 'General settings', icon: 'SlidersHorizontal', isNew: true, real: 'open the general settings for the tool.' },
    { label: 'User Management', icon: 'ShieldCheck', real: 'open user management, where an administrator sets who can see and change what.' },
    { label: 'Integrations', icon: 'Plug', real: 'open the integrations page, where the live payroll connection is set up.' },
  ] },
];
const activeGo = () => (S.route === 'client' ? 'clients' : S.route);

const ROW = 'group relative flex min-h-[44px] items-center gap-2.5 rounded-[9px] py-2 text-[0.86rem] transition-[background-color,color] duration-120 lg:[@media(pointer:fine)]:min-h-0 lg:[@media(pointer:fine)]:py-[7px] ';
const SELECTED = 'bg-rail-raised font-bold text-white shadow-[inset_0_0_0_1px_rgba(138,180,255,0.16)]';
const railRow = (active, iconOnly) => ROW + (iconOnly ? 'justify-center px-0 ' : 'px-3 ') + (active ? SELECTED : 'font-medium text-rail-text hover:bg-rail-hover hover:text-white');
const railGroupRow = (active, iconOnly) => ROW + 'w-full ' + (iconOnly ? 'justify-center px-0 ' : 'px-3 ') +
  (active && iconOnly ? SELECTED : active ? 'font-semibold text-white hover:bg-rail-hover' : 'font-medium text-rail-text hover:bg-rail-hover hover:text-white');
const railIcon = active => 'shrink-0 opacity-80 transition-colors duration-120 ' + (active ? 'text-white' : 'text-rail-icon group-hover:text-white');
const railChildRow = active => ROW + 'whitespace-nowrap pl-9 pr-3 ' + (active ? SELECTED : 'font-medium text-rail-text hover:bg-rail-hover hover:text-white');
const NEW = '<span aria-hidden="true" class="ml-1.5 shrink-0 rounded-full bg-brand px-1.5 py-[0.1rem] text-[0.62rem] font-bold leading-[1.4] text-white">New</span>';

function leaf(item, child, iconOnly) {
  const active = item.go && item.go === activeGo();
  const cls = child ? railChildRow(active) : railRow(active, iconOnly);
  const icon = ic(item.icon, child ? 16 : iconOnly ? 19 : 17, railIcon(active), child ? 2.2 : iconOnly ? 2 : 2.2);
  const label = iconOnly && !child ? '' : esc(item.label) + (item.isNew && !iconOnly ? NEW : '');
  const extra = iconOnly && !child ? ` title="${attr(item.label)}" aria-label="${attr(item.label)}"` : '';
  if (item.real) return `<button type="button" class="${cls} w-full text-left" data-real="${attr(REAL(item.real.charAt(0).toLowerCase() + item.real.slice(1)))}"${extra}>${icon}${label}</button>`;
  return `<a href="${item.href}" class="${cls}"${active ? ' aria-current="page"' : ''}${extra}>${icon}${label}</a>`;
}

function nav(iconOnly) {
  return `<div class="flex flex-col gap-0.5">${NAV.map(item => {
    if (!item.items) return leaf(item, false, iconOnly);
    const active = item.items.some(c => c.go && c.go === activeGo());
    const open = S.groups[item.label] ?? active;
    const newInside = !open && item.items.some(c => c.isNew);
    return `<div><button type="button" id="grp-${attr(item.label.replace(/\W/g, ''))}" data-act="group" data-k="${attr(item.label)}" class="${railGroupRow(active, iconOnly)}"${iconOnly ? ` title="${attr(item.label)}" aria-label="${attr(item.label)}"` : ` aria-expanded="${open}"`}>
      ${ic(item.icon, iconOnly ? 19 : 17, railIcon(active && iconOnly), iconOnly ? 2 : 2.2)}
      ${iconOnly ? '' : `<span>${esc(item.label)}</span>${newInside ? NEW : ''}${ic('ChevronDown', 15, `ml-auto shrink-0 text-rail-muted transition-transform duration-150 ${open ? '' : '-rotate-90'}`)}`}
    </button>${!iconOnly && open ? `<div role="group" aria-label="${attr(item.label)}" class="mt-0.5 flex flex-col gap-0.5">${item.items.map(c => leaf(c, true, false)).join('')}</div>` : ''}</div>`;
  }).join('')}</div>`;
}

// The light at the foot of the rail (components/RailGlow.tsx), decoration only.
const GLOW = `<svg aria-hidden="true" focusable="false" viewBox="0 0 256 340" preserveAspectRatio="xMaxYMax slice" class="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[340px] w-full select-none"><defs>
<linearGradient id="rg-a" x1="0" y1="1" x2="1" y2="0.2"><stop offset="0" stop-color="#2f6fed" stop-opacity="0.06"/><stop offset="0.45" stop-color="#2f6fed" stop-opacity="0.26"/><stop offset="1" stop-color="#5b95ff" stop-opacity="0.5"/></linearGradient>
<linearGradient id="rg-b" x1="0" y1="1" x2="1" y2="0.3"><stop offset="0" stop-color="#1d4ed8" stop-opacity="0.04"/><stop offset="0.55" stop-color="#2563eb" stop-opacity="0.2"/><stop offset="1" stop-color="#3b82f6" stop-opacity="0.38"/></linearGradient>
<linearGradient id="rg-w" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#1e40af" stop-opacity="0.16"/><stop offset="1" stop-color="#2f6fed" stop-opacity="0.22"/></linearGradient>
<linearGradient id="rg-l" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#8ab4ff" stop-opacity="0"/><stop offset="0.55" stop-color="#8ab4ff" stop-opacity="0.28"/><stop offset="1" stop-color="#b9d2ff" stop-opacity="0.55"/></linearGradient>
<radialGradient id="rg-g" cx="0.8" cy="0.55" r="0.85"><stop offset="0" stop-color="#3b82f6" stop-opacity="0.3"/><stop offset="1" stop-color="#3b82f6" stop-opacity="0"/></radialGradient>
<linearGradient id="rg-f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="0.35" stop-color="#fff" stop-opacity="1"/><stop offset="0.66" stop-color="#fff" stop-opacity="1"/><stop offset="0.8" stop-color="#fff" stop-opacity="0.2"/><stop offset="0.84" stop-color="#fff" stop-opacity="0"/></linearGradient>
<mask id="rg-m" maskUnits="userSpaceOnUse" x="0" y="0" width="256" height="340"><rect width="256" height="340" fill="url(#rg-f)"/></mask></defs>
<g mask="url(#rg-m)"><rect width="256" height="340" fill="url(#rg-g)"/>
<path d="M-30 360 C 40 320, 120 290, 190 245 C 230 220, 255 200, 290 175 L 290 360 Z" fill="url(#rg-w)"/>
<path d="M-30 330 C 40 290, 110 250, 180 195 C 215 168, 240 140, 290 95 L 290 150 C 240 190, 205 215, 170 238 C 100 283, 40 318, -30 360 Z" fill="url(#rg-a)"/>
<path d="M-30 285 C 50 250, 120 205, 190 150 C 225 122, 250 95, 290 55 L 290 82 C 250 118, 222 145, 188 170 C 118 222, 52 262, -30 302 Z" fill="url(#rg-b)"/>
<path d="M-20 300 C 55 262, 125 222, 190 172 C 228 143, 252 116, 286 80" fill="none" stroke="url(#rg-l)" stroke-width="1.1"/>
<path d="M-20 336 C 60 296, 130 256, 196 210 C 232 184, 256 160, 286 132" fill="none" stroke="url(#rg-l)" stroke-width="0.8"/>
<path d="M-20 262 C 70 230, 140 186, 200 136 C 236 106, 258 82, 286 50" fill="none" stroke="url(#rg-l)" stroke-width="0.6" stroke-opacity="0.7"/></g></svg>`;

// A neutral mark in place of the client's logo, with the product name beside it.
const MARK = `<span aria-hidden="true" class="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] bg-brand text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)]">${ic('FileCheck2', 16, '', 2.2)}</span>`;
const lockup = collapsed => collapsed
  ? `<span role="img" aria-label="Certified Payroll">${MARK}</span>`
  : `<div class="flex items-center gap-2.5">${MARK}<span class="text-[1.14rem] font-bold tracking-[-0.01em] text-white">Certified Payroll</span></div>`;

function rail() {
  const c = S.collapsed;
  return `<aside class="sticky top-0 hidden h-screen shrink-0 flex-col overflow-hidden lg:flex isolate bg-gradient-to-b from-rail to-rail-to text-rail-text font-rail ${c ? 'w-[72px]' : 'w-[264px]'}">
    ${GLOW}
    <div class="flex h-topbar shrink-0 items-center ${c ? 'justify-center' : 'px-6'}">${lockup(c)}</div>
    <div class="min-h-0 flex-1 overflow-y-auto px-3 py-3"><nav aria-label="Sections">${nav(c)}</nav></div>
    ${c ? '' : `<div class="flex shrink-0 items-center border-t border-rail-line py-3.5 pl-6 pr-3"><div class="flex flex-wrap items-center gap-x-3 gap-y-1">
      <button type="button" class="rounded-sm text-caption font-medium text-rail-muted transition-colors duration-120 hover:text-white" data-real="${attr(REAL('open the terms of use.'))}">Terms</button>
      <span aria-hidden="true" class="h-3 w-px bg-rail-line"></span>
      <button type="button" class="rounded-sm text-caption font-medium text-rail-muted transition-colors duration-120 hover:text-white" data-real="${attr(REAL('open the privacy notice.'))}">Privacy</button></div></div>`}
  </aside>`;
}

/* ---------- the top bar (TopBar.tsx, topBarStyles.ts) ---------- */
const TB_ICON = 'relative flex shrink-0 items-center justify-center rounded-control border border-line bg-surface text-ink-muted transition-colors duration-120 hover:border-brand hover:text-brand h-11 w-11 lg:h-9 lg:w-9';
function topbar() {
  return `<div class="sticky top-0 z-40"><div class="mx-auto max-w-[1600px] px-4 pt-4 sm:px-8">
  <header class="glass-frost flex items-center gap-2 rounded-card border border-line/80 px-2.5 py-2 shadow-bar sm:px-3">
    <button type="button" id="tb-collapse" data-act="collapse" aria-label="${S.collapsed ? 'Expand menu' : 'Collapse menu'}" aria-expanded="${!S.collapsed}" title="${S.collapsed ? 'Expand menu' : 'Collapse menu'}" class="${TB_ICON} hidden lg:flex">${ic('PanelLeft', 17)}</button>
    <button type="button" aria-haspopup="dialog" data-real="${attr(REAL('open search across clients, job sites, pages and help.'))}" class="group relative flex h-11 w-full min-w-0 items-center rounded-control border border-line bg-surface pl-9 pr-3 text-left text-[0.84rem] text-ink-subtle transition-colors duration-120 hover:border-brand lg:h-9 lg:pr-16 hidden max-w-xl flex-1 md:flex">
      ${ic('Search', 15, 'pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint group-hover:text-brand')}
      <span class="min-w-0 flex-1 truncate">Search clients, job sites, pages or help</span>
      <kbd class="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-md border border-line bg-subtle px-1.5 py-0.5 font-sans text-[0.68rem] font-semibold text-ink-subtle lg:block">⌘ K</kbd>
    </button>
    <div class="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
      <span title="Which copy of Certified Payroll you are in" class="hidden h-9 shrink-0 items-center gap-1.5 rounded-control border border-line bg-subtle/80 px-3 text-[0.74rem] font-semibold text-ink-muted xl:inline-flex"><span aria-hidden="true" class="h-2 w-2 rounded-full bg-warning-solid"></span>Sandbox</span>
      <span aria-hidden="true" class="mx-0.5 hidden h-6 w-px shrink-0 bg-line xl:block"></span>
      <button type="button" aria-label="Alerts: 2 to review" class="${TB_ICON}" data-real="${attr(REAL('open the alerts panel: wage determinations to check and anything else that needs a person.'))}">${ic('Bell', 17)}<span aria-hidden="true" class="absolute right-2 top-2 h-2 w-2 rounded-full bg-warning-solid ring-2 ring-surface lg:right-1.5 lg:top-1.5"></span></button>
      <span aria-hidden="true" class="mx-0.5 hidden h-6 w-px shrink-0 bg-line sm:block"></span>
      <button type="button" aria-label="Account menu: Local reviewer, Sandbox, Team demo" data-real="${attr(REAL('open the account menu: switch workspace, preview as view only, or sign out.'))}" class="flex h-11 shrink-0 items-center gap-2 rounded-control border border-line bg-surface pl-1.5 pr-1.5 text-left text-[0.8rem] font-semibold text-ink transition-colors duration-120 hover:border-brand hover:text-brand sm:pr-2.5 lg:h-9 lg:pl-1">
        <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] bg-brand text-[0.66rem] font-extrabold text-white">LR</span>
        <span class="min-w-0 leading-tight"><span class="hidden max-w-[140px] truncate text-[0.78rem] sm:block">Local reviewer</span>
          <span class="flex items-center gap-1 whitespace-nowrap text-[0.68rem] font-medium text-ink-subtle"><span aria-hidden="true" class="h-1.5 w-1.5 shrink-0 rounded-full bg-warning-solid"></span><span>Sandbox</span><span aria-hidden="true" class="hidden text-ink-faint sm:inline">·</span><span class="font-medium text-demo-fg">Team demo</span></span></span>
        ${ic('ChevronDown', 14, 'hidden shrink-0 text-ink-faint transition-transform duration-120 sm:block')}
      </button>
    </div>
  </header></div></div>`;
}

/* ---------- shared pieces (components/ui.tsx) ---------- */
const crumbs = trail => `<nav aria-label="Breadcrumb" class="flex min-w-0 items-center gap-2 -mt-3 mb-4 hidden md:flex"><ol class="flex min-w-0 items-center gap-1.5 text-body-sm">${trail.map((c, i) => `<li class="flex items-center gap-1.5 min-w-0 ${i === trail.length - 1 ? '' : 'shrink'}">${i ? ic('ChevronRight', 14, 'shrink-0 text-ink-faint') : ''}${
  i === trail.length - 1 ? `<span aria-current="page" class="truncate font-semibold text-ink">${esc(c.label)}</span>`
  : c.href ? `<a href="${c.href}" class="truncate rounded-sm font-medium text-ink-subtle transition-colors duration-120 hover:text-ink">${esc(c.label)}</a>`
  : `<span class="truncate font-medium text-ink-subtle">${esc(c.label)}</span>`}</li>`).join('')}</ol></nav>`;

const helpLink = what => `<button type="button" title="How this screen works" data-real="${attr(REAL(`open the How-To chapter on ${what}.`))}" class="inline-flex min-h-8 items-center gap-1.5 rounded-control border border-line-strong bg-surface px-3 py-1.5 text-body-sm font-medium coarse:min-h-11 text-ink-muted shadow-e1 transition-colors duration-120 hover:bg-subtle hover:text-ink">${ic('CircleHelp', 14)}How this screen works</button>`;

const hero = ({ title, sub, actions, eyebrow }) => `<div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div class="min-w-0">
  ${eyebrow ? `<div class="mb-2 flex items-center gap-2 text-label uppercase text-ink-subtle"><span aria-hidden="true" class="h-1.5 w-1.5 shrink-0 rounded-full bg-brand"></span>${eyebrow}</div>` : ''}
  <h1 class="text-page text-ink">${title}</h1>${sub ? `<p class="mt-2 text-body text-ink-muted">${sub}</p>` : ''}</div>
  ${actions ? `<div class="flex shrink-0 items-center gap-2 sm:pt-6">${actions}</div>` : ''}</div>`;

const DOT = { ok: 'bg-success-solid', warn: 'bg-warning-solid', bad: 'bg-critical-solid', info: 'bg-info-solid' };
const chip = (text, kind = 'info') => `<span class="inline-flex items-center gap-1.5 whitespace-nowrap text-caption font-medium text-ink-muted"><span aria-hidden="true" class="h-1.5 w-1.5 shrink-0 rounded-full ${DOT[kind]}"></span>${esc(text)}</span>`;
const card = (inner, cls = '') => `<div class="rounded-card bg-surface shadow-e4 ${cls}">${inner}</div>`;
const section = (title, count, action = '') => `<div class="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-1"><div class="min-w-0"><h2 class="flex items-center gap-2 text-section text-ink">${esc(title)}${count !== undefined ? `<span class="rounded-full bg-tile-slate px-2 py-0.5 text-caption font-semibold tabular-nums text-ink-muted">${count}</span>` : ''}</h2></div>${action ? `<div class="shrink-0 text-body-sm">${action}</div>` : ''}</div>`;
const ROWLINK = 'inline-flex min-h-8 items-center gap-1.5 rounded-sm text-body-sm coarse:min-h-11 font-semibold text-brand-dark transition-colors duration-120 hover:text-brand hover:underline';
const BTN_QUIET = 'inline-flex items-center justify-center whitespace-nowrap rounded-control font-semibold transition-colors duration-120 disabled:cursor-not-allowed disabled:opacity-50 min-h-10 gap-2 px-4 py-2 text-body-sm coarse:min-h-11 border border-line-strong bg-surface text-ink shadow-e1 hover:bg-subtle';
const BTN_PRIMARY = 'inline-flex items-center justify-center whitespace-nowrap rounded-control font-semibold transition-colors duration-120 disabled:cursor-not-allowed disabled:opacity-50 min-h-10 gap-2 px-4 py-2 text-body-sm coarse:min-h-11 bg-brand text-white shadow-e1 hover:bg-brand-dark';
const TILE = { blue: 'bg-tile-blue text-tile-blue-fg', cyan: 'bg-tile-cyan text-tile-cyan-fg', violet: 'bg-tile-violet text-tile-violet-fg', slate: 'bg-tile-slate text-tile-slate-fg' };

function metric({ href, label, value, detail, icon, accent, tone }) {
  const t = tone === 'warning' ? ['bg-warning-solid', 'text-warning-fg'] : tone === 'success' ? ['bg-success-solid', 'text-success-fg'] : null;
  const body = `<div class="flex h-full items-start gap-4 p-5"><span aria-hidden="true" class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${TILE[accent]}">${ic(icon, 20, '', 1.75)}</span>
    <div class="min-w-0 pt-0.5"><div class="text-body-sm font-medium text-ink-muted">${esc(label)}</div><div class="mt-1.5 text-metric tabular-nums text-ink">${esc(value)}</div>
    <div class="mt-1.5 flex items-center gap-1.5 text-caption text-ink-subtle">${t ? `<span aria-hidden="true" class="h-1.5 w-1.5 shrink-0 rounded-full ${t[0]}"></span>` : ''}<span class="${t ? t[1] : ''}">${esc(detail)}</span></div></div></div>`;
  const cls = 'block rounded-card bg-surface shadow-e4 transition-shadow duration-120 hover:shadow-lift text-left';
  return href.startsWith('#') ? `<a href="${href}" class="${cls}" aria-label="${attr(label + ': ' + value)}">${body}</a>`
    : `<button type="button" class="${cls}" data-real="${attr(REAL(href))}" aria-label="${attr(label + ': ' + value)}">${body}</button>`;
}

/* ---------- Dashboard (DashboardPage.tsx) ---------- */
function dashboard() {
  const all = CLIENTS, rdy = all.filter(ready), att = all.filter(c => !ready(c));
  const month = TODAY.slice(0, 7);
  const reportsThisMonth = jobs().reduce((n, j) => n + j.p.reports.filter(r => r.at.startsWith(month)).length, 0);
  const connected = all.filter(c => c.paycorConnected).length;
  const walk = `<section aria-label="Walkthrough" class="mb-6 flex flex-col gap-4 rounded-card border border-line bg-gradient-to-r from-brand-softer to-surface p-4 shadow-e2 sm:flex-row sm:items-center sm:p-5">
    <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-brand text-white">${ic('Compass', 22)}</span>
    <div class="min-w-0 flex-1"><h2 class="text-[1rem] font-bold text-ink">New here? Take the walkthrough</h2>
      <p class="mt-0.5 text-[0.85rem] text-ink-muted">A step-by-step walk through every screen you can use, and what to check before a report goes out: 12 chapters, about 27 minutes. It only opens and closes things, never saves or files.</p>
      <div class="mt-2 h-1.5 max-w-sm overflow-hidden rounded-full bg-surface ring-1 ring-line" aria-hidden="true"><div class="h-full w-0 rounded-full bg-brand"></div></div></div>
    <div class="flex flex-wrap items-center gap-2">
      <button type="button" aria-label="Walk through one area" data-real="${attr(REAL('list the 12 walkthrough chapters so you can walk through one area only.'))}" class="flex h-11 w-40 items-center gap-2 rounded-control border border-line bg-surface pl-3 pr-2.5 text-left text-[1rem] text-ink shadow-e1 outline-none transition-colors duration-120 hover:border-brand lg:text-body-sm"><span class="min-w-0 flex-1 truncate font-medium">One area</span>${ic('ChevronDown', 16, 'shrink-0 text-ink-subtle')}</button>
      <button type="button" data-real="${attr(REAL('start the guided walkthrough: it opens each screen in turn and explains what to check, without saving or filing anything.'))}" class="inline-flex h-10 items-center gap-1.5 rounded-control bg-brand px-4 text-[0.88rem] font-semibold text-white shadow-e2 hover:bg-brand-dark">${ic('Play', 15)} Start the walkthrough</button>
    </div></section>`;

  const metrics = `<section aria-label="Key numbers" class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
    ${metric({ href: '#/clients', label: 'Ready to file', value: `${rdy.length} of ${all.length}`, detail: att.length ? `${att.length} still in setup` : 'every client is set up', icon: 'FileText', accent: 'blue', tone: att.length ? 'warning' : 'success' })}
    ${metric({ href: '#/this-week', label: 'Sheets in the inbox', value: '0', detail: 'sent through the portal, last 14 days', icon: 'Mail', accent: 'cyan' })}
    ${metric({ href: '#/reports', label: 'Reports this month', value: String(reportsThisMonth), detail: 'produced by the tool', icon: 'BarChart3', accent: 'violet' })}
    ${metric({ href: 'open Integrations, where the live payroll connection for each client is set up.', label: 'Paycor connected', value: `${connected} of ${all.length}`, detail: 'live pay figures available', icon: 'Plug', accent: 'slate', tone: 'success' })}
  </section>`;

  const wd = `<section>${section('Wage Determinations to check', WD_ALERTS.length)}<div class="rounded-card bg-surface shadow-e4 divide-y divide-line">${WD_ALERTS.map((a, i) => {
    const c = client(a.client), open = S.review.has(i);
    return `<div><div class="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3"><div class="min-w-0 flex-1"><p class="text-body font-semibold text-ink">${esc(c.name)}</p><p class="mt-0.5 text-body-sm text-ink-subtle">${esc(a.headline)}</p></div>
      <button type="button" id="rev-${i}" data-act="review" data-k="${i}" aria-expanded="${open}" class="inline-flex items-center gap-1 text-body-sm font-semibold text-brand transition-colors duration-120 hover:text-brand-dark hover:underline">${open ? 'Hide the email' : 'Review the email'}${ic('ArrowRight', 13)}</button></div>
      ${open ? `<div class="border-t border-line bg-subtle px-4 py-3">
        <ul class="list-disc space-y-0.5 pl-5 text-caption leading-relaxed text-gray-600">${a.reasons.map(r => `<li>${esc(r)}</li>`).join('')}${a.review.length ? `<li>Classifications to review: <span class="font-semibold text-ink">${esc(a.review.join(', '))}</span></li>` : ''}</ul>
        <button type="button" data-real="${attr(REAL('open this determination on SAM.gov in a new tab.'))}" class="mt-2 inline-flex items-center gap-1 text-caption font-semibold text-brand hover:underline">Check it on SAM.gov ${ic('ExternalLink', 11)}</button>
        <div class="mt-3 overflow-hidden rounded-xl border border-line bg-white">
          <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-gray-100 px-4 py-2"><div class="text-label uppercase text-gray-500">Read this before it goes</div>
            <button type="button" data-act="review" data-k="${i}" class="inline-flex items-center gap-1 text-caption font-semibold text-gray-500 transition-colors hover:text-brand">${ic('X', 13)} Close</button></div>
          <dl class="divide-y divide-gray-100 text-body-sm"><div class="flex gap-3 px-4 py-2"><dt class="w-16 shrink-0 font-semibold text-gray-500">To</dt><dd class="min-w-0 flex-1 text-ink">${esc(a.to.join(', '))}</dd></div>
            <div class="flex gap-3 px-4 py-2"><dt class="w-16 shrink-0 font-semibold text-gray-500">Subject</dt><dd class="min-w-0 flex-1 font-semibold text-ink">${esc(a.subject)}</dd></div></dl>
          <div class="border-y border-gray-100 bg-white px-6 py-5 text-body-sm leading-relaxed text-ink">${a.body.map(p => `<p class="mb-3 last:mb-0">${esc(p)}</p>`).join('')}</div>
          <div class="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2.5">
            <button type="button" data-real="${attr(REAL(`send this email to ${a.to.join(' and ')}, and record that it went.`))}" class="inline-flex min-h-8 items-center gap-1.5 rounded-control bg-brand coarse:min-h-11 px-3 py-1.5 text-body-sm font-semibold text-white shadow-e1 transition-colors duration-120 hover:bg-brand-dark">${ic('Send', 13)} Send it to ${a.to.length === 1 ? esc(a.to[0]) : `${a.to.length} people`}</button>
            <button type="button" data-act="review" data-k="${i}" class="text-body-sm font-semibold text-gray-500 transition-colors hover:text-brand">Not yet</button></div>
        </div></div>` : ''}</div>`;
  }).join('')}</div></section>`;

  const attention = `<section>${section('Needs attention', att.length || undefined, `<a href="#/clients" class="${ROWLINK}">View all clients ${ic('ArrowRight', 16)}</a>`)}
    <div class="overflow-hidden rounded-card bg-surface shadow-e4"><ul aria-label="Clients that need attention" class="divide-y divide-line">${att.map(c => `<li class="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3 transition-colors duration-120 hover:bg-muted/50">
      <span aria-hidden="true" class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-tile-slate text-tile-slate-fg">${ic('Building2', 18, '', 1.75)}</span>
      <div class="min-w-0 flex-1"><div class="text-body font-semibold text-ink">${esc(c.name)}</div><div class="mt-0.5">${chip(`${c.missing.length} details missing`, 'warn')}</div></div>
      <div class="basis-full pl-[52px] sm:basis-auto sm:shrink-0 sm:pl-0"><a href="#/clients/${c.key}/sites" class="${ROWLINK}">${c.projects.length ? 'Fill in the company details' : 'Add a job site'} ${ic('ArrowRight', 16)}</a></div></li>`).join('')}</ul></div></section>`;

  const quiet = `<section>${section('Weeks to confirm')}<div class="rounded-card bg-surface shadow-e4 overflow-hidden p-0">
    <div class="flex items-start gap-3 border-b border-line px-4 py-3">${ic('CalendarOff', 16, 'mt-0.5 shrink-0 text-ink-subtle')}<p class="text-body-sm text-ink-muted">No payroll ran for these clients in these weeks, and no report has been filed. Nothing is filed from here: open the job to confirm.</p></div>
    <ul class="divide-y divide-line">${WEEKS_TO_CONFIRM.map(w => `<li class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4 py-3"><div class="min-w-0"><span class="font-medium text-ink">${esc(w.job)}</span> <span class="text-body-sm text-ink-subtle">${esc(w.client)}</span><p class="mt-0.5 text-body-sm text-ink-muted">Week ending ${w.week}. A WH-347 is owed for every week of the job, worked or not.</p></div>
      <a href="#/this-week" data-pick="copperleaf|library" class="shrink-0 text-body-sm font-semibold text-brand transition-colors duration-120 hover:text-brand-dark hover:underline">Open the job</a></li>`).join('')}</ul></div></section>`;

  const week = `<section>${section('This week', jobs().length)}<div class="rounded-card bg-surface shadow-e4 divide-y divide-line">${jobs().map(({ c, p }) => {
    const last = p.reports[0];
    const due = last ? ` · due ${short(addDays(last.week, c.pay_offset + 7))}` : '';
    return `<div class="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3"><div class="min-w-0 flex-1"><p class="text-body font-semibold text-ink">${esc(c.name)} <span class="font-normal text-ink-subtle">/</span> ${esc(p.name)}</p>
      <p class="mt-0.5 text-body-sm text-ink-subtle">${last ? `Last: No. ${last.n}, week ending ${short(last.week)}${due}` : 'No reports yet'}</p></div>
      <a href="#/this-week" data-pick="${c.key}|${p.key}" class="${ROWLINK}">Produce ${ic('ArrowRight', 14)}</a></div>`;
  }).join('')}</div></section>`;

  const recent = jobs().flatMap(j => j.p.reports.map(r => ({ j, r }))).sort((a, b) => b.r.at.localeCompare(a.r.at) || b.r.week.localeCompare(a.r.week)).slice(0, 5);
  const rec = `<section>${section('Recent reports', undefined, `<a href="#/reports" class="${ROWLINK}">All filed reports ${ic('ArrowRight', 14)}</a>`)}<div class="rounded-card bg-surface shadow-e4 divide-y divide-line">${recent.map(({ j, r }) => `<div class="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-body-sm"><span class="font-semibold tabular-nums text-ink">No. ${r.n}</span><span class="min-w-0 text-ink-muted">${esc(j.c.name)} / ${esc(j.p.name)}</span><span class="ml-auto text-ink-subtle">week ending ${short(r.week)}${r.noWork ? ', no work' : ''}</span></div>`).join('')}</div></section>`;

  return hero({ title: 'Where things stand', sub: 'Every client that needs certified payroll, what is still needed, and what is due. Nothing here is a form; each line links to the page where the work happens.', actions: helpLink('what this tool does'), eyebrow: `<time datetime="${TODAY}">${TODAY_LABEL}</time>` })
    + walk + `<div class="flex flex-col gap-8">${metrics}${wd}${attention}${quiet}${week}${rec}</div>`;
}

/* ---------- Clients list (Setup.tsx) ---------- */
function clients() {
  return crumbs([{ label: 'Accounts' }, { label: 'Clients' }])
    + hero({ title: 'Clients that need certified payroll', sub: 'The register: every client, its job sites, and what each still needs before a report can be filed.', actions: helpLink('setting up a client') })
    + `<div class="space-y-4"><div class="flex flex-wrap items-center justify-between gap-x-8 gap-y-2">
      <p class="min-w-0 flex-1 text-body-sm leading-snug text-gray-600">Every client the tool can produce for. Open a client to see what is still needed, its job sites, rates and report history, and to change any of it.</p>
      <button type="button" data-real="${attr(REAL('open the new client wizard: company details, the first job site and its contract, step by step.'))}" class="inline-flex items-center justify-center whitespace-nowrap rounded-control bg-brand px-5 py-2 text-body font-semibold text-white shadow-e2 transition-[transform,background-color,box-shadow] duration-180 ease-spring hover:-translate-y-px hover:bg-brand-dark hover:shadow-e4 active:scale-[0.97]">${ic('Plus', 15, 'mr-1')} Add a client</button></div>
    <div class="rounded-card bg-surface shadow-e4 overflow-hidden p-0">${CLIENTS.map(c => {
      const gaps = c.missing.length + c.projects.reduce((n, p) => n + p.missing.length, 0);
      return `<a href="#/clients/${c.key}" class="flex w-full flex-wrap items-center gap-x-2 gap-y-1 border-b border-line px-5 py-3.5 transition-colors duration-120 last:border-b-0 hover:bg-brand-softer focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand">
        <span class="min-w-0 truncate text-[0.92rem] font-semibold text-ink">${esc(c.name)}</span>
        ${c.details_confirmed ? chip('Confirmed', 'ok') : chip('Details unconfirmed', 'warn')}
        ${gaps ? chip(gaps === 1 ? '1 to-do' : `${gaps} to-dos`, 'warn') : chip('Ready', 'ok')}
        <span class="ml-auto shrink-0 text-caption text-gray-500">${c.projects.length} job site${c.projects.length === 1 ? '' : 's'}</span>
        ${ic('ChevronRight', 16, 'shrink-0 text-gray-300')}</a>`;
    }).join('')}</div></div>`;
}

/* ---------- Client page (ClientDetailPage.tsx) ---------- */
const TABS = [['overview', 'Overview'], ['sites', 'Job sites'], ['employees', 'Employees'], ['rates', 'Rates'], ['history', 'Reports']];
const dlRow = (label, value, good) => `<div class="flex flex-col gap-0.5 sm:flex-row sm:gap-3"><dt class="w-44 shrink-0 text-caption font-medium text-gray-500">${esc(label)}</dt><dd class="text-body-sm text-ink">${
  value ? esc(value) : good ? `<span class="inline-flex items-center gap-1 text-success-ink">${ic('Check', 14)} ${esc(good)}</span>` : '<span class="text-ink-subtle">not set</span>'}</dd></div>`;
const quiet = (label, icon, real) => `<button type="button" class="${BTN_QUIET}" data-real="${attr(REAL(real))}">${ic(icon, 14, 'mr-1')} ${esc(label)}</button>`;

function steps(c) {
  const p = c.projects[0], hasReport = c.projects.some(x => x.reports.length);
  return [
    { label: 'Add the client', done: true },
    { label: 'Add the job site and its contract details', done: Boolean(p) && !p.missing.length, tab: 'sites', detail: p ? '' : 'No job site on this client yet.' },
    { label: 'Fill in the company details the form prints', done: !c.missing.length, tab: 'overview', detail: c.missing.length ? `Still needed: ${c.missing.join(', ')}.` : '' },
    { label: 'Confirm the details in writing', done: c.details_confirmed && Boolean(p?.confirmed), tab: 'overview', detail: 'Records who confirmed the contract details, and when. A form is not filed on unconfirmed data.' },
    { label: 'Produce the first report', done: hasReport, detail: 'Send the hours sheet, then bring it back to produce the form.' },
  ];
}

function checklist(c) {
  const st = steps(c), done = st.filter(s => s.done).length, total = st.length;
  if (done === total) return '';
  const pct = Math.round(done / total * 100);
  const lead = done === 0 ? 'A few details and this job is ready to file.' : done >= total - 1 ? 'Almost there. One more and this job is ready to file.' : 'Good progress. A few details still to go.';
  return card(`<div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1"><h3 class="text-[0.95rem] font-bold text-ink">Setting up this client</h3><span class="text-caption font-medium tabular-nums text-gray-500">${done} of ${total} complete</span></div>
    <p class="mt-1 text-body-sm text-gray-600">${lead}</p>
    <div class="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-100" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="${done} of ${total} setup steps complete"><div class="h-full rounded-full bg-brand" style="width:${pct}%"></div></div>
    <ol class="mt-4 flex flex-col gap-2.5">${st.map(s => `<li class="flex items-start gap-2.5"><span aria-hidden="true" class="mt-[3px] flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border ${s.done ? 'border-brand bg-brand text-white' : 'border-gray-300 bg-white'}">${s.done ? ic('Check', 12, '', 3) : ''}</span>
      <div class="min-w-0">${s.done ? `<span class="text-body-sm text-ink-subtle line-through">${esc(s.label)}</span>` : s.tab ? `<a href="#/clients/${c.key}/${s.tab}" class="text-body-sm font-semibold text-brand hover:underline">${esc(s.label)}</a>` : `<span class="text-body-sm font-semibold text-ink">${esc(s.label)}</span>`}
      ${!s.done && s.detail ? `<p class="mt-0.5 text-caption leading-snug text-gray-600">${esc(s.detail)}</p>` : ''}</div></li>`).join('')}</ol>
    <p class="mt-4 border-t border-gray-200 pt-3 text-caption leading-snug text-gray-500">Anything still missing prints blank on the sheet and on the form.</p>`, 'p-5');
}

function historyList(c, p) {
  if (!p.reports.length) return '<p class="mt-3 text-body-sm text-gray-600">No reports have been recorded for this job site yet.</p>';
  return `<div class="mt-3"><div class="divide-y divide-line rounded-xl border border-line bg-white">${p.reports.map(r => `<div class="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5 text-body-sm">
    <span class="font-bold text-ink">Report No. ${r.n}</span><span class="text-gray-600">Week ending ${r.week}</span>
    ${r.noWork ? '<span class="rounded-full bg-gray-100 px-2 py-0.5 text-label uppercase text-gray-600">No work</span>' : ''}
    <span class="ml-auto text-caption text-ink-subtle">recorded ${r.at}</span>
    <button type="button" title="The form as it was produced for this week" data-real="${attr(REAL(`rebuild Report No. ${r.n} for ${p.name} exactly as it was produced and download it as a PDF.`))}" class="inline-flex items-center gap-1 rounded-lg border border-line bg-white px-2 py-1 text-caption font-semibold text-ink hover:border-brand hover:text-brand">${ic('Download', 12)} Download PDF</button></div>`).join('')}</div></div>`;
}

function clientPage() {
  const c = client(S.client);
  if (!c) return card(`<p class="text-body font-semibold text-ink">No client with that address.</p><p class="mt-1 text-body-sm text-gray-600"><a href="#/clients" class="font-semibold text-brand hover:underline">Back to all clients</a>.</p>`, 'p-5');
  const gaps = c.missing.length + c.projects.reduce((n, p) => n + p.missing.length, 0);
  const next = steps(c).find(s => !s.done);
  const head = `${crumbs([{ label: 'Accounts' }, { label: 'Clients', href: '#/clients' }, { label: c.name }])}
    <a href="#/clients" class="mb-3 inline-flex items-center gap-1 text-body-sm font-semibold text-brand-dark hover:underline">${ic('ArrowLeft', 14)} All clients</a>
    <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div class="min-w-0">
      <div class="flex flex-wrap items-center gap-x-3 gap-y-1"><h1 class="text-page text-ink">${esc(c.name)}</h1>${c.details_confirmed ? chip('Confirmed', 'ok') : chip('Details unconfirmed', 'warn')}${gaps ? chip(`${gaps} to-dos`, 'warn') : chip('Ready', 'ok')}</div>
      <p class="mt-1 text-body text-ink-muted">${next ? `<span class="font-semibold text-ink">Next:</span> ${next.tab ? `<a href="#/clients/${c.key}/${next.tab}" class="font-semibold text-brand-dark hover:underline">${esc(next.label)}</a>` : esc(next.label)}` : '<span class="text-success-fg">Set up and confirmed. Nothing outstanding.</span>'}</p>
    </div><div class="flex shrink-0 items-center gap-2">${helpLink('setting up a client')}</div></div>
    <div role="tablist" aria-label="Client sections" class="flex max-w-full gap-1 overflow-x-auto px-1 pt-1 shadow-[inset_0_-1px_0_#e4e8ee] mb-5">${TABS.map(([k, l]) => {
      const sel = S.tab === k;
      return `<button type="button" role="tab" id="tab-${k}" aria-selected="${sel}" tabindex="${sel ? 0 : -1}" data-act="tab" data-k="${k}" class="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-t-control border-b-2 px-3 pb-2.5 pt-1.5 text-body-sm coarse:min-h-11 font-semibold transition-colors duration-120 ${sel ? 'border-brand text-brand-dark' : 'border-transparent text-ink-muted hover:text-ink'}">${l}${k === 'sites' ? ` (${c.projects.length})` : ''}</button>`;
    }).join('')}</div>`;

  let body = '';
  if (S.tab === 'overview') {
    body = `<div class="flex flex-col gap-4">${checklist(c)}${card(`<div class="flex flex-wrap items-center justify-between gap-2"><h2 class="text-label uppercase text-gray-500">Client details</h2><div class="flex flex-wrap gap-2">
      ${quiet('Edit details', 'Pencil', 'open the editor for the company details the form prints, and withdraw the written confirmation until someone confirms again.')}
      ${quiet('Upload contract', 'FileText', 'read an uploaded contract and propose the details it finds, each with the line it came from, for a person to approve.')}
      ${quiet('Delete', 'Trash2', 'delete this client after you type its name to confirm. A client that has produced a report can only be retired.')}
      <button type="button" class="${BTN_QUIET}" data-real="${attr(REAL('retire this client: nothing is deleted, and it stops being offered for new reports.'))}">Retire client</button></div></div>
      <dl class="mt-3 grid gap-2">${dlRow('Legal name', c.legal_name)}${dlRow('Address', c.address)}${dlRow('FEIN', c.fein)}${dlRow('Day-to-day contact', c.designated)}${dlRow('Backup contact', c.backup)}${dlRow('Signs the Statement of Compliance', c.certifying)}${dlRow('Workweek starts', c.week_start)}${dlRow('Days from week end to pay date', c.pay_offset == null ? '' : String(c.pay_offset))}${dlRow('Paycor legal entity', c.paycor)}${dlRow('Confirmed in writing', c.confirmed)}</dl>`, 'p-5')}</div>`;
  } else if (S.tab === 'sites') {
    body = `<div class="flex flex-col gap-3"><div class="flex flex-wrap items-center gap-2">${quiet('Add a job site', 'Plus', 'add a job site with its location, contract number and wage determination.')}</div>
      ${c.projects.length ? `<div class="rounded-card bg-surface shadow-e4 overflow-hidden p-0">${c.projects.map(p => {
        const k = c.key + '|' + p.key, open = S.siteOpen.has(k);
        return `<div class="border-b border-line last:border-b-0 ${open ? 'bg-gray-50/70' : ''}"><button type="button" id="site-${p.key}" data-act="site" data-k="${k}" aria-expanded="${open}" class="flex w-full flex-wrap items-center gap-x-2 gap-y-1 px-4 py-2.5 text-left transition-colors hover:bg-gray-50">
          ${ic('ChevronRight', 15, 'shrink-0 text-gray-400 transition-transform ' + (open ? 'rotate-90' : ''))}<span class="text-body font-semibold text-ink">${esc(p.name)}</span>
          ${p.confirmed ? chip('Confirmed', 'ok') : chip('Unconfirmed', 'warn')}${chip(p.state)}${chip(p.funding + ' funded')}
          <span class="ml-auto shrink-0 text-caption text-gray-500">Next report No. ${p.next}</span></button>
          <div ${open ? '' : 'hidden'}><div class="flex items-start gap-4 border-t border-line bg-white px-4 py-3"><div class="min-w-0 flex-1"><dl class="grid gap-1">${dlRow('Location', p.location)}${dlRow('Contract number', p.contract)}${dlRow('Wage Determination', p.wd, p.wdNotNeeded ? 'Not needed: state-funded job, the annual wage order below applies' : '')}${p.state === 'MO' ? dlRow('Annual wage order', p.awo) : ''}</dl></div>
          ${quiet('Edit', 'Pencil', `open the editor for ${p.name}: location, contract, wage determination and funding.`)}</div></div></div>`;
      }).join('')}</div>` : card(`<p class="text-body font-semibold text-ink">No job sites yet.</p><p class="mt-1 text-body-sm text-gray-600">Every certified payroll form is filed per job site. Add the first one to give this client somewhere to file for.</p>`, 'p-5')}</div>`;
  } else if (S.tab === 'employees') {
    const ws = S.workers[c.key];
    const INPUT = 'w-full rounded-control border border-line bg-white px-3 py-2 text-body-sm text-ink shadow-e1 focus:border-brand focus:outline-none disabled:bg-gray-50';
    const LABEL = 'text-caption font-medium text-gray-700';
    const trades = [...new Set(c.projects.flatMap(p => p.rates.map(r => r.classification)))];
    body = `<div class="flex flex-col gap-4">${card(`<div class="flex flex-wrap items-start justify-between gap-x-6 gap-y-2"><div class="min-w-0"><h2 class="text-[1rem] font-extrabold text-ink">Employees</h2>
      <p class="mt-1 max-w-[46rem] text-body-sm leading-snug text-gray-600">Everyone who works for this client. The weekly hours sheet arrives with their name, trade, rate and the last four already filled in, so nobody retypes them. Add someone once and every sheet from then on carries them.</p></div>
      <button type="button" class="${BTN_PRIMARY}" data-real="${attr(REAL('save these employees to the client, so the next hours sheet goes out with them filled in.'))}">${ic('Save', 15, 'mr-1.5')} Save employees</button></div>
      ${ws.length ? `<div class="mt-4 divide-y divide-line overflow-hidden rounded-xl border border-line">${ws.map((w, i) => {
        const open = S.empOpen.has(c.key + i), id = `e-${c.key}-${i}`;
        return `<div class="${open ? 'bg-gray-50/70' : ''}"><button type="button" id="${id}" data-act="emp" data-k="${c.key + i}" aria-expanded="${open}" class="flex w-full flex-wrap items-center gap-x-3 gap-y-1 px-3.5 py-2.5 text-left transition-colors hover:bg-gray-50">
          ${ic('ChevronRight', 15, 'shrink-0 text-gray-400 transition-transform ' + (open ? 'rotate-90' : ''))}<span class="text-body font-semibold text-ink">${esc(`${w.first} ${w.last}`.trim() || `Person ${i + 1}`)}</span>
          <span class="text-body-sm text-gray-600">${esc(w.trade)}</span><span class="tnum ml-auto text-body-sm text-gray-600">${w.rate === '' ? 'no rate' : `$${esc(w.rate)}/hr`}</span></button>
          <div ${open ? '' : 'hidden'} class="border-t border-line bg-white p-3.5"><div class="grid grid-cols-1 gap-3 sm:grid-cols-4">
            ${[['first', 'First name'], ['middle', 'Middle'], ['last', 'Last name'], ['last4', 'Last 4 of SSN']].map(([f, l]) => `<label class="${LABEL}"><span class="mb-1 block">${l}</span><input id="${id}-${f}" class="${INPUT}" data-emp="${c.key}|${i}|${f}" value="${attr(w[f])}"${f === 'last4' ? ' inputmode="numeric" maxlength="4" placeholder="0000"' : ''}></label>`).join('')}</div>
            <div class="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3"><label class="${LABEL}"><span class="mb-1 block">Classification</span><select id="${id}-trade" class="${INPUT}" data-emp="${c.key}|${i}|trade">${trades.map(t => `<option${t === w.trade ? ' selected' : ''}>${esc(t)}</option>`).join('')}</select></label>
            <label class="${LABEL}"><span class="mb-1 block">Hourly rate</span><input id="${id}-rate" class="${INPUT}" inputmode="decimal" data-emp="${c.key}|${i}|rate" value="${attr(w.rate)}"></label></div></div></div>`;
      }).join('')}</div>` : `<div class="mt-4 rounded-xl border border-dashed border-line px-4 py-6 text-center"><p class="text-body-sm text-gray-600">Nobody on file yet. Until somebody is here, the hours sheet goes out with an empty grid and the client types every name themselves, every week.</p></div>`}`, 'p-5')}</div>`;
  } else if (S.tab === 'rates') {
    body = `<div class="flex flex-col gap-3"><p class="text-body-sm leading-snug text-gray-600">The classification library: the prevailing rate for each trade on each job site, as supplied by the client from their contract. The tool judges every worker's pay against these; it does not look rates up itself.</p>
      ${c.projects.length ? `<div class="rounded-card bg-surface shadow-e4 overflow-hidden p-0">${c.projects.map(p => {
        const k = c.key + '|' + p.key, open = S.rateOpen.has(k), n = p.rates.length;
        return `<div class="border-b border-line last:border-b-0 ${open ? 'bg-gray-50/70' : ''}"><button type="button" id="rate-${p.key}" data-act="rate" data-k="${k}" aria-expanded="${open}" class="flex w-full flex-wrap items-center gap-x-2 gap-y-1 px-4 py-2.5 text-left transition-colors hover:bg-gray-50">
          ${ic('ChevronRight', 15, 'shrink-0 text-gray-400 transition-transform ' + (open ? 'rotate-90' : ''))}<span class="text-body font-semibold text-ink">${esc(p.name)}</span>
          ${p.wd ? chip('WD ' + p.wd) : chip('No federal WD needed', 'ok')}<span class="ml-auto shrink-0 text-body-sm text-gray-600">${n} ${n === 1 ? 'trade' : 'trades'} priced</span></button>
          <div ${open ? '' : 'hidden'}><div class="border-t border-line bg-white px-4 py-3"><div class="mb-2 flex justify-end">${quiet('Edit rates', 'Pencil', `open the rate editor for ${p.name}, one row per classification from the contract.`)}</div>
            <div class="overflow-x-auto"><table class="w-full min-w-[28rem] text-body-sm"><thead><tr class="text-left text-label uppercase text-gray-500"><th class="pb-1 pr-3">Classification</th><th class="pb-1 pr-3 text-right">Base</th><th class="pb-1 pr-3 text-right">Fringe</th><th class="pb-1 text-right">Total</th></tr></thead>
            <tbody>${p.rates.map(r => `<tr class="border-t border-gray-100"><td class="py-1.5 pr-3 text-ink">${esc(r.classification)}</td><td class="py-1.5 pr-3 text-right tabular-nums">${r.base_rate.toFixed(2)}</td><td class="py-1.5 pr-3 text-right tabular-nums">${r.fringe_rate.toFixed(2)}</td><td class="py-1.5 text-right font-semibold tabular-nums">${(r.base_rate + r.fringe_rate).toFixed(2)}</td></tr>`).join('')}</tbody></table></div></div></div></div>`;
      }).join('')}</div>` : card('<p class="text-body-sm text-gray-600">No job sites yet, so no rates.</p>', 'p-5')}</div>`;
  } else {
    body = `<div class="flex flex-col gap-4"><p class="text-body-sm leading-snug text-gray-600">Every report the tool has produced for this client, by job site. To correct a report or fill a gap in the numbering, open <a href="#/this-week" data-pick="${c.projects[0] ? c.key + '|' + c.projects[0].key : ''}" class="font-semibold text-brand hover:underline">Produce reports</a>.</p>
      ${c.projects.length ? c.projects.map(p => `<section><h2 class="mb-2 text-label uppercase text-gray-500">${esc(p.name)}</h2>${historyList(c, p)}</section>`).join('') : card('<p class="text-body-sm text-gray-600">No job sites yet, so no history.</p>', 'p-4')}</div>`;
  }
  return head + body;
}

/* ---------- Filed reports (FiledReportsPage.tsx) ---------- */
function filed() {
  const [ck, pk] = S.filed.split('|'), c = client(ck), p = c?.projects.find(x => x.key === pk);
  return crumbs([{ label: 'Accounts' }, { label: 'Filed reports' }])
    + hero({ title: 'Filed reports', sub: 'Every report the tool has produced, by job site. Numbers, weeks, and which row stands for each number.', actions: helpLink('report numbers, corrections and no-work weeks') })
    + card(`<label for="filed-sel" class="mb-1 block text-label uppercase text-gray-500">Client and job site</label>
      <select id="filed-sel" data-act-change="filed" class="mt-2 w-full max-w-[34rem] rounded-control border border-line bg-white px-3 py-2.5 text-body font-medium text-ink shadow-e1 focus:border-brand focus:outline-none">
        <option value="">Select a client and job site...</option>
        ${CLIENTS.filter(x => x.projects.length).map(x => `<optgroup label="${attr(x.name)}">${x.projects.map(y => `<option value="${x.key}|${y.key}"${S.filed === x.key + '|' + y.key ? ' selected' : ''}>${esc(x.name)} - ${esc(y.name)}</option>`).join('')}</optgroup>`).join('')}
      </select>
      ${p ? `<p class="mt-3 text-body-sm text-gray-600">To correct a report or fill a gap in the numbering, open <a href="#/this-week" data-pick="${S.filed}" class="font-semibold text-brand hover:underline">Produce reports</a> for this job. The archive here is read-only.</p>` : ''}`, 'p-5')
    + (p ? `<div class="mt-5">${historyList(c, p)}</div>` : '');
}

/* ---------- Federal filings (CertifiedPayrollPage.tsx, produce) ---------- */
const stepHead = (n, title, intro) => `<div class="mb-3 flex items-start gap-3"><span aria-hidden="true" class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-body font-extrabold text-white">${n}</span>
  <div class="min-w-0 flex-1"><h2 class="text-[1.05rem] font-extrabold tracking-tight text-ink"><span class="sr-only">Step ${n}: </span>${esc(title)}</h2><p class="mt-0.5 text-body-sm leading-relaxed text-gray-600">${esc(intro)}</p></div></div>`;
const STEP_BTN = 'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line coarse:h-11 coarse:w-11 bg-white text-gray-600 transition-colors duration-120 hover:border-brand hover:text-brand';

function produce() {
  const owes = jobs().filter(j => j.p.federal !== 'No');
  const sel = owes.find(j => `${j.c.key}|${j.p.key}` === S.pSel);
  const q = S.pQ.trim().toLowerCase();
  const shown = owes.filter(j => !q || (j.c.name + ' ' + j.p.name).toLowerCase().includes(q));
  const start = addDays(WEEK0, -7 * S.pBack), end = addDays(start, 7 * S.pWeeks - 1);
  const range = `${dayLabel(start)} to ${dayLabel(end)}`;
  const back = S.pBack;
  const plabel = back === 0 ? (S.pWeeks === 2 ? 'This period, in progress' : 'This week, in progress') : back === 1 ? (S.pWeeks === 2 ? 'Last two weeks' : 'Last week') : back < 0 ? (back === -1 ? `Next ${S.pWeeks === 2 ? 'two weeks' : 'week'}, not started yet` : `${-back} weeks ahead, not started yet`) : `${back} weeks ago`;
  const filedRep = sel?.p.reports.find(r => r.week === end);

  const picker = sel
    ? `<div class="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 rounded-xl border border-line px-3.5 py-2"><span class="truncate text-label font-medium uppercase text-ink-subtle">${esc(sel.c.name)}</span><span class="break-words text-body font-bold text-ink sm:truncate">${esc(sel.p.name)}</span>
        <button type="button" id="p-change" data-act="pchange" class="ml-auto shrink-0 text-caption font-semibold text-brand hover:underline">Change</button></div>`
    : `<div><label class="relative block"><span class="sr-only">Search clients and job sites</span>${ic('Search', 15, 'pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400')}
        <input type="search" id="p-q" data-input="pQ" value="${attr(S.pQ)}" placeholder="Search ${owes.length} job sites by client or job name" class="w-full rounded-control border border-line bg-white py-2 pl-9 pr-3 text-body-sm text-ink shadow-e1 focus:border-brand focus:outline-none"></label>
      <div class="mt-2 overflow-hidden rounded-xl border border-line"><div class="flex items-center gap-3 border-b border-line bg-gray-50/70 px-3.5 py-1.5 text-label uppercase text-ink-subtle"><span class="flex-1">Job site</span><span class="w-12 shrink-0 text-right">Federal</span><span class="w-12 shrink-0 text-right">State</span></div>
      ${shown.length ? `<div role="listbox" aria-label="Client and job site" class="max-h-[20rem] divide-y divide-line overflow-y-auto">${shown.map(j => `<button type="button" role="option" aria-selected="false" data-act="ppick" data-k="${j.c.key}|${j.p.key}" class="flex w-full items-center gap-3 px-3.5 py-1.5 text-left transition-colors duration-120 hover:bg-brand-softer">
        <span class="min-w-0 flex-1"><span class="block break-words text-label font-medium uppercase text-ink-subtle sm:truncate">${esc(j.c.name)}</span><span class="block break-words text-body-sm text-ink sm:truncate font-medium">${esc(j.p.name)}</span></span>
        <span class="w-12 shrink-0 text-right text-body-sm font-semibold text-gray-600">${j.p.federal}</span><span class="w-12 shrink-0 text-right text-body-sm font-semibold text-gray-600">${j.p.stateForm}</span></button>`).join('')}</div>`
      : `<p class="px-3.5 py-4 text-body-sm text-gray-600">Nothing matches "${esc(S.pQ.trim())}".</p>`}</div></div>`;

  const weekPicker = `<div class="rounded-xl border border-line px-3.5 py-2.5"><div class="flex flex-wrap items-center gap-x-3 gap-y-2"><span class="text-label font-medium uppercase text-ink-subtle">Week</span>
    <div class="flex items-center gap-2"><button type="button" id="p-prev" data-act="pweek" data-k="1" aria-label="Earlier week" title="Earlier week" class="${STEP_BTN}">${ic('ChevronLeft', 16)}</button>
      <div class="min-w-0"><div class="text-body font-bold text-ink">${range}</div><div class="text-caption text-gray-500">${plabel}</div></div>
      <button type="button" id="p-next" data-act="pweek" data-k="-1" aria-label="Later week" title="Later week" class="${STEP_BTN}">${ic('ChevronRight', 16)}</button></div>
    ${back !== 0 ? `<button type="button" id="p-now" data-act="pnow" class="shrink-0 text-caption font-semibold text-brand hover:underline">${S.pWeeks === 2 ? 'This period' : 'This week'}</button>` : ''}
    <label class="ml-auto flex items-center gap-2 text-label font-medium uppercase text-ink-subtle">Length <select id="p-len" aria-label="Period length" data-act-change="plen" class="rounded-lg border border-line bg-white px-2 py-1 text-body-sm font-medium normal-case tracking-normal text-ink"><option value="1"${S.pWeeks === 1 ? ' selected' : ''}>One week</option><option value="2"${S.pWeeks === 2 ? ' selected' : ''}>Two weeks</option></select></label></div>
    ${sel ? `<p class="mt-2 text-caption text-gray-600">${filedRep ? (filedRep.noWork ? `Recorded as a week nobody worked (payroll number ${filedRep.n}).` : `Report ${filedRep.n} is already recorded for this week.`) : 'No report is recorded for this week yet.'}</p>` : ''}</div>`;

  const step1 = `<section class="mt-5 first:mt-0">${stepHead(1, 'Pick the job', 'A certified payroll form is filed per job site, so this choice sets everything below it. Each job says what it owes before you pick it: the federal WH-347 follows how the job is funded, the state filing follows the state it is in.')}
    ${card(`${picker}<div class="mt-4">${weekPicker}</div>
      <div class="mt-6 border-t border-gray-200 pt-5"><div class="text-label uppercase text-gray-500">Hours sheet for the client</div><p class="mt-1 text-body-sm leading-snug text-gray-600">The sheet the client fills in with hours by day, job and trade, for the ${S.pWeeks === 2 ? 'two weeks' : 'week'} above.</p>
      <div class="mt-3"><button type="button" class="${BTN_QUIET}" data-real="${attr(REAL('build the hours sheet for this job and week, with the crew, trades and rates already filled in, and download it.'))}">${ic('Download', 15, 'mr-1.5')} Download hours sheet</button></div></div>`, 'p-5')}</section>`;

  const option = (icon, title, text, real) => `<button type="button" data-real="${attr(REAL(real))}" class="flex w-full items-start gap-3 rounded-xl border border-line bg-white px-4 py-3 text-left transition-colors duration-120 hover:border-brand hover:bg-brand-softer"><span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">${ic(icon, 18)}</span><span class="min-w-0"><span class="block text-body-sm font-semibold text-ink">${esc(title)}</span><span class="mt-0.5 block text-caption leading-snug text-gray-600">${esc(text)}</span></span></button>`;
  const step2 = `<section class="mt-5 first:mt-0">${stepHead(2, 'Bring the hours back', 'This client sends the filled workbook back. Upload it and the figures are read and checked before anything is produced.')}
    ${card(`<div class="grid gap-3 md:grid-cols-3">
      ${option('Upload', 'Upload the completed sheet', 'The filled workbook is read and every line is checked against the job\'s rates.', 'read the completed hours sheet, check every worker\'s pay against the job\'s prevailing rates, and list anything that does not add up.')}
      ${option('Keyboard', 'Type the hours', 'The fields are the ones on the hours sheet, in the same order.', 'open a grid to type the week\'s hours by worker, day and trade.')}
      ${option('Plug', 'Live payroll from Paycor', 'Pull the pay figures, then add the project-and-day hours.', 'pull this week\'s paychecks from the connected payroll system and combine them with the hours sheet.')}</div>
      <div class="mt-4 rounded-xl border border-line bg-gray-50 px-4 py-3"><div class="flex flex-wrap items-center justify-between gap-3"><p class="text-body-sm text-gray-600">Nobody worked this job this week? A no-work week still takes a numbered report.</p>
        <button type="button" class="${BTN_QUIET}" data-real="${attr(REAL('record this week as a week nobody worked, under the next payroll number.'))}">Record a no-work week</button></div></div>`, 'p-5')}</section>`;

  const c = sel?.c, pay = addDays(end, c?.pay_offset ?? 7), due = addDays(pay, 7);
  const step3 = `<section class="mt-5 first:mt-0">${stepHead(3, 'Check the deadline', 'A report is due within 7 days of the pay date, so this is the clock that matters. Everything produced for this job is recorded below it.')}
    ${card(`<div class="flex items-start gap-3"><span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">${ic('CalendarDays', 18)}</span><div><div class="text-label uppercase text-gray-500">Reports and deadlines</div><p class="mt-1 text-body-sm leading-snug text-gray-600">The filing clock for ${range}, and every report recorded for the job site selected above.</p></div></div>
      ${!sel ? '<div class="mt-4 rounded-xl border border-line bg-gray-50 px-4 py-3 text-body-sm text-gray-600">Select a client and job site above to see its deadline and report history.</div>'
      : `<div class="mt-4 grid overflow-hidden rounded-xl border border-info-border bg-brand-soft/40 sm:grid-cols-3">${[['Week ends', end], ['Pay day', pay], ['Report due', due]].map(([l, v]) => `<div class="border-b border-info-border px-4 py-3 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0"><div class="text-label uppercase text-gray-500">${l}</div><div class="mt-1 text-body font-bold text-ink">${v}</div></div>`).join('')}</div>
        <div class="mt-4 flex flex-wrap gap-2"><button type="button" class="${BTN_PRIMARY}" data-real="${attr(REAL(`produce the WH-347 and Statement of Compliance for ${sel.p.name}, ${range}, as Report No. ${sel.p.next}, ready for the contractor to sign.`))}">${ic('FileCheck2', 15)} Produce the WH-347</button></div>
        <div class="mt-5 border-t border-gray-200 pt-4"><div class="text-label uppercase text-gray-500">Recorded report history</div>${historyList(sel.c, sel.p)}</div>`}`, 'p-5')}</section>`;

  return crumbs([{ label: 'Produce reports' }, { label: 'Federal filings' }])
    + hero({ title: 'Federal filings', sub: 'The federal WH-347 for one job site, in three steps. Pick the job and send its hours sheet, bring the week\'s hours back the way that client works, then produce the form and check the filing clock. What a job owes the state is under State filings.', actions: helpLink('producing a federal report') })
    + step1 + step2 + step3;
}

/* ---------- Wage determinations (WageDeterminationsPage.tsx, WageLookup.tsx, RateTable.tsx) ---------- */
function rateTable(d) {
  const q = S.wd.q.trim().toLowerCase();
  const rows = d.rates, shown = rows.filter(r => !q || (r.trade + ' ' + r.classification).toLowerCase().includes(q));
  const trades = [...new Set(rows.map(r => r.trade))];
  const groups = [...new Set(shown.map(r => r.trade))].map(t => ({ t, rows: shown.filter(r => r.trade === t) }));
  const summary = q ? `${shown.length} of ${rows.length} rates match` : `${rows.length} rates in ${trades.length} trades. Open a trade, or type to find one.`;
  return `<div class="mt-3"><div class="flex flex-wrap items-center gap-3"><label class="relative block min-w-[16rem] flex-1"><span class="sr-only">Find a trade or classification</span>${ic('Search', 15, 'pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400')}
    <input id="wd-q" data-input="wdq" value="${attr(S.wd.q)}" class="w-full rounded-control border border-line bg-white py-2 pl-9 pr-3 text-body-sm text-ink shadow-e1 focus:border-brand focus:outline-none" placeholder="Find a trade: carpenter, laborer, bulldozer..."></label><span class="text-caption text-gray-600">${summary}</span></div>
    ${groups.length ? `<div class="mt-3 overflow-hidden rounded-xl border border-line">${groups.map(g => {
      const open = q || S.wd.trades.has(g.t);
      return `<div class="border-b border-line last:border-b-0"><button type="button" id="tr-${attr(g.t.replace(/\W/g, ''))}" data-act="trade" data-k="${attr(g.t)}" aria-expanded="${Boolean(open)}" class="flex w-full items-center gap-2 bg-gray-50/70 px-3.5 py-2 text-left hover:bg-gray-100">
        ${open ? ic('ChevronDown', 15, 'shrink-0 text-gray-500') : ic('ChevronRight', 15, 'shrink-0 text-gray-500')}<span class="text-body-sm font-bold text-ink">${esc(g.t)}</span><span class="text-caption text-gray-500">${g.rows.length} rate${g.rows.length === 1 ? '' : 's'}</span></button>
        ${open ? `<div class="overflow-x-auto"><table class="w-full min-w-[30rem] text-left text-body-sm"><thead><tr class="text-label uppercase text-gray-500"><th class="px-3.5 py-1.5 font-bold">Classification</th><th class="px-2 py-1.5 text-right font-bold">Base</th><th class="px-2 py-1.5 text-right font-bold">Fringe</th><th class="px-3.5 py-1.5 text-right font-bold">Total</th></tr></thead>
          <tbody class="divide-y divide-line">${g.rows.map(r => `<tr class="align-top"><td class="px-3.5 py-2 text-ink">${esc(r.classification)}</td><td class="px-2 py-2 text-right tabular-nums text-gray-700">${money(r.base)}</td><td class="px-2 py-2 text-right tabular-nums text-gray-700">${money(r.fringe)}</td><td class="px-3.5 py-2 text-right font-bold tabular-nums text-ink">${money(r.base + r.fringe)}</td></tr>`).join('')}</tbody></table></div>` : ''}</div>`;
    }).join('')}</div>` : `<p class="mt-3 text-body-sm text-gray-600">Nothing here matches "${esc(S.wd.q)}". Try a shorter word or read the full text on SAM.gov.</p>`}
    <p class="mt-2 text-caption text-gray-500">Total is base plus fringe per hour. Fringe can be paid as cash or into a benefit plan; the split goes on the report.</p></div>`;
}

function wdPage() {
  const W = S.wd;
  const INPUT = 'w-full rounded-control border border-line bg-white px-3 py-2 text-body-sm text-ink shadow-e1 focus:border-brand focus:outline-none disabled:bg-gray-50';
  const LABEL = 'text-caption font-medium text-gray-700';
  const res = W.results;
  return hero({ title: 'Wage determinations', sub: 'Look up the prevailing wage rates for a state, county and type of construction, straight from SAM.gov. <strong class="font-extrabold text-ink">This is a reference only: nothing here is saved, and no job is changed.</strong>' })
    + `<div class="rounded-card bg-surface shadow-e4 mb-5 overflow-hidden">
      <div class="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div class="flex items-start gap-3"><span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">${ic('ShieldCheck', 19)}</span>
        <div><h2 class="text-[0.95rem] font-bold text-ink">Wage Determination checks</h2><p class="mt-0.5 max-w-[42rem] text-body-sm leading-relaxed text-gray-600">The determinations recorded on jobs are compared with SAM.gov every 24 hours. New modifications or rate differences are flagged for review.</p></div></div>
        <div class="shrink-0 sm:text-right">${chip('Checker off', 'info')}<p class="mt-1 text-caption text-gray-500">Not running on this server.</p></div></div>
      <div class="grid gap-px border-y border-line bg-line sm:grid-cols-2">
        <div class="bg-white px-5 py-3.5"><div class="flex items-center gap-2 text-caption font-bold text-ink">${ic('FileCheck2', 15, 'text-brand')} Use the contract rate</div><p class="mt-1 text-caption leading-relaxed text-gray-600">Confirm the determination named in the contract. A newer publication does not automatically apply.</p></div>
        <div class="bg-white px-5 py-3.5"><div class="flex items-center gap-2 text-caption font-bold text-ink">${ic('AlertTriangle', 15, 'text-warning-fg')} Review before filing</div><p class="mt-1 text-caption leading-relaxed text-gray-600">Resolve any flagged difference before the contractor signs the Statement of Compliance.</p></div></div>
      <div class="flex flex-col gap-2 bg-gray-50 px-5 py-3 text-caption leading-relaxed text-gray-600 sm:flex-row sm:items-center sm:justify-between"><span>The tool never changes a job's rates automatically. The signing contractor remains responsible for the submitted rates.</span>
        <button type="button" data-real="${attr(REAL('open the wage determination search on SAM.gov in a new tab.'))}" class="inline-flex shrink-0 items-center gap-1 font-semibold text-brand hover:underline">Open SAM.gov ${ic('ExternalLink', 12)}</button></div></div>
    ${card(`<form id="wd-form" class="grid gap-3 md:grid-cols-[1fr_1.4fr_1fr_auto] md:items-end">
      <label class="${LABEL}"><span class="mb-1 block">State</span><select id="wd-state" data-act-change="wdstate" class="${INPUT}" required><option value="">Choose...</option>${US_STATES.map(([c, n]) => `<option value="${c}"${W.state === c ? ' selected' : ''}>${n}</option>`).join('')}</select></label>
      <label class="${LABEL}"><span class="mb-1 block">County</span><select id="wd-county" data-act-change="wdcounty" class="${INPUT}"${W.state ? '' : ' disabled'}>${W.state ? `<option value="">Any county</option>${countiesFor(W.state).map(c => `<option${W.county === c ? ' selected' : ''}>${c}</option>`).join('')}` : '<option value="">Choose a state first</option>'}</select></label>
      <label class="${LABEL}"><span class="mb-1 block">Construction type</span><select id="wd-type" data-act-change="wdtype" class="${INPUT}"><option value="">Any</option>${CONSTRUCTION_TYPES.map(t => `<option${W.ctype === t ? ' selected' : ''}>${t}</option>`).join('')}</select></label>
      <button type="submit" id="wd-go" class="${BTN_PRIMARY}"${W.state ? '' : ' disabled'}>${ic('Search', 15, 'mr-1.5')}Search</button></form>
      ${res ? `<div class="mt-4"><div class="text-body-sm text-gray-600">${res.length} determination${res.length === 1 ? '' : 's'}.</div>
        <div class="mt-3 divide-y divide-line rounded-xl border border-line">${res.map(d => {
          const open = W.open === d.wd;
          const where = d.county ? `${d.county}, ${d.state}` : d.state;
          return `<div class="px-4 py-3"><div class="flex flex-wrap items-baseline gap-x-3 gap-y-1"><span class="text-body font-semibold text-ink">${d.wd}</span>${d.mod ? `<span class="text-body-sm text-gray-600">Modification ${d.mod}</span>` : ''}<span class="text-body-sm text-gray-500">${d.type} · ${esc(where)}</span><span class="text-caption text-gray-500">Published by SAM.gov ${d.published}</span>
            <button type="button" data-real="${attr(REAL(`open ${d.wd} on SAM.gov in a new tab.`))}" class="inline-flex items-center gap-1 text-caption font-semibold text-brand hover:underline">Open on SAM.gov ${ic('ExternalLink', 11)}</button>
            <button type="button" id="wd-${d.wd}" data-act="wdopen" data-k="${d.wd}" aria-expanded="${open}" class="ml-auto text-caption font-semibold text-brand hover:underline">${open ? 'Hide rates' : `Show ${d.rates.length} rates`}</button></div>
            ${open ? rateTable(d) : ''}</div>`;
        }).join('')}</div></div>` : ''}`, 'p-5')}
    <p class="mt-4 text-body-sm leading-relaxed text-gray-500">The number and rates that go on a job come from the client's contract and are entered on that job in <strong>Clients</strong>. This page does not put anything on a job.</p>`;
}

/* ---------- Sign-in (pages/SignInLanding.tsx, pages/landing/parts.tsx) ----------
   The app's signed-out page. The office photo is replaced by a still of the
   app's own animated gradient (gradientMesh.ts colours), and the marketing
   lines by neutral ones. The team button takes you into the demo, as the
   app does on a local build; every other way in shows a note. */
const MS_MARK = '<svg width="16" height="16" viewBox="0 0 21 21" aria-hidden="true"><rect x="1" y="1" width="9" height="9" fill="#f25022"/><rect x="11" y="1" width="9" height="9" fill="#7fba00"/><rect x="1" y="11" width="9" height="9" fill="#00a4ef"/><rect x="11" y="11" width="9" height="9" fill="#ffb900"/></svg>';
const G_MARK = '<svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>';
const MESH = 'background:radial-gradient(circle at 18% 30%,#1d315cf7,#1d315c00 45%),radial-gradient(circle at 38% 68%,#2D6FE0f7,#2D6FE000 48%),radial-gradient(circle at 66% 26%,#4f8df2f7,#4f8df200 46%),radial-gradient(circle at 88% 58%,#1f5dc8f7,#1f5dc800 44%),radial-gradient(circle at 54% 52%,#fbf6eecc,#fbf6ee00 36%),radial-gradient(circle at 78% 88%,#bcd4f8f7,#bcd4f800 40%),radial-gradient(circle at 14% 92%,#5b7df0f7,#5b7df000 40%),linear-gradient(135deg,#9dbcf2,#c4d8f9 55%,#eef4fe)';
const authBtn = ({ label, mark, primary, act, real }) => `<button type="button"${act ? ` data-act="${act}"` : ''}${real ? ` data-real="${attr(REAL(real))}"` : ''} class="group flex min-h-[3.125rem] w-full items-center gap-2.5 rounded-xl px-4 text-body font-semibold sm:gap-3 transition duration-180 ease-spring hover:-translate-y-px active:translate-y-0 active:scale-[0.99] ${primary ? 'bg-tess text-white shadow-[0_8px_18px_-8px_rgba(80,98,237,0.7)] hover:bg-tess-dark hover:shadow-[0_12px_22px_-10px_rgba(80,98,237,0.75)]' : 'border border-line-strong/80 bg-white text-tess-ink shadow-e1 hover:border-tess/40 hover:bg-tess-soft/50'}">
  ${mark ? `<span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${primary ? 'bg-white text-tess-ink' : 'text-ink-muted'}">${mark}</span>` : ''}<span class="${mark ? '' : 'flex-1 text-center'}">${esc(label)}</span>${ic('ArrowRight', 16, 'ml-auto shrink-0 transition-transform duration-180 group-hover:translate-x-0.5 ' + (primary ? 'text-white/90' : 'text-ink-faint'))}</button>`;
const PREVIEW_BARS = [0.28, 0.4, 0.34, 0.52, 0.46, 0.6, 0.55, 0.74, 0.66, 0.88];
const preview = cls => `<div role="img" aria-label="Illustration: a payroll overview card with hours, payroll and employee totals and a weekly bar chart." class="w-[17.5rem] rounded-[1.25rem] border border-white/80 bg-white/95 p-5 shadow-[0_24px_48px_-20px_rgba(23,43,92,0.35),0_0_0_1px_rgba(23,43,92,0.05)] backdrop-blur ${cls}">
  <p class="text-[0.8125rem] font-semibold text-tess-ink">Payroll overview</p><div class="mt-3 grid grid-cols-3 gap-3">${[['Total hours', '1,248', '12%'], ['Total payroll', '$48,672', '8%'], ['Employees', '124', '6%']].map(([l, v, c]) => `<div><p class="text-[0.6875rem] leading-tight text-ink-subtle">${l}</p><p class="mt-1 text-[1.0625rem] font-bold leading-tight tracking-[-0.01em] text-tess-ink">${v}</p><p class="mt-0.5 flex items-center gap-0.5 text-[0.6875rem] font-semibold text-success-fg">${ic('ArrowUpRight', 11, '', 2.5)}${c}</p></div>`).join('')}</div>
  <div class="mt-4 flex h-16 items-end gap-[5px] border-b border-line pb-px">${PREVIEW_BARS.map((h, i) => `<span class="flex-1 rounded-t-[3px] bg-gradient-to-t from-brand/60 to-tess" style="height:${Math.round(h / 0.88 * 100)}%;opacity:${(0.35 + 0.65 * i / 9).toFixed(2)}"></span>`).join('')}</div></div>`;

function signin() {
  const door = S.door;
  const team = `<p class="text-body-sm leading-relaxed text-ink-muted">Use your work account to access the internal portal.</p>
    <div class="mt-4">${authBtn({ label: 'Sign in with Microsoft', mark: MS_MARK, primary: true, act: 'enter' })}</div>
    <p class="mt-3 text-caption leading-snug text-ink-subtle">Staff only. Your access is set by an administrator.</p>`;
  const clientDoor = `<p class="text-body-sm leading-relaxed text-ink-muted">Download your hours sheet, send it back, and see your reports and deadlines.</p>
    <div class="mt-4 grid gap-3">${authBtn({ label: 'Continue with Microsoft', mark: MS_MARK, primary: true, real: 'send the client to Microsoft to sign in, then open the client portal for that one company.' })}
      ${authBtn({ label: 'Continue with Google', mark: G_MARK, real: 'send the client to Google to sign in, then open the client portal for that one company.' })}
      ${authBtn({ label: 'Email me a sign-in link', mark: ic('Mail', 16), real: 'email the client a one-time sign-in link for the client portal.' })}</div>
    <button type="button" data-real="${attr(REAL('open the client portal\'s request-access form, for a company that has no sign-in yet.'))}" class="mt-4 inline-block rounded-md text-left text-body-sm font-semibold text-tess transition-colors duration-120 hover:text-tess-dark">Do not have access yet? <span class="whitespace-nowrap">Request access${ic('ArrowRight', 14, 'ml-1 inline align-[-2px]')}</span></button>`;
  const doors = [['team', 'Team', 'Building2'], ['client', 'Client', 'Users']];
  const trust = [['ShieldCheck', 'Secure sign-in', 'Access set by an administrator.'], ['CalendarDays', 'Every week numbered', 'Reports and deadlines in one place.'], ['Scale', 'Checked before filing', 'Pay compared with the contract rates.']];
  return `<div class="relative flex min-h-screen flex-col overflow-x-hidden bg-white text-ink lg:h-screen lg:overflow-hidden">
  <div aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden">
    <div class="absolute -left-40 -top-48 h-[34rem] w-[34rem] animate-landingDrift rounded-full bg-[radial-gradient(closest-side,rgba(80,98,237,0.10),transparent)]"></div>
    <div class="absolute -right-32 top-1/3 h-[40rem] w-[40rem] animate-landingDrift rounded-full bg-[radial-gradient(closest-side,rgba(45,111,224,0.09),transparent)]" style="animation-delay:-11s"></div>
    <div class="absolute right-[34%] top-[-7rem] hidden h-40 w-64 rotate-[-32deg] rounded-[3rem] bg-gradient-to-br from-tess-mist/50 to-brand-soft/20 lg:block"></div>
    <div class="absolute -bottom-24 right-[-3rem] hidden h-64 w-64 rotate-[38deg] rounded-[3.5rem] bg-gradient-to-br from-tess/15 to-brand/10 lg:block"></div>
    <div class="absolute bottom-[8%] right-[14%] hidden h-40 w-40 rotate-[38deg] rounded-[2.5rem] bg-gradient-to-br from-tess-mist/80 to-tess-soft/40 lg:block"></div></div>
  <div class="relative z-10 mx-auto flex w-full max-w-[42rem] flex-1 flex-col px-5 sm:px-8 lg:min-h-0 lg:max-w-[120rem] lg:px-[clamp(2rem,4.5vw,6rem)]">
    <header class="pt-7 sm:pt-9 lg:pt-[clamp(1.25rem,3.6vh,2.5rem)]"><div class="flex items-center gap-2.5">${MARK.replace('h-7 w-7', 'h-8 w-8')}<span class="text-[1.3rem] font-bold tracking-[-0.015em] text-tess-ink">Certified Payroll</span></div></header>
    <main id="main" tabindex="-1" class="flex flex-1 flex-col py-10 sm:py-12 focus:outline-none lg:grid lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] 2xl:grid-cols-[minmax(0,0.82fr)_minmax(0,1fr)] lg:gap-x-[clamp(2.5rem,5vw,6.5rem)] lg:py-[clamp(1.25rem,4vh,3rem)]">
      <div id="fit-col" class="flex min-w-0 flex-col lg:min-h-0 lg:justify-center"><div id="fit-inner" class="flex flex-col">
        <div class="animate-landingIn"><p class="text-label uppercase tracking-[0.16em] text-tess">Certified Payroll</p>
          <h1 class="mt-4 text-[2.5rem] font-bold leading-[1.04] tracking-[-0.035em] text-tess-ink sm:text-[3.25rem] lg:mt-[clamp(0.625rem,1.6vh,1rem)] lg:text-[clamp(2.25rem,min(5.4vh,3.7vw),3.75rem)]">Prevailing wage reports.<br><span class="bg-gradient-to-r from-tess-ink via-tess-ink to-tess bg-clip-text text-transparent">Filed on time.</span></h1>
          <p class="mt-4 max-w-[30rem] text-[1.0625rem] leading-relaxed text-ink-muted sm:text-[1.125rem] lg:mt-[clamp(0.625rem,1.8vh,1.25rem)] lg:text-[clamp(1rem,1.8vh,1.125rem)] shortest:hidden">Secure access to your certified payroll reports, rates and deadlines, all in one place.</p></div>
        <section aria-labelledby="signin-title" class="w-full max-w-[30rem] animate-landingIn rounded-[1.375rem] border border-[#e6ecf5] bg-white p-5 sm:p-8 short:px-8 short:py-7 shadow-[0_2px_4px_rgba(23,43,92,0.03),0_40px_90px_-36px_rgba(30,50,120,0.42)] mx-auto mt-16 sm:mt-20 lg:mx-0 lg:mt-[clamp(1.25rem,3.6vh,2.5rem)] lg:max-w-[31rem]" style="animation-delay:120ms">
          <h2 id="signin-title" class="text-[1.625rem] font-bold leading-tight tracking-[-0.015em] text-tess-ink">Certified Payroll</h2>
          <p class="mt-1.5 text-body text-ink-muted">Sign in to access your Certified Payroll portal</p>
          <div class="mt-6"><p id="door-label" class="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-ink-subtle">Who are you signing in as?</p>
            <div role="radiogroup" aria-labelledby="door-label" class="mt-2.5 grid grid-cols-2 gap-1 rounded-xl bg-[#f1f4fa] p-1">${doors.map(([k, l, icon]) => {
              const on = door === k;
              return `<button type="button" id="door-${k}" role="radio" aria-checked="${on}" tabindex="${on ? 0 : -1}" data-act="door" data-k="${k}" class="flex min-h-[2.75rem] items-center justify-center gap-2 rounded-[10px] text-body-sm font-semibold transition duration-180 ease-spring ${on ? 'bg-white text-tess-dark shadow-[0_1px_3px_rgba(80,98,237,0.2)] ring-1 ring-tess/50' : 'text-ink-muted hover:text-tess-ink'}">${ic(icon, 15)}${l}</button>`;
            }).join('')}</div>
            <div class="mt-5 grid shorter:mt-4">${[['team', team], ['client', clientDoor]].map(([k, html]) => `<div class="col-start-1 row-start-1 ${door === k ? '' : 'invisible'}"${door === k ? '' : ' aria-hidden="true" inert'}>${html}</div>`).join('')}</div>
            <p class="mt-5 flex items-start gap-2 text-caption leading-snug text-ink-muted">${ic('ShieldCheck', 14, 'mt-0.5 shrink-0 text-success-fg')}<span>Sign-in is handled by Microsoft. The tool never stores a password, and a client sign-in only ever opens that one company's payroll.</span></p>
            <p class="text-caption leading-snug text-gray-500 mt-2">By signing in you agree to our <button type="button" data-real="${attr(REAL('open the Terms of Service.'))}" class="font-semibold text-brand underline-offset-2 transition-colors duration-120 hover:text-brand-dark hover:underline">Terms of Service</button> and <button type="button" data-real="${attr(REAL('open the Privacy Policy.'))}" class="font-semibold text-brand underline-offset-2 transition-colors duration-120 hover:text-brand-dark hover:underline">Privacy Policy</button>.</p></div></section>
        <div class="grid gap-5 sm:grid-cols-3 sm:gap-x-6 mt-10 animate-landingIn lg:hidden xl:mt-[clamp(1.25rem,3.6vh,2.25rem)] xl:grid shorter:hidden">${trust.map(([icon, t, l]) => `<div class="flex items-start gap-2.5">${ic(icon, 19, 'mt-0.5 shrink-0 text-tess', 1.75)}<div><p class="text-body-sm font-semibold text-tess-ink">${t}</p><p class="text-caption text-ink-subtle">${l}</p></div></div>`).join('')}</div>
      </div></div>
      <div class="relative hidden min-h-0 lg:block"><div class="relative h-full w-full">
        <div aria-hidden="true" class="absolute -right-6 -top-6 h-[clamp(7rem,15vh,11rem)] w-[clamp(7rem,15vh,11rem)] rotate-[14deg] rounded-[2.25rem] bg-gradient-to-br from-tess/25 to-brand/10"></div>
        <div aria-hidden="true" class="absolute inset-0 overflow-hidden rounded-[clamp(7rem,17vh,12rem)_2.25rem_2.25rem_clamp(3.5rem,8vh,6rem)] bg-tess-soft shadow-[0_30px_60px_-30px_rgba(23,43,92,0.35)] ring-1 ring-tess-ink/5"><div class="h-full w-full animate-landingPhoto" style="${MESH}"></div><div class="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-tess-ink/15 to-transparent"></div></div>
        <div class="absolute bottom-[7%] left-4 animate-landingIn xl:-left-16" style="animation-delay:450ms">${preview('origin-bottom-left animate-landingFloat lg:[scale:0.88] xl:[scale:1] shorter:[scale:0.88]')}</div>
      </div></div>
    </main></div></div>`;
}

// The app's useFitToHeight: on a desktop window, shrink the left column to fit.
function fitSignin() {
  const col = document.getElementById('fit-col'), body = document.getElementById('fit-inner');
  if (!col || !body) return;
  body.style.zoom = '';
  if (!matchMedia('(min-width: 1024px)').matches) return;
  const need = body.offsetHeight, have = col.clientHeight;
  if (need > have + 1) body.style.zoom = String(Math.max(0.72, have / need));
}
window.addEventListener('resize', fitSignin);

/* ---------- routing and render ---------- */
const app = document.getElementById('app');
const PAGES = { dashboard, clients, client: clientPage, reports: filed, produce, wd: wdPage };

function parse() {
  const h = location.hash.replace(/^#\/?/, '');
  const [a, b, c] = h.split('/');
  if (a === 'clients' && b) { S.route = 'client'; S.client = b; S.tab = TABS.some(t => t[0] === c) ? c : 'overview'; }
  else if (a === 'signin') S.route = 'signin';
  else S.route = { clients: 'clients', reports: 'reports', 'this-week': 'produce', 'wage-determinations': 'wd' }[a] || 'dashboard';
}

function render() {
  const f = document.activeElement, fid = f?.id, sel = f && 'selectionStart' in f ? [f.selectionStart, f.selectionEnd] : null;
  if (S.route === 'signin') {
    // Entrance animations play once, not on every click inside the card.
    const html = signin();
    app.innerHTML = S.signinShown ? html.replace(/\banimate-landing(In|Photo)\b/g, '') : html;
    S.signinShown = true; fitSignin();
  }
  else app.innerHTML = `<div class="flex min-h-screen">${rail()}<div class="min-w-0 flex-1">${topbar()}<main id="main" tabindex="-1" class="mx-auto max-w-[1600px] px-4 py-6 sm:px-8 sm:py-8 focus:outline-none">${PAGES[S.route]()}</main></div></div>`;
  const back = fid && document.getElementById(fid);
  if (back) { back.focus({ preventScroll: true }); if (sel && back.setSelectionRange && sel[0] != null) try { back.setSelectionRange(sel[0], sel[1]); } catch { /* not a text field */ } }
}

app.addEventListener('click', e => {
  const pick = e.target.closest('[data-pick]');
  if (pick && pick.dataset.pick) { S.pSel = pick.dataset.pick; S.pBack = 0; }
  const t = e.target.closest('[data-act]');
  if (!t) return;
  const k = t.dataset.k, tog = (set, v) => (set.has(v) ? set.delete(v) : set.add(v));
  switch (t.dataset.act) {
    case 'group':
      if (S.collapsed) { S.collapsed = false; S.groups[k] = true; }
      else { const item = NAV.find(n => n.label === k); const act = item.items.some(c => c.go && c.go === activeGo()); S.groups[k] = !(S.groups[k] ?? act); }
      break;
    case 'door': S.door = k; break;
    case 'enter': location.hash = '#/'; return;
    case 'collapse': S.collapsed = !S.collapsed; break;
    case 'review': tog(S.review, Number(k)); break;
    case 'tab': location.hash = `#/clients/${S.client}/${k}`; return;
    case 'site': tog(S.siteOpen, k); break;
    case 'rate': tog(S.rateOpen, k); break;
    case 'emp': tog(S.empOpen, k); break;
    case 'ppick': S.pSel = k; S.pBack = 0; break;
    case 'pchange': S.pSel = ''; S.pQ = ''; break;
    case 'pweek': S.pBack += Number(k) * S.pWeeks; break;
    case 'pnow': S.pBack = 0; break;
    case 'wdopen': S.wd.open = S.wd.open === k ? null : k; S.wd.q = ''; S.wd.trades = new Set(); break;
    case 'trade': tog(S.wd.trades, k); break;
    default: return;
  }
  render();
  if (t.dataset.act === 'ppick' || t.dataset.act === 'pchange') document.getElementById(t.dataset.act === 'ppick' ? 'p-change' : 'p-q')?.focus();
});

app.addEventListener('keydown', e => {
  const r = e.target.closest('[role="radio"][data-act="door"]');
  if (r && ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
    e.preventDefault(); S.door = S.door === 'team' ? 'client' : 'team'; render(); document.getElementById('door-' + S.door)?.focus(); return;
  }
  const t = e.target.closest('[role="tab"]');
  if (!t || !['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(e.key)) return;
  e.preventDefault();
  const i = TABS.findIndex(x => x[0] === S.tab), n = TABS.length;
  const to = e.key === 'ArrowRight' ? (i + 1) % n : e.key === 'ArrowLeft' ? (i - 1 + n) % n : e.key === 'Home' ? 0 : n - 1;
  location.hash = `#/clients/${S.client}/${TABS[to][0]}`;
  setTimeout(() => document.getElementById('tab-' + TABS[to][0])?.focus(), 0);
});

app.addEventListener('change', e => {
  const t = e.target, a = t.dataset.actChange;
  if (a === 'filed') S.filed = t.value;
  else if (a === 'plen') { S.pWeeks = Number(t.value) === 2 ? 2 : 1; }
  else if (a === 'wdstate') { S.wd.state = t.value; S.wd.county = ''; }
  else if (a === 'wdcounty') S.wd.county = t.value;
  else if (a === 'wdtype') S.wd.ctype = t.value;
  else if (t.dataset.emp) { const [ck, i, f] = t.dataset.emp.split('|'); S.workers[ck][Number(i)][f] = t.value; }
  else return;
  render();
});

app.addEventListener('input', e => {
  const t = e.target;
  if (t.dataset.input === 'pQ') { S.pQ = t.value; render(); }
  else if (t.dataset.input === 'wdq') { S.wd.q = t.value; render(); }
  else if (t.dataset.emp) { const [ck, i, f] = t.dataset.emp.split('|'); S.workers[ck][Number(i)][f] = t.value; if (f === 'first' || f === 'last' || f === 'rate') render(); }
});

app.addEventListener('submit', e => {
  if (e.target.id !== 'wd-form') return;
  const W = S.wd;
  if (!W.state) return;
  W.results = lookup(W.state, W.county, W.ctype); W.open = null; W.q = ''; W.trades = new Set();
  render();
});

window.addEventListener('hashchange', () => { const was = S.route + S.client; parse(); render(); if (S.route + S.client !== was) { window.scrollTo(0, 0); document.getElementById('main')?.focus({ preventScroll: true }); } });

mini({ label: 'Demo, made-up data', ok: 'OK' });
parse();
render();
