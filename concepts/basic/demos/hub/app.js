/* Web Hub miniature: the hub's real layout (rail, glass top bar, pages) redrawn
   as static HTML with the same Tailwind classes as the app, filled with
   made-up data. Five screens work: Home, Billing Agents, Your review, the
   Billing Console's Review & edit, and the Pricing store. Every other menu
   entry, and anything that would write to an outside system, shows a note. */
import { mini, esc, svg } from '../mini.js';
import { I } from './icons.js';
import { MONTH, RECORD, CLIENTS, DRAFTS, ACTIVITY } from './data.js';

const ic = (n, size = 16, cls = '', stroke = 2) => svg(I[n], { size, cls, stroke });
const money = n => (n < 0 ? '-$' : '$') + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const REAL = what => `In the real product this would ${what}`;

// The rail, in the hub's own order. Pages with a "go" route are in the demo.
const NAV = [
  { label: 'Home', icon: 'Home', go: 'home' },
  { group: 'Clients', icon: 'Users', items: [['Client Profile', 'Users', 'open each client’s services, pricing and invoices', true], ['Client Email', 'Megaphone', 'open the client notices and campaigns tool', true], ['Client Terminations', 'UserMinus', 'open the client terminations workflow', true], ['Payroll dashboard', 'CalendarCheck', 'open today’s payroll dashboard', true]] },
  { group: 'Billing', icon: 'CircleDollarSign', items: [['Billing Exceptions', 'CircleDollarSign', 'open the billing exceptions queue'], ['Billing Console', 'ReceiptText', 'console'], ['Pricing store', 'Table2', 'pricing'], ['Billing Agents', 'Bot', 'agents', true]] },
  { group: 'Finance', icon: 'ReceiptText', items: [['Vendor Invoices', 'FileText', 'open vendor invoice intake']] },
  { group: 'Dashboards', icon: 'BarChart3', items: [['Billing', 'LineChart', 'open the leadership billing dashboard'], ['Support', 'LifeBuoy', 'open the support dashboard', true], ['Terminations', 'UserMinus', 'open the terminations dashboard'], ['Phone calls', 'Phone', 'open the phone dashboard']] },
  { label: 'Marketing', icon: 'Megaphone', real: 'open the marketing tools' },
  { group: 'SOPs', icon: 'FileText', isNew: true, items: [['The playbook', 'FileText', 'open the service playbook', true], ['How-to videos', 'PlayCircle', 'open the how-to videos', true]] },
  { group: 'Planning', icon: 'Map', items: [['Roadmap', 'Map', 'open the roadmap'], ['Ideas', 'Lightbulb', 'open the ideas board']] },
  { group: 'Pilots', icon: 'Sparkles', items: [['Workers comp pilot', 'ClipboardCheck', 'open the workers comp pilot', true]] },
  { label: 'Settings', icon: 'Settings', real: 'open user management and settings' },
];
const ROUTES = ['home', 'agents', 'review', 'console', 'pricing', 'signin'];
const isRoute = s => ROUTES.includes(s);

const S = {
  route: 'agents', collapsed: false, open: new Set(['Billing']), search: '',
  step: 'review', feedAll: false,
  filter: 'open', client: 'aspen', edits: {}, from: {}, picks: {}, tab: {}, note: '', error: '',
  status: Object.fromEntries(CLIENTS.map(c => [c.id, c.status])),
  cTab: 'review', cFilter: 'all', cType: 'all', cSearch: '', cSel: new Set(), cOpen: null,
  drafts: DRAFTS.map(d => ({ ...d })), pSearch: '',
};

/* ---------- shell: rail and top bar (components/Shell.tsx) ---------- */
const navLabel = (label, isNew) => isNew
  ? `<span class="relative mr-7 inline-block whitespace-nowrap">${esc(label)}<span aria-hidden="true" class="pointer-events-none absolute -top-1 left-full ml-[3px] rounded-full bg-[#dce8ff] px-1 py-px text-[9px] font-bold leading-3 text-[#174d9b]">New</span></span>`
  : `<span>${esc(label)}</span>`;
const linkCls = (indent, active) => `flex min-h-[44px] w-full items-center gap-2.5 rounded-[9px] py-2 text-left text-[0.86rem] transition-[background-color,color] duration-120 lg:[@media(pointer:fine)]:min-h-0 lg:[@media(pointer:fine)]:py-[7px] ${indent ? 'pl-9 pr-3' : 'px-3'} ${active ? 'bg-brand-soft font-bold text-brand' : 'font-medium text-gray-600 hover:bg-gray-100 hover:text-ink'}`;
const leaf = ([label, icon, to, isNew], indent) => {
  const go = isRoute(to) ? to : null, active = go === S.route || (to === 'agents' && S.route === 'review');
  return `<button type="button" class="${linkCls(indent, active)}" ${go ? `data-go="${go}"` : `data-real="${esc(REAL(to + '.'))}"`}${active ? ' aria-current="page"' : ''}>
    ${ic(icon, indent ? 16 : 17, 'shrink-0 opacity-80', 2.2)}${navLabel(label, isNew)}</button>`;
};
const brand = small => small
  ? `<span class="mb-5 flex h-8 w-8 items-center justify-center rounded-[9px] bg-brand text-[0.95rem] font-black text-white" aria-label="Ops Hub">O</span>`
  : `<span class="mb-6 ml-2 flex h-7 items-center gap-2 self-start" aria-label="Ops Hub"><span class="flex h-7 w-7 items-center justify-center rounded-[8px] bg-brand text-[0.9rem] font-black text-white">O</span><span class="text-[1.35rem] font-extrabold tracking-[-0.03em] text-[#0f1f3d]">opshub</span></span>`;
function rail() {
  if (S.collapsed) {
    const row = active => `relative flex h-11 w-11 items-center justify-center rounded-[10px] transition-[background-color,color] duration-120 ${active ? 'bg-brand-soft text-brand' : 'text-gray-600 hover:bg-gray-100 hover:text-ink'}`;
    return `<aside aria-label="Main navigation" class="sticky top-0 flex h-screen w-[72px] shrink-0 flex-col items-center overflow-hidden border-r border-line bg-white px-2 py-5">${brand(true)}
      <div class="-mx-2 min-h-0 flex-1 overflow-y-auto px-2"><nav class="flex flex-col items-center gap-1">${NAV.map(n => n.items
        ? `<button type="button" title="${esc(n.group)}" aria-label="${esc(n.group)} (opens the menu)" data-expand="${esc(n.group)}" class="${row(n.items.some(([, , to]) => to === S.route || (to === 'agents' && S.route === 'review')))}">${ic(n.icon, 19)}</button>`
        : `<button type="button" title="${esc(n.label)}" aria-label="${esc(n.label)}" class="${row(n.go === S.route)}" ${n.go ? `data-go="${n.go}"` : `data-real="${esc(REAL(n.real + '.'))}"`}>${ic(n.icon, 19)}</button>`).join('')}</nav></div>
      <div class="relative mt-auto flex shrink-0 flex-col items-center gap-1 border-t border-line pt-3">
        <button type="button" class="${row(false)}" aria-label="Need help? View documentation" data-real="${esc(REAL('open the hub’s documentation.'))}">${ic('LifeBuoy', 19)}</button>
        <button type="button" class="${row(false)}" aria-label="Sign out" data-real="${esc(REAL('sign you out of the hub.'))}">${ic('LogOut', 19)}</button></div></aside>`;
  }
  const nav = NAV.map(n => {
    if (!n.items) return leaf([n.label, n.icon, n.go || n.real], false);
    const open = S.open.has(n.group), inside = n.items.some(([, , to]) => to === S.route || (to === 'agents' && S.route === 'review'));
    const newInside = !open && (n.isNew || n.items.some(x => x[3]));
    return `<div><button type="button" data-group="${esc(n.group)}" aria-expanded="${open}" class="flex min-h-[44px] w-full items-center gap-2.5 rounded-[9px] px-3 py-2 text-[0.86rem] transition-[background-color,color] duration-120 lg:[@media(pointer:fine)]:min-h-0 lg:[@media(pointer:fine)]:py-[7px] ${inside ? 'font-bold text-brand' : 'font-medium text-gray-600 hover:bg-gray-100 hover:text-ink'}">
      ${ic(n.icon, 17, 'shrink-0 opacity-80', 2.2)}${navLabel(n.group, newInside)}${ic('ChevronDown', 15, `ml-auto shrink-0 text-gray-400 transition-transform duration-150 ${open ? '' : '-rotate-90'}`)}</button>
      ${open ? n.items.map(x => leaf(x, true)).join('') : ''}</div>`;
  }).join('');
  return `<aside aria-label="Main navigation" class="sticky top-0 flex h-screen w-[264px] shrink-0 flex-col overflow-hidden border-r border-line bg-white px-3 py-5">${brand(false)}
    <div class="-mx-3 min-h-0 flex-1 overflow-y-auto overscroll-contain px-3"><nav class="flex flex-col gap-0.5">${nav}</nav></div>
    <div class="relative mt-auto shrink-0 border-t border-line px-1 pt-3">
      <button type="button" class="flex min-h-[44px] w-full items-center gap-3 rounded-[9px] px-2 py-2 text-left text-gray-600 transition-colors hover:bg-gray-100 hover:text-ink" data-real="${esc(REAL('open the hub’s documentation.'))}">
        ${ic('LifeBuoy', 18, 'shrink-0 opacity-80', 2.2)}<span class="leading-tight"><span class="block text-[0.8rem] font-medium">Need help?</span><span class="flex items-center gap-1 text-[0.8rem] font-semibold">View documentation ${ic('ExternalLink', 12)}</span></span></button>
      <button type="button" class="mt-1 flex min-h-[44px] w-full items-center gap-3 rounded-[9px] px-2 py-2 text-left text-[0.86rem] font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-ink" data-real="${esc(REAL('sign you out of the hub.'))}">${ic('LogOut', 18, 'shrink-0 opacity-80', 2.2)}Sign out</button>
      <p class="mt-2 px-2 text-[0.72rem] leading-relaxed text-gray-500">Drafts only. Posting stays manual in the accounting system.</p></div></aside>`;
}
const TB = 'relative flex shrink-0 items-center justify-center rounded-[10px] border border-line bg-white text-gray-600 transition-colors hover:border-brand hover:text-brand';
function topbar() {
  const pages = NAV.flatMap(n => n.items ? n.items.map(([l, , to]) => [l, to]) : [[n.label, n.go || n.real]]);
  const hits = S.search.trim() ? pages.filter(([l]) => l.toLowerCase().includes(S.search.trim().toLowerCase())).slice(0, 6) : [];
  return `<div class="sticky top-0 z-40 px-8 pt-4"><header class="glass flex items-center gap-2 rounded-card border border-line/80 px-3 py-2 shadow-e2">
    <button type="button" data-collapse aria-label="${S.collapsed ? 'Expand navigation' : 'Collapse navigation'}" aria-expanded="${!S.collapsed}" class="${TB} h-9 w-9">${ic('PanelLeft', 17)}</button>
    <div class="relative w-full max-w-[520px]">
      <label class="flex h-9 items-center gap-2 rounded-[10px] border border-line bg-white px-3 text-[0.86rem] text-gray-400 focus-within:border-brand">${ic('Search', 16, 'shrink-0 text-gray-500')}
        <input data-input="search" value="${esc(S.search)}" placeholder="Search tools and clients..." aria-label="Search tools and clients" class="min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-gray-400">
        <kbd class="rounded-md border border-line bg-gray-50 px-1.5 text-[0.7rem] font-semibold text-gray-500">⌘K</kbd></label>
      ${hits.length ? `<ul class="absolute inset-x-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-line bg-white py-1 shadow-e8">${hits.map(([l, to]) =>
        `<li><button type="button" class="flex w-full items-center gap-2 px-3 py-2 text-left text-[0.86rem] text-ink hover:bg-brand-softer" ${isRoute(to) ? `data-go="${to}"` : `data-real="${esc(REAL(to + '.'))}"`}>${ic('ArrowRight', 14, 'text-gray-400')}${esc(l)}</button></li>`).join('')}</ul>` : ''}
    </div>
    <div class="ml-auto flex shrink-0 items-center gap-2">
      <span class="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-[10px] border border-line bg-gray-50/80 px-3 text-[0.74rem] font-semibold text-gray-600" title="Where drafts go from this page. Nothing posts from the hub."><span class="h-2 w-2 rounded-full bg-green-500"></span>Sandbox</span>
      <span aria-hidden="true" class="mx-0.5 h-6 w-px shrink-0 bg-line"></span>
      <button type="button" class="${TB} h-9 min-w-[36px] gap-1.5 px-3 text-[0.8rem] font-semibold" data-real="${esc(REAL('open the feedback form, which records the page you were on.'))}">${ic('MessageSquarePlus', 16, 'text-brand')}<span>Feedback</span></button>
      <button type="button" class="${TB} h-9 min-w-[36px] gap-1.5 px-3 text-[0.8rem] font-semibold" data-real="${esc(REAL('open help for this page.'))}">${ic('LifeBuoy', 16, 'text-brand')}<span>Help</span></button>
      <button type="button" class="${TB} h-9 w-9" aria-label="Notifications" data-real="${esc(REAL('show your notifications.'))}">${ic('Bell', 17)}</button>
      <span aria-hidden="true" class="mx-0.5 h-6 w-px shrink-0 bg-line"></span>
      <button type="button" class="flex h-9 shrink-0 items-center gap-2 rounded-[10px] border border-line bg-white pl-1 pr-2.5 text-[0.8rem] font-semibold text-ink transition-colors hover:border-brand hover:text-brand" data-real="${esc(REAL('open your account and workspace panel.'))}">
        <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] bg-brand text-[0.66rem] font-extrabold text-white">DU</span>
        <span class="text-left leading-tight"><span class="block max-w-[140px] truncate text-[0.78rem]">Demo user</span><span class="flex items-center gap-1 text-[0.68rem] font-medium text-gray-500"><span class="h-1.5 w-1.5 rounded-full bg-amber-500"></span>Sandbox</span></span>
        ${ic('ChevronDown', 14, '-rotate-90')}</button></div></header></div>`;
}
const pageHeader = (eyebrow, title, { desc = '', actions = '', compact = false } = {}) =>
  `<header class="relative flex flex-wrap items-start justify-between gap-x-6 gap-y-2 border-b border-line ${compact ? 'mb-4 pb-3' : 'mb-6 pb-6'}">
    <div class="min-w-0 flex-1 basis-80"><div class="text-[0.72rem] font-bold uppercase tracking-[0.1em] text-brand">${esc(eyebrow)}</div>
      <h1 class="mt-0.5 min-w-0 font-extrabold leading-tight tracking-[-0.02em] text-[#0f1f3d] ${compact ? 'text-[1.5rem]' : 'text-[1.75rem] sm:text-[2rem]'}">${title}</h1>
      ${desc ? `<p class="max-w-3xl text-gray-600 ${compact ? 'mt-0.5 text-[0.88rem]' : 'mt-1.5 text-[0.95rem]'}">${esc(desc)}</p>` : ''}</div>
    ${actions ? `<div class="flex flex-wrap items-center gap-2">${actions}</div>` : ''}</header>`;

/* ---------- Home (pages/Home.tsx) ---------- */
const TILES = [
  ['CircleDollarSign', 'Billing Exceptions', 'Credits, add-ons and one-off charges', 'open the billing exceptions queue'],
  ['ReceiptText', 'Billing Console', 'Guided monthly billing close', 'console'],
  ['Bot', 'Billing Agents', 'The supervisor’s view of the close', 'agents'],
  ['Table2', 'Pricing store', 'Every client’s prices in one place', 'pricing'],
  ['Users', 'Client Profile', 'Services, pricing, invoices', 'open each client’s services, pricing and invoices'],
  ['Megaphone', 'Client Email', 'Client notices and campaigns', 'open the client notices and campaigns tool'],
  ['CalendarCheck', 'Payroll dashboard', 'Today’s payrolls, done on time', 'open today’s payroll dashboard'],
  ['LineChart', 'Billing', 'Leadership billing dashboard', 'open the leadership billing dashboard'],
  ['FileText', 'SOPs', 'Playbooks and how-to videos', 'open the service playbook'],
];
const home = () => pageHeader('Web Hub', 'Welcome, Demo', { desc: 'Your internal tools, one place.' })
  + `<div class="mb-3 flex flex-wrap items-center justify-between gap-3"><p class="text-[0.72rem] font-bold uppercase tracking-[0.08em] text-gray-500">Your tools <span class="tnum font-semibold text-gray-400">${TILES.length}</span></p></div>
  <div class="grid content-start gap-3 md:grid-cols-2 xl:grid-cols-3 [grid-auto-rows:74px]">${TILES.map(([icon, name, tag, to]) =>
    `<button type="button" aria-label="Open ${esc(name)}" class="text-left" ${isRoute(to) ? `data-go="${to}"` : `data-real="${esc(REAL(to + '.'))}"`}><div class="group flex h-full items-center gap-3.5 rounded-xl border border-line bg-white px-4 py-3 shadow-e2 transition-all duration-150 hover:-translate-y-px hover:border-blue-200 hover:shadow-e4">
      <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] bg-brand-soft text-brand">${ic(icon, 20)}</span>
      <span class="min-w-0 flex-1"><span class="block truncate text-[0.95rem] font-bold tracking-tight text-[#0f1f3d]">${esc(name)}</span><span class="block truncate text-[0.78rem] text-gray-500">${esc(tag)}</span></span>
      ${ic('ArrowRight', 16, 'shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand')}</div></button>`).join('')}</div>`;

/* ---------- Billing Agents (billing_agents/BillingAgentsPage.tsx) ---------- */
const doneCount = () => CLIENTS.filter(c => S.status[c.id] !== 'open').length;
const openCount = () => CLIENTS.filter(c => S.status[c.id] === 'open').length;
function steps() {
  const d = doneCount(), all = CLIENTS.length, left = openCount();
  return [
    { key: 'data', label: 'Data arrived', status: 'done', lines: ['Done', 'In the hub'], owner: 'agents', summary: 'The month’s payroll and pricing data arrived and was read.', facts: [['Files', '3'], ['Clients', '10'], ['Read at', 'Jan 2, 8:30 AM']] },
    { key: 'write', label: 'Invoices written', status: 'done', lines: ['Done', '9 invoices'], owner: 'agents', summary: 'The agents wrote an invoice for every client and checked each line against the price record.', facts: [['Invoices', '9'], ['Lines', '22'], ['Checked', '22 of 22']] },
    { key: 'am', label: 'Account managers check', status: 'off', lines: ['Off', 'Switched off'], owner: 'agents', summary: 'This step is switched off for the demo month.', facts: [] },
    { key: 'sort', label: 'Sorted and alerts', status: 'done', lines: ['5 ready', '4 person · 3 differ'], owner: 'agents', summary: 'Invoices the agents could settle are ready; the rest wait for a person.', bars: [['Ready to send', 5], ['Agents want a person', 4, true], ['Totals differ from the console', 3, true]] },
    { key: 'review', label: 'Your review', status: left ? 'now' : 'done', lines: [`${d} of ${all} done`, left ? 'Your turn' : 'Finished'], owner: 'person', summary: 'A person decides the invoices the agents could not settle, side by side with the console.',
      facts: [['To decide', String(left)], ['Decided', String(CLIENTS.filter(c => S.status[c.id] === 'decided').length)], ['Held', String(CLIENTS.filter(c => S.status[c.id] === 'held').length)], ['Already sent', '0']],
      bars: [['Agents want a person', CLIENTS.filter(c => S.status[c.id] === 'open' && c.why.some(w => w.includes('person'))).length, true], ['Totals differ from the console', CLIENTS.filter(c => S.status[c.id] === 'open' && c.why.some(w => w.includes('different'))).length, true]],
      gaps: CLIENTS.map(c => [c.id, c.name, c.invoices.reduce((g, i) => g + sum(i.agents) - sum(i.console), 0)]).filter(x => x[2] > 0.004).sort((a, b) => b[2] - a[2]).slice(0, 3) },
    { key: 'final', label: 'Final agent check', status: 'later', lines: ['Not built yet', 'After review'], owner: 'agents', summary: 'Planned: the agents re-check every decided invoice before it goes out.', facts: [] },
    { key: 'bc', label: 'Ready to send', status: left ? 'waiting' : 'now', lines: [left ? 'Waiting' : 'Ready', '0 of 9 sent'], owner: 'person', summary: 'Decided invoices go to the accounting system as drafts. Posting stays manual there.', facts: [['Drafts', '0 of 9']] },
  ];
}
const STATUS = {
  done: ['bg-brand text-white', ic('Check', 12, '', 3), 'Done'], now: ['bg-brand-soft text-brand', ic('Loader2', 12), 'Now'],
  waiting: ['bg-gray-100 text-gray-400', ic('Clock', 12), 'Waiting'], off: ['bg-gray-100 text-gray-400', ic('MinusCircle', 12), 'Off'],
  later: ['bg-gray-50 text-gray-300', ic('CircleDashed', 12), 'Not built yet'],
};
function agents() {
  const st = steps(), left = openCount(), step = st.find(s => s.key === S.step) || st[4], i = st.indexOf(step) + 1;
  const done = st.filter(s => s.status === 'done').length;
  const kpis = [['Clients', '10'], ['Invoices', '9'], ['Ready', String(9 - left)], ['Need a person', String(left)], ['Differ from console', String(CLIENTS.filter(c => S.status[c.id] === 'open' && c.why.some(w => w.includes('different'))).length)], ['Agents’ cost', '$3.40']];
  const feed = S.feedAll ? ACTIVITY : ACTIVITY.slice(0, 5);
  return `<div class="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3">${pageHeader('Billing', 'Billing Agents', { compact: true, actions:
    `<div class="flex items-center gap-3"><span class="flex items-center gap-1.5 text-[0.76rem] text-gray-500"><span class="h-1.5 w-1.5 rounded-full bg-green-500"></span> Live · updated 9:48 AM</span>
      <select aria-label="Month" class="rounded-lg border border-line bg-white px-2 py-1 text-[0.85rem] font-semibold text-ink"><option>${MONTH}</option></select></div>` })}
    <section aria-label="Where the month is" class="rounded-card border bg-white px-5 py-3.5 shadow-e4 ${left ? 'border-brand' : 'border-line'}">
      <div class="flex flex-wrap items-center justify-between gap-x-6 gap-y-2"><div class="min-w-0">
        <p class="text-[0.7rem] font-bold uppercase tracking-[0.08em] ${left ? 'text-brand' : 'text-gray-500'}">Now · ${left ? 'waiting on you' : 'the agents are working'}</p>
        <h2 class="text-[1.2rem] font-extrabold leading-snug tracking-tight">${left ? `Waiting on you: ${left} invoice${left === 1 ? '' : 's'} to decide` : 'Review finished. Drafts are ready for the accounting system.'}</h2></div>
        <div class="flex items-center gap-4"><p class="tnum text-right text-[0.8rem] leading-snug text-gray-500">Post <b class="text-ink">Thu, Jan 8</b> · Due <b class="text-ink">Fri, Jan 9</b></p>
          ${left ? `<button type="button" data-go="review" class="whitespace-nowrap rounded-xl bg-brand px-4 py-2 text-[0.88rem] font-bold text-white shadow-brand hover:bg-brand-dark">Start review</button>` : ''}</div></div>
      <div class="mt-2.5 flex items-center gap-3"><div class="h-2 flex-1 overflow-hidden rounded-full bg-gray-100" role="progressbar" aria-valuenow="${done}" aria-valuemin="0" aria-valuemax="7" aria-label="Stages finished">
        <div class="h-full rounded-full bg-brand transition-[width] duration-500" style="width:${Math.round(done / 7 * 100)}%"></div></div>
        <span class="tnum whitespace-nowrap text-[0.78rem] font-semibold text-gray-600">Step ${left ? 5 : 7} of 7</span></div></section>
    <section aria-label="The month in numbers" class="grid grid-cols-3 gap-px overflow-hidden rounded-card border border-line bg-gray-100 shadow-e4 md:grid-cols-6">${kpis.map(([l, v]) =>
      `<div class="min-w-0 bg-white px-4 py-2.5"><div class="text-[0.66rem] font-bold uppercase leading-tight tracking-[0.07em] text-gray-500 md:truncate">${esc(l)}</div><div class="tnum whitespace-nowrap text-[1.3rem] font-extrabold leading-tight tracking-[-0.03em] md:text-[1.8rem]">${v}</div></div>`).join('')}</section>
    <ol aria-label="The cycle" class="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7 lg:gap-3">${st.map((s, k) => {
      const [cls, icon, word] = STATUS[s.status], on = S.step === s.key, needsYou = s.owner === 'person' && s.status === 'now';
      return `<li class="relative min-w-0">${k ? `<span class="absolute -left-[13px] top-1/2 hidden -translate-y-1/2 lg:block ${s.status === 'done' || s.status === 'now' ? 'text-brand' : 'text-gray-300'}">${ic('ChevronRight', 14)}</span>` : ''}
        <button type="button" data-step="${s.key}" aria-pressed="${on}" class="flex h-full w-full flex-col rounded-card border bg-white px-3 py-2.5 text-left shadow-e4 transition-colors duration-120 ${needsYou ? 'border-2 border-brand' : 'border-line'} ${on ? 'bg-brand-softer ring-2 ring-brand/40' : 'hover:bg-gray-50'}">
          <span class="flex items-start justify-between gap-2"><span class="line-clamp-2 min-h-[2.1em] text-[0.74rem] font-bold leading-tight text-gray-600">${k + 1} · ${esc(s.label)}</span><span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${cls}" title="${word}">${icon}</span></span>
          <span class="tnum mt-1 truncate text-[1.02rem] font-extrabold leading-tight ${s.status === 'later' ? 'text-gray-400' : 'text-ink'}">${esc(s.lines[0])}</span>
          <span class="tnum truncate text-[0.76rem] text-gray-500">${esc(s.lines[1])}</span>
          <span class="mt-1.5 inline-flex items-center gap-1 text-[0.68rem] font-semibold ${s.owner === 'person' ? 'text-brand' : 'text-gray-400'}">${s.owner === 'person' ? `${ic('User', 11)} You` : `${ic('Bot', 11)} Agents`}</span></button></li>`;
    }).join('')}</ol>
    <div class="grid grid-cols-1 gap-3 lg:h-[18rem] lg:grid-cols-[minmax(0,1fr)_21rem]">
      <section aria-label="${esc(step.label)} detail" class="flex min-h-0 min-w-0 flex-col rounded-card border border-line bg-white px-5 py-3 shadow-e4">
        <div class="flex flex-wrap items-start justify-between gap-3"><div class="min-w-0"><h2 class="text-[0.98rem] font-extrabold tracking-tight">${i} · ${esc(step.label)}</h2>
          <p class="mt-0.5 max-w-3xl text-[0.82rem] text-gray-600">${esc(step.summary)}</p></div>
          ${step.key === 'review' && left ? `<button type="button" data-go="review" class="rounded-xl border border-brand px-3.5 py-1.5 text-[0.82rem] font-bold text-brand hover:bg-brand-softer">Start review</button>` : ''}</div>
        <div class="mt-2.5 grid min-h-0 flex-1 grid-cols-1 gap-x-8 gap-y-3 overflow-y-auto md:grid-cols-2"><div class="space-y-3">
          ${step.facts?.length ? `<dl class="grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-4">${step.facts.map(([l, v]) => `<div class="min-w-0"><dt class="truncate text-[0.66rem] font-bold uppercase tracking-[0.07em] text-gray-500">${esc(l)}</dt><dd class="tnum truncate text-[0.95rem] font-bold">${esc(v)}</dd></div>`).join('')}</dl>` : ''}
          ${step.bars ? (() => { const max = Math.max(1, ...step.bars.map(b => b[1])); return `<ul class="space-y-1.5">${step.bars.map(([l, v, link]) => {
            const row = `<span class="min-w-0 flex-1 truncate text-left text-[0.82rem] text-gray-700">${esc(l)}</span><span class="h-2 w-[30%] shrink-0 overflow-hidden rounded-full bg-gray-100"><span class="block h-full rounded-full bg-brand/70" style="width:${v / max * 100}%"></span></span><span class="tnum w-12 text-right text-[0.86rem] font-bold">${v}</span>`;
            return `<li>${link && v ? `<button type="button" data-go="review" title="Open the review" class="flex w-full items-center gap-3 rounded-md px-1 py-0.5 hover:bg-brand-softer">${row}</button>` : `<div class="flex items-center gap-3 px-1 py-0.5">${row}</div>`}</li>`; }).join('')}</ul>`; })() : ''}</div>
          ${step.gaps ? `<div><h3 class="mb-1 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-gray-500">Biggest gaps, agents vs console</h3><ul class="divide-y divide-line">${step.gaps.map(([id, n, g]) =>
            `<li><button type="button" data-client-go="${id}" class="flex w-full items-center justify-between gap-3 rounded-md px-1 py-1.5 text-left hover:bg-brand-softer"><span class="truncate text-[0.84rem] font-semibold">${esc(n)}</span><span class="tnum text-[0.84rem] font-bold text-amber-700">+${money(g)}</span></button></li>`).join('')}</ul></div>` : ''}</div></section>
      <section aria-label="Agent activity" class="flex min-h-0 min-w-0 flex-col rounded-card border border-line bg-white px-4 py-3 shadow-e4">
        <h2 class="mb-2 text-[0.7rem] font-bold uppercase tracking-[0.08em] text-gray-500">Agent activity</h2>
        <p class="mb-2 flex items-center gap-2 text-[0.84rem] font-semibold"><span class="h-2 w-2 rounded-full bg-brand"></span>${left ? 'Waiting on your review' : 'Review finished'}</p>
        <ul class="min-h-0 flex-1 divide-y divide-line overflow-y-auto">${feed.map(([at, t]) => `<li class="grid grid-cols-[6.4rem_minmax(0,1fr)] gap-2 py-1.5 text-[0.8rem]"><span class="tnum text-gray-400">${esc(at)}</span><span class="truncate font-semibold text-ink">${esc(t)}</span></li>`).join('')}</ul>
        <button type="button" data-feed class="mt-1 self-start text-[0.8rem] font-semibold text-brand hover:underline">${S.feedAll ? 'Show fewer' : `Show all (${ACTIVITY.length})`}</button></section></div></div>`;
}

/* ---------- Your review (billing_agents/ReviewPage.tsx) ---------- */
const amt = l => l.qty * l.price;
const sum = ls => ls.reduce((s, l) => s + amt(l), 0);
const linesOf = (inv, side) => (side === 'console' ? inv.console : inv.agents).map(l => ({ ...l }));
function editsFor(c, inv) {
  if (!S.edits[inv.key]) S.edits[inv.key] = linesOf(inv, S.from[inv.key] || 'agents');
  return S.edits[inv.key];
}
function review() {
  const filt = S.filter, shown = CLIENTS.filter(c => filt === 'open' ? S.status[c.id] === 'open' : filt === 'held' ? S.status[c.id] === 'held' : S.status[c.id] === 'decided');
  const count = f => CLIENTS.filter(c => f === 'open' ? S.status[c.id] === 'open' : f === 'held' ? S.status[c.id] === 'held' : S.status[c.id] === 'decided').length;
  const c = CLIENTS.find(x => x.id === S.client) || CLIENTS[0];
  const invs = c.invoices, multi = invs.length > 1, cur = invs.find(i => i.key === S.tab[c.id]) || invs[0];
  const aSum = invs.reduce((s, i) => s + sum(i.agents), 0), cSum = invs.reduce((s, i) => s + sum(i.console), 0);
  const edits = editsFor(c, cur), locked = S.status[c.id] !== 'open';
  const keys = [...new Set([...cur.agents, ...cur.console, ...cur.last].map(l => l.item))];
  const flagged = k => Math.abs(sum(cur.agents.filter(l => l.item === k)) - sum(cur.console.filter(l => l.item === k))) > 0.004;
  const order = [...keys.filter(flagged), ...keys.filter(k => !flagged(k))];
  const extra = edits.filter(e => !keys.includes(e.item));
  const cell = (ls, k, flag) => { const l = ls.find(x => x.item === k); return l ? `<td class="tnum whitespace-nowrap px-1.5 py-1 text-right ${flag ? 'font-bold text-amber-700' : 'text-gray-700'}" title="${l.qty} x ${money(l.price)}">${money(amt(l))}</td>` : `<td class="px-2 py-1 text-right text-gray-300">-</td>`; };
  const input = 'tnum w-full rounded-md border border-line bg-white px-1.5 py-0.5 text-right text-[0.82rem] focus:border-brand focus:outline-none disabled:bg-gray-50';
  const editCells = (k) => { const n = edits.findIndex(e => e.item === k); if (n < 0) return `<td colspan="4" class="border-l-2 border-brand/30 px-2 text-[0.75rem] text-gray-400">Not billed</td>`;
    const e = edits[n];
    return `<td class="w-14 border-l-2 border-brand/30 py-0.5 pl-1.5"><input aria-label="Quantity" data-edit="${n}:qty" class="${input} min-w-[3.25rem]" ${locked ? 'disabled' : ''} value="${isNaN(e.qty) ? '' : e.qty}"></td>
      <td class="w-[4.5rem] py-0.5 pl-1"><input aria-label="Price" data-edit="${n}:price" class="${input} min-w-[4.5rem]" ${locked ? 'disabled' : ''} value="${isNaN(e.price) ? '' : e.price}"></td>
      <td class="tnum whitespace-nowrap px-1.5 py-0.5 text-right font-semibold text-ink">${isNaN(amt(e)) ? '-' : money(amt(e))}</td>
      <td class="w-7 py-0.5 text-center">${locked ? '' : `<button type="button" aria-label="Remove line" title="Remove line" data-remove="${n}" class="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-red-600">${ic('X', 14)}</button>`}</td>`; };
  const seg = (side, label) => `<button type="button" data-from="${side}" aria-pressed="${(S.from[cur.key] || 'agents') === side}" ${locked ? 'disabled' : ''} class="px-2.5 py-1 font-semibold ${(S.from[cur.key] || 'agents') === side ? 'bg-brand-soft text-[#174d9b]' : 'text-gray-500 hover:text-ink'}">${label}</button>`;
  const total = sum(edits.filter(e => !isNaN(amt(e))));
  return `<div class="mx-auto flex max-w-[1500px] flex-col gap-3 px-4 py-4">
    <header class="flex flex-wrap items-center gap-x-4 gap-y-2">
      <button type="button" data-go="agents" class="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[0.82rem] font-semibold text-gray-600 hover:bg-gray-100">${ic('ArrowLeft', 15)} Billing Agents</button>
      <h1 class="text-[1.25rem] font-extrabold tracking-tight">Your review <span class="font-semibold text-gray-400">· ${MONTH}</span></h1>
      <span class="tnum text-[0.84rem] text-gray-500">${doneCount()} of ${CLIENTS.length} done</span>
      <button type="button" data-hold ${locked ? 'disabled' : ''} class="ml-auto rounded-xl border border-line bg-white px-4 py-1.5 text-[0.85rem] font-bold text-ink hover:bg-gray-50 disabled:opacity-50">Hold client</button></header>
    <div class="grid gap-3 lg:grid-cols-[17rem_minmax(0,1fr)]">
      <aside class="flex min-w-0 flex-col rounded-card border border-line bg-white p-2 shadow-e4" aria-label="Clients to review">
        <div role="tablist" aria-label="Which clients" class="mb-1.5 flex gap-1">${[['open', 'To decide'], ['done', 'Done'], ['held', 'Held']].map(([k, l]) =>
          `<button type="button" role="tab" aria-selected="${filt === k}" data-filter="${k}" class="flex-1 whitespace-nowrap rounded-lg px-1 py-1 text-[0.74rem] font-semibold ${filt === k ? 'bg-brand-soft text-[#174d9b]' : 'text-gray-500 hover:bg-gray-50'}">${l} <span class="tnum">${count(k)}</span></button>`).join('')}</div>
        ${shown.length ? `<ul class="flex flex-col gap-0.5">${shown.map(x => { const gap = Math.abs(x.invoices.reduce((s, i) => s + sum(i.agents) - sum(i.console), 0)), on = x.id === c.id;
          return `<li><button type="button" data-client="${x.id}" ${on ? 'aria-current="true"' : ''} class="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[0.82rem] ${on ? 'bg-brand-softer ring-1 ring-brand/40' : 'hover:bg-gray-50'}">
            <span class="min-w-0 flex-1 truncate font-semibold text-ink">${esc(x.name)}</span>${x.invoices.length > 1 ? `<span class="tnum shrink-0 text-[0.72rem] text-gray-400">${x.invoices.length} div</span>` : ''}
            <span class="tnum shrink-0 text-[0.76rem] ${gap > 0.004 ? 'font-semibold text-amber-700' : 'text-gray-400'}">${gap > 0.004 ? money(gap) : '$0'}</span>${S.status[x.id] === 'decided' ? ic('Check', 13, 'shrink-0 text-emerald-600') : ''}</button></li>`; }).join('')}</ul>`
          : `<p class="px-2 py-3 text-[0.82rem] text-gray-500">None here.</p>`}</aside>
      <section class="flex min-w-0 flex-col rounded-card border border-line bg-white px-4 py-3 shadow-e4" aria-label="Client">
        <div class="flex flex-wrap items-baseline gap-x-4 gap-y-1"><h2 class="text-[1.1rem] font-extrabold tracking-tight">${esc(c.name)}</h2>
          ${multi ? `<span class="text-[0.82rem] text-gray-500">${invs.length} divisions</span>` : ''}
          <span class="tnum text-[0.82rem] text-gray-600">Agents ${money(aSum)} · Console ${money(cSum)}${Math.abs(aSum - cSum) > 0.004 ? `<span class="font-bold text-amber-700"> · Gap ${money(Math.abs(aSum - cSum))}</span>` : ''}</span>
          <span class="ml-auto text-[0.76rem] text-gray-500">${{ open: 'To decide', held: 'Held', decided: 'Decided' }[S.status[c.id]]}</span></div>
        <div class="mt-1.5 rounded-xl bg-gray-50 px-3 py-1.5 text-[0.82rem]"><p class="text-gray-700"><span class="font-bold text-gray-500">Why: </span>${esc(c.why.join('; '))}.</p></div>
        ${c.asks.length ? `<div class="mt-1.5 flex flex-col gap-1.5" aria-label="The agents ask">${c.asks.map((a, qi) => { const p = S.picks[`${c.id}:${qi}`];
          return `<div class="rounded-xl border px-3 py-1.5 text-[0.82rem] ${p !== undefined ? 'border-emerald-200 bg-emerald-50/40' : 'border-brand/30 bg-brand-softer/60'}">
            <p class="text-gray-800"><span class="mr-1 font-bold text-brand">${qi + 1}</span><span>${esc(a.q)}</span>${a.why ? `<span class="ml-1 text-[0.76rem] text-gray-500"> · ${esc(a.why)}</span>` : ''}</p>
            <div class="mt-1 flex flex-wrap items-start gap-1.5">${a.answers.map((ans, ai) => { const on = p === ai;
              return `<button type="button" data-pick="${qi}:${ai}" ${locked ? 'disabled' : ''} aria-pressed="${on}" class="flex max-w-[16rem] flex-col rounded-lg border px-2.5 py-1 text-left disabled:opacity-50 ${on ? 'border-emerald-500 bg-emerald-50 text-emerald-900' : 'border-line bg-white hover:border-brand'}">
                <span class="flex items-center gap-1 font-bold">${on ? ic('Check', 13) : ''}${esc(ans.label)}</span>${ans.effect ? `<span class="text-[0.72rem] text-gray-500">${esc(ans.effect)}</span>` : ''}</button>`; }).join('')}
              <button type="button" ${locked ? 'disabled' : ''} data-real="${esc(REAL('let you type your own answer, which goes to the agents’ final check.'))}" class="rounded-lg border border-dashed border-line bg-white px-2.5 py-1 font-semibold text-gray-600 hover:border-brand disabled:opacity-50">Other answer</button></div></div>`; }).join('')}</div>` : ''}
        ${multi ? `<div role="tablist" aria-label="Divisions" class="mt-2 flex flex-wrap gap-1">${invs.map(i => { const on = i.key === cur.key, diff = Math.abs(sum(i.agents) - sum(i.console)) > 0.004;
          return `<button type="button" role="tab" aria-selected="${on}" data-div="${i.key}" class="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[0.8rem] font-semibold ${on ? 'border-brand bg-brand-softer text-[#174d9b]' : 'border-line text-gray-600 hover:bg-gray-50'}">${esc(i.division)}${diff ? '<span class="font-bold text-amber-700" aria-label="differs">!</span>' : ''}</button>`; }).join('')}</div>` : ''}
        <div class="mt-2 flex items-baseline gap-2"><h3 class="text-[0.9rem] font-extrabold uppercase tracking-[0.05em] text-ink">${esc(cur.division || c.name)}</h3><span class="tnum text-[0.72rem] text-gray-400">${c.fein}</span></div>
        <div class="overflow-x-auto"><table class="w-full min-w-[700px] text-[0.8rem]"><thead>
          <tr class="text-[0.68rem] font-bold uppercase tracking-[0.06em] text-gray-500"><th scope="col" class="px-2 py-1 text-left">Item</th><th scope="col" class="px-2 py-1 text-right">Last month</th><th scope="col" class="px-2 py-1 text-right">Record</th><th scope="col" class="px-2 py-1 text-right">Agents</th><th scope="col" class="px-2 py-1 text-right">Console</th><th scope="col" colspan="4" class="border-l-2 border-brand/30 px-2 py-1 text-left text-brand">This invoice</th></tr>
          <tr class="text-[0.62rem] font-semibold uppercase tracking-[0.06em] text-gray-400"><td colspan="5"></td><th scope="col" class="border-l-2 border-brand/30 px-1.5 pb-0.5 text-right font-semibold">Quantity</th><th scope="col" class="px-1.5 pb-0.5 text-right font-semibold">Price</th><th scope="col" class="px-1.5 pb-0.5 text-right font-semibold">Amount</th><td></td></tr></thead>
          <tbody class="divide-y divide-line">${extra.map(e => { const n = edits.indexOf(e); return `<tr class="bg-emerald-50" title="Added by your answer"><td class="px-2 py-0.5" colspan="5"><span class="tnum font-semibold">${esc(e.item)}</span> <span class="text-gray-700">${esc(e.desc)}</span></td>${editCells(e.item)}</tr>`; }).join('')}
          ${order.map(k => { const rec = RECORD[k], flag = flagged(k), d = (cur.agents.find(l => l.item === k) || cur.console.find(l => l.item === k) || cur.last.find(l => l.item === k)).desc;
            return `<tr class="${flag ? 'bg-amber-50/50' : ''}"><td class="max-w-[12rem] truncate px-1.5 py-1"><span class="tnum font-semibold">${esc(k)}</span> <span class="text-gray-700">${esc(d)}</span>${flag ? '<span class="ml-1 font-bold text-amber-700" title="The agents and the console differ">!</span>' : ''}</td>
              ${cell(cur.last, k)}<td class="tnum whitespace-nowrap px-1.5 py-1 text-right text-gray-700">${rec ? money(rec.price) : '<span class="text-gray-300">-</span>'}</td>${cell(cur.agents, k, flag)}${cell(cur.console, k, flag)}${editCells(k)}</tr>`; }).join('')}</tbody>
          <tfoot><tr class="border-t-2 border-line font-bold"><td class="px-2 py-1">Total</td><td class="tnum px-2 py-1 text-right">${money(sum(cur.last))}</td><td></td><td class="tnum px-2 py-1 text-right">${money(sum(cur.agents))}</td><td class="tnum px-2 py-1 text-right">${money(sum(cur.console))}</td><td colspan="2" class="border-l-2 border-brand/30"></td><td class="tnum px-2 py-1 text-right text-brand" data-total>${money(total)}</td><td></td></tr></tfoot></table></div>
        <div class="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.8rem]"><span class="flex items-center gap-2 text-gray-500">Start from <span class="inline-flex overflow-hidden rounded-lg border border-line">${seg('agents', 'Agents')}${seg('console', 'Console')}</span></span>
          ${locked ? '' : `<button type="button" data-add class="inline-flex items-center gap-1 rounded-md px-2 py-1 font-semibold text-brand hover:bg-brand-softer">${ic('Plus', 14)} Add line</button>`}
          <span class="tnum ml-auto text-gray-500">Lines 1-${edits.length} of ${edits.length}</span></div>
        ${S.error ? `<p role="alert" class="mt-1.5 text-[0.84rem] text-red-700">${esc(S.error)}</p>` : ''}
        <div class="mt-2 flex flex-wrap items-center gap-2 border-t border-line pt-2">
          <input aria-label="Note to the agents" data-input="note" placeholder="Note to the agents (optional)" value="${esc(S.note)}" ${locked ? 'disabled' : ''} class="min-w-[12rem] flex-1 rounded-lg border border-line px-3 py-1.5 text-[0.84rem] focus:border-brand focus:outline-none">
          <button type="button" data-approve ${locked ? 'disabled' : ''} class="rounded-xl bg-brand px-4 py-1.5 text-[0.86rem] font-bold text-white shadow-brand hover:bg-brand-dark disabled:opacity-50">${multi ? `Approve all ${invs.length}` : 'Approve and next'}</button></div></section></div></div>`;
}

/* ---------- Billing Console, Review & edit (console/ConsoleLayout.tsx) ---------- */
const CTABS = [['overview', 'Overview'], ['sources', '1 · Sources'], ['review', '2 · Review & Edit'], ['finalize', '3 · Finalize']];
function consolePage() {
  const ds = S.drafts, q = S.cSearch.trim().toLowerCase();
  const rows = ds.filter(d => (S.cFilter === 'all' || (S.cFilter === 'approved') === d.approved || (S.cFilter === 'edited' && d.edited))
    && (S.cType === 'all' || d.type === S.cType) && (!q || d.name.toLowerCase().includes(q) || d.fein.includes(q)));
  const proj = ds.reduce((s, d) => s + d.total, 0), nType = t => ds.filter(d => d.type === t).length;
  const chip = (on, label, attr) => `<button type="button" ${attr} aria-pressed="${on}" class="rounded-full border px-3 py-1.5 text-[0.82rem] font-semibold ${on ? 'border-brand bg-brand-soft text-brand' : 'border-line bg-white text-gray-600 hover:border-brand'}">${label}</button>`;
  const tabs = `<div class="mb-5 flex flex-wrap items-center gap-4"><div class="flex items-center gap-2"><label class="text-[0.8rem] font-semibold text-gray-500" for="cyc">Cycle</label>
      <input id="cyc" value="2099-01" readonly class="w-28 rounded-[9px] border border-line bg-white px-3 py-1.5 text-[0.86rem] font-semibold shadow-e2 outline-none"></div>
    <div class="flex items-center gap-2"><div class="h-1.5 w-36 overflow-hidden rounded-full bg-gray-200"><div class="h-full rounded-full bg-brand" style="width:${S.cTab === 'finalize' ? 66 : 33}%"></div></div><span class="tnum text-xs font-semibold text-gray-500">${S.cTab === 'finalize' ? 2 : 1}/3 steps</span></div></div>
    <div class="mb-7 flex flex-wrap gap-1 border-b border-line" role="tablist" aria-label="Console steps">${CTABS.map(([k, l]) =>
      `<button type="button" role="tab" aria-selected="${S.cTab === k}" data-ctab="${k}" class="-mb-px flex min-h-[44px] items-center border-b-2 px-3.5 pb-2.5 pt-1 text-[0.86rem] transition-colors xl:block xl:min-h-0 ${S.cTab === k ? 'border-brand font-bold text-brand' : 'border-transparent font-medium text-gray-500 hover:text-ink'}">${l}</button>`).join('')}</div>`;
  let body;
  if (S.cTab === 'review') {
    body = pageHeader('Billing Console / Cycle 2099-01', 'Review &amp; edit', { desc: 'Every draft moves through one journey: needs review, then verified, then approved, then sent. Approve verified invoices in one click. Every change is audited.' })
      + `<div class="mb-4 rounded-card border border-line bg-white px-6 py-5 shadow-e4"><p class="text-[0.72rem] font-bold uppercase tracking-[0.1em] text-gray-500">Projected bill this cycle</p><p class="tnum text-[2.3rem] font-extrabold leading-tight tracking-[-0.03em]">${money(proj)}</p><p class="text-[0.86rem] text-gray-500">${ds.length} invoices</p></div>
      <div class="mb-3 flex flex-wrap items-center gap-2"><label class="flex h-10 min-w-[260px] flex-1 items-center gap-2 rounded-xl border border-line bg-white px-3 shadow-e2">${ic('Search', 16, 'text-gray-400')}<input data-input="cSearch" value="${esc(S.cSearch)}" placeholder="Search by customer or FEIN" aria-label="Search by customer or FEIN" class="min-w-0 flex-1 bg-transparent text-[0.88rem] outline-none"></label>
        ${chip(S.cFilter === 'all', 'All', 'data-cfilter="all"')}${chip(S.cFilter === 'pending', 'Not approved', 'data-cfilter="pending"')}${chip(S.cFilter === 'approved', 'Approved', 'data-cfilter="approved"')}${chip(S.cFilter === 'edited', 'Edited', 'data-cfilter="edited"')}</div>
      <div class="mb-3 flex flex-wrap items-center gap-2">${chip(S.cType === 'all', 'All types', 'data-ctype="all"')}${chip(S.cType === 'regular', `Regular <span class="tnum text-gray-400">${nType('regular')}</span>`, 'data-ctype="regular"')}${chip(S.cType === 'division', `Division <span class="tnum text-gray-400">${nType('division')}</span>`, 'data-ctype="division"')}${chip(S.cType === 'net-new', `Net-new <span class="tnum text-gray-400">${nType('net-new')}</span>`, 'data-ctype="net-new"')}
        <span class="ml-auto"></span>${S.cSel.size ? `<button type="button" data-capprove class="rounded-xl bg-brand px-4 py-1.5 text-[0.86rem] font-bold text-white shadow-brand hover:bg-brand-dark">Approve ${S.cSel.size} selected</button>` : ''}</div>
      <div class="overflow-hidden rounded-card border border-line bg-white shadow-e4"><table class="w-full text-[0.86rem]"><thead><tr class="border-b border-line bg-gray-50/60 text-[0.7rem] font-bold uppercase tracking-[0.08em] text-gray-500">
        <th scope="col" class="w-12 px-4 py-2.5"><input type="checkbox" aria-label="Select all" data-call ${rows.length && rows.every(r => S.cSel.has(r.fein)) ? 'checked' : ''} class="h-4 w-4 accent-[#2D6FE0]"></th><th scope="col" class="px-2 py-2.5 text-left">Customer</th><th scope="col" class="px-2 py-2.5 text-left">Status</th><th scope="col" class="px-2 py-2.5 text-right">Lines</th><th scope="col" class="px-2 py-2.5 text-right">Coverage</th><th scope="col" class="px-2 py-2.5 text-left">Last month</th><th scope="col" class="px-4 py-2.5 text-right">Total</th></tr></thead>
        <tbody>${rows.map(d => `<tr class="cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-brand-softer" data-crow="${d.fein}"><td class="px-4 py-2.5"><input type="checkbox" aria-label="Select ${esc(d.name)}" data-csel="${d.fein}" ${S.cSel.has(d.fein) ? 'checked' : ''} class="h-4 w-4 accent-[#2D6FE0]"></td>
          <td class="px-2 py-2.5"><button type="button" data-copen="${d.fein}" class="text-left"><span class="block font-semibold text-ink">${esc(d.name)}</span><span class="tnum block text-xs text-gray-500">FEIN ${d.fein}</span></button></td>
          <td class="px-2 py-2.5"><span class="flex flex-col items-start gap-1">${d.approved ? '<span class="rounded-full bg-green-50 px-2 py-0.5 text-[0.72rem] font-bold text-green-700">approved</span>' : '<span class="rounded-full bg-brand-soft px-2 py-0.5 text-[0.72rem] font-bold text-brand">pending</span><span class="rounded-full bg-brand-soft px-2 py-0.5 text-[0.72rem] font-bold text-brand">unreviewed</span>'}</span></td>
          <td class="tnum px-2 py-2.5 text-right">${d.lines}</td><td class="tnum px-2 py-2.5 text-right">${d.cov}</td><td class="px-2 py-2.5 text-gray-300">-</td><td class="tnum px-4 py-2.5 text-right font-bold">${money(d.total)}</td></tr>`).join('') || `<tr><td colspan="7" class="px-5 py-5 text-center text-[0.85rem] text-gray-500">Empty.</td></tr>`}</tbody></table></div>`;
  } else if (S.cTab === 'overview') {
    body = pageHeader('Billing Console / Cycle 2099-01', 'Overview', { desc: 'The month’s close, in three steps.' })
      + `<div class="grid gap-3 md:grid-cols-3">${[['1 · Sources', 'Payroll data for the month is in.', 'Done', 'sources'], ['2 · Review & Edit', `${ds.filter(d => !d.approved).length} drafts still need a look.`, 'Now', 'review'], ['3 · Finalize', 'Create the drafts in the accounting system.', 'Waiting', 'finalize']].map(([t, d, s, k]) =>
        `<button type="button" data-ctab="${k}" class="rounded-card border border-line bg-white px-5 py-4 text-left shadow-e4 hover:bg-gray-50"><span class="text-[0.72rem] font-bold uppercase tracking-[0.08em] text-gray-500">${s}</span><span class="mt-1 block text-[1.05rem] font-extrabold tracking-tight">${t}</span><span class="mt-0.5 block text-[0.86rem] text-gray-600">${d}</span></button>`).join('')}</div>`;
  } else if (S.cTab === 'sources') {
    body = pageHeader('Billing Console / Cycle 2099-01', 'Sources', { desc: 'The files this month’s close is built from.' })
      + `<div class="overflow-hidden rounded-card border border-line bg-white shadow-e4">${[['Payroll data', 'Read: 10 clients, 22 lines'], ['Pricing records', 'Read: 6 services'], ['Last month’s invoices', 'Not configured in the demo']].map(([t, d], k) =>
        `<div class="flex items-center gap-3 border-b border-gray-100 px-5 py-3 last:border-b-0">${k < 2 ? ic('CheckCircle2', 16, 'shrink-0 text-green-600') : ic('AlertTriangle', 16, 'shrink-0 text-amber-600')}<div class="min-w-0 flex-1"><div class="text-[0.88rem] font-semibold">${t}</div><div class="text-[0.78rem] text-gray-500">${d}</div></div></div>`).join('')}</div>
      <button type="button" class="mt-4 rounded-xl border border-brand bg-white px-4 py-2 text-[0.86rem] font-bold text-brand hover:bg-brand-softer" data-real="${esc(REAL('let you drop in the month’s payroll file to price it.'))}">Upload a file</button>`;
  } else {
    body = pageHeader('Billing Console / Cycle 2099-01', 'Finalize', { desc: 'Approved invoices become drafts in the accounting system. Nothing posts from the hub.' })
      + `<div class="mb-4 rounded-card border border-line bg-white px-6 py-5 shadow-e4"><p class="text-[0.86rem] text-gray-600"><b class="text-ink">${ds.filter(d => d.approved).length} of ${ds.length}</b> invoices approved.</p></div>
      <button type="button" class="rounded-xl bg-brand px-4 py-2 text-[0.88rem] font-bold text-white shadow-brand hover:bg-brand-dark" data-real="${esc(REAL('create the approved invoices as drafts in the accounting system. A person still posts them there.'))}">Create drafts</button>`;
  }
  const o = S.cOpen && ds.find(d => d.fein === S.cOpen);
  const drawer = o ? `<div class="fixed inset-0 z-50 flex items-end justify-end bg-ink/20 backdrop-blur-[2px]" data-cclose>
    <div class="h-full w-full max-w-xl overflow-y-auto overscroll-contain bg-white p-7 shadow-e8" role="dialog" aria-modal="true" aria-label="${esc(o.name)}" data-stop>
      <div class="mb-1 flex items-start justify-between gap-4"><div><h2 class="text-xl font-extrabold tracking-tight">${esc(o.name)}</h2><p class="tnum text-[0.82rem] text-gray-500">FEIN ${o.fein} · ${money(o.total)}</p></div>
        <button type="button" data-cclose aria-label="Close" class="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-ink">${ic('X', 18)}</button></div>
      <h3 class="mb-2 mt-5 text-[0.72rem] font-bold uppercase tracking-[0.08em] text-gray-500">Checks</h3>
      <div class="overflow-hidden rounded-card border border-line">${[['pass', 'Every line matches the price record'], ['pass', 'Headcount matches payroll'], [o.type === 'net-new' ? 'warn' : 'pass', o.type === 'net-new' ? 'New client: no last month to compare' : 'Within 10% of last month']].map(([s, t]) =>
        `<div class="flex items-start gap-3 border-b border-gray-100 px-4 py-2.5 last:border-b-0">${s === 'pass' ? ic('CheckCircle2', 16, 'shrink-0 text-green-600') : ic('AlertTriangle', 16, 'shrink-0 text-amber-600')}<div class="min-w-0"><div class="text-[0.84rem] font-semibold">${t}</div></div></div>`).join('')}</div>
      <div class="mt-6 flex gap-2"><button type="button" data-capprove-one="${o.fein}" ${o.approved ? 'disabled' : ''} class="rounded-xl bg-brand px-4 py-2 text-[0.86rem] font-bold text-white shadow-brand hover:bg-brand-dark disabled:opacity-50">${o.approved ? 'Approved' : 'Approve'}</button>
        <button type="button" data-cedit="${o.fein}" class="rounded-xl border border-line bg-white px-4 py-2 text-[0.86rem] font-bold text-ink hover:bg-gray-50">Mark as edited</button></div></div></div>` : '';
  return tabs + body + drawer;
}

/* ---------- Pricing store ---------- */
function pricing() {
  const q = S.pSearch.trim().toLowerCase();
  const rows = Object.entries(RECORD).filter(([k, r]) => !q || k.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q));
  return pageHeader('Billing', 'Pricing store', { desc: 'The standard price of every service, which the agents and the console check every line against.' })
    + `<div class="mb-3 flex items-center gap-2"><label class="flex h-10 w-full max-w-md items-center gap-2 rounded-xl border border-line bg-white px-3 shadow-e2">${ic('Search', 16, 'text-gray-400')}<input data-input="pSearch" value="${esc(S.pSearch)}" placeholder="Search services" aria-label="Search services" class="min-w-0 flex-1 bg-transparent text-[0.88rem] outline-none"></label>
      <button type="button" class="ml-auto rounded-xl border border-brand bg-white px-4 py-2 text-[0.86rem] font-bold text-brand hover:bg-brand-softer" data-real="${esc(REAL('download the price list as a spreadsheet.'))}">${ic('Download', 15, 'mr-1 inline')}Export</button></div>
    <div class="overflow-hidden rounded-card border border-line bg-white shadow-e4"><table class="w-full text-[0.86rem]"><thead><tr class="border-b border-line bg-gray-50/60 text-[0.7rem] font-bold uppercase tracking-[0.08em] text-gray-500"><th scope="col" class="px-5 py-2.5 text-left">Item</th><th scope="col" class="px-2 py-2.5 text-left">Service</th><th scope="col" class="px-2 py-2.5 text-left">Unit</th><th scope="col" class="px-2 py-2.5 text-right">Price</th><th scope="col" class="px-5 py-2.5 text-right"><span class="sr-only">Actions</span></th></tr></thead>
    <tbody>${rows.map(([k, r]) => `<tr class="border-b border-gray-100 last:border-b-0 hover:bg-brand-softer"><td class="tnum px-5 py-2.5 font-semibold">${k}</td><td class="px-2 py-2.5">${esc(r.desc)}</td><td class="px-2 py-2.5 text-gray-500">${k === 'PE-02' || k === 'TM-05' ? 'per employee' : 'each'}</td><td class="tnum px-2 py-2.5 text-right font-bold">${money(r.price)}</td>
      <td class="px-5 py-2.5 text-right"><button type="button" class="rounded-lg px-2.5 py-1 text-[0.8rem] font-semibold text-brand hover:bg-brand-soft" data-real="${esc(REAL('open a pricing change request, which an administrator approves before it takes effect.'))}">Request a change</button></td></tr>`).join('') || `<tr><td colspan="5" class="px-5 py-5 text-center text-gray-500">No services match.</td></tr>`}</tbody></table></div>`;
}

/* ---------- Sign in (pages/Login.tsx) ---------- */
const CARD = 'rounded-2xl border border-white/80 bg-white/95 shadow-[0_1px_2px_rgba(15,31,61,0.06),0_12px_32px_rgba(15,31,61,0.12)] backdrop-blur-sm';
const bar = (w, tone = 'bg-[#dbe6fb]') => `<span class="block h-1.5 rounded-full ${tone}" style="width:${w}"></span>`;
function signin() {
  const services = [['Users', 'Billing & Payroll Services'], ['ShieldCheck', 'Compliance'], ['HeartHandshake', 'Client care'], ['CalendarCheck', 'Workforce Management']];
  return `<div class="relative flex min-h-screen flex-col overflow-x-hidden bg-gradient-to-b from-[#f5f8fe] via-white to-[#f7f9fd] text-ink">
    <div aria-hidden="true" class="landing-dots pointer-events-none absolute inset-0"></div>
    <header class="relative z-10 border-b border-line/80 bg-white/85 backdrop-blur-sm"><div class="mx-auto flex h-[4.5rem] max-w-[1600px] items-center justify-between px-[4vw]">
      <span class="flex items-center gap-2" aria-label="Ops Hub"><span class="flex h-8 w-8 items-center justify-center rounded-[9px] bg-brand text-[1rem] font-black text-white">O</span><span class="text-[1.5rem] font-extrabold tracking-[-0.03em] text-[#0f1f3d]">opshub</span></span></div></header>
    <main class="relative z-10 flex flex-1 items-center"><div class="mx-auto grid w-full max-w-[1600px] grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] items-center gap-10 px-[4vw] py-16">
      <section aria-labelledby="landing-title">
        <p class="text-[0.74rem] font-semibold uppercase tracking-[0.28em] text-[#3d5a8a]">Internal operations portal</p>
        <h1 id="landing-title" class="mt-4 text-[3.9rem] font-black leading-[1.02] tracking-[-0.035em] text-[#0f1f3d] xl:text-[4.6rem]">Welcome back.</h1>
        <p class="mt-5 max-w-[34rem] text-[1.12rem] leading-relaxed text-gray-600">The internal operations platform: the tools and resources behind the team’s billing, payroll, compliance and client services. For authorized team members only.</p>
        <div class="mt-8"><button type="button" data-go="home" class="group inline-flex h-14 min-w-[20rem] items-center justify-center gap-3 rounded-[12px] bg-brand px-7 text-[1rem] font-semibold text-white shadow-[0_8px_24px_rgba(45,111,224,0.30)] transition-all duration-150 hover:-translate-y-px hover:bg-brand-dark">
          <span aria-hidden="true" class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white"><svg width="15" height="15" viewBox="0 0 21 21"><rect x="1" y="1" width="9" height="9" fill="#F25022"/><rect x="11" y="1" width="9" height="9" fill="#7FBA00"/><rect x="1" y="11" width="9" height="9" fill="#00A4EF"/><rect x="11" y="11" width="9" height="9" fill="#FFB900"/></svg></span>
          Sign in with Microsoft${ic('ArrowRight', 18, 'transition-transform duration-150 group-hover:translate-x-0.5')}</button>
          <p class="mt-3 flex items-center gap-2 text-[0.84rem] text-gray-500">${ic('Lock', 14, 'shrink-0')}Use your Microsoft work account to sign in.</p></div>
        <ul class="mt-10 grid max-w-[40rem] grid-cols-2 gap-y-5 border-t border-line pt-7 xl:grid-cols-4 xl:gap-y-0">${services.map(([icon, label], i) =>
          `<li class="flex flex-col gap-2 pr-3 text-[0.84rem] font-semibold leading-snug text-[#0f1f3d] xl:px-4 ${i ? 'xl:border-l xl:border-line' : 'xl:pl-0'}"><span class="text-brand">${ic(icon, 20, '', 1.75)}</span>${label}</li>`).join('')}</ul></section>
      <div aria-hidden="true" class="relative mx-auto w-full max-w-[880px] px-8 py-8">
        <div class="absolute right-0 top-0 h-[34%] w-[30%] rounded-[44px] bg-[#dbe6fb]"></div><div class="absolute bottom-2 left-0 h-[40%] w-[24%] rounded-[40px] bg-[#e8effc]"></div>
        <div class="relative">
          <div class="aspect-[1336/1080] w-full rounded-[28px] bg-gradient-to-br from-[#eef2f8] via-[#f6f9fe] to-[#e3ecfb] shadow-[0_28px_70px_rgba(15,31,61,0.18)] ring-1 ring-black/5"></div>
          <div class="${CARD} absolute left-[3%] top-[10%] w-[34%] min-w-[11rem] max-w-[15rem] p-4"><div class="mb-3 flex items-center gap-2 text-[0.8rem] font-semibold text-[#0f1f3d]">${ic('Users', 16, 'text-brand')} Team overview</div>
            <div class="grid grid-cols-2 gap-3"><div><div class="mb-1.5 text-[0.7rem] font-medium text-gray-500">People</div>${bar('85%', 'bg-brand/70')}</div><div><div class="mb-1.5 text-[0.7rem] font-medium text-gray-500">Payroll</div>${bar('95%', 'bg-emerald-500/70')}</div></div></div>
          <div class="${CARD} absolute -right-[4%] top-[4%] w-[32%] min-w-[13.5rem] max-w-[16rem] p-4"><div class="mb-3 flex items-center gap-2 text-[0.8rem] font-semibold text-[#0f1f3d]">${ic('CheckCircle2', 16, 'text-brand')} Recent activity</div>
            <ul class="space-y-2.5">${['Payroll processed', 'Invoices checked', 'Compliance check'].map((t, i) => `<li class="flex items-center gap-2.5 text-[0.76rem] text-gray-700"><span class="h-2 w-2 shrink-0 rounded-full ${i ? 'bg-brand' : 'bg-emerald-500'}"></span><span class="flex-1">${t}</span>${bar('20%')}</li>`).join('')}</ul></div>
          <div class="${CARD} absolute -left-[3%] top-[80%] flex h-20 w-20 items-center justify-center">${ic('FileCheck2', 34, 'text-brand', 1.5)}</div>
          <div class="${CARD} absolute -right-[4%] top-[68%] flex min-w-[13rem] items-center gap-3 px-4 py-3"><span class="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-soft text-brand">${ic('BarChart3', 18)}</span><span class="leading-tight"><span class="block text-[0.8rem] font-semibold text-[#0f1f3d]">On track</span><span class="block text-[0.72rem] text-gray-500">Key operations</span></span></div>
        </div></div></div></main>
    <footer class="relative z-10 border-t border-line/70 bg-white/60"><div class="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-x-6 gap-y-2 px-[4vw] py-4 text-[0.78rem] text-gray-500">
      <span>© 2026 Ops Hub demo. Internal use only.</span><nav aria-label="Footer links" class="flex items-center gap-5"><button type="button" class="font-medium transition-colors hover:text-brand" data-real="${esc(REAL('open the privacy notice.'))}">Privacy</button></nav></div></footer></div>`;
}

/* ---------- render and events ---------- */
const PAGES = { home, agents, review, console: consolePage, pricing, signin };
const app = document.getElementById('app');
function render(focusSel) {
  const active = document.activeElement, sel = focusSel || (active && active !== document.body && keyOf(active)), caret = active?.selectionStart;
  app.innerHTML = S.route === 'signin' ? signin() : `<div class="flex min-h-[100dvh]">${rail()}<div class="min-w-0 flex-1">${topbar()}<main class="px-8 py-7">${PAGES[S.route]()}</main></div></div>`;
  document.documentElement.dataset.route = S.route;
  if (sel) { const el = app.querySelector(sel); if (el) { el.focus({ preventScroll: true }); if (caret != null && el.setSelectionRange) try { el.setSelectionRange(caret, caret); } catch {} } }
}
// A selector that finds the same control again after a redraw.
function keyOf(el) {
  for (const a of ['data-edit', 'data-input', 'data-go', 'data-step', 'data-group', 'data-client', 'data-filter', 'data-pick', 'data-div', 'data-from', 'data-ctab', 'data-cfilter', 'data-ctype', 'data-csel', 'data-copen'])
    if (el.hasAttribute?.(a)) return `[${a}="${CSS.escape(el.getAttribute(a))}"]`;
  for (const a of ['data-collapse', 'data-feed', 'data-hold', 'data-approve', 'data-add', 'data-call', 'data-capprove']) if (el.hasAttribute?.(a)) return `[${a}]`;
  return null;
}
const go = r => { S.route = r; S.search = ''; location.hash = '/' + r; render(); app.querySelector('main')?.focus?.(); };
function nextOpen() { return CLIENTS.find(c => S.status[c.id] === 'open'); }
app.addEventListener('click', e => {
  const t = e.target.closest('button, [data-crow], [data-cclose]'); if (!t || t.disabled || t.closest('[data-real]')) return;
  const d = t.dataset;
  if (d.go) return go(d.go);
  if (d.stop !== undefined && !e.target.closest('button')) return;
  if (t.hasAttribute('data-collapse')) S.collapsed = !S.collapsed;
  else if (d.expand) { S.collapsed = false; S.open.add(d.expand); }
  else if (d.group) S.open.has(d.group) ? S.open.delete(d.group) : S.open.add(d.group);
  else if (d.step) S.step = d.step;
  else if (t.hasAttribute('data-feed')) S.feedAll = !S.feedAll;
  else if (d.clientGo) { S.client = d.clientGo; S.filter = S.status[d.clientGo] === 'open' ? 'open' : S.status[d.clientGo] === 'held' ? 'held' : 'done'; return go('review'); }
  else if (d.filter) S.filter = d.filter;
  else if (d.client) { S.client = d.client; S.error = ''; S.note = ''; }
  else if (d.div) S.tab[S.client] = d.div;
  else if (d.from) { const c = CLIENTS.find(x => x.id === S.client), inv = c.invoices.find(i => i.key === S.tab[c.id]) || c.invoices[0]; S.from[inv.key] = d.from; S.edits[inv.key] = linesOf(inv, d.from); }
  else if (d.pick) {
    const [qi, ai] = d.pick.split(':').map(Number), c = CLIENTS.find(x => x.id === S.client), inv = c.invoices[0], k = `${c.id}:${qi}`, a = c.asks[qi];
    const undo = S.picks[k] !== undefined ? a.answers[S.picks[k]] : null, ed = editsFor(c, inv);
    if (undo?.add) { const n = ed.findIndex(x => x.item === undo.add.item); if (n >= 0) ed.splice(n, 1); }
    if (undo?.remove) ed.push(...inv.agents.filter(l => l.item === undo.remove).map(l => ({ ...l })));
    if (undo?.set) { const l = ed.find(x => x.item === undo.set.item); const orig = inv.agents.find(x => x.item === undo.set.item); if (l && orig) l.qty = orig.qty; }
    if (S.picks[k] === ai) delete S.picks[k];
    else { S.picks[k] = ai; const ans = a.answers[ai];
      if (ans.add) ed.push({ ...ans.add });
      if (ans.remove) for (let n = ed.length - 1; n >= 0; n--) if (ed[n].item === ans.remove) ed.splice(n, 1);
      if (ans.set) { const l = ed.find(x => x.item === ans.set.item); if (l) l.qty = ans.set.qty; } }
  }
  else if (d.remove !== undefined) { const c = CLIENTS.find(x => x.id === S.client), inv = c.invoices.find(i => i.key === S.tab[c.id]) || c.invoices[0]; S.edits[inv.key].splice(Number(d.remove), 1); }
  else if (t.hasAttribute('data-add')) { const c = CLIENTS.find(x => x.id === S.client), inv = c.invoices.find(i => i.key === S.tab[c.id]) || c.invoices[0]; S.edits[inv.key].push({ item: 'TM-05', desc: RECORD['TM-05'].desc, qty: 1, price: RECORD['TM-05'].price }); }
  else if (t.hasAttribute('data-approve') || t.hasAttribute('data-hold')) {
    const c = CLIENTS.find(x => x.id === S.client);
    if (t.hasAttribute('data-approve') && c.asks.some((_, qi) => S.picks[`${c.id}:${qi}`] === undefined)) S.error = 'Answer the agents’ question first.';
    else { S.status[c.id] = t.hasAttribute('data-hold') ? 'held' : 'decided'; S.error = ''; S.note = ''; const n = nextOpen(); if (n) S.client = n.id; else return go('agents'); }
  }
  else if (d.ctab) S.cTab = d.ctab;
  else if (d.cfilter) S.cFilter = d.cfilter;
  else if (d.ctype) S.cType = d.ctype;
  else if (d.copen) S.cOpen = d.copen;
  else if (d.crow && !e.target.closest('input')) S.cOpen = d.crow;
  else if (t.hasAttribute('data-cclose')) { if (e.target.closest('[data-stop]') && !e.target.closest('button[data-cclose]')) return; S.cOpen = null; }
  else if (t.hasAttribute('data-capprove')) { S.drafts.forEach(x => { if (S.cSel.has(x.fein)) x.approved = true; }); S.cSel.clear(); }
  else if (d.capproveOne) S.drafts.find(x => x.fein === d.capproveOne).approved = true;
  else if (d.cedit) S.drafts.find(x => x.fein === d.cedit).edited = true;
  else return;
  render();
});
app.addEventListener('change', e => {
  const t = e.target;
  if (t.dataset.csel) { t.checked ? S.cSel.add(t.dataset.csel) : S.cSel.delete(t.dataset.csel); render(); }
  else if (t.hasAttribute('data-call')) { const vis = [...app.querySelectorAll('[data-csel]')].map(x => x.dataset.csel); vis.forEach(f => t.checked ? S.cSel.add(f) : S.cSel.delete(f)); render('[data-call]'); }
});
app.addEventListener('input', e => {
  const t = e.target;
  if (t.dataset.input) { S[t.dataset.input] = t.value; return render(); }
  if (t.dataset.edit) {
    const [n, f] = t.dataset.edit.split(':'), c = CLIENTS.find(x => x.id === S.client), inv = c.invoices.find(i => i.key === S.tab[c.id]) || c.invoices[0];
    S.edits[inv.key][Number(n)][f] = t.value.trim() === '' ? NaN : Number(t.value); render();
  }
});
app.addEventListener('keydown', e => { if (e.key === 'Escape' && S.cOpen) { S.cOpen = null; render(); } });
window.addEventListener('hashchange', () => { const r = location.hash.replace('#/', ''); if (isRoute(r) && r !== S.route) { S.route = r; render(); } });
const start = location.hash.replace('#/', '');
if (isRoute(start)) S.route = start;
mini({ label: 'Demo, made-up data', ok: 'OK' });
render();
