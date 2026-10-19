/* Support miniature: the support desk's real layout (dark rail, white top bar,
   Today, the ticket table, one ticket with its AI triage, Settings) redrawn as
   static HTML with the app's own Tailwind classes and made-up tickets. Changes
   to a ticket stay in this page. Anything that would email, text, call the AI,
   open a pull request or save settings shows a note instead. */
import { mini, esc, svg } from '../mini.js';
import { I } from './icons.js';
import { TENANT, APPS, TEAM, ME, ROUTES, TEMPLATES, TICKETS, SUMMARY, USAGE, HISTORY } from './data.js';

const ic = (n, size = 16, cls = '', stroke = 2) => svg(I[n], { size, cls, stroke });
const REAL = what => `In the real product this would ${what}`;
const NOW = Date.now();
const MIN = 60000;
const at = m => (m == null ? null : NOW - m * MIN);

/* ---------- labels and helpers (api.ts) ---------- */
const STATUS_LABEL = { new: 'Open', open: 'In progress', pending: 'Waiting on customer', on_hold: 'On hold', solved: 'Resolved', closed: 'Closed' };
const PRIORITY_LABEL = { P0: 'Urgent', P1: 'High', P2: 'Medium', P3: 'Low' };
const TYPE_LABEL = { bug: 'Bug', how_to: 'How-to', account_billing: 'Account / billing', feature: 'Feature request', spam: 'Spam' };
const CHANNEL = { email: ['Mail', 'Email'], portal: ['MessageSquare', 'Help button'], api: ['MessageSquare', 'Added by staff or API'], phone: ['Phone', 'Phone'], sms: ['Smartphone', 'Text'] };
const CHANNEL_LABEL = { email: 'Email', portal: 'Help button', api: 'Added by staff or API', phone: 'Phone', sms: 'Text message' };
function since(ms) { const mins = Math.max(0, Math.floor((NOW - ms) / MIN)); if (mins < 60) return `${mins}m`; const h = Math.floor(mins / 60); if (h < 24) return mins % 60 ? `${h}h ${mins % 60}m` : `${h}h`; return `${Math.floor(h / 24)}d`; }
const waitTone = ms => { const h = (NOW - ms) / 3600000; return h >= 24 ? 'late' : h >= 2 ? 'warn' : 'ok'; };
function ago(ms) { const mins = Math.floor((Date.now() - ms) / MIN); if (mins < 1) return 'just now'; if (mins < 60) return `${mins} min ago`; const h = Math.floor(mins / 60); if (h < 24) return `${h} h ago`; const d = Math.floor(h / 24); return d === 1 ? 'yesterday' : `${d} days ago`; }
function when(ms) {
  const d = new Date(ms), today = new Date(), yest = new Date(); yest.setDate(today.getDate() - 1);
  const same = (a, b) => a.toDateString() === b.toDateString();
  return { day: same(d, today) ? 'Today' : same(d, yest) ? 'Yesterday' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), time: d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) };
}
const stamp = ms => new Date(ms).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
const person = id => TEAM.find(p => p.id === id);
const appName = k => APPS.find(a => a.key === k)?.name ?? k;
const initials = name => (name || '?').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('') || '?';
const custName = c => c.name ?? c.email ?? c.phone ?? 'Unknown sender';
const active = t => !['solved', 'closed'].includes(t.status);
const needsReview = t => !t.priority && active(t);

/* ---------- state ---------- */
const S = {
  page: 'today', ref: '', app: '', section: 'general',
  collapsed: false, appsOpen: false, q: '', status: 'all', sort: 'newest', owner: '', picked: new Set(),
  pop: null, dialog: null, mode: 'reply', draft: '', triageOpen: {}, toasts: [],
  tickets: TICKETS.map(t => ({ ...t, created_at: at(t.created), updated_at: at(t.updated), waiting_since: at(t.waiting), first_response_at: at(t.first),
    messages: t.messages.map((m, i) => ({ ...m, id: `${t.ref}-m${i}`, at: at(m.at) })), notes: (t.notes || []).map((n, i) => ({ ...n, id: `${t.ref}-n${i}`, at: at(n.at) })) })),
  ws: { name: TENANT.name, prefix: TENANT.prefix, desc: 'Payroll, time clock and client portals for small service companies. Customers are office managers and their crews.', sort: '0.80', fix: '0.90', notify: 'dana@example.com\nsupport-team@example.com' },
  routes: Object.fromEntries(ROUTES.map(r => [r.area, r.owner])),
  team: TEAM.map(p => ({ ...p, active: true, invited: p.id === 'u5' })),
  invite: { name: '', email: '', role: 'agent' },
};
const T = ref => S.tickets.find(t => t.ref === ref);

/* ---------- shared pieces (ui.tsx) ---------- */
const PRIORITY_STYLE = { P0: 'bg-rose-600 text-white ring-rose-600', P1: 'bg-rose-50 text-rose-700 ring-rose-200', P2: 'bg-amber-50 text-amber-800 ring-amber-200', P3: 'bg-emerald-50 text-emerald-700 ring-emerald-200' };
const PriorityBadge = p => !p ? `<span title="No priority set yet" class="text-[0.78rem] text-muted">Not set</span>`
  : `<span title="${p}" class="inline-flex whitespace-nowrap rounded-md px-1.5 py-px text-[0.75rem] xl:text-[0.72rem] font-semibold ring-1 ring-inset ${PRIORITY_STYLE[p]}">${PRIORITY_LABEL[p]}</span>`;
const ReviewMark = () => `<span title="The AI was not sure, so a person should check it and set a priority" class="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-violet-50 px-2 py-0.5 text-[0.75rem] xl:text-[0.72rem] font-semibold text-violet-700 ring-1 ring-inset ring-violet-200">${ic('Sparkles', 11)} Review</span>`;
function WaitPill(ms) {
  const tone = waitTone(ms);
  const cls = tone === 'late' ? 'bg-rose-50 text-rose-700 ring-rose-200' : tone === 'warn' ? 'bg-amber-50 text-amber-800 ring-amber-200' : 'bg-gray-100 text-gray-600 ring-gray-200';
  return `<span title="Waiting since ${esc(new Date(ms).toLocaleString('en-US'))}" class="tnum inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[0.75rem] font-semibold ring-1 ring-inset ${cls}">${ic('Clock3', 11)} ${since(ms)}</span>`;
}
const TYPE_STYLE = { bug: 'bg-rose-50 text-rose-700', how_to: 'bg-sky-50 text-sky-800', account_billing: 'bg-emerald-50 text-emerald-800', feature: 'bg-violet-50 text-violet-700', spam: 'bg-gray-100 text-gray-600' };
const TypeBadge = t => t && TYPE_STYLE[t] ? `<span class="rounded-md px-1.5 py-0.5 text-[0.75rem] xl:text-[0.72rem] font-semibold ${TYPE_STYLE[t]}">${TYPE_LABEL[t]}</span>` : '';
const STATUS_ICON = { new: 'CircleDot', open: 'Clock3', pending: 'Hourglass', on_hold: 'PauseCircle', solved: 'CheckCircle2', closed: 'Archive' };
const STATUS_STYLE = { new: 'bg-blue-50 text-blue-700 ring-blue-200', open: 'bg-indigo-50 text-indigo-700 ring-indigo-200', pending: 'bg-amber-50 text-amber-800 ring-amber-200', on_hold: 'bg-slate-100 text-slate-700 ring-slate-300', solved: 'bg-emerald-50 text-emerald-700 ring-emerald-200', closed: 'bg-gray-100 text-gray-600 ring-gray-200' };
const StatusBadge = s => `<span class="inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[0.75rem] xl:text-[0.74rem] font-semibold ring-1 ring-inset transition-colors ${STATUS_STYLE[s]}">${ic(STATUS_ICON[s], 12)}${STATUS_LABEL[s]}</span>`;
const Card = (inner, cls = '') => `<div class="rounded-card border border-line bg-white shadow-e1 ${cls}">${inner}</div>`;
const BTN = 'inline-flex h-11 xl:h-10 items-center justify-center gap-1.5 rounded-[10px] px-4 text-[0.88rem] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 disabled:opacity-50';
const PRIMARY = `${BTN} bg-brand text-ink shadow-e2 hover:bg-brand-dark`;
const QUIET = `${BTN} border border-line bg-white text-gray-700 hover:border-gray-400 hover:text-ink`;
const SMALL = 'inline-flex h-11 xl:h-9 items-center gap-1.5 rounded-[10px] border border-line bg-white px-3 text-[0.84rem] font-semibold text-gray-700 transition-colors hover:border-gray-400 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 disabled:opacity-50';
const INPUT = 'min-h-11 w-full rounded-[10px] border border-line bg-white px-3 py-2 text-[1rem] xl:min-h-0 xl:text-[0.9rem] transition-colors focus:border-brand-ink focus:outline-none focus:ring-2 focus:ring-brand/15';
const EYEBROW = 'text-[0.75rem] xl:text-[0.72rem] font-bold uppercase tracking-[0.12em] text-muted';
const Avatar = (name, size = 34, cls = 'bg-rail') => `<span aria-hidden="true" class="inline-flex shrink-0 items-center justify-center rounded-full font-bold text-white ${cls}" style="width:${size}px;height:${size}px;font-size:${(size * 0.38).toFixed(1)}px">${esc(initials(name))}</span>`;
const MenuItem = (inner, attrs, icon = '', danger = false) => `<button type="button" ${attrs} class="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[0.85rem] transition-colors disabled:opacity-50 ${danger ? 'text-rose-700 hover:bg-rose-50' : 'text-gray-700 hover:bg-canvas'}">${icon ? ic(icon, 15, 'shrink-0 text-gray-400') : ''}<span class="min-w-0 flex-1">${inner}</span></button>`;
// A popover trigger; its panel is drawn in the floating layer (see popLayer).
const PopBtn = (id, label, cls, inner) => `<div class="relative"><button type="button" data-pop="${esc(id)}" data-pop-trigger="${esc(id)}" aria-label="${esc(label)}" aria-haspopup="true" aria-expanded="${S.pop === id}" class="${cls}">${inner}</button></div>`;
const EmptyState = (icon, title, text, action = '') => `<div class="flex flex-col items-center px-6 py-14 text-center"><span class="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-canvas text-muted">${ic(icon, 26)}</span><h3 class="text-[1rem] font-bold">${esc(title)}</h3><p class="mt-1 max-w-sm text-[0.88rem] text-muted">${esc(text)}</p>${action ? `<div class="mt-4">${action}</div>` : ''}</div>`;
function toast(text) {
  const id = Math.random();
  S.toasts.push({ id, text });
  setTimeout(() => { S.toasts = S.toasts.filter(x => x.id !== id); drawToasts(); }, 3200);
}
function drawToasts() {
  const box = document.getElementById('toasts'); if (!box) return;
  box.innerHTML = S.toasts.map(t => `<div role="status" class="pointer-events-auto flex items-start gap-2 rounded-xl px-4 py-3 text-[0.86rem] font-medium shadow-e8 animate-slide-up bg-ink text-white">${ic('CheckCircle2', 16, 'mt-px shrink-0 text-emerald-300')}<span>${esc(t.text)}</span></div>`).join('');
}

/* ---------- sidebar (App.tsx) ---------- */
const NAV_ITEM = 'flex min-h-11 items-center gap-3 rounded-[10px] px-3 py-2.5 text-[0.9rem] xl:min-h-0 font-semibold transition-colors';
const NAV_ON = 'bg-white/[.12] text-white shadow-[inset_3px_0_0_#FF7A3D]';
const NAV_OFF = 'text-rail-text/80 hover:bg-white/10 hover:text-rail-text';
const appOpen = () => Object.fromEntries(APPS.map(a => [a.key, S.tickets.filter(t => t.app === a.key && active(t)).length]));
function sidebar() {
  const c = S.collapsed, n = appOpen(), total = Object.values(n).reduce((a, b) => a + b, 0);
  const onTickets = S.page === 'tickets' || S.page === 'ticket';
  const nav = c ? `<div class="space-y-1">
      <a href="#/tickets" aria-label="Tickets" title="Tickets (${total} open)" ${onTickets ? 'aria-current="page"' : ''} class="${NAV_ITEM} relative justify-center px-0 ${onTickets ? NAV_ON : NAV_OFF}">${ic('Inbox', 19)}</a>
      ${APPS.map(a => `<a href="#/apps/${a.key}" aria-label="${esc(a.name)}" title="${esc(a.name)} (${n[a.key]} open)" ${S.page === 'app' && S.app === a.key ? 'aria-current="page"' : ''} class="${NAV_ITEM} relative justify-center px-0 text-[0.78rem] font-bold ${S.page === 'app' && S.app === a.key ? NAV_ON : NAV_OFF}">${initials(a.name)}</a>`).join('')}</div>`
    : `<div><a href="#/tickets" ${onTickets ? 'aria-current="page"' : ''} class="${NAV_ITEM} ${onTickets ? NAV_ON : NAV_OFF}">${ic('Inbox', 18)} <span class="flex-1">Tickets</span></a>
      <div class="mt-2"><button type="button" data-act="apps" aria-expanded="${S.appsOpen}" aria-controls="nav-apps" class="flex min-h-11 w-full items-center gap-2 rounded-lg px-3 py-1.5 text-[0.75rem] xl:min-h-0 xl:text-[0.72rem] font-bold uppercase tracking-[0.12em] text-rail-muted transition-colors hover:bg-white/10 hover:text-rail-text">${ic('Building2', 13)} <span class="flex-1 text-left">${esc(S.ws.name)}</span>${ic('ChevronDown', 14, `transition-transform ${S.appsOpen ? '' : '-rotate-90'}`)}</button>
      ${S.appsOpen ? `<div id="nav-apps" role="group" aria-label="${esc(S.ws.name)} apps" class="mt-0.5 space-y-0.5 animate-fade-in">${APPS.map(a => { const on = S.page === 'app' && S.app === a.key;
        return `<a href="#/apps/${a.key}" ${on ? 'aria-current="page"' : ''} class="flex min-h-11 items-center gap-2 rounded-lg py-1.5 pl-11 pr-3 text-[0.84rem] transition-colors xl:min-h-0 ${on ? 'bg-white/10 font-semibold text-brand' : 'text-rail-text/75 hover:bg-white/10 hover:text-rail-text'}"><span class="min-w-0 flex-1 truncate">${esc(a.name)}</span>${n[a.key] > 0 ? `<span class="tnum rounded-full bg-white/10 px-1.5 text-[0.75rem] xl:text-[0.7rem] font-semibold text-rail-text">${n[a.key]}</span>` : ''}</a>`; }).join('')}</div>` : ''}</div></div>`;
  return `<aside id="sidebar" aria-label="Sidebar" class="sticky top-0 h-screen shrink-0 overflow-y-auto overflow-x-hidden bg-rail py-6 transition-[width] duration-200 ${c ? 'w-[76px] px-3' : 'w-64 px-3'}"><div class="flex h-full flex-col">
    <a href="#/today" aria-label="Support home" class="mb-7 flex min-h-11 items-center gap-3 xl:min-h-0 ${c ? 'justify-center' : 'px-2'}"><span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand text-ink shadow-[0_6px_18px_rgba(255,122,61,.25)]">${ic('LifeBuoy', 20)}</span>
      ${c ? '' : `<span><span class="block font-display text-[1.05rem] font-extrabold leading-tight tracking-[-0.01em] text-rail-text">Support</span><span class="block text-[0.75rem] xl:text-[0.74rem] text-rail-muted">Support. Solutions. Faster.</span></span>`}</a>
    <nav aria-label="Main" class="space-y-1">
      <a href="#/today" ${c ? 'aria-label="Today" title="Today"' : ''} ${S.page === 'today' ? 'aria-current="page"' : ''} class="${NAV_ITEM} mb-2 ${c ? 'justify-center px-0' : ''} ${S.page === 'today' ? NAV_ON : NAV_OFF}">${ic('Sun', 18)} ${c ? '' : 'Today'}</a>
      ${nav}</nav>
    <div class="mt-auto space-y-1 border-t border-rail-line pt-4">
      <a href="#/settings/general" ${c ? 'aria-label="Settings" title="Settings"' : ''} ${S.page === 'settings' ? 'aria-current="page"' : ''} class="${NAV_ITEM} ${c ? 'justify-center px-0' : ''} ${S.page === 'settings' ? NAV_ON : NAV_OFF}">${ic('Settings', 18)} ${c ? '' : 'Settings'}</a>
      <button type="button" ${c ? 'aria-label="Sign out" title="Sign out"' : ''} data-real="${esc(REAL('end your session and return to the sign-in page.'))}" class="${NAV_ITEM} ${NAV_OFF} w-full ${c ? 'justify-center px-0' : ''}">${ic('LogOut', 17)} ${c ? '' : 'Sign out'}</button>
    </div></div></aside>`;
}

/* ---------- top bar (Topbar.tsx) ---------- */
const meUser = () => S.team.find(p => p.id === ME);
function topbar() {
  const fresh = S.tickets.filter(t => t.status === 'new').length;
  const u = meUser();
  return `<header class="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/80"><div class="flex h-16 items-center gap-2 px-3 sm:gap-3 sm:px-6 lg:px-8">
    <button type="button" data-act="collapse" aria-controls="sidebar" aria-label="${S.collapsed ? 'Expand the sidebar' : 'Collapse the sidebar'}" title="${S.collapsed ? 'Expand the sidebar' : 'Collapse the sidebar'}" class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-muted xl:h-10 xl:w-10 transition-colors hover:bg-canvas hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50">${ic(S.collapsed ? 'PanelLeftOpen' : 'PanelLeftClose', 20)}</button>
    <form role="search" data-search class="relative min-w-0 flex-1 md:max-w-[460px]"><label for="ticket-search" class="sr-only">Search tickets</label>${ic('Search', 16, 'pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400')}
      <input id="ticket-search" data-input="q" value="${esc(S.q)}" placeholder="Search tickets (ID, subject, or requester...)" class="h-11 w-full rounded-xl border border-line bg-white pl-9 pr-20 text-[0.88rem] shadow-e1 transition-[border-color,box-shadow] placeholder:text-gray-400 focus:border-brand-ink focus:outline-none focus:ring-2 focus:ring-brand/15">
      <span class="absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center gap-1">${S.q ? `<button type="button" data-act="clearq" aria-label="Clear search" class="flex min-h-9 min-w-9 items-center justify-center rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-ink xl:min-h-0 xl:min-w-0">${ic('X', 14)}</button>` : ''}<kbd class="hidden rounded-md border border-line bg-canvas px-1.5 py-0.5 font-sans text-[0.75rem] xl:text-[0.7rem] font-semibold text-gray-500 sm:inline">Ctrl K</kbd></span></form>
    <div class="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
      ${PopBtn('bell', `Notifications: ${fresh} open requests not picked up`, 'relative flex h-11 w-11 items-center justify-center rounded-xl text-gray-600 transition-colors hover:bg-white hover:text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
        `${ic('Bell', 19)}${fresh ? `<span class="tnum absolute right-1.5 top-1.5 min-w-[18px] rounded-full bg-rose-600 px-1 text-center text-[0.75rem] xl:text-[0.64rem] font-bold leading-[18px] text-white">${fresh > 9 ? '9+' : fresh}</span>` : ''}`)}
      <span class="mx-1 hidden h-7 w-px bg-line sm:block" aria-hidden="true"></span>
      ${PopBtn('profile', 'Account', `flex items-center gap-2.5 rounded-xl py-1 pl-1 pr-1 transition-colors hover:bg-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 sm:pr-2.5 ${S.pop === 'profile' ? 'bg-canvas' : ''}`,
        `<span class="relative">${Avatar(u.name, 36)}</span><span class="hidden text-left leading-tight sm:block"><span class="block max-w-[140px] truncate text-[0.86rem] font-semibold text-ink">${esc(u.name)}</span><span class="block text-[0.75rem] xl:text-[0.74rem] text-muted">Admin</span></span>${ic('ChevronDown', 15, `hidden text-muted transition-transform sm:block ${S.pop === 'profile' ? 'rotate-180' : ''}`)}`)}
    </div></div></header>`;
}
const ROW = 'group flex min-h-11 w-full items-center gap-3 rounded-[10px] px-2 py-1.5 text-left transition-colors xl:min-h-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40';
const MenuRow = (icon, label, hint, attrs, danger = false) => `<button type="button" ${attrs} class="${ROW} ${danger ? 'hover:bg-rose-50' : 'hover:bg-canvas'}"><span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${danger ? 'bg-rose-50 text-rose-700' : 'bg-canvas text-muted group-hover:bg-white group-hover:text-brand-ink'}">${ic(icon, 16)}</span><span class="min-w-0 flex-1"><span class="block truncate text-[0.86rem] font-semibold ${danger ? 'text-rose-700' : 'text-ink'}">${esc(label)}</span>${hint ? `<span class="block truncate text-[0.75rem] text-muted">${esc(hint)}</span>` : ''}</span></button>`;
const POPS = {
  bell: ['right', 'w-[min(88vw,340px)]', () => { const rows = S.tickets.filter(t => t.status === 'new').sort((a, b) => b.created_at - a.created_at);
    return `<div><div class="px-2.5 pb-1.5 pt-1 text-[0.78rem] font-bold text-gray-500">Waiting for a first look</div>${rows.length ? '' : '<p class="px-2.5 py-4 text-[0.85rem] text-muted">Nothing new. You are all caught up.</p>'}
      ${rows.slice(0, 6).map(t => `<a href="#/tickets/${t.ref}" class="block rounded-lg px-2.5 py-2 hover:bg-canvas"><span class="block truncate text-[0.86rem] font-semibold">${esc(t.subject)}</span><span class="text-[0.76rem] text-muted">${t.ref} · ${esc(custName(t.customer))} · ${ago(t.created_at)}</span></a>`).join('')}</div>`; }],
  profile: ['right', 'w-[min(320px,calc(100vw-16px))]', () => { const u = meUser();
    return `<div><div class="flex items-center gap-3 rounded-[10px] bg-canvas p-3">${Avatar(u.name, 42)}<div class="min-w-0 flex-1"><div class="truncate font-display text-[0.95rem] font-extrabold leading-tight tracking-[-0.01em] text-ink">${esc(u.name)}</div><div class="truncate text-[0.78rem] text-muted">${esc(u.email)}</div>
      <div class="mt-1.5 flex flex-wrap items-center gap-1.5"><span class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.7rem] font-bold border border-line bg-white text-gray-700">Admin</span><span class="inline-flex max-w-full items-center gap-1 truncate rounded-full border border-line bg-white px-2 py-0.5 text-[0.7rem] font-semibold text-gray-700">${ic('Building2', 11, 'shrink-0 text-muted')} <span class="truncate">${esc(S.ws.name)}</span></span></div></div></div>
      <div class="px-1 pb-1 pt-2"><div class="text-[0.7rem] font-bold uppercase tracking-[0.12em] text-muted px-2 pb-1">Account</div>
        ${MenuRow('UserCog', 'Your account', 'Name and password', `data-real="${esc(REAL('open your name and password settings.'))}"`)}
        ${MenuRow('Settings', 'Workspace settings', `${S.ws.name}: team, email, Help button`, 'data-go="#/settings/general"')}</div>
      <div class="border-t border-hair px-1 pt-1">${MenuRow('LogOut', 'Sign out', '', `data-real="${esc(REAL('end your session and return to the sign-in page.'))}"`, true)}</div></div>`; }],
};

/* ---------- Today (Today.tsx) ---------- */
function today() {
  const rows = S.tickets.filter(active).sort((a, b) => a.created_at - b.created_at);
  const mine = rows.filter(t => t.assignee === ME);
  const waiting = rows.filter(t => t.waiting_since).sort((a, b) => a.waiting_since - b.waiting_since);
  const review = rows.filter(t => !t.priority), nobody = rows.filter(t => !t.assignee);
  const late = waiting.filter(t => waitTone(t.waiting_since) !== 'ok').length;
  const hour = new Date().getHours(), hello = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const line = rows.length === 0 ? 'All caught up. Nothing open right now.' : [`${rows.length} open`, waiting.length && `${waiting.length} waiting on a reply`, waiting[0] && `oldest ${since(waiting[0].waiting_since)}`].filter(Boolean).join(' · ');
  const fr = SUMMARY.first_reply_min;
  const stats = [['Assigned to you', mine.length], ['Waiting on a reply', waiting.length, late ? `${late} over 2 hours` : ''], ['Avg first reply, 7 days', fr < 60 ? `${fr}m` : `${Math.floor(fr / 60)}h ${fr % 60}m`], ['Solved, 7 days', SUMMARY.solved_7]];
  const where = t => [t.app ? appName(t.app) : null, custName(t.customer)].filter(Boolean).join(' · ');
  const section = (icon, title, hint, list, empty, right, more) => Card(`<div class="flex items-start justify-between gap-3 border-b border-hair px-5 py-3.5"><div>
      <h2 class="flex items-center gap-2 text-[0.98rem] font-bold">${ic(icon, 17, 'text-muted')} ${esc(title)} <span class="tnum rounded-full bg-gray-100 px-1.5 text-[0.75rem] font-semibold text-gray-600">${list.length}</span></h2>${hint ? `<p class="mt-0.5 text-[0.8rem] text-muted">${esc(hint)}</p>` : ''}</div>
      ${more && list.length > 6 ? `<a href="${more}" class="shrink-0 text-[0.8rem] font-semibold text-ink hover:underline">See all</a>` : ''}</div>
    ${list.length === 0 ? `<p class="flex items-center gap-2 px-5 py-6 text-[0.88rem] text-muted">${ic('CheckCircle2', 16, 'text-emerald-600')} ${esc(empty)}</p>`
      : `<ul class="divide-y divide-hair">${list.slice(0, 6).map(t => `<li><a href="#/tickets/${t.ref}" class="flex min-h-11 items-center gap-3 px-5 py-2.5 transition-colors hover:bg-canvas"><span class="tnum w-[4.6rem] shrink-0 text-[0.8rem] font-semibold text-gray-600">${t.ref}</span><span class="min-w-0 flex-1"><span class="block truncate text-[0.88rem] font-semibold">${esc(t.subject)}</span><span class="block truncate text-[0.76rem] text-muted">${esc(where(t))}</span></span><span class="shrink-0">${right(t)}</span></a></li>`).join('')}</ul>`}`, 'flex min-w-0 flex-col overflow-hidden');
  return `<header class="mb-6"><div class="${EYEBROW}">${esc(S.ws.name)}</div><h1 class="mt-1 font-display text-[1.9rem] font-extrabold leading-tight tracking-[-0.02em]">${hello}, Dana</h1><p class="mt-1 text-[0.95rem] text-muted">${esc(line)}</p></header>
    <div class="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">${stats.map(([l, v, h]) => Card(`<div class="text-[0.8rem] font-semibold text-muted">${l}</div><div class="tnum mt-1 font-display text-[1.6rem] font-extrabold leading-none">${v}</div>${h ? `<div class="mt-1.5 text-[0.76rem] font-semibold text-amber-800">${h}</div>` : ''}`, 'px-4 py-3.5')).join('')}</div>
    <div class="grid gap-4 xl:grid-cols-2">
      ${section('Clock3', 'Waiting on a reply', 'Oldest first. The customer wrote last.', waiting, 'Every customer has an answer.', t => WaitPill(t.waiting_since))}
      ${section('UserCheck', 'Assigned to you', '', mine, 'Nothing assigned to you.', t => StatusBadge(t.status), '#/tickets')}
      ${section('Sparkles', 'AI wants a review', 'It was not sure, so a person should set the priority.', review, 'Nothing for the AI to hand over.', () => ReviewMark())}
      ${section('UserX', 'Nobody assigned', '', nobody, 'Every open ticket has an owner.', t => t.priority ? PriorityBadge(t.priority) : StatusBadge(t.status))}
    </div>`;
}

/* ---------- Tickets (TicketList.tsx) ---------- */
const TABS = [['all', 'All tickets', []], ['new', 'Open', ['new']], ['open', 'In progress', ['open']], ['pending', 'Waiting on customer', ['pending']], ['on_hold', 'On hold', ['on_hold']], ['resolved', 'Resolved', ['solved', 'closed']]];
const SORTS = [['newest', 'Newest first'], ['oldest', 'Oldest first'], ['urgent', 'Highest priority'], ['updated', 'Recently updated']];
function filtered(withStatus = true) {
  const q = S.q.trim().toLowerCase();
  let rows = S.tickets.filter(t => (!S.app || S.page !== 'app' || t.app === S.app)
    && (!S.owner || (S.owner === 'none' ? !t.assignee : t.assignee === S.owner))
    && (!q || [t.ref, t.subject, t.customer.name, t.customer.email, t.messages[0]?.body].some(x => (x || '').toLowerCase().includes(q))));
  if (withStatus && S.status !== 'all') { const tab = TABS.find(x => x[0] === S.status); rows = rows.filter(t => tab[2].includes(t.status)); }
  const rank = p => (p ? Number(p[1]) : 9);
  const by = { newest: (a, b) => b.created_at - a.created_at, oldest: (a, b) => a.created_at - b.created_at, urgent: (a, b) => rank(a.priority) - rank(b.priority) || b.created_at - a.created_at, updated: (a, b) => b.updated_at - a.updated_at };
  return rows.sort(by[S.sort]);
}
function workload() {
  const all = S.tickets.filter(t => S.page !== 'app' || t.app === S.app), n = s => all.filter(t => t.status === s).length;
  const open = n('new') + n('open'), waiting = n('pending'), hold = n('on_hold');
  if (open + waiting + hold === 0) return 'All caught up. Nothing open right now.';
  return [`${open} open`, waiting && `${waiting} waiting on customer`, hold && `${hold} on hold`].filter(Boolean).join(' · ');
}
const BULK = 'inline-flex h-11 xl:h-8 items-center gap-1.5 rounded-lg border border-white/25 px-2.5 text-[0.8rem] font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50';
function tickets() {
  const isApp = S.page === 'app', base = filtered(false), rows = filtered(true);
  const count = tab => tab[2].length ? base.filter(t => tab[2].includes(t.status)).length : base.length;
  const shown = new Set(rows.map(t => t.ref)), ticked = [...S.picked].filter(r => shown.has(r));
  const anyFilter = !!S.owner || !!S.q || S.status !== 'all';
  const allOn = rows.length > 0 && rows.every(t => S.picked.has(t.ref));
  const box = 'h-4 w-4 cursor-pointer rounded border-gray-300 accent-ink';
  const table = `<table class="w-full table-fixed text-left"><caption class="sr-only">Tickets</caption><thead><tr class="border-b border-hair bg-canvas text-[0.76rem] font-semibold text-muted">
      <th scope="col" class="w-11 py-2.5 pl-5"><input type="checkbox" data-act="tickall" class="${box}" ${allOn ? 'checked' : ''} aria-label="${allOn ? 'Untick every ticket' : 'Tick every ticket shown'}"></th>
      <th scope="col" class="w-[6.5rem] py-2.5 pr-2 pl-2">ID</th><th scope="col" class="px-2">Subject</th><th scope="col" class="w-40 px-2">App / channel</th><th scope="col" class="w-32 px-2">Assignee</th><th scope="col" class="w-[5.5rem] px-2">Priority</th><th scope="col" class="w-[10.5rem] px-2">Status</th>
      <th scope="col" class="w-[6.5rem] px-2"><button type="button" data-act="sortcreated" class="inline-flex items-center gap-1 hover:text-ink" aria-label="${S.sort === 'oldest' ? 'Created: oldest first. Sort newest first' : 'Created: newest first. Sort oldest first'}">Created ${ic(S.sort === 'oldest' ? 'ArrowUp' : S.sort === 'newest' ? 'ArrowDown' : 'ArrowUpDown', 12)}</button></th>
      <th scope="col" class="w-12 pr-4 text-right"><span class="sr-only">Actions</span></th></tr></thead>
    <tbody>${rows.map(t => { const [icon, how] = CHANNEL[t.channel], w = when(t.created_at), on = S.picked.has(t.ref), who = person(t.assignee);
      return `<tr data-open="${t.ref}" class="group cursor-pointer border-b border-hair transition-colors last:border-0 hover:bg-canvas ${on ? 'bg-canvas' : ''}">
        <td class="py-3.5 pl-5" data-stop><input type="checkbox" data-tick="${t.ref}" class="${box}" ${on ? 'checked' : ''} aria-label="Tick ${t.ref}"></td>
        <td class="tnum py-3.5 pr-2 text-[0.84rem] font-semibold text-gray-600 pl-2">${t.ref}</td>
        <td class="px-2 py-3.5"><a href="#/tickets/${t.ref}" class="block truncate text-[0.9rem] font-semibold text-ink group-hover:underline">${esc(t.subject)}</a><span class="block truncate text-[0.8rem] text-muted">${esc(t.messages[0]?.body ?? custName(t.customer))}</span></td>
        <td class="px-2"><div class="flex items-center gap-2"><span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-canvas text-muted">${ic(icon, 15)}</span><span class="min-w-0"><span class="block truncate text-[0.84rem] font-semibold">${esc(t.app ? appName(t.app) : S.ws.name)}</span><span class="block truncate text-[0.75rem] xl:text-[0.74rem] text-muted">${how}</span></span></div></td>
        <td class="px-2">${who ? `<span class="flex min-w-0 items-center gap-1.5 text-[0.82rem] font-medium">${Avatar(who.name, 22)}<span class="truncate">${who.id === ME ? 'You' : esc(who.name.split(/\s+/)[0])}</span></span>` : '<span class="text-[0.8rem] text-muted">Nobody</span>'}</td>
        <td class="px-2">${PriorityBadge(t.priority)}</td>
        <td class="px-2"><div class="flex flex-wrap items-center gap-1.5">${StatusBadge(t.status)}${needsReview(t) ? ReviewMark() : ''}</div></td>
        <td class="px-2 text-[0.8rem]">${t.waiting_since && active(t) ? WaitPill(t.waiting_since) : `<span class="block font-medium text-ink">${w.day}</span>`}<span class="block text-muted">${t.waiting_since && active(t) ? w.day : w.time}</span></td>
        <td class="pr-4 text-right" data-stop>${PopBtn(`row:${t.ref}`, `Actions for ${t.ref}`, 'inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg p-1.5 text-gray-400 xl:min-h-0 xl:min-w-0 transition-colors hover:bg-gray-100 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40', ic('MoreHorizontal', 18))}</td></tr>`; }).join('')}</tbody></table>`;
  return `<header class="mb-6 flex flex-wrap items-end justify-between gap-4"><div><div class="${EYEBROW}">${isApp ? `${esc(S.ws.name)} · Help button` : 'Technical support'}</div>
      <h1 class="mt-1 font-display text-[1.9rem] font-extrabold leading-tight tracking-[-0.02em]">${isApp ? esc(appName(S.app)) : 'Tickets'}</h1>
      <p class="mt-1 text-[0.95rem] text-muted">${isApp ? `Requests people sent from the help button in ${esc(appName(S.app))}.` : esc(workload())}</p></div>
      <button type="button" class="${PRIMARY}" data-act="create">${ic('Plus', 16)} Create ticket</button></header>
    <div>${Card(`<div class="flex flex-col gap-1 border-b border-hair px-3 pt-2 sm:px-5 2xl:flex-row 2xl:items-end 2xl:justify-between 2xl:gap-3">
        <div role="tablist" aria-label="Ticket status" class="no-scrollbar -mb-px flex gap-1 overflow-x-auto">${TABS.map(tab => { const on = S.status === tab[0];
          return `<button type="button" role="tab" aria-selected="${on}" data-tab="${tab[0]}" class="flex shrink-0 items-center gap-2 border-b-2 px-3 pb-3 pt-2.5 text-[0.88rem] transition-colors ${on ? 'border-ink font-semibold text-ink' : 'border-transparent font-medium text-muted hover:text-ink'}">${tab[1]}<span class="tnum rounded-full px-1.5 text-[0.75rem] xl:text-[0.72rem] font-semibold transition-colors ${on ? 'bg-ink text-white' : 'bg-gray-100 text-gray-600'}">${count(tab)}</span></button>`; }).join('')}</div>
        <div class="flex shrink-0 flex-wrap items-center gap-2 pb-3">
          <div role="radiogroup" aria-label="Whose tickets" class="flex rounded-[10px] border border-line bg-canvas p-0.5">${[['', 'Everyone'], [ME, 'Mine'], ['none', 'Unassigned']].map(([v, l]) => `<button type="button" role="radio" aria-checked="${S.owner === v}" data-owner="${v}" class="min-h-11 rounded-lg px-3 text-[0.82rem] font-semibold transition-colors xl:min-h-0 xl:py-1 ${S.owner === v ? 'bg-white text-ink shadow-e1' : 'text-muted hover:text-ink'}">${l}</button>`).join('')}</div>
          ${PopBtn('sort', 'Sort tickets', SMALL, `${ic('ArrowUpDown', 15)} ${SORTS.find(s => s[0] === S.sort)[1]} ${ic('ChevronDown', 14, `transition-transform ${S.pop === 'sort' ? 'rotate-180' : ''}`)}`)}</div></div>
      ${S.q ? `<div class="flex flex-wrap items-center gap-2 border-b border-hair px-5 py-2.5"><span class="inline-flex items-center gap-1 rounded-full border border-line bg-canvas py-0.5 pl-2.5 pr-1 text-[0.78rem] font-medium text-ink animate-fade-in">Search: "${esc(S.q)}"<button type="button" data-act="clearq" aria-label="Remove filter: search" class="rounded-full p-0.5 hover:bg-hair">${ic('X', 12)}</button></span><button type="button" data-act="clearall" class="text-[0.8rem] font-semibold text-ink hover:underline">Clear all</button></div>` : ''}
      ${ticked.length ? `<div role="toolbar" aria-label="Change the ticked tickets" class="flex flex-wrap items-center gap-2 border-b border-hair bg-ink px-5 py-2.5 text-white animate-fade-in"><span class="mr-1 text-[0.86rem] font-semibold tnum">${ticked.length} ticked</span>
        <button type="button" class="${BULK}" data-bulk="assignee:${ME}">${ic('UserCheck', 14)} Assign to me</button>
        ${PopBtn('bulk-assign', 'Assign to', BULK, `Assign to ${ic('ChevronDown', 13)}`)}${PopBtn('bulk-status', 'Set status', BULK, `Status ${ic('ChevronDown', 13)}`)}${PopBtn('bulk-prio', 'Set priority', BULK, `Priority ${ic('ChevronDown', 13)}`)}
        <button type="button" class="${BULK} ml-auto border-transparent" data-act="untick">${ic('X', 14)} Clear</button></div>` : ''}
      ${rows.length ? table : anyFilter ? EmptyState('SearchX', 'No tickets found', S.q ? `Nothing matches "${S.q}" with the current filters.` : 'There aren’t any tickets matching your current filters.', `<button type="button" class="${SMALL}" data-act="clearall">Clear filters</button>`)
        : EmptyState('CheckCircle2', 'All caught up', 'Nothing here needs you right now. New requests show up on their own.')}`, 'min-w-0 overflow-hidden')}</div>`;
}
const pickedRefs = () => { const shown = new Set(filtered(true).map(t => t.ref)); return [...S.picked].filter(r => shown.has(r)); };
Object.assign(POPS, {
  sort: ['right', 'w-52', () => SORTS.map(([k, l]) => MenuItem(`<span class="${S.sort === k ? 'font-semibold text-ink' : ''}">${l}</span>`, `data-sort="${k}"`)).join('')],
  'bulk-assign': ['left', 'w-56', () => MenuItem('Nobody', 'data-bulk="assignee:"') + TEAM.filter(p => p.role !== 'viewer').map(p => MenuItem(esc(p.name), `data-bulk="assignee:${p.id}"`)).join('')],
  'bulk-status': ['left', 'w-56', () => Object.keys(STATUS_LABEL).filter(s => s !== 'closed').map(s => MenuItem(STATUS_LABEL[s], `data-bulk="status:${s}"`, STATUS_ICON[s])).join('')],
  'bulk-prio': ['left', 'w-48', () => Object.keys(PRIORITY_LABEL).map(p => MenuItem(PRIORITY_LABEL[p], `data-bulk="priority:${p}"`)).join('')],
});
function rowPop(ref) {
  const t = T(ref);
  return MenuItem('Open ticket', `data-go="#/tickets/${ref}"`, 'ExternalLink')
    + (t.assignee !== ME ? MenuItem('Assign to me', `data-one="${ref}|assignee:${ME}"`, 'UserCheck') : '')
    + (t.status !== 'open' ? MenuItem('Mark in progress', `data-one="${ref}|status:open"`, 'Clock3') : '')
    + (t.status !== 'on_hold' ? MenuItem('Put on hold', `data-one="${ref}|status:on_hold"`, 'PauseCircle') : '')
    + (t.status !== 'solved' ? MenuItem('Mark resolved', `data-one="${ref}|status:solved"`, 'CheckCircle2') : '');
}
const BULK_LABEL = (k, v) => k === 'assignee' ? (v === ME ? 'Assigned to you' : v ? `Assigned to ${person(v).name}` : 'Unassigned') : k === 'status' ? STATUS_LABEL[v] : PRIORITY_LABEL[v];
function change(refs, k, v) {
  refs.forEach(r => { const t = T(r); t[k] = v || null; t.updated_at = Date.now(); if (k === 'priority' && v) t.tags = t.tags.filter(g => g !== 'needs-review'); });
}

/* ---------- One ticket (TicketView.tsx) ---------- */
const ASIDE_H = 'mb-3 text-[0.78rem] font-bold uppercase tracking-[0.08em] text-muted';
const SELECT = `${INPUT} xl:py-1.5`;
const Fact = (label, value) => `<div class="flex justify-between gap-3"><dt class="shrink-0 text-muted">${label}</dt><dd class="min-w-0 truncate text-right font-medium text-ink">${value}</dd></div>`;
const Field = (label, inner) => `<label class="block min-w-0 text-[0.8rem] font-semibold text-gray-600">${label}<div class="mt-1">${inner}</div></label>`;
const opt = (v, l, cur) => `<option value="${v}" ${cur === v ? 'selected' : ''}>${esc(l)}</option>`;
const fits = t => t.priority === t.triage.priority && t.type === t.triage.type && (t.triage.owner == null || t.assignee === t.triage.owner);
function triageCard(t) {
  const c = t.triage, pct = Math.round(c.confidence * 100), owner = person(c.owner);
  const shown = S.triageOpen[t.ref] ?? (!c.applied && !fits(t));
  const line = [TYPE_LABEL[c.type], PRIORITY_LABEL[c.priority], `${pct}% sure`].join(' · ');
  if (!shown) return Card(`<button type="button" data-triage="${t.ref}" aria-expanded="false" class="flex w-full items-center gap-2 rounded-card px-4 py-3 text-left hover:bg-canvas">${ic('Sparkles', 14, 'shrink-0 text-violet-700')}<span class="text-[0.78rem] font-bold uppercase tracking-[0.08em] text-violet-700">AI</span><span class="min-w-0 flex-1 text-[0.84rem] leading-snug text-gray-700">${line}</span>${c.reply ? '<span class="shrink-0 rounded-full bg-violet-50 px-2 py-0.5 text-[0.72rem] font-semibold text-violet-700">Reply ready</span>' : ''}${ic('ChevronDown', 15, 'shrink-0 text-muted')}</button>`, 'p-0');
  const SM = 'inline-flex h-11 items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 text-[0.78rem] font-semibold text-gray-700 hover:border-gray-400 hover:text-ink disabled:opacity-60 xl:h-8';
  return Card(`<div class="mb-3 flex items-center justify-between gap-2"><button type="button" data-triage="${t.ref}" aria-expanded="true" class="flex items-center gap-1.5 text-[0.78rem] font-bold uppercase tracking-[0.08em] text-violet-700 hover:underline">${ic('Sparkles', 14)} AI triage ${ic('ChevronDown', 14, 'rotate-180')}</button>
      <button type="button" class="${SM}" data-real="${esc(REAL('ask the AI to read the ticket again and suggest a topic, urgency and owner.'))}">${ic('RefreshCw', 13)} Run again</button></div>
    <div class="flex flex-wrap items-center gap-1.5">${PriorityBadge(c.priority)}${TypeBadge(c.type)}<span class="rounded-md bg-gray-100 px-1.5 py-0.5 text-[0.75rem] xl:text-[0.72rem] font-semibold text-gray-700">${esc(c.area)}</span>${c.code ? '<span class="rounded-md bg-rose-50 px-1.5 py-0.5 text-[0.75rem] xl:text-[0.72rem] font-semibold text-rose-700">Code issue</span>' : ''}</div>
    ${owner ? `<div class="mt-2.5 flex items-center gap-2 text-[0.82rem]"><span class="text-muted">Route to</span>${Avatar(owner.name, 22)}<span class="font-semibold">${esc(owner.name)}</span><span class="text-muted">· ${esc(c.area)}</span></div>` : ''}
    <div class="mt-3"><div class="flex justify-between text-[0.76rem] text-gray-600"><span>Confidence</span><span class="tnum font-semibold">${pct}%</span></div>
      <div class="mt-1 h-2 overflow-hidden rounded-full bg-gray-100" role="meter" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="Confidence"><div class="h-full rounded-full ${c.applied ? 'bg-violet-600' : 'bg-amber-500'}" style="width:${pct}%"></div></div>
      <p class="mt-1.5 text-[0.76rem] text-gray-600">${c.applied ? 'Applied to the ticket. Anything your team set by hand was kept.' : 'Not sure enough to change anything on its own. Please review it.'}</p></div>
    ${fits(t) ? `<p class="mt-3 flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-[0.8rem] font-semibold text-emerald-800">${ic('Check', 14)} The ticket matches this suggestion.</p>`
      : `<div class="mt-3 flex flex-wrap gap-2"><button type="button" class="inline-flex h-11 xl:h-8 items-center justify-center gap-1.5 rounded-lg px-2.5 text-[0.78rem] font-semibold transition-colors bg-brand text-ink hover:bg-brand-dark" data-accept="${t.ref}">${ic('Check', 14)} Accept suggestion</button><button type="button" class="${SM}" data-act="changefields">${ic('Pencil', 13)} Change</button></div>`}
    ${c.reply ? `<div class="mt-3 rounded-lg border border-line bg-canvas p-3"><div class="mb-1 text-[0.75rem] xl:text-[0.74rem] font-bold uppercase tracking-[0.06em] text-gray-500">Suggested reply</div><p class="whitespace-pre-wrap text-[0.84rem] text-gray-800">${esc(c.reply)}</p><button type="button" data-use="${t.ref}" class="mt-2 inline-flex h-11 items-center gap-1.5 rounded-lg xl:h-8 border border-line bg-white px-2.5 text-[0.78rem] font-semibold text-gray-700 hover:border-gray-400 hover:text-ink">Use this reply</button></div>` : ''}`, 'border-violet-200 p-4');
}
function fixCard(t) {
  const f = t.fix, SMALLB = 'inline-flex h-11 xl:h-8 items-center justify-center gap-1.5 rounded-lg px-2.5 text-[0.78rem] font-semibold transition-colors disabled:opacity-50';
  const SQ = `${SMALLB} border border-line bg-white text-gray-700 hover:border-brand-ink hover:text-brand-ink`;
  const head = `<div class="mb-3 flex items-center justify-between gap-2"><h2 class="flex items-center gap-1.5 text-[0.78rem] font-bold uppercase tracking-[0.08em] text-gray-600">${ic('GitBranch', 14)} Proposed fix</h2>${f ? '' : `<button type="button" class="${SQ}" data-real="${esc(REAL('ask the AI agent to read the code, make a change, run the tests and open a draft pull request for a person to review.'))}">${ic('Sparkles', 13)} Propose a fix</button>`}</div>`;
  if (!f) return Card(`${head}<p class="text-[0.84rem] text-gray-600">None yet. The agent tries one by itself when triage finds a confident code issue.</p>`, 'p-4');
  return Card(`${head}<div class="flex flex-wrap items-center gap-2"><span class="rounded-full px-2 py-0.5 text-[0.75rem] xl:text-[0.74rem] font-semibold bg-gray-100 text-gray-700">Draft pull request</span><span class="tnum text-[0.76rem] text-gray-600">${Math.round(f.confidence * 100)}% confident</span></div>
    <p class="mt-2 text-[0.9rem] font-semibold leading-snug text-ink">${esc(f.summary)}</p><p class="mt-1 break-all text-[0.76rem] text-gray-600">${esc(f.repo)} · ${esc(f.branch)}</p>
    <button type="button" data-real="${esc(REAL('open the draft pull request in the code host.'))}" class="mt-1.5 inline-flex items-center gap-1 text-[0.82rem] font-semibold text-brand-ink hover:underline">Open pull request #${f.pr} ${ic('ExternalLink', 12)}</button>
    <p class="mt-2 text-[0.82rem] leading-relaxed text-gray-700"><span class="font-semibold">Root cause.</span> ${esc(f.root_cause)}</p>
    <ul class="mt-2 space-y-0.5">${f.files.map(x => `<li class="break-all font-mono text-[0.75rem] xl:text-[0.74rem] text-gray-700">${esc(x)}</li>`).join('')}</ul>
    <div class="mt-3 flex flex-wrap gap-2"><button type="button" class="${SMALLB} bg-brand text-ink hover:bg-brand-dark" data-real="${esc(REAL('approve the pull request; merging is a second, separate step for an owner or admin.'))}">${ic('Check', 14)} Approve</button>
      <button type="button" class="${SQ}" data-real="${esc(REAL('let you edit the pull request title before it is approved.'))}">${ic('Pencil', 13)} Edit</button>
      <button type="button" class="${SQ} hover:border-rose-400 hover:text-rose-700" data-real="${esc(REAL('reject the pull request with your reason, and close it.'))}">${ic('X', 14)} Reject</button></div>`, 'p-4');
}
function ticket() {
  const t = T(S.ref);
  if (!t) return EmptyState('SearchX', 'Ticket not found', 'It may have been deleted.', `<a href="#/tickets" class="${SMALL}">All tickets</a>`);
  const cu = t.customer, files = t.messages.flatMap(m => m.files || []);
  const items = [...t.messages.map(m => ({ k: 'm', at: m.at, m })), ...t.notes.map(n => ({ k: 'n', at: n.at, n }))].sort((a, b) => a.at - b.at);
  const back = t.app ? [`#/apps/${t.app}`, `${appName(t.app)} tickets`] : ['#/tickets', 'All tickets'];
  const canSend = !!S.draft.trim();
  const sendBtn = S.mode === 'reply' ? `<button type="button" id="send" class="${PRIMARY}" ${canSend ? '' : 'disabled'} data-real="${esc(REAL(`send this reply to ${custName(cu)} by ${t.channel === 'sms' ? 'text message' : 'email'}, with ${t.ref} in the subject.`))}">Send reply</button>`
    : `<button type="button" id="send" class="${QUIET} border-amber-300 text-amber-800" ${canSend ? '' : 'disabled'} data-act="addnote">Add note</button>`;
  const viewers = t.ref === 'BOS-1039' ? `<span title="Priya Raman" class="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-[0.75rem] font-semibold text-sky-800 ring-1 ring-inset ring-sky-200 animate-fade-in">${ic('Eye', 12)} Priya is viewing</span>` : '';
  return `<div class="flex flex-col xl:h-[calc(100dvh-121px)]">
    <a href="${back[0]}" class="mb-1 inline-flex min-h-11 shrink-0 items-center gap-1.5 self-start text-[0.86rem] xl:mb-3 xl:min-h-0 font-semibold text-muted hover:text-ink">${ic('ArrowLeft', 15)} ${esc(back[1])}</a>
    <header class="mb-4 flex shrink-0 flex-col gap-3 lg:flex-row lg:items-start lg:justify-between"><div class="min-w-0"><div class="flex flex-wrap items-center gap-2">
      <span class="tnum rounded-md bg-white px-2 py-0.5 text-[0.8rem] font-bold text-gray-600 ring-1 ring-inset ring-line">${t.ref}</span>${StatusBadge(t.status)}${needsReview(t) || t.tags.includes('needs-review') ? ReviewMark() : ''}${t.priority ? PriorityBadge(t.priority) : ''}${TypeBadge(t.type)}
      ${t.tags.filter(g => g !== 'needs-review').map(g => `<span class="rounded-full bg-gray-100 px-2 py-0.5 text-[0.75rem] xl:text-[0.72rem] font-semibold text-gray-600">#${esc(g)}</span>`).join('')}${viewers}</div>
      <h1 class="mt-2 font-display text-[1.55rem] font-extrabold leading-tight tracking-[-0.02em]">${esc(t.subject)}</h1></div>
      <div class="flex shrink-0 flex-wrap gap-2">${t.assignee !== ME ? `<button type="button" class="${QUIET}" data-act="assignme" title="Shortcut: a">${ic('UserCheck', 15)} Assign to me</button>` : ''}
        ${active(t) ? `<button type="button" class="${QUIET} hover:border-emerald-500 hover:text-emerald-700" data-act="resolve" title="Shortcut: e">${ic('CheckCircle2', 15)} Resolve</button>` : ''}
        <button type="button" class="${QUIET} hover:border-rose-600 hover:text-rose-700" data-act="delete" aria-label="Delete ticket" title="Delete ticket">${ic('Trash2', 15)}</button></div></header>
    <div class="grid gap-4 xl:min-h-0 xl:flex-1 xl:grid-cols-[minmax(0,1fr)_340px]">
      ${Card(`<h2 class="flex shrink-0 items-center gap-2 border-b border-hair px-4 py-3 text-[0.95rem] font-bold">${ic('MessagesSquare', 17, 'text-muted')} Conversation <span class="tnum rounded-full bg-gray-100 px-1.5 text-[0.75rem] font-semibold text-gray-600">${items.length}</span></h2>
        <ol id="thread" class="space-y-3 p-4 xl:min-h-0 xl:flex-1 xl:overflow-y-auto">${items.map(it => it.k === 'm' ? `<li class="animate-fade-in"><div class="rounded-xl border p-4 ${it.m.dir === 'out' ? 'ml-4 border-line bg-canvas sm:ml-10' : 'mr-4 border-line bg-white sm:mr-10'}">
            <div class="mb-2 flex items-center justify-between gap-3 text-[0.8rem] text-muted"><span class="flex items-center gap-2 font-semibold text-ink">${it.m.dir === 'in' ? Avatar(custName(cu), 24, 'bg-gray-500') : Avatar(it.m.author, 24)}${it.m.dir === 'in' ? esc(custName(cu)) : `${esc(it.m.author)} replied`}${it.m.sms ? '<span class="font-normal text-muted">· text</span>' : ''}${it.m.phone ? '<span class="font-normal text-muted">· voicemail</span>' : ''}</span><span class="text-right">${ago(it.m.at)}</span></div>
            <div class="whitespace-pre-wrap break-words text-[0.92rem] leading-relaxed">${esc(it.m.body)}</div>
            ${(it.m.files || []).length ? `<div class="mt-3 flex flex-wrap gap-2">${it.m.files.map(([n, kb]) => `<button type="button" data-real="${esc(REAL('download this attachment.'))}" class="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 py-1 text-[0.8rem] font-semibold text-gray-700 hover:border-gray-400 hover:text-ink">${ic('Paperclip', 13)} ${esc(n)} <span class="font-normal text-gray-400">${kb} KB</span></button>`).join('')}</div>` : ''}</div></li>`
          : `<li class="animate-fade-in"><div class="mx-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 sm:mx-6"><div class="mb-1 flex items-center justify-between text-[0.78rem] text-amber-800"><span class="flex items-center gap-1.5 font-semibold">${ic('Lock', 12)} Internal note · ${esc(it.n.author)}</span><span>${ago(it.n.at)}</span></div><div class="whitespace-pre-wrap text-[0.9rem] text-amber-950">${esc(it.n.body)}</div></div></li>`).join('')}</ol>
        <div id="composer" class="shrink-0 border-t px-4 pb-4 pt-3 ${S.mode === 'note' ? 'border-amber-200 bg-amber-50/40' : 'border-line bg-white'}"><div class="mb-2 flex flex-wrap items-center gap-1">
          <div role="tablist" aria-label="Reply or note" class="flex gap-1">${[['reply', 'Send', 'Reply'], ['note', 'StickyNote', 'Internal note']].map(([k, icn, l]) => `<button type="button" role="tab" aria-selected="${S.mode === k}" data-mode="${k}" title="Shortcut: ${k[0]}" class="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-3 text-[0.84rem] font-semibold transition-colors xl:min-h-0 xl:py-1.5 ${S.mode === k ? 'bg-ink text-white' : 'text-muted hover:bg-canvas hover:text-ink'}">${ic(icn, 14)} ${l}</button>`).join('')}</div>
          <span class="mx-1 hidden h-5 w-px bg-line sm:block" aria-hidden="true"></span>
          ${PopBtn('saved', 'Saved replies', `inline-flex min-h-11 items-center gap-1.5 rounded-lg px-3 text-[0.84rem] font-semibold transition-colors xl:min-h-0 xl:py-1.5 ${S.pop === 'saved' ? 'bg-canvas text-ink' : 'text-muted hover:bg-canvas hover:text-ink'}`, `${ic('BookmarkPlus', 14)} Saved replies ${ic('ChevronDown', 13, `transition-transform ${S.pop === 'saved' ? 'rotate-180' : ''}`)}`)}</div>
          <label for="composer-text" class="sr-only">${S.mode === 'reply' ? 'Reply' : 'Internal note'}</label>
          <textarea id="composer-text" data-input="draft" rows="3" placeholder="${esc(S.mode === 'note' ? 'Only your team sees this.' : t.channel === 'sms' ? `A text to ${cu.phone}. Keep it short; it comes from the support number.` : `Reply to ${custName(cu)}. It goes by email with ${t.ref} in the subject.`)}" class="${INPUT} resize-y ${S.mode === 'note' ? 'border-amber-300 bg-white' : ''}">${esc(S.draft)}</textarea>
          <div class="mt-2 flex flex-wrap items-center justify-between gap-2"><span class="hidden text-[0.75rem] text-muted sm:block"><kbd class="rounded border border-line bg-canvas px-1 py-px font-sans text-[0.72rem] font-semibold text-gray-600">Ctrl Enter</kbd> to send · <kbd class="rounded border border-line bg-canvas px-1 py-px font-sans text-[0.72rem] font-semibold text-gray-600">?</kbd> for all shortcuts</span><span class="ml-auto flex items-center gap-3">${sendBtn}</span></div></div>`, 'flex min-w-0 flex-col overflow-hidden xl:min-h-0')}
      <aside class="space-y-4 xl:-mr-2 xl:min-h-0 xl:overflow-y-auto xl:pr-2">
        ${Card(`<h2 class="${ASIDE_H}">Details</h2><div class="space-y-2.5">
          ${Field('Status', `<select class="${SELECT}" data-field="status">${Object.keys(STATUS_LABEL).map(s => opt(s, STATUS_LABEL[s], t.status)).join('')}</select>`)}
          ${Field('Priority', `<select id="f-priority" class="${SELECT}" data-field="priority">${opt('', 'Not set', t.priority || '')}${Object.keys(PRIORITY_LABEL).map(p => opt(p, PRIORITY_LABEL[p], t.priority)).join('')}</select>`)}
          ${Field('Type', `<select class="${SELECT}" data-field="type">${opt('', 'Not set', t.type || '')}${Object.keys(TYPE_LABEL).map(k => opt(k, TYPE_LABEL[k], t.type)).join('')}</select>`)}
          ${Field('Assignee', `<select class="${SELECT}" data-field="assignee">${opt('', 'Nobody', t.assignee || '')}${TEAM.filter(p => p.role !== 'viewer').map(p => opt(p.id, p.id === ME ? `${p.name} (you)` : p.name, t.assignee)).join('')}</select>`)}</div>
          <dl class="mt-4 space-y-1.5 border-t border-hair pt-3 text-[0.82rem]">${Fact('App / channel', `${esc(t.app ? appName(t.app) : S.ws.name)} · ${CHANNEL_LABEL[t.channel]}`)}${t.area ? Fact('Area', `<span class="capitalize">${esc(t.area)}</span>`) : ''}${Fact('Created', stamp(t.created_at))}${Fact('First reply', t.first_response_at ? stamp(t.first_response_at) : 'Not yet')}${Fact('Last updated', ago(t.updated_at))}</dl>`, 'p-4')}
        ${Card(`<h2 class="${ASIDE_H}">Customer</h2><button type="button" data-act="profile" title="Open their profile" class="group -mx-1 flex w-[calc(100%+0.5rem)] items-center gap-3 rounded-lg p-1 text-left hover:bg-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40">${Avatar(custName(cu), 36, 'bg-gray-500')}<span class="min-w-0"><span class="block truncate text-[0.92rem] font-semibold group-hover:underline">${esc(custName(cu))}</span>${cu.name && (cu.email || cu.phone) ? `<span class="block truncate text-[0.8rem] text-muted">${esc(cu.email || cu.phone)}</span>` : ''}</span></button>
          <dl class="mt-3 space-y-1.5 text-[0.82rem]">${Fact('Requests', `${cu.tickets} total · ${cu.open} open`)}${cu.apps.length ? Fact('Apps', esc(cu.apps.map(appName).join(', '))) : ''}${Fact('First contact', new Date(at(cu.since)).toLocaleDateString('en-US', { dateStyle: 'medium' }))}</dl>
          ${related(t).length ? `<div class="mt-3 border-t border-hair pt-3"><h3 class="mb-1 text-[0.76rem] font-semibold text-muted">Their other tickets</h3><ul class="-mx-1.5">${related(t).map(r => `<li><a href="#/tickets/${r.ref}" class="flex items-center gap-2 rounded-lg px-1.5 py-1.5 hover:bg-canvas"><span class="tnum shrink-0 text-[0.76rem] text-muted">${r.ref}</span><span class="min-w-0 flex-1 truncate text-[0.84rem] font-semibold">${esc(r.subject)}</span>${StatusBadge(r.status)}</a></li>`).join('')}</ul></div>` : ''}`, 'p-4')}
        ${triageCard(t)}
        ${fixCard(t)}
        ${files.length ? Card(`<h2 class="${ASIDE_H} flex items-center gap-1.5">${ic('Paperclip', 13)} Attachments</h2><ul class="space-y-1">${files.map(([n, kb]) => `<li><button type="button" data-real="${esc(REAL('download this attachment.'))}" class="flex w-full items-center justify-between gap-2 rounded-lg px-1.5 py-1.5 text-[0.84rem] hover:bg-canvas"><span class="truncate font-semibold text-gray-700">${esc(n)}</span><span class="shrink-0 text-[0.75rem] xl:text-[0.74rem] text-muted">${kb} KB</span></button></li>`).join('')}</ul>`, 'p-4') : ''}
      </aside></div></div>`;
}
const related = t => S.tickets.filter(r => r.ref !== t.ref && ((t.customer.email && r.customer.email === t.customer.email) || (t.customer.phone && r.customer.phone === t.customer.phone)));
POPS.saved = ['left', 'w-80', () => `<div><ul class="max-h-64 overflow-y-auto">${TEMPLATES.map(x => `<li class="group flex items-start gap-1"><button type="button" data-tpl="${x.id}" class="min-w-0 flex-1 rounded-lg px-2.5 py-2 text-left hover:bg-canvas"><span class="block truncate text-[0.85rem] font-semibold">${esc(x.title)}</span><span class="block truncate text-[0.76rem] text-muted">${esc(x.body)}</span></button></li>`).join('')}</ul>
  <div class="mt-1 border-t border-hair pt-1.5">${MenuItem(S.draft.trim() ? 'Save the text in the box' : 'Type a reply first to save it', `${S.draft.trim() ? '' : 'disabled'} data-real="${esc(REAL('save the text in the box as a saved reply for the whole team.'))}"`, 'BookmarkPlus')}</div></div>`];

/* ---------- Settings (Settings.tsx) ---------- */
const SECTIONS = [['general', 'General'], ['email', 'Email', 'open the support addresses and the DNS check for your domain.'], ['team', 'Team'], ['widget', 'Widget', 'open the Help button settings: its title, colour and the portals allowed to show it.'],
  ['phone', 'Phone and SMS', 'open the support phone numbers and text message settings.'], ['github', 'GitHub', 'open the code repositories the AI fix agent may read.'], ['api-keys', 'API keys', 'open the API keys for adding tickets from other systems.'],
  ['webhooks', 'Webhooks', 'open the webhooks that tell other systems about ticket changes.'], ['usage', 'Usage'], ['history', 'History'], ['account', 'Your account', 'open your name and password settings.']];
const Box = (title, hint, inner) => Card(`<h2 class="text-[1.05rem] font-bold">${title}</h2>${hint ? `<p class="mt-0.5 text-[0.84rem] text-gray-600">${hint}</p>` : ''}<div class="mt-4">${inner}</div>`, 'p-5');
const SField = (label, hint, inner) => `<label class="mb-4 block"><span class="text-[0.84rem] font-semibold text-gray-700">${label}</span>${hint ? `<span class="block text-[0.78rem] text-gray-500">${hint}</span>` : ''}<div class="mt-1">${inner}</div></label>`;
const saveBtn = what => `<button type="button" class="${PRIMARY}" data-real="${esc(REAL(what))}">Save</button>`;
function general() {
  const w = S.ws;
  return Box('Workspace', 'How your team and the AI see this workspace.', `${SField('Name', '', `<input class="${INPUT}" data-ws="name" value="${esc(w.name)}">`)}
      ${SField('Ticket prefix', 'Fixed: customers already have ticket numbers.', `<input class="${INPUT} max-w-[10rem] uppercase" value="${esc(w.prefix)}" disabled>`)}
      ${SField('What your product does', 'The AI reads this to sort tickets and understand your customers. Plain words are best.', `<textarea class="${INPUT}" rows="4" data-ws="desc">${esc(w.desc)}</textarea>`)}
      <div class="grid gap-4 sm:grid-cols-2">${SField('AI sorting bar', 'Below this confidence the AI only flags a ticket for review.', `<input class="${INPUT}" type="number" min="0.5" max="0.99" step="0.01" data-ws="sort" value="${esc(w.sort)}">`)}
        ${SField('AI fix bar', 'The confidence needed before the AI tries a code fix.', `<input class="${INPUT}" type="number" min="0.5" max="0.99" step="0.01" data-ws="fix" value="${esc(w.fix)}">`)}</div>
      <div class="flex items-center gap-3">${saveBtn('save the workspace settings. The AI uses the new bars on the next ticket it reads.')}</div>`)
    + Box('Suggested owners', 'The AI suggests who should take a ticket from its product area. A person accepts or changes it on the ticket.', `<ul class="divide-y divide-gray-100">${ROUTES.map(r => `<li class="flex flex-wrap items-center gap-3 py-3"><div class="min-w-0 flex-1"><div class="font-semibold capitalize">${esc(r.area)}</div><div class="text-[0.8rem] text-gray-600">${esc(r.note)}</div></div>
        <select class="min-h-11 w-48 rounded-[10px] border border-line bg-white px-3 py-2 text-[1rem] xl:min-h-0 xl:text-[0.9rem] transition-colors focus:border-brand-ink focus:outline-none focus:ring-2 focus:ring-brand/15" aria-label="Owner for ${esc(r.area)}" data-route="${esc(r.area)}">${TEAM.filter(p => p.role !== 'viewer').map(p => opt(p.id, p.name, S.routes[r.area])).join('')}</select></li>`).join('')}</ul>
      <div class="mt-3 flex items-center gap-3">${saveBtn('save who the AI suggests for each product area.')}</div>`)
    + Box('Who hears about new tickets', 'One email address per line. Each gets an email the moment a ticket arrives.', `<textarea class="${INPUT}" rows="3" data-ws="notify" aria-label="Notification recipients">${esc(w.notify)}</textarea>
      <div class="mt-3 flex items-center gap-3">${saveBtn('save who is emailed when a new ticket arrives.')}</div>`);
}
function team() {
  const help = { owner: 'Everything, including owners', admin: 'Settings and team', agent: 'Works tickets', viewer: 'Reads only' }, roles = ['owner', 'admin', 'agent', 'viewer'], f = S.invite;
  const cap = r => r[0].toUpperCase() + r.slice(1);
  return Box('Invite someone', 'They get an email with a link to choose their password. The link works for 7 days.', `<div class="grid gap-3 sm:grid-cols-[1fr_1fr_10rem]">
      <input class="${INPUT}" placeholder="Name" aria-label="Name" data-inv="name" value="${esc(f.name)}"><input class="${INPUT}" placeholder="Email" aria-label="Email" type="email" data-inv="email" value="${esc(f.email)}">
      <select class="${INPUT}" aria-label="Role" data-inv="role">${roles.map(r => opt(r, cap(r), f.role)).join('')}</select></div>
      <p class="mt-1 text-[0.78rem] text-gray-500" id="role-help">${help[f.role]}</p>
      <div class="mt-3 flex items-center gap-3"><button type="button" class="${PRIMARY}" data-real="${esc(REAL('email an invitation link to this person.'))}">Send invitation</button></div>`)
    + Box('Team', '', `<ul class="divide-y divide-gray-100">${S.team.map(m => `<li class="flex flex-wrap items-center gap-3 py-3"><div class="min-w-0 flex-1"><div class="font-semibold">${esc(m.name)} ${m.id === ME ? '<span class="text-[0.78rem] font-normal text-gray-500">(you)</span>' : ''}</div>
        <div class="break-all text-[0.8rem] text-gray-600">${esc(m.email)}${m.invited ? '<span class="ml-2 rounded-full bg-amber-50 px-2 text-amber-900">Invited</span>' : ''}${!m.active ? '<span class="ml-2 rounded-full bg-gray-100 px-2 text-gray-600">No access</span>' : ''}</div></div>
        <select class="${INPUT} w-32" aria-label="Role for ${esc(m.name)}" data-role="${m.id}" ${m.id === ME ? 'disabled' : ''}>${roles.map(r => opt(r, cap(r), m.role)).join('')}</select>
        ${m.invited ? `<button type="button" class="${QUIET}" data-real="${esc(REAL('email the invitation link again.'))}">Resend</button>` : ''}
        ${m.id !== ME ? `<button type="button" class="${QUIET}" data-access="${m.id}">${m.active ? 'Remove access' : 'Give access back'}</button>` : ''}</li>`).join('')}</ul>`);
}
const usage = () => Box('Usage', 'What this workspace used each month. This is what billing will be based on.', `<div class="overflow-x-auto"><table class="w-full text-left text-[0.88rem]"><thead><tr class="border-b border-line text-[0.78rem] uppercase tracking-wide text-gray-600"><th class="py-2 pr-4 font-semibold">What</th>${USAGE.months.map(m => `<th class="py-2 pr-4 text-right font-semibold tnum">${m}</th>`).join('')}</tr></thead>
  <tbody>${USAGE.rows.map(([l, v]) => `<tr class="border-b border-gray-100"><td class="py-2 pr-4">${l}</td>${v.map(n => `<td class="py-2 pr-4 text-right tnum">${n.toLocaleString('en-US')}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);
const history = () => Box('History', 'Every change to this workspace’s settings and team, newest first.', `<ol class="space-y-2 text-[0.86rem]">${HISTORY.map(([who, what, m, extra]) => `<li><span class="font-semibold">${esc(who)}</span> ${esc(what)}${extra ? `<span class="text-gray-600"> (${esc(extra)})</span>` : ''}<span class="ml-2 text-[0.78rem] text-gray-500">${ago(at(m))}</span></li>`).join('')}</ol>`);
function settings() {
  const body = { general, team, usage, history }[S.section] || general;
  return `<div><p class="text-[0.75rem] xl:text-[0.74rem] font-bold uppercase tracking-[0.1em] text-brand-ink">Settings</p><h1 class="mb-5 text-[1.9rem] font-extrabold leading-tight">${esc(S.ws.name)}</h1>
    <div class="grid gap-6 lg:grid-cols-[200px_minmax(0,1fr)]"><nav aria-label="Settings sections" class="flex gap-1 overflow-x-auto lg:flex-col">${SECTIONS.map(([k, l, real]) => { const on = S.section === k, cls = `flex min-h-11 items-center whitespace-nowrap rounded-[10px] px-3 py-2 text-[0.88rem] font-semibold xl:min-h-0 xl:block text-left ${on ? 'bg-brand-soft text-brand-ink' : 'text-gray-600 hover:bg-gray-100'}`;
      return real ? `<button type="button" class="${cls}" data-real="${esc(REAL(real))}">${l}</button>` : `<a href="#/settings/${k}" class="${cls}" ${on ? 'aria-current="page"' : ''}>${l}</a>`; }).join('')}</nav>
      <div class="min-w-0 max-w-3xl space-y-5">${body()}</div></div></div>`;
}

/* ---------- dialogs (ui.tsx Dialog) ---------- */
function dialog() {
  if (!S.dialog) return '';
  const t = T(S.ref), label = 'block text-[0.82rem] font-semibold text-gray-700';
  const wrap = (title, inner) => `<div class="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-0 animate-fade-in sm:items-center sm:p-4" data-scrim><div id="dlg" role="dialog" aria-modal="true" aria-label="${esc(title)}" class="max-h-[92dvh] w-full overflow-y-auto overscroll-contain rounded-t-2xl bg-white shadow-e8 animate-slide-up sm:rounded-2xl sm:max-w-lg">
    <div class="flex items-center justify-between border-b border-hair px-5 py-4"><h2 class="text-[1.05rem] font-bold">${esc(title)}</h2><button type="button" data-act="close" aria-label="Close" class="flex h-11 w-11 items-center justify-center rounded-lg text-gray-500 xl:h-auto xl:w-auto xl:p-1.5 hover:bg-gray-100 hover:text-ink">${ic('X', 18)}</button></div><div class="p-5">${inner}</div></div></div>`;
  if (S.dialog === 'create') return wrap('Create a ticket', `<form class="space-y-4"><p class="-mt-1 text-[0.86rem] text-muted">For a request that came in another way. The requester gets replies by email.</p>
    <div class="grid gap-3 sm:grid-cols-2"><label class="${label}">Requester email<input class="${INPUT} mt-1" type="email"></label><label class="${label}">Name <span class="font-normal text-muted">(optional)</span><input class="${INPUT} mt-1"></label></div>
    <label class="${label}">Subject<input class="${INPUT} mt-1" maxlength="300"></label><label class="${label}">What do they need?<textarea class="${INPUT} mt-1 resize-y" rows="5"></textarea></label>
    <div class="grid gap-3 sm:grid-cols-2"><label class="${label}">App<select class="${INPUT} mt-1"><option value="" disabled ${S.page === 'app' ? '' : 'selected'}>Choose the app</option>${APPS.map(a => opt(a.key, a.name, S.page === 'app' ? S.app : '')).join('')}</select></label>
      <label class="${label}">Priority<select class="${INPUT} mt-1"><option value="">Let the AI decide</option>${Object.keys(PRIORITY_LABEL).map(p => opt(p, PRIORITY_LABEL[p], '')).join('')}</select></label></div>
    <label class="flex min-h-11 xl:min-h-0 items-center gap-2 text-[0.86rem] text-gray-700"><input type="checkbox" checked class="h-4 w-4 accent-[#E5602A]"> Assign it to me</label>
    <div class="flex justify-end gap-2 pt-1"><button type="button" class="${QUIET}" data-act="close">Cancel</button><button type="submit" class="${PRIMARY}" data-real="${esc(REAL('create the ticket, tell the team, and let the AI sort it.'))}">Create ticket</button></div></form>`);
  if (S.dialog === 'delete') return wrap(`Delete ${t.ref}?`, `<p class="text-[0.92rem] text-gray-700">This removes the request, its conversation, notes, attachments and AI results for everyone, including the requester's "My requests" list. It cannot be undone.</p>
    <div class="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" class="${QUIET}" data-act="close">Cancel</button><button type="button" class="${BTN} bg-rose-700 text-white shadow-e2 hover:bg-rose-800" data-real="${esc(REAL('delete this ticket for good. Only owners and admins can.'))}">${ic('Trash2', 15)} Delete for good</button></div>`);
  const cu = t.customer, row = 'flex justify-between gap-4 py-2', theirs = [t, ...related(t)].sort((a, b) => b.created_at - a.created_at);
  return wrap('Requester', `<div class="flex items-center gap-4">${Avatar(custName(cu), 56, 'shrink-0 bg-gray-500 text-[1rem]')}<div class="min-w-0"><div class="truncate font-display text-[1.2rem] font-extrabold">${esc(custName(cu))}</div>${cu.email ? `<span class="block truncate text-[0.88rem] text-brand-ink">${esc(cu.email)}</span>` : ''}</div></div>
    <dl class="mt-4 divide-y divide-hair border-y border-hair text-[0.86rem]"><div class="${row}"><dt class="text-muted">Name</dt><dd class="text-right font-medium">${esc(cu.name ?? 'Not given')}</dd></div><div class="${row}"><dt class="text-muted">Email</dt><dd class="min-w-0 truncate text-right font-medium">${esc(cu.email ?? 'Not given')}</dd></div><div class="${row}"><dt class="text-muted">Phone</dt><dd class="text-right font-medium">${esc(cu.phone ?? 'Not given')}</dd></div>
      <div class="${row}"><dt class="text-muted">Apps</dt><dd class="text-right font-medium">${esc(cu.apps.length ? cu.apps.map(appName).join(', ') : 'None recorded')}</dd></div><div class="${row}"><dt class="text-muted">First contact</dt><dd class="text-right font-medium">${new Date(at(cu.since)).toLocaleDateString('en-US', { dateStyle: 'medium' })}</dd></div><div class="${row}"><dt class="text-muted">Requests</dt><dd class="tnum text-right font-medium">${cu.tickets} total · ${cu.open} open</dd></div></dl>
    <div class="mt-4"><h3 class="mb-1.5 text-[0.78rem] font-bold uppercase tracking-[0.08em] text-muted">Their requests</h3><ul class="-mx-1.5 max-h-72 overflow-y-auto">${theirs.map(r => `<li><a href="#/tickets/${r.ref}" class="flex min-h-11 items-center gap-3 rounded-lg px-1.5 py-2 hover:bg-canvas xl:min-h-0 ${r.ref === t.ref ? 'bg-canvas font-semibold' : ''}"><span class="tnum w-[4.5rem] shrink-0 text-[0.8rem] text-muted">${r.ref}</span><span class="min-w-0 flex-1 truncate text-[0.86rem] font-semibold">${esc(r.subject)}</span>${StatusBadge(r.status)}</a></li>`).join('')}</ul></div>`);
}

/* ---------- floating layer for popovers ---------- */
function popLayer() {
  if (!S.pop) return '';
  const [align, cls, body] = S.pop.startsWith('row:') ? ['right', 'w-56', () => rowPop(S.pop.slice(4))] : POPS[S.pop];
  return `<div id="pop-panel" role="dialog" aria-label="${esc(S.pop)}" data-align="${align}" style="position:fixed;top:0;left:0;visibility:hidden" class="z-[60] animate-pop-in rounded-xl border border-line bg-white p-1.5 shadow-e8 ${cls}">${body()}</div>`;
}
function placePop() {
  const p = document.getElementById('pop-panel'), b = S.pop && app.querySelector(`[data-pop-trigger="${CSS.escape(S.pop)}"]`)?.getBoundingClientRect();
  if (!p || !b) return;
  const w = p.offsetWidth, h = p.offsetHeight, gap = 6, edge = 8, below = innerHeight - b.bottom - gap - edge;
  const top = h <= below || b.top - gap - edge < h ? b.bottom + gap : b.top - gap - h, left = p.dataset.align === 'right' ? b.right - w : b.left;
  p.style.top = `${Math.max(edge, Math.min(top, innerHeight - h - edge))}px`; p.style.left = `${Math.max(edge, Math.min(left, innerWidth - w - edge))}px`; p.style.visibility = 'visible';
}


/* ---------- Sign in (App.tsx Login) ---------- */
const signin = () => `<div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-canvas to-white px-4">
  <form data-signin class="w-full max-w-sm rounded-2xl border border-line bg-white p-7 shadow-e8">
    <div class="mb-6 flex items-center gap-2.5"><span class="flex h-10 w-10 items-center justify-center rounded-xl bg-rail text-white">${ic('LifeBuoy', 20)}</span>
      <div><div class="text-[1.1rem] font-extrabold">Support</div><div class="text-[0.8rem] text-gray-500">Staff sign in</div></div></div>
    <label class="mb-3 block text-[0.84rem] font-semibold text-gray-700">Email<input id="si-email" class="${INPUT} mt-1" type="email" value="demo@example.com" autocomplete="off"></label>
    <label class="mb-4 block text-[0.84rem] font-semibold text-gray-700">Password<input id="si-pass" class="${INPUT} mt-1" type="password" autocomplete="off"></label>
    <button type="submit" class="${PRIMARY} w-full">Sign in</button>
    <p class="mt-4 text-center text-[0.84rem] text-gray-600">New to Support? <a href="#/signup" data-real="${esc(REAL('open the sign-up page to create a new workspace for your company.'))}" class="inline-flex min-h-11 items-center xl:min-h-0 font-semibold text-brand-ink">Create a workspace</a></p>
  </form></div>`;

/* ---------- render and events ---------- */
const PAGES = { today, tickets, app: tickets, ticket, settings };
const app = document.getElementById('app');
function keyOf(el) {
  if (!el || el === document.body) return null;
  if (el.id) return `#${CSS.escape(el.id)}`;
  for (const a of ['data-input', 'data-ws', 'data-inv', 'data-field', 'data-route', 'data-role', 'data-pop', 'data-tab', 'data-owner', 'data-mode', 'data-triage', 'data-tick', 'data-access', 'data-act', 'data-accept', 'data-use'])
    if (el.hasAttribute?.(a)) return `[${a}="${CSS.escape(el.getAttribute(a))}"]`;
  return null;
}
function render(focusSel) {
  const act = document.activeElement, sel = focusSel || keyOf(act), caret = act?.selectionStart;
  const keepThread = document.getElementById('thread')?.scrollTop;
  const mainScroll = window.scrollY;
  if (S.page === 'signin') { app.innerHTML = signin(); if (sel) app.querySelector(sel)?.focus({ preventScroll: true }); return; }
  app.innerHTML = `<div class="flex min-h-screen bg-canvas">${sidebar()}<main class="min-w-0 flex-1">${topbar()}<div class="px-4 py-6 sm:px-6 lg:px-8 lg:py-7">${PAGES[S.page]()}</div></main></div>${dialog()}${popLayer()}<div id="toasts" aria-live="polite" class="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[min(92vw,360px)] flex-col gap-2"></div>`;
  drawToasts();
  const th = document.getElementById('thread'); if (th) th.scrollTop = keepThread ?? th.scrollHeight;
  window.scrollTo(0, mainScroll);
  placePop();
  if (sel) { const el = app.querySelector(sel); if (el) { el.focus({ preventScroll: true }); if (caret != null && el.setSelectionRange) try { el.setSelectionRange(caret, caret); } catch {} } }
}
function route() {
  const parts = location.hash.replace(/^#\/?/, '').split('/').map(decodeURIComponent);
  const [a, b] = parts;
  S.pop = null; S.dialog = null;
  if (a === 'tickets' && b && T(b)) { if (S.ref !== b) { S.draft = ''; S.mode = 'reply'; } S.page = 'ticket'; S.ref = b; }
  else if (a === 'tickets') { S.page = 'tickets'; S.app = ''; }
  else if (a === 'apps' && APPS.some(x => x.key === b)) { if (S.app !== b) { S.status = 'all'; S.picked.clear(); } S.page = 'app'; S.app = b; S.appsOpen = true; }
  else if (a === 'signin') S.page = 'signin';
  else if (a === 'settings') { S.page = 'settings'; S.section = ['general', 'team', 'usage', 'history'].includes(b) ? b : 'general'; }
  else S.page = 'today';
  render(); window.scrollTo(0, 0);
}
const go = h => { if (location.hash === h) route(); else location.hash = h; };

app.addEventListener('click', e => {
  const t = e.target.closest('button, a, tr[data-open], [data-scrim], [data-stop]');
  if (S.pop && !e.target.closest('#pop-panel') && !e.target.closest('[data-pop]')) { S.pop = null; if (!t || t.tagName === 'TR' || t.hasAttribute('data-stop')) return render(); }
  if (!t || t.closest('[data-real]')) { if (t?.closest('[data-real]') && S.pop) { S.pop = null; render(); } return; }
  if (t.hasAttribute('data-scrim')) { if (e.target === t) { S.dialog = null; render(); } return; }
  if (t.hasAttribute('data-stop') && t.tagName !== 'BUTTON') return;
  if (t.tagName === 'A') { if (S.pop) { S.pop = null; } if (t.getAttribute('href') === location.hash) { e.preventDefault(); route(); } return; }
  if (t.tagName === 'TR') { if (!e.target.closest('input, [data-stop]')) go(`#/tickets/${t.dataset.open}`); return; }
  if (t.disabled) return;
  const d = t.dataset, tk = T(S.ref);
  if (d.go) { S.pop = null; return go(d.go); }
  if (d.pop) { S.pop = S.pop === d.pop ? null : d.pop; return render(); }
  if (d.tab) { S.status = d.tab; S.picked.clear(); }
  else if (d.owner !== undefined) S.owner = d.owner;
  else if (d.sort) { S.sort = d.sort; S.pop = null; }
  else if (d.bulk) { const [k, v] = d.bulk.split(':'), refs = pickedRefs(); change(refs, k, v); toast(`${BULK_LABEL(k, v)}: ${refs.length} ${refs.length === 1 ? 'ticket' : 'tickets'} updated`); S.picked.clear(); S.pop = null; }
  else if (d.one) { const [ref, kv] = d.one.split('|'), [k, v] = kv.split(':'); change([ref], k, v); toast(`${k === 'status' && v === 'solved' ? 'Resolved' : BULK_LABEL(k, v)}: 1 ticket updated`); S.pop = null; }
  else if (d.mode) S.mode = d.mode;
  else if (d.triage) S.triageOpen[d.triage] = !(t.getAttribute('aria-expanded') === 'true');
  else if (d.accept) { const x = T(d.accept), c = x.triage; S.triageOpen[d.accept] = true; x.priority = c.priority; x.type = c.type; x.area = c.area; if (c.owner) x.assignee = c.owner; x.tags = x.tags.filter(g => g !== 'needs-review'); x.updated_at = Date.now(); toast(c.owner ? `Suggestion accepted: routed to ${person(c.owner).name}` : 'Suggestion accepted'); }
  else if (d.use) { S.mode = 'reply'; S.draft = T(d.use).triage.reply; render('#composer-text'); return; }
  else if (d.tpl) { const x = TEMPLATES.find(y => y.id === d.tpl); S.draft = S.draft.trim() ? `${S.draft.trimEnd()}\n\n${x.body}` : x.body; S.pop = null; render('#composer-text'); return; }
  else if (d.access) { const m = S.team.find(p => p.id === d.access); m.active = !m.active; toast(m.active ? `${m.name} has access again` : `${m.name} no longer has access`); }
  else switch (d.act) {
    case 'collapse': S.collapsed = !S.collapsed; break;
    case 'apps': S.appsOpen = !S.appsOpen; break;
    case 'clearq': S.q = ''; break;
    case 'clearall': S.q = ''; S.owner = ''; S.status = 'all'; break;
    case 'sortcreated': S.sort = S.sort === 'oldest' ? 'newest' : 'oldest'; break;
    case 'untick': S.picked.clear(); break;
    case 'create': S.dialog = 'create'; render(); document.querySelector('#dlg input')?.focus(); return;
    case 'delete': S.dialog = 'delete'; render(); document.querySelector('#dlg button')?.focus(); return;
    case 'profile': S.dialog = 'profile'; render(); document.querySelector('#dlg button')?.focus(); return;
    case 'close': S.dialog = null; break;
    case 'assignme': tk.assignee = ME; tk.updated_at = Date.now(); toast('Assigned to you'); break;
    case 'resolve': tk.status = 'solved'; tk.updated_at = Date.now(); toast('Marked resolved'); break;
    case 'addnote': { tk.notes.push({ id: `${tk.ref}-n${tk.notes.length}`, at: Date.now(), author: meUser().name, body: S.draft.trim() }); S.draft = ''; toast('Note added'); render(); const th = document.getElementById('thread'); if (th) th.scrollTop = th.scrollHeight; return; }
    case 'changefields': S.triageOpen[S.ref] = true; render('#f-priority'); document.getElementById('f-priority')?.scrollIntoView({ block: 'nearest' }); return;
    default: return;
  }
  render();
});
app.addEventListener('change', e => {
  const t = e.target, d = t.dataset, tk = T(S.ref);
  if (d.act === 'tickall') { const rows = filtered(true); rows.every(r => S.picked.has(r.ref)) ? S.picked.clear() : rows.forEach(r => S.picked.add(r.ref)); render(); }
  else if (d.tick) { S.picked.has(d.tick) ? S.picked.delete(d.tick) : S.picked.add(d.tick); render(); }
  else if (d.field) { tk[d.field] = t.value || null; tk.updated_at = Date.now(); if (d.field === 'priority' && t.value) tk.tags = tk.tags.filter(g => g !== 'needs-review');
    toast(d.field === 'status' && t.value === 'solved' ? 'Marked resolved' : d.field === 'assignee' && t.value === ME ? 'Assigned to you' : 'Saved'); render(); }
  else if (d.route) S.routes[d.route] = t.value;
  else if (d.role) { S.team.find(p => p.id === d.role).role = t.value; toast('Role changed'); }
  else if (d.inv === 'role') { S.invite.role = t.value; render(); }
});
app.addEventListener('input', e => {
  const t = e.target, d = t.dataset;
  if (d.input === 'q') { S.q = t.value; if (S.page === 'tickets' || S.page === 'app') { S.picked.clear(); render(); } }
  else if (d.input === 'draft') { S.draft = t.value; const b = document.getElementById('send'); if (b) b.disabled = !t.value.trim(); }
  else if (d.ws) S.ws[d.ws] = t.value;
  else if (d.inv) S.invite[d.inv] = t.value;
});
app.addEventListener('submit', e => {
  if (e.target.matches('[data-signin]')) { e.preventDefault(); return go('#/today'); }
  if (e.target.matches('[data-search]') && S.q.trim() && S.page !== 'tickets' && S.page !== 'app') { S.status = 'all'; go('#/tickets'); }
});
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); const i = document.getElementById('ticket-search'); i?.focus(); i?.select(); }
  else if (e.key === 'Escape' && document.querySelector('.mini-note.on')) return;
  else if (e.key === 'Escape' && S.pop) { const back = S.pop; S.pop = null; render(`[data-pop="${CSS.escape(back)}"]`); }
  else if (e.key === 'Escape' && S.dialog) { S.dialog = null; render(); }
  else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && e.target.id === 'composer-text') { e.preventDefault(); document.getElementById('send')?.click(); }
});
window.addEventListener('resize', placePop);
window.addEventListener('scroll', placePop, true);
window.addEventListener('hashchange', route);

mini({ label: 'Demo, made-up data', ok: 'OK' });
route();
