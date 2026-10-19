/* Billing agent miniature: the billing review's own layout (rail, hub top bar,
   page title, cards, step tabs, dialogs) redrawn with its own CSS and filled
   with a made-up month of 12 invoices. Working screens: Overview, Monthly close
   (all 7 steps, Needs review fully working), Drafts (register, invoice dialog,
   prices side by side, line edits), Client emails, Records > Activity and
   Rules library. Anything that would send, post, file or write to an outside
   system shows a note instead. State lives in memory only. */
import { mini, esc, svg } from '../mini.js';
import { I } from './icons.js';
import { CYCLE, ITEMS, INVOICES, CARDS, EMAILS, SOURCES, RULES, AUDIT } from './data.js';

const ICON = { grid: 'LayoutGrid', inbox: 'Inbox', layers: 'Layers', check: 'Check', shield: 'ShieldCheck', arrow: 'ArrowRight', file: 'FileText',
  spark: 'Sparkle', clock: 'Clock', people: 'Users', search: 'Search', pause: 'Pause', play: 'Play', close: 'X', book: 'BookOpen', download: 'Download',
  link: 'Link', chart: 'ChartLine', chevron: 'ChevronRight', calendar: 'Calendar', list: 'List', restart: 'RotateCcw', dollar: 'CircleDollarSign',
  down: 'ChevronDown', sliders: 'SlidersHorizontal', percent: 'Percent', userx: 'UserX', database: 'Database', alert: 'TriangleAlert',
  sidebar: 'PanelLeft', bell: 'Bell', plus: 'Plus', help: 'LifeBuoy' };
const icon = n => svg(I[ICON[n] || 'FileText'], { size: 18, stroke: 1.7 });
const $ = s => document.querySelector(s);
const money = v => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);
const REAL = what => `In the real product this would ${what}`;
const real = what => `data-real="${esc(REAL(what))}"`;
const btn = (label, action, attrs = '', kind = 'primary') => `<button type="button" class="button ${kind}" ${action ? `data-action="${action}"` : ''} ${attrs}>${label}</button>`;
const rbtn = (label, what, kind = 'primary', attrs = '') => `<button type="button" class="button ${kind}" ${real(what)} ${attrs}>${label}</button>`;
const badge = (label, tone = 'neutral') => `<span class="badge ${tone}">${label}</span>`;
const initials = s => s.replace(/[^A-Za-z ]/g, '').split(/\s+/).filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase();
const round = n => Math.round(n * 100) / 100;

/* ---------- state ---------- */
const STEPS = [['schedule', 'Schedule'], ['sources', 'Sources'], ['needs', 'Needs review'], ['release', 'Final checks'], ['bc', 'BC & email'], ['ach', 'ACH'], ['close', 'Close & learn']];
const isStep = id => STEPS.some(x => x[0] === id);
const PAGES = { overview: 'Overview', invoices: 'Drafts', inbox: 'Client emails', activity: 'Activity', knowledge: 'Rules library' };
const ROUTES = ['overview', ...STEPS.map(x => x[0]), 'invoices', 'inbox', 'activity', 'knowledge'];
const fresh = () => ({
  tab: 'overview', layout: 'overview', lastStep: 'needs', paused: false, motion: true, railCollapsed: false, navOpen: { billing: true, records: false },
  cards: Object.fromEntries(CARDS.map(c => [c.id, { status: 'open', choice: null, notes: [] }])), needsOpen: null,
  approved: Object.fromEntries(INVOICES.map(i => [i.id, i.approved])), edits: {},
  mailOpen: 'e1', checkedAgo: 2, audit: AUDIT.map(([at, owner, text]) => ({ at, owner, text })),
});
let S = fresh();
let page = 0, rowsPerPage = 3, query = '', ruleQuery = '', ruleCat = 'All';
let draftFilter = 'all', draftSort = 'total', draftView = 'lines', draftEditing = null, draftBuffer = null, selected = null;
let job = null, bellOpen = false, menuOpen = null, menuActive = 0, lastFocus = null;

const card = id => CARDS.find(c => c.id === id);
const inv = id => INVOICES.find(i => i.id === id);
const AGENT_LINES = {
  af: () => inv('af').lines.filter(l => l.item !== 'SV-150'),
  bd: () => inv('bd').lines.map(l => l.item === 'SV-110' ? { ...l, unit_price: 110 } : l),
  ti: () => inv('ti').lines,
};
const linesOf = i => S.edits[i.id] || i.lines;
const lineSum = lines => round(lines.reduce((n, l) => n + (Number(l.qty) || 0) * (Number(l.unit_price) || 0), 0));
const totalOf = i => lineSum(linesOf(i));
const consoleTotal = id => lineSum(inv(id).lines);
const openCards = () => CARDS.filter(c => S.cards[c.id].status === 'open');
const needsCount = () => openCards().length;
const agreeIds = () => INVOICES.filter(i => !card(i.id)).map(i => i.id);
const corrections = () => round(CARDS.reduce((n, c) => n + (S.cards[c.id].choice === 'agent' ? consoleTotal(c.id) - c.agent : 0), 0));
const batchTotal = () => round(INVOICES.reduce((n, i) => n + totalOf(i), 0));
function record(owner, text) { S.audit.unshift({ at: new Date().toISOString(), owner, text }); }

/* ---------- shell ---------- */
const NAV = [['overview', 'Overview', 'chart'], { group: 'billing', label: 'Billing', icon: 'dollar', kids: [['monthly', 'Monthly close', 'calendar'], ['invoices', 'Drafts', 'file'], ['inbox', 'Client emails', 'inbox']] },
  { group: 'records', label: 'Records', icon: 'book', kids: [['decisions', 'Decisions', 'alert'], ['activity', 'Activity', 'list'], ['knowledge', 'Rules library', 'book']] }];
const isActive = id => id === 'monthly' ? isStep(S.tab) : S.tab === id;
function navLink([id, label, ic], kid = false) {
  const act = isActive(id), badgeN = id === 'monthly' && needsCount() ? `<b>${needsCount()}</b>` : id === 'inbox' ? `<b>${EMAILS.length}</b>` : '';
  const target = id === 'decisions' ? real('open the queue of rules waiting on a yes or no.') : `data-action="tab" data-tab="${id === 'monthly' ? S.lastStep : id}"`;
  return `<button type="button" ${target} title="${label}" class="${kid ? 'nav-child ' : ''}${act ? 'active' : ''}" ${act ? 'aria-current="page"' : ''}>${icon(ic)}<span>${label}</span>${badgeN}</button>`;
}
function navGroup(g) {
  const open = S.navOpen[g.group], inside = g.kids.some(k => isActive(k[0]));
  return `<div class="nav-group-block"><button type="button" class="nav-group-btn ${inside ? 'inside' : ''}" data-action="nav-group" data-group="${g.group}" aria-expanded="${open}" title="${g.label}">${icon(g.icon)}<span>${g.label}</span><i class="nav-caret">${icon('down')}</i></button><div class="nav-children" ${open ? '' : 'data-closed'}>${g.kids.map(k => navLink(k, true)).join('')}</div></div>`;
}
const logo = () => `<span class="logo nlogo" role="img" aria-label="Billing agent"><i aria-hidden="true"></i><span>ledgerline</span></span>`;
function rail() {
  return `<aside class="rail" id="rail">${logo()}<div class="cycle-card"><span>Current cycle</span><strong>October 2026</strong><small>September services</small><em>${icon('clock')}Started Oct 2 · Snowflake</em></div>
    <nav aria-label="Billing sections">${NAV.map(n => Array.isArray(n) ? navLink(n) : navGroup(n)).join('')}</nav>
    <div class="rail-bottom"><button type="button" data-action="reset" title="Start a new demo">${icon('restart')} Start a new demo</button><button type="button" ${real('open the earlier design concepts for this dashboard.')} title="Earlier concepts">${icon('grid')} Earlier concepts</button><p class="rail-note">Drafts go to BC from here. Posting happens in Business Central.</p></div></aside>`;
}
function nextAction() {
  if (needsCount()) return { headline: `${needsCount()} ${needsCount() === 1 ? 'client needs' : 'clients need'} review.`, sub: '9 candidates cleared by the agents. Open each finding to see the evidence and proposed action.', label: 'Review next decision', tab: 'needs', icon: 'people', tone: 'amber' };
  return { headline: 'Every decision is recorded. Run the final checks.', sub: `${INVOICES.length} invoices · ${money(batchTotal())}. The checks must pass before anything goes to BC.`, label: 'Open final checks', tab: 'release', icon: 'shield', tone: 'blue' };
}
const when = t => { const x = new Date(t); return `${x.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · ${x.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`; };
function bell() {
  const a = nextAction(), n = needsCount();
  return `<button type="button" class="bell" data-action="bell" aria-expanded="${bellOpen}" aria-controls="bell-panel" aria-label="Notifications${n ? `, ${n} need review` : ''}" title="Notifications">${icon('bell')}${n ? `<span class="bell-count">${n}</span>` : '<span class="bell-dot"></span>'}</button>
    <div id="bell-panel" class="bell-panel" role="region" aria-label="Notifications" ${bellOpen ? '' : 'hidden'}><div class="bell-head"><strong>Notifications</strong><span>October 2026 cycle</span></div>
    <div class="bell-next ${a.tone}"><span class="message-symbol">${icon(a.icon)}</span><div><strong>${esc(a.headline)}</strong><p>${esc(a.sub)}</p>${btn(a.label + icon('arrow'), 'tab', `data-tab="${a.tab}"`)}</div></div>
    <span class="bell-group">Recent activity</span>${S.audit.slice(0, 3).map(x => `<div class="bell-item">${icon('clock')}<div><p>${esc(x.text)}</p><small>${esc(x.owner)} · ${when(x.at)}</small></div></div>`).join('')}
    <button type="button" class="bell-all" data-action="tab" data-tab="activity">See all activity${icon('chevron')}</button></div>`;
}
const SUBS = { overview: 'September services · fictional demo records', needs: 'Clients the agents could not clear · pricing side by side', schedule: 'Automatic start on the 2nd · ready-to-view emails',
  sources: 'September billing data from Snowflake', release: 'The hub’s send guards, then the batch goes to Business Central', close: 'Close record and next-cycle learning', invoices: 'The October register',
  knowledge: 'Every rule the agents follow, by category', inbox: 'Complaints and questions since the send', bc: 'Check, approve and email from Business Central', ach: 'Agent creates · reviewer checks · submitter sends', activity: 'Who did what, in one timeline' };
const pageSub = () => job && S.tab !== 'overview' ? `${S.paused ? 'Paused' : 'Working'}: ${job.short} · ${job.pct}%` : isStep(S.tab) ? `Step ${STEPS.findIndex(x => x[0] === S.tab) + 1} of ${STEPS.length} · ${SUBS[S.tab]}` : SUBS[S.tab];
const title = () => S.tab === 'overview' ? 'Billing overview' : PAGES[S.tab] || 'Monthly close';
const layoutSwitch = () => `<nav class="layout-switch" aria-label="Overview arrangement">${[['overview', '01', 'Overview'], ['review', '02', 'Review desk'], ['operations', '03', 'Close']].map(([id, n, label]) => `<button type="button" data-action="layout" data-layout="${id}" aria-pressed="${S.layout === id}"><span>${n}</span>${label}</button>`).join('')}</nav>`;
function header() {
  return `<header class="heading"><div class="topbar"><button type="button" class="rail-toggle" data-action="toggle-rail" aria-controls="rail" aria-label="${S.railCollapsed ? 'Expand' : 'Collapse'} navigation" aria-expanded="${!S.railCollapsed}">${icon('sidebar')}</button>
    <div class="hub-search" role="search"><span class="hub-search-icon">${icon('search')}</span><input id="hub-search" type="text" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="search-results" aria-label="Search pages and clients" placeholder="Search pages and clients…" autocomplete="off"><kbd>Ctrl K</kbd><div id="search-results" class="search-results" role="listbox" aria-label="Search results" hidden></div></div>
    <div class="header-actions"><span class="env-pill"><i aria-hidden="true"></i>Demo · fake BC</span><span class="topbar-divider" aria-hidden="true"></span>${btn(icon(S.paused ? 'play' : 'pause') + (S.paused ? 'Resume agents' : 'Pause agents'), 'pause', `aria-pressed="${S.paused}"`, 'quiet')}${btn(icon('help') + 'Help', 'about', 'aria-label="Help: how this works"', 'quiet')}<div class="bell-wrap" id="bell-slot">${bell()}</div><span class="topbar-divider" aria-hidden="true"></span>
    <button type="button" class="account-chip" data-action="controls" aria-label="Demo Reviewer: agent permissions and controls"><span class="avatar">DR</span><span class="account-name"><strong>Demo Reviewer</strong><small><i aria-hidden="true"></i>Billing workspace</small></span>${icon('chevron')}</button></div></div>
    <div class="page-row"><div class="page-title"><span class="eyebrow">Billing / October 2026 cycle</span><h1>${title()}</h1><p id="page-sub">${esc(pageSub())}</p></div>${S.tab === 'overview' ? layoutSwitch() : ''}</div></header>`;
}

/* ---------- overview ---------- */
function metrics() {
  const reviewed = job ? Math.min(12, Math.floor(job.pct / 100 * 12)) : 12;
  return `<section class="metrics" aria-label="Cycle metrics">${[
    ['Projected billing', money(batchTotal()), `${INVOICES.length} candidate invoices`, 'blue'],
    ['Reviewed by agents', `${reviewed}<span class="denominator"> / ${INVOICES.length}</span>`, job ? (S.paused ? 'Review paused' : 'Review in progress') : 'Investigation complete', 'blue'],
    ['Needs review', String(needsCount()), needsCount() ? 'Findings with evidence' : 'All decided', 'amber'],
    ['Corrections applied', money(corrections()), 'Taken off the prepared drafts', 'green'],
  ].map(([l, v, sub, tone]) => `<article class="metric ${tone}"><span>${l}</span><strong>${v}</strong><small title="${sub}">${sub}</small></article>`).join('')}</section>`;
}
const PHASES = [['Collect', 'layers', 'Snowflake · 2nd'], ['Prepare', 'file', 'Pricing engine'], ['Rule check', 'book', 'Off-cycle runs'], ['Investigate', 'search', 'Investigator'], ['Verify', 'shield', 'Verifier'], ['Ready for you', 'people', 'Human judgment']];
const JOB_TEXT = ['Fetching payroll details, price records and the payroll calendar from Snowflake.', 'Pricing 12 candidates against their price records.', 'More than two off-cycle runs in a month needs a rule that covers them.',
  'Following the evidence behind prices, credits and services.', 'A second agent checks the conclusions and proposed corrections.', '9 agent-cleared candidates · 3 decisions remain for a person.'];
function telemetry() {
  const phase = job ? job.phase : 5, running = !!job && !S.paused;
  const status = S.paused ? 'Paused' : job ? 'Working' : 'Review complete';
  const detail = S.paused ? 'Agent work is paused. Human review remains available.' : job ? JOB_TEXT[job.phase] : 'Every finding has a source. Your decisions stay connected to the evidence.';
  const progress = job ? job.pct : 100;
  return `<section class="agent-stage" aria-label="Agent activity" data-running="${running}" data-motion="${S.motion}"><div class="stage-heading"><div><span class="eyebrow">AGENT ACTIVITY</span><h2>${job ? esc(job.short) : 'Your agents, at a glance.'}</h2></div><div class="stage-tools"><span class="live-state ${running ? 'running' : ''}"><i></i>${status}</span>${btn(icon('play') + ' Watch review', 'watch', job || S.paused ? 'disabled' : '', 'text')}</div></div>
    <div class="agent-flow">${PHASES.map(([label, ic, sub], n) => `<div class="flow-step ${n < phase || !job ? 'done' : ''} ${n === phase ? 'current' : ''} ${running && n === phase ? 'working' : ''}"><span class="flow-node">${svg(I[ICON[n < phase ? 'check' : ic]], { size: 18, stroke: 1.7 })}<span class="node-ring"></span></span><div><strong>${label}</strong><small>${sub}</small></div>${n < PHASES.length - 1 ? `<div class="connector ${running && n === phase ? 'active' : ''}"><i></i></div>` : ''}</div>`).join('')}</div>
    <div class="stage-bottom"><div class="stage-caption">${icon(job ? 'search' : 'shield')}<span id="agent-detail">${esc(detail)}</span></div><div class="run-meter"><span>${job ? progress + '%' : '12 / 12 checked'}</span><div><i style="width:${progress}%"></i></div></div></div></section>`;
}
function panelTitle(t, sub, extra = '') { return `<div class="panel-heading"><div><h2>${t}</h2>${sub ? `<p>${sub}</p>` : ''}</div>${extra}</div>`; }
function overviewPanel() {
  const open = openCards();
  const list = open.length ? open.slice(0, 2).map(c => `<button type="button" class="attention-row" data-action="card-go" data-id="${c.id}"><span class="client-avatar">${initials(c.client)}</span><div><strong>${esc(c.client)}</strong><small>${esc(c.type)} · ${c.impact ? '−' + money(-c.impact) : 'confirm'}</small></div>${icon('chevron')}</button>`).join('')
    : `<div class="clear-state">${icon('shield')}<div><strong>Review decisions are complete.</strong><p>Continue with the final checks and the BC send.</p></div></div>`;
  const ms = [['Intake', 'needs'], ['Snowflake', 'schedule'], ['Review', 'needs'], ['Final checks', 'release'], ['Send to BC', 'release'], ['Close', 'close']], cur = needsCount() ? 2 : 3;
  return `<div class="overview-columns"><section class="attention-panel">${panelTitle('Where you can help', 'Evidence and a proposed action, ready for review.', btn('View all', 'tab', 'data-tab="needs"', 'text'))}${list}</section>
    <section class="cycle-panel">${panelTitle('The close, in one view', 'Complete means the supporting evidence is recorded.')}<div class="milestones">${ms.map(([label, tab], i) => `<button type="button" data-action="tab" data-tab="${tab}" class="${i < cur ? 'complete' : i === cur ? 'current' : ''}"><span>${i < cur ? icon('check') : i + 1}</span><strong>${label}</strong></button>`).join('')}</div>
    <div class="cycle-note"><span>${icon('clock')} Starts on the 2nd · posting stays in BC</span>${btn('Open final checks', 'tab', 'data-tab="release"', 'text')}</div></section></div>`;
}

/* ---------- list helpers ---------- */
function pager(length) {
  const total = Math.max(1, Math.ceil(length / rowsPerPage)); page = Math.min(page, total - 1);
  return `<div class="pager"><span>${length ? `${page * rowsPerPage + 1}-${Math.min((page + 1) * rowsPerPage, length)} of ${length}` : 'No records'}</span><div>${btn('Previous', 'page', 'data-delta="-1" ' + (page === 0 ? 'disabled' : ''), 'quiet')}<span>${page + 1} / ${total}</span>${btn('Next', 'page', 'data-delta="1" ' + (page >= total - 1 ? 'disabled' : ''), 'quiet')}</div></div>`;
}
function rows(items, renderer) { const p = pager(items.length); return `<div class="list-body" id="list-body">${items.slice(page * rowsPerPage, (page + 1) * rowsPerPage).map(renderer).join('') || '<div class="empty-list">Nothing in this view.</div>'}</div>${p}`; }
const hubSearch = (id, value, placeholder, label) => `<label class="field-search">${icon('search')}<input id="${id}" type="search" value="${esc(value)}" placeholder="${esc(placeholder)}" aria-label="${esc(label)}" autocomplete="off"></label>`;

/* Select menu, the hub's style: a rounded button and a card list. */
const MENUS = {
  drafts: { label: 'Sort and filter invoices', sections: () => {
    const c = draftCounts();
    return [{ heading: 'Show', value: draftFilter, set: v => { draftFilter = v; }, options: [['all', 'All invoices', 'grid', `${c.all} invoices`], ['review', 'Needs review', 'alert', `${c.review} ${c.review === 1 ? 'invoice' : 'invoices'}`], ['reviewed', 'Reviewed', 'shield', `${c.reviewed} invoices`]] },
      { heading: 'Sort by', value: draftSort, set: v => { draftSort = v; }, options: [['total', 'Largest total', 'dollar', 'Biggest invoices first'], ['change', 'Biggest change', 'chart', 'Largest move from last month'], ['name', 'Client, A to Z', 'list', 'Find a client you know by name'], ['lines', 'Most lines', 'file', 'Busiest invoices first']] }];
  }, text: () => { const s = MENUS.drafts.sections(); const so = s[1].options.find(o => o[0] === draftSort)[1], sh = s[0].options.find(o => o[0] === draftFilter)[1]; return so + (draftFilter !== 'all' ? ' · ' + sh : ''); } },
  cat: { label: 'Filter rules by category', sections: () => [{ heading: 'Category', value: ruleCat, set: v => { ruleCat = v; }, options: ['All', ...new Set(RULES.map(r => r.cat))].map(c => { const n = c === 'All' ? RULES.length : RULES.filter(r => r.cat === c).length; return [c, c === 'All' ? 'All categories' : c, { All: 'grid', Pricing: 'dollar', Fees: 'file', 'Off-cycle': 'calendar', 'Credits & discounts': 'percent', Terminations: 'userx', Services: 'layers' }[c] || 'book', `${n} ${n === 1 ? 'rule' : 'rules'}`]; }) }],
    text: () => ruleCat === 'All' ? 'All categories' : ruleCat },
};
const flatMenu = k => MENUS[k].sections().flatMap((s, si) => s.options.map(o => ({ o, si })));
function selectMenu(key) {
  const m = MENUS[key], secs = m.sections(), open = menuOpen === key, text = m.text(); let i = -1;
  const list = open ? `<div class="select-list" id="${key}-list" role="listbox" tabindex="-1" aria-label="${esc(m.label)}" aria-activedescendant="${key}-opt-${menuActive}">${secs.map((x, si) => `${si ? '<div class="menu-sep" role="presentation"></div>' : ''}<div class="menu-heading" role="presentation">${esc(x.heading)}</div>${x.options.map(([v, l, ic, hint]) => { i++; return `<div role="option" id="${key}-opt-${i}" class="menu-option${i === menuActive ? ' hot' : ''}" aria-selected="${v === x.value}" data-action="menu-pick" data-menu="${key}" data-i="${i}"><span class="menu-icon">${icon(ic)}</span><span class="menu-text"><strong>${esc(l)}</strong><small>${esc(hint)}</small></span><span class="menu-check">${icon('check')}</span></div>`; }).join('')}`).join('')}</div>` : '';
  return `<div class="select-menu" id="${key}-menu"><button type="button" class="select-button${open ? ' open' : ''}" id="${key}-button" data-action="menu-toggle" data-menu="${key}" aria-haspopup="listbox" aria-expanded="${open}" aria-label="${esc(m.label)}: ${esc(text)}"><span class="select-lead">${icon('sliders')}</span><span class="select-text">${esc(text)}</span><span class="select-chev">${icon('down')}</span></button>${list}</div>`;
}
function placeMenu() {
  const b = $('#' + menuOpen + '-button'), l = $('#' + menuOpen + '-list'); if (!b || !l) return;
  const r = b.getBoundingClientRect(), w = Math.min(Math.max(r.width, 280), innerWidth - 32);
  l.style.left = Math.max(16, Math.min(r.left, innerWidth - w - 16)) + 'px'; l.style.width = w + 'px';
  const below = innerHeight - r.bottom - 16; l.style.maxHeight = Math.min(416, Math.max(below, 200)) + 'px';
  l.style.top = (below >= 200 ? r.bottom + 6 : Math.max(16, r.top - 6 - Math.min(416, l.scrollHeight))) + 'px';
}
function drawMenu(focusKey) { drawPanel(); if (menuOpen) { placeMenu(); $('#' + menuOpen + '-list')?.focus(); } else if (focusKey) $('#' + focusKey + '-button')?.focus(); }
function openMenu(k) { const secs = MENUS[k].sections(); menuActive = Math.max(0, flatMenu(k).findIndex(({ o, si }) => o[0] === secs[si].value)); menuOpen = k; drawMenu(); }
function closeMenu(refocus = true) { if (!menuOpen) return; const k = menuOpen; menuOpen = null; drawMenu(refocus ? k : null); }
function pickMenu(k, i) { const secs = MENUS[k].sections(), x = flatMenu(k)[i]; if (x) { secs[x.si].set(x.o[0]); page = 0; } menuOpen = null; drawMenu(k); }
function moveMenu(i) { const opts = [...document.querySelectorAll('#' + menuOpen + '-list .menu-option')]; if (!opts.length) return; menuActive = (i + opts.length) % opts.length; opts.forEach((o, k) => o.classList.toggle('hot', k === menuActive)); $('#' + menuOpen + '-list').setAttribute('aria-activedescendant', menuOpen + '-opt-' + menuActive); }

/* ---------- Monthly close: steps ---------- */
function stepTabs() { return `<nav class="tabs step-tabs" aria-label="Monthly close steps">${STEPS.map(([id, label], n) => `<button type="button" data-action="tab" data-tab="${id}" aria-pressed="${S.tab === id}"><em>${n + 1}</em> · ${label}${id === 'needs' && needsCount() ? `<span>${needsCount()}</span>` : ''}</button>`).join('')}</nav>`; }
const SLOTS = (() => { const out = []; for (let d = 2; d <= 8; d++) for (const h of [9, 15]) out.push(new Date(2026, 9, d, h)); return out.reverse(); })();
function schedulePanel() {
  const steps = [['Oct 2', 'Automatic start'], ['Snowflake', 'Connected'], ['Fetched', '1,206 rows'], ['Drafts', 'Prepared by itself'], ['Rule check', 'Off-cycle runs'], ['Reviewed', 'By the agents']];
  const t = d => `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  const ready = d => d >= new Date(2026, 9, 2, 11, 30);
  return `<div class="schedule-columns"><section class="schedule-start">${panelTitle('Starts by itself on the 2nd', 'Automatic monthly pull from Snowflake.', badge('Ran Oct 2', 'green'))}<div class="milestones schedule-steps">${steps.map(([l, sub]) => `<div class="complete"><span>${icon('check')}</span><strong>${l}</strong><small>${sub}</small></div>`).join('')}</div>
    <div class="cycle-note backup-start"><span>${icon('shield')} Backup only, if the connection was lost.</span>${btn('Start', '', 'disabled title="The scheduled run finished on Oct 2"', 'quiet')}</div></section>
    <section class="schedule-email">${panelTitle('Ready-to-view emails', '9 AM and 3 PM from the 2nd · billing lead and controller', badge('Next Oct 9 · 9:00 AM', 'blue'))}${rows(SLOTS, d => `<div class="data-row"><span class="row-icon ${ready(d) ? 'green' : ''}">${icon('inbox')}</span><span class="record-name"><strong>${t(d)}</strong><small>To the billing lead and the controller</small></span>${badge(ready(d) ? 'Ready to view' : 'Not ready yet', ready(d) ? 'green' : 'amber')}</div>`)}</section></div>`;
}
function sourcesPanel() {
  return panelTitle('One dated evidence packet', 'September 1-30, 2026 · six source groups from Snowflake', badge('Fetched Oct 2', 'green')) + rows(SOURCES, ([name, stat, desc, ic]) => `<div class="data-row"><span class="row-icon">${icon(ic)}</span><span class="record-name"><strong>${name}</strong><small>${desc}</small></span><span class="source-stat">${stat}</span>${badge('Fetched', 'green')}</div>`);
}
const STATUS = { open: ['To decide', 'amber'], decided: ['Decided', 'green'], held: ['On hold', 'neutral'] };
const CHOICE = { agent: "Agents' invoice", console: "Console's draft" };
function needsPanel() {
  const cards = CARDS, done = cards.filter(c => S.cards[c.id].status !== 'open').length;
  const want = cards.filter(c => c.why.some(w => w.startsWith('The agents want'))).length, differ = cards.filter(c => c.why.some(w => w.includes('different totals'))).length;
  const ids = agreeIds(), agreeTotal = round(ids.reduce((n, id) => n + totalOf(inv(id)), 0)), approvedN = ids.filter(id => S.approved[id]).length, left = ids.length - approvedN;
  const head = panelTitle('Needs review', `<span class="legend-inline">${icon('spark')} Demo · the agents' close · built 14 days ago</span>`);
  const strip = `<div class="decide-strip"><div class="decide-count"><strong>${needsCount()}</strong><span>to decide</span></div><div class="decide-progress"><div class="decide-bar" role="img" aria-label="${done} of ${cards.length} decided"><i style="width:${Math.round(done / cards.length * 100)}%"></i></div><span>${done} of ${cards.length} decided · cycle ${CYCLE} · agents cost $0.84</span></div><div class="decide-reasons">${want ? `<span class="reason-chip amber">${icon('help')}Agents ask <b>${want}</b></span>` : ''}${differ ? `<span class="reason-chip red">${icon('alert')}Totals differ <b>${differ}</b></span>` : ''}<span class="reason-chip amber" title="From the close-dates schedule">${icon('calendar')}Post Thursday, October 8 · email by 8:00 am · due Friday, October 9</span></div>${btn(icon('restart') + ' Refresh', 'needs-refresh', '', 'quiet')}<button type="button" class="button quiet" disabled title="The agents run on their own schedule in this demo">${icon('play')} Run again</button></div>`;
  const agree = `<article class="decision-row${left ? '' : ' done'}"><div class="decision-main"><span class="mail-avatar">${icon('check')}</span><div class="decision-name"><strong>Agents and console agree: ${ids.length} clients</strong><div class="decision-tags"><span class="tag">${icon('dollar')}${money(agreeTotal)}</span><span class="tag">${icon('shield')}${approvedN} of ${ids.length} approved</span></div></div><div class="decision-acts">${left ? btn(icon('check') + ` Approve ${left} invoice${left === 1 ? '' : 's'}`, 'agree-approve') : `<span class="done-chip confirmed">${icon('check')}All approved</span>`}</div></div></article>`;
  return head + strip + `<div class="decision-list">${agree}${cards.map(needsRow).join('')}</div>`;
}
function needsRow(c) {
  const st = S.cards[c.id], open = S.needsOpen === c.id, [sl, tone] = STATUS[st.status];
  const tags = c.why.map(w => `<span class="reason-chip ${w.startsWith('The agents want') ? 'amber' : 'red'}">${icon(w.startsWith('The agents want') ? 'help' : 'alert')}${esc(w)}</span>`).join('')
    + `<span class="tag">${icon('spark')}Agents ${money(c.agent)}</span><span class="tag">${icon('file')}Console ${money(consoleTotal(c.id))}</span>`
    + (st.status === 'open' && S.approved[c.id] ? `<span class="reason-chip red" title="Final checks would send the console's draft unless you decide or hold">${icon('alert')}Console already approved</span>` : '')
    + (st.notes.length ? `<span class="tag">${icon('inbox')}${st.notes.length} note${st.notes.length === 1 ? '' : 's'}</span>` : '');
  const acts = (st.status === 'open' ? badge(sl, tone) : `<span class="done-chip ${st.status === 'held' ? '' : 'confirmed'}">${icon(st.status === 'held' ? 'pause' : 'check')}${sl}${st.choice ? ` · ${CHOICE[st.choice]}` : ''}</span>`)
    + `<button type="button" class="icon-act more${open ? ' on' : ''}" data-action="needs-open" data-id="${c.id}" aria-expanded="${open}" aria-label="${open ? 'Hide' : 'Show'} ${esc(c.client)}">${icon('down')}</button>`;
  return `<article class="decision-row${st.status === 'open' ? '' : ' done'}${open ? ' open' : ''}" id="card-${c.id}"><div class="decision-main"><span class="mail-avatar">${initials(c.client)}</span><div class="decision-name"><strong>${esc(c.client)}</strong><div class="decision-tags">${tags}</div></div><div class="decision-acts">${acts}</div></div>${open ? needsDetail(c) : ''}</article>`;
}
function needsDetail(c) {
  const st = S.cards[c.id], i = inv(c.id), con = consoleTotal(c.id);
  const table = `<table class="price-compare dr-prices"><thead><tr><th scope="col">Invoice</th><th scope="col">Agents</th><th scope="col">Console</th><th scope="col">Console draft</th></tr></thead><tbody><tr class="${Math.abs(c.agent - con) > 0.005 ? 'changed' : ''}"><th scope="row">${i.number}</th><td>${money(c.agent)}</td><td>${money(con)}</td><td>${S.approved[c.id] ? 'Approved' : 'Not approved'}</td></tr></tbody></table>`;
  const notes = st.notes.length ? `<div class="needs-notes">${st.notes.map(n => `<p class="muted">${icon('inbox')} <strong>Demo Reviewer</strong>&nbsp;${n.at}${n.choice ? ` · ${CHOICE[n.choice] || 'On hold'}` : ''}: ${esc(n.text)}</p>`).join('')}</div>` : '';
  return `<div class="decision-detail"><p class="agent-fix">${icon('spark')} <strong>Agents:</strong> ${esc(c.summary)}</p><ul class="needs-q">${c.questions.map(q => `<li>${esc(q)}</li>`).join('')}</ul>${table}${notes}
    <textarea id="ln-note-${c.id}" rows="2" class="live-reply" maxlength="2000" aria-label="Note to the agents about ${esc(c.client)}" placeholder="Note to the agents (optional for the first three, needed to send back)"></textarea>
    <div class="row-btns">${btn(icon('spark') + " Use the agents' invoice", 'needs-agents', `data-id="${c.id}"`)}${btn(icon('check') + " Keep the console's draft", 'needs-console', `data-id="${c.id}"`, 'quiet')}${btn(icon('pause') + ' Hold', 'needs-hold', `data-id="${c.id}"`, 'quiet')}${btn(icon('arrow') + ' Send back with the note', 'needs-back', `data-id="${c.id}"`, 'text')}</div>
    <p class="muted">${icon('shield')} Approving does not send anything. Final checks sends the approved drafts to BC. Hold keeps this client out of the batch.</p></div>`;
}
function stage(n, t, who, state, body) { return `<section class="stage ${state}"><header><span class="stage-dot">${state === 'done' ? icon('check') : `<b>${n}</b>`}</span><div><h3>${t}</h3><small>${who}</small></div></header><div class="stage-body">${body}</div></section>`; }
const figure = (v, l, tone = '') => `<div class="fig ${tone}"><strong>${v}</strong><span>${l}</span></div>`;
const muted = (ic, t) => `<p class="muted">${icon(ic)} ${t}</p>`;
function releasePanel() {
  const blocked = openCards(), ready = INVOICES.filter(i => S.approved[i.id] && !blocked.some(c => c.id === i.id)).length;
  return panelTitle('Final checks', `<span class="legend-inline">${icon('shield')} Demo · cycle ${CYCLE}</span>`) + `<div class="stages">
    <section class="stage ${ready ? 'now' : 'later'}"><header><span class="stage-dot"><b>1</b></span><div><h3>Final checks</h3><small>The hub's send guards</small></div></header><div class="stage-body"><div class="figs">${figure(ready, 'ready to send', ready ? 'green' : '')}${figure(blocked.length, 'blocked', blocked.length ? 'red' : '')}</div>${blocked.map(c => `<div class="bounce">${icon('alert')}<span><strong>${esc(c.client)}</strong> decision open in Needs review</span></div>`).join('')}${btn(icon('restart') + ' Check again', 'release-check', '', 'quiet')}</div></section>
    <section class="stage ${ready ? 'now' : 'later'}"><header><span class="stage-dot"><b>2</b></span><div><h3>Send to BC</h3><small>Creates the approved drafts in BC</small></div></header><div class="stage-body">${rbtn(icon('arrow') + ` Send ${ready} to BC`, `create the ${ready} approved draft invoices in Business Central. Posting still happens in BC.`)}</div></section></div>`;
}
function bcPanel() {
  return panelTitle('BC & email', `<span class="legend-inline">${icon('shield')} Demo · from Business Central</span>`) + `<div class="stages">
    ${stage(1, 'Check BC', 'Every sent invoice', 'now', rbtn(icon('search') + ' Check BC', 'look up every sent invoice in Business Central and compare its total with the hub.'))}
    ${stage(2, 'Approve & post', 'In Business Central', 'later', muted('clock', 'Every invoice must be found and match'))}
    ${stage(3, 'Email invoices', 'From BC', 'later', muted('clock', 'Waits for posting'))}</div>`;
}
function achPanel() {
  return panelTitle('ACH', `<span class="legend-inline">${icon('people')} Demo · agent builds · reviewer checks · submitter sends</span>`) + `<div class="stages">
    ${stage(1, 'Create report', 'From the posted invoices', 'now', rbtn(icon('spark') + ' Create ACH report', 'build the ACH bank report from the posted invoices for a person to check.'))}
    ${stage(2, 'Check every number', 'Reviewer', 'later', muted('clock', 'Waits for the report'))}
    ${stage(3, 'Submit to bank', 'Submitter', 'later', muted('clock', 'Waits for the check'))}</div>`;
}
function closePanel() {
  return panelTitle('Close record & next-cycle learning', 'Finish BC & email and ACH first.', btn('Close October', '', 'disabled')) + `<div class="close-grid"><div class="close-total"><span>SENT TO BC</span><strong>Not sent yet</strong><p>Run the final checks, then send the batch to BC.</p>${btn('Inspect proof', '', 'disabled', 'text')}</div>
    <div class="learning-summary"><div><strong>After the send</strong>${badge('After close')}</div><p>Review the client replies, prepare any credits and propose a process improvement.</p>${btn('Open follow-up', '', 'disabled', 'quiet')}</div>
    <div class="carry-forward"><span>${icon('inbox')} Carry forward</span><p>Tidewater Inn’s seasonal-worker question stays with the account manager until it is answered.</p>${badge('R-102 · confirmation pending', 'amber')}</div></div>`;
}

/* ---------- Drafts ---------- */
const invStatus = i => S.approved[i.id] ? 'reviewed' : 'review';
const DSTATUS = { review: ['Needs review', 'amber'], reviewed: ['Reviewed · good to batch', 'blue'] };
function draftCounts() { const by = s => INVOICES.filter(i => invStatus(i) === s); return { all: INVOICES.length, review: by('review').length, reviewed: by('reviewed').length, reviewSum: by('review').reduce((n, i) => n + totalOf(i), 0) }; }
function draftsPanel() {
  const c = draftCounts();
  let list = draftFilter === 'all' ? INVOICES : INVOICES.filter(i => invStatus(i) === draftFilter);
  const q = query.toLowerCase(); if (q) list = list.filter(i => (i.name + ' ' + i.number + ' ' + i.fein).toLowerCase().includes(q));
  const change = i => i.last == null ? null : totalOf(i) - i.last;
  const sorters = { total: (a, b) => totalOf(b) - totalOf(a), name: (a, b) => a.name.localeCompare(b.name), change: (a, b) => Math.abs(change(b) ?? 0) - Math.abs(change(a) ?? 0), lines: (a, b) => linesOf(b).length - linesOf(a).length };
  list = [...list].sort(sorters[draftSort]);
  const summary = `${c.all} invoices · ${money(batchTotal())} · ${c.review} need review (${money(c.reviewSum)}) · ${c.reviewed} reviewed`;
  return panelTitle('Draft invoices', summary) + `<div class="dr-controls">${hubSearch('invoice-search', query, 'Search client, invoice or FEIN', 'Search invoices')}${selectMenu('drafts')}</div>`
    + `<div class="dr-row dr-head"><span>Client</span><span>Status</span><span class="num">Lines</span><span class="num">Last month</span><span class="num">Change</span><span class="num">Total</span></div>`
    + rows(list, i => { const [l, tone] = DSTATUS[invStatus(i)], ch = change(i); return `<button type="button" class="data-row dr-row" data-action="invoice" data-id="${i.id}"><span class="record-name"><strong>${esc(i.name)}</strong><small>${i.number} · ${CYCLE}${S.edits[i.id] ? ' · edited' : ''}</small></span>${badge(l, tone)}<span class="num">${linesOf(i).length}</span><span class="num muted">${i.last == null ? 'New' : money(i.last)}</span><span class="num ${ch == null || Math.abs(ch) < 0.005 ? 'muted' : ch > 0 ? 'up' : 'down'}">${ch == null ? '' : (ch > 0 ? '+' : ch < 0 ? '−' : '') + money(Math.abs(ch))}</span><span class="num strong">${money(totalOf(i))}</span></button>`; });
}
function priceCompare(i) {
  const r = linesOf(i).map(l => { const rec = ITEMS[l.item] ? ITEMS[l.item][1] : null; return { service: `${l.item} · ${l.description}`, record: rec, draft: Number(l.unit_price) || 0, differs: rec == null || Math.abs(rec - Number(l.unit_price)) > 0.004 }; });
  const diff = r.filter(x => x.differs).length;
  return `<div class="price-summary">${diff ? `<span class="reason-chip red">${icon('alert')}${diff} differ</span>` : ''}<span class="reason-chip green">${icon('check')}${r.length - diff} match</span></div>
    <table class="price-compare dr-prices"><thead><tr><th scope="col">Service</th><th scope="col">Price record</th><th scope="col">On the draft</th><th scope="col">Status</th></tr></thead><tbody>${r.map(x => `<tr class="${x.differs ? 'changed' : ''}"><th scope="row">${esc(x.service)}</th><td>${x.record == null ? 'Not on the record' : money(x.record)}</td><td>${money(x.draft)}</td><td class="match">${x.differs ? `<span class="mark no" title="${x.record == null ? 'Not on the record' : 'Differs'}">${icon('alert')}</span>` : `<span class="mark ok" title="Matches">${icon('check')}</span>`}</td></tr>`).join('')}</tbody></table>`;
}
function draftDialog(id) {
  const i = inv(id); if (!i) return; selected = id;
  const editing = draftEditing === id, lines = editing ? draftBuffer : linesOf(i), [label, tone] = DSTATUS[invStatus(i)], approved = S.approved[id];
  const lineRows = editing
    ? lines.map((l, n) => `<div class="dr-line edit" data-line="${n}"><input class="dr-in item" value="${esc(l.item)}" aria-label="Item, line ${n + 1}"><input class="dr-in desc" value="${esc(l.description)}" aria-label="Description, line ${n + 1}"><input class="dr-in num" type="number" step="any" value="${l.qty}" aria-label="Quantity, line ${n + 1}"><input class="dr-in num" type="number" step="0.01" value="${l.unit_price}" aria-label="Price, line ${n + 1}"><span class="num">${money((Number(l.qty) || 0) * (Number(l.unit_price) || 0))}</span>${btn(icon('close'), 'draft-delline', `data-n="${n}" aria-label="Remove line ${n + 1}"`, 'icon-only')}</div>`).join('')
    : lines.map(l => `<div class="dr-line"><span class="item">${esc(l.item) || '·'}</span><span class="desc">${esc(l.description)}</span><span class="num">${Number(l.qty)}</span><span class="num">${money(Number(l.unit_price))}</span><span class="num strong">${money((Number(l.qty) || 0) * (Number(l.unit_price) || 0))}</span></div>`).join('');
  const total = editing ? lineSum(lines) : totalOf(i), c = card(id);
  const last = i.last == null ? 'No invoice last month (new client)' : `Last month: ${money(i.last)} · change ${total - i.last >= 0 ? '+' : '−'}${money(Math.abs(total - i.last))}`;
  const body = `<div class="issue-topline">${badge(label, tone)}<span>${i.number} · ${i.fein} · service ${CYCLE}</span></div>
    <div class="dr-verdict ${approved ? 'cleared' : 'held'}"><span class="eyebrow">${approved ? 'AGENTS CLEARED THIS INVOICE · APPROVED' : 'AGENTS HELD THIS INVOICE · WAITING FOR REVIEW'}</span>${!approved && c ? `<p>${esc(c.summary)}</p>` : ''}</div>
    ${editing ? '' : `<div class="dialog-tabs dr-tabs"><button type="button" data-action="draft-view" data-view="lines" aria-pressed="${draftView === 'lines'}">${icon('list')} Lines</button><button type="button" data-action="draft-view" data-view="prices" aria-pressed="${draftView === 'prices'}">${icon('dollar')} Prices side by side</button></div>`}
    ${!editing && draftView === 'prices' ? priceCompare(i) : `<div class="dr-lines"><div class="dr-line dr-line-head"><span class="item">Item</span><span class="desc">Description</span><span class="num">Qty</span><span class="num">Price</span><span class="num">Amount</span>${editing ? '<span></span>' : ''}</div>${lineRows}
      ${editing ? `<div class="dr-addline">${btn(icon('plus') + ' Add line', 'draft-addline', '', 'quiet')}</div>` : ''}<div class="dr-total"><span>${editing ? 'Total before you save' : 'Total'}</span><strong id="dr-edit-total">${money(total)}</strong></div></div><p class="dr-last">${last}${S.edits[id] ? ' · edited in this demo' : ''}</p>`}`;
  const footer = editing ? `<span class="footer-note">Edits stay in this demo. Nothing is sent.</span>${btn('Cancel', 'draft-cancel', '', 'quiet')}${btn('Save lines', 'draft-save')}`
    : `${S.edits[id] ? btn('Reset lines', 'draft-reset', '', 'quiet') : ''}${btn('Edit lines', 'draft-edit', '', 'quiet')}${approved ? btn('Undo reviewed', 'draft-unreview', '', 'quiet') : btn(icon('check') + ' Mark reviewed · good to batch', 'draft-review')}`;
  openDialog(esc(i.name), body, footer, true);
}
const readEditLines = () => [...document.querySelectorAll('.dr-line.edit')].map(row => { const v = [...row.querySelectorAll('.dr-in')].map(x => x.value); return { item: v[0].trim(), description: v[1].trim(), qty: Number(v[2]) || 0, unit_price: Number(v[3]) || 0 }; });

/* ---------- Client emails ---------- */
const MAIL_TYPES = { mistake: ['Mistake claim', 'alert', 'red'], missing: ['Missing invoice', 'inbox', 'amber'], payment: ['Payment', 'dollar', 'green'], question: ['Question', 'help', 'gray'] };
function inboxPanel() {
  const counts = Object.entries(MAIL_TYPES).map(([k, [l, ic, tone]]) => [l, ic, tone, EMAILS.filter(m => m.type === k).length]).filter(x => x[3]);
  const watching = `<div class="watching"><span class="watch-label">${icon('search')} Watching</span><span class="tag source mailbox">${icon('inbox')}Billing mailbox · billing@example.com (demo)</span><span class="tag source zendesk">${icon('help')}Help desk tickets (demo)</span><span class="watch-when">${S.checkedAgo < 1 ? 'Checked just now' : `Checked ${S.checkedAgo} min ago`} · checks every 5 min while open</span></div>`;
  const strip = `<div class="decide-strip"><div class="decide-count"><strong>${EMAILS.length}</strong><span>to work</span></div><div class="decide-progress"><div class="decide-bar" role="img" aria-label="0 of ${EMAILS.length} worked"><i style="width:0%"></i></div><span>0 of ${EMAILS.length} worked · cycle ${CYCLE}</span></div><div class="decide-reasons">${counts.map(([l, ic, tone, n]) => `<span class="reason-chip ${tone}">${icon(ic)}${l} <b>${n}</b></span>`).join('')}</div>${btn(icon('restart') + ' Refresh', 'mail-refresh', '', 'quiet')}</div>`;
  return panelTitle('Client emails', `<span class="legend-inline">${icon('spark')} Demo · the agent sorts each email and suggests the fix</span>`) + watching + strip + `<div class="decision-list">${EMAILS.map(mailRow).join('')}</div>`;
}
function mailRow(m) {
  const [l, ic, tone] = MAIL_TYPES[m.type], open = S.mailOpen === m.id;
  const acts = m.type === 'missing' ? rbtn(icon('arrow') + ' Resend from BC', `resend ${m.invoice} to the client from Business Central.`, 'quiet')
    : m.type === 'payment' ? rbtn(icon('people') + ' Route', 'route this email to accounts receivable so the payment is logged.', 'quiet') : '';
  const form = !open ? '' : m.type === 'mistake'
    ? `<div class="reject-box"><input id="li-amt-${m.id}" type="number" step="0.01" min="0" value="${m.amount}" placeholder="Credit amount" aria-label="Credit amount"><input id="li-item-${m.id}" value="${esc(m.item)}" placeholder="BC item" aria-label="BC item">${rbtn(icon('check') + ' File credit', 'file this credit in Billing Exceptions for approval. Once approved it lands on the next invoice.')}</div>${muted('shield', 'Filed in Billing Exceptions for approval, then it lands on the next invoice.')}`
    : m.type === 'question' ? `<textarea id="li-reply-${m.id}" rows="3" class="live-reply" aria-label="Reply to ${esc(m.client)}" placeholder="Reply (saved as a draft, not sent)"></textarea>${rbtn('Save reply draft', 'save this reply as a draft in the billing mailbox. It is never sent from here.', 'quiet')}` : '';
  const detail = open ? `<div class="decision-detail"><blockquote class="mail-body">${esc(m.body)}</blockquote><p class="agent-fix">${icon('spark')} <strong>Agent:</strong> ${esc(m.fix)}</p>${m.named ? muted('file', 'Lines named: ' + esc(m.named)) : ''}${form}</div>` : '';
  return `<article class="decision-row${open ? ' open' : ''}" id="mail-${m.id}"><div class="decision-main"><span class="mail-avatar">${esc(m.client.slice(0, 2).toUpperCase())}</span><div class="decision-name"><strong>${esc(m.subject)}</strong><div class="decision-tags"><span class="reason-chip ${tone}">${icon(ic)}${l}</span><span class="tag source ${m.source === 'tickets' ? 'zendesk' : 'mailbox'}">${icon(m.source === 'tickets' ? 'help' : 'inbox')}${m.source === 'tickets' ? 'Help desk #' + (1040 + Number(m.id.slice(1))) : 'Billing mailbox'}</span><span class="tag">${icon('people')}${esc(m.client)}</span><span class="tag muted-tag">${esc(m.from)}</span><span class="tag">${icon('file')}${m.invoice}</span><span class="tag">${icon('calendar')}${m.at}</span></div></div><div class="decision-acts">${acts}<button type="button" class="icon-act more${open ? ' on' : ''}" data-action="mail-open" data-id="${m.id}" aria-expanded="${open}" aria-label="${open ? 'Hide' : 'Show'} the email from ${esc(m.client)}">${icon('down')}</button></div></div>${detail}</article>`;
}

/* ---------- Records ---------- */
function activityPanel() {
  return panelTitle('A record of who did what', 'Decisions, agent work and the BC send, in one timeline.', rbtn(icon('download') + ' Export', 'download the cycle’s activity log as a file.', 'quiet'))
    + rows(S.audit, a => `<div class="data-row activity-row"><span class="row-icon">${icon(a.owner === 'Demo Reviewer' ? 'people' : 'spark')}</span><span class="record-name"><strong>${esc(a.text)}</strong><small>${esc(a.owner)} · ${when(a.at)}</small></span></div>`);
}
const ruleList = () => { const q = ruleQuery.trim().toLowerCase(); return RULES.filter(r => (ruleCat === 'All' || r.cat === ruleCat) && (!q || (r.id + ' ' + r.title + ' ' + r.text + ' ' + r.cat).toLowerCase().includes(q))); };
function knowledgePanel() {
  return panelTitle('Rules library', 'Demo rules', rbtn(icon('plus') + ' New rule', 'open the rule editor and add a rule to the rule book for approval.', 'quiet'))
    + `<div class="rule-filter">${hubSearch('rule-search', ruleQuery, 'Search rules by ID or words', 'Search rules')}${selectMenu('cat')}</div>`
    + rows(ruleList(), r => `<button type="button" class="data-row rule-row" data-action="rule" data-id="${r.id}"><span class="rule-id">${badge(r.id, 'blue')}</span><span class="record-name"><strong><span class="rule-name-text">${esc(r.title)}</span></strong><small><span class="tag"><i class="ov-dot conf-ruled"></i>Ruled</span><span class="tag">${icon('book')}${esc(r.cat)}</span><span class="tag">${icon('people')}All clients</span></small></span>${icon('chevron')}</button>`);
}
function ruleDialog(id) {
  const r = RULES.find(x => x.id === id);
  openDialog(`${r.id} · ${esc(r.title)}`, `<div class="rule-form"><label class="field">Rule<textarea id="rule-title" rows="2" maxlength="300">${esc(r.title)}</textarea></label><label class="field">How to apply<textarea id="rule-text" rows="4" maxlength="600">${esc(r.text)}</textarea></label><label class="field">Category<select id="rule-cat-field">${[...new Set(RULES.map(x => x.cat))].map(c => `<option ${c === r.cat ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select></label></div>`,
    `${btn('Cancel', 'dismiss', '', 'quiet')}${rbtn('Save changes', 'save a new dated version of this rule in the rule book. The agents use it from their next run.')}`);
}

/* ---------- dialogs and toast ---------- */
function openDialog(t, content, footer = '', wide = false) {
  const dlg = $('#detail'); if (!dlg.open) lastFocus = document.activeElement;
  dlg.className = wide ? 'wide' : '';
  dlg.innerHTML = `<header class="dialog-header"><div><span class="eyebrow">DEMO · ${CYCLE}</span><h2 id="dialog-title">${t}</h2></div><div class="dialog-tools">${btn(icon('close'), 'dismiss', 'aria-label="Close dialog"', 'icon-only')}</div></header><div class="dialog-content">${content}</div>${footer ? `<footer class="dialog-footer">${footer}</footer>` : ''}`;
  dlg.setAttribute('aria-labelledby', 'dialog-title');
  if (!dlg.open) dlg.showModal();
}
function dismiss() { const dlg = $('#detail'); if (dlg.open) dlg.close(); draftEditing = null; draftBuffer = null; if (lastFocus?.isConnected) lastFocus.focus(); }
let toastTimer = 0;
function toast(text) { const t = $('#toast'); clearTimeout(toastTimer); t.textContent = text; t.classList.add('visible'); toastTimer = setTimeout(() => t.classList.remove('visible'), 3200); }
function about() {
  openDialog('One page. A shared understanding.', `<div class="about-grid"><div><b>01</b><h3>Understand the month</h3><p>The overview names the next decision. Four figures explain where the cycle stands.</p></div><div><b>02</b><h3>See the work happen</h3><p>Watch review replays the agents' run: collect, prepare, rule check, investigate and verify. Pause work or turn motion off.</p></div><div><b>03</b><h3>Complete the close</h3><p>Decide the clients in Needs review, run the final checks, send the batch to BC and record the close.</p></div></div>`, `<span class="footer-note">Demo month with made-up clients and amounts.</span>${btn('Got it', 'dismiss')}`, true);
}
function controls() {
  openDialog('A clear line of responsibility.', `<div class="control-grid">${[['Read and investigate', 'Agents'], ['Judge with evidence', 'Investigator + verifier'], ['Decide unresolved cases', 'Person'], ['Approve price-record changes', 'Admin'], ['Start the monthly pull', 'Scheduler · the 2nd'], ['Send ready-to-view emails', 'Scheduler · 9 AM and 3 PM'], ['Send approved drafts to BC', 'Coordinator'], ['Post invoices', 'People in Business Central'], ['Approve new billing rules', 'Billing rules lead']].map(([a, b]) => `<div><strong>${a}</strong><span>${b}</span></div>`).join('')}</div><div class="control-note">${icon('shield')} This demo uses one reviewer to show the role handoffs.</div>`,
    `${btn(S.paused ? 'Resume agents' : 'Pause agents', 'pause', '', 'quiet')}${btn('Done', 'dismiss')}`);
}

/* ---------- search ---------- */
const SEARCH_PAGES = [['overview', 'Overview', 'summary dashboard agents month'], ['schedule', 'Schedule', 'snowflake 2nd start emails'], ['sources', 'Sources', 'data evidence'], ['needs', 'Needs review', 'decisions clients pricing'],
  ['release', 'Final checks', 'checks send bc'], ['bc', 'BC & email', 'business central email invoices'], ['ach', 'ACH', 'bank report'], ['close', 'Close & learn', 'close learning'], ['invoices', 'Drafts', 'register invoices'],
  ['inbox', 'Client emails', 'emails complaints mistake payment question'], ['activity', 'Activity', 'audit log history'], ['knowledge', 'Rules library', 'rules knowledge']];
let searchItems = [], searchIndex = 0;
function searchResults(q) {
  q = q.trim().toLowerCase(); if (!q) return [];
  const score = (t, k = '') => t.toLowerCase().startsWith(q) ? 0 : t.toLowerCase().includes(q) ? 1 : k.includes(q) ? 2 : 9;
  const pages = SEARCH_PAGES.map(([id, label, k]) => ({ kind: 'page', id, label, sub: isStep(id) ? 'Monthly close step' : 'Page', s: score(label, k) })).filter(x => x.s < 9);
  const clients = INVOICES.map(i => ({ kind: 'client', id: i.id, label: i.name, sub: `${i.number} · ${DSTATUS[invStatus(i)][0]}`, s: Math.min(score(i.name), score(i.number)) })).filter(x => x.s < 9);
  return [...pages.sort((a, b) => a.s - b.s).slice(0, 5), ...clients.sort((a, b) => a.s - b.s).slice(0, 6)];
}
function drawSearch() {
  const box = $('#search-results'), input = $('#hub-search'); if (!box) return;
  searchItems = searchResults(input.value); const open = input.value.trim().length > 0; box.hidden = !open; input.setAttribute('aria-expanded', String(open)); if (!open) return;
  if (!searchItems.length) { box.innerHTML = `<p class="search-empty">No pages or clients match “${esc(input.value.trim())}”.</p>`; return; }
  searchIndex = Math.min(searchIndex, searchItems.length - 1); let group = '';
  box.innerHTML = searchItems.map((r, n) => { const head = r.kind !== group ? `<span class="search-group">${r.kind === 'page' ? 'Pages' : 'Clients'}</span>` : ''; group = r.kind;
    return head + `<button type="button" role="option" id="search-opt-${n}" aria-selected="${n === searchIndex}" data-action="search-go" data-kind="${r.kind}" data-id="${r.id}">${r.kind === 'page' ? icon('file') : `<span class="search-avatar">${initials(r.label)}</span>`}<span><strong>${esc(r.label)}</strong><small>${esc(r.sub)}</small></span></button>`; }).join('');
  input.setAttribute('aria-activedescendant', 'search-opt-' + searchIndex);
}
function closeSearch() { const box = $('#search-results'), input = $('#hub-search'); if (box) box.hidden = true; if (input) { input.setAttribute('aria-expanded', 'false'); input.removeAttribute('aria-activedescendant'); } }
function goSearch(kind, id) { closeSearch(); if (kind === 'page') return go(id); go('invoices'); draftView = 'lines'; draftDialog(id); }

/* ---------- render ---------- */
function panel() {
  return { overview: overviewPanel, needs: needsPanel, schedule: schedulePanel, sources: sourcesPanel, release: releasePanel, bc: bcPanel, ach: achPanel, close: closePanel,
    invoices: draftsPanel, inbox: inboxPanel, activity: activityPanel, knowledge: knowledgePanel }[S.tab]();
}
const tabsNav = () => `<nav class="tabs page-tabs" aria-label="Billing pages">${[['overview', 'Overview'], ['needs', 'Monthly close'], ['invoices', 'Drafts'], ['inbox', 'Emails'], ['activity', 'Activity'], ['knowledge', 'Rules']].map(([id, l]) => `<button type="button" data-action="tab" data-tab="${id}" aria-pressed="${id === 'needs' ? isStep(S.tab) : S.tab === id}">${l}</button>`).join('')}</nav>`;
function render() {
  const ov = S.tab === 'overview', b = document.body.dataset;
  b.page = ov ? 'overview' : isStep(S.tab) ? 'steps' : 'section'; b.layout = ov ? S.layout : 'overview'; b.panel = S.tab; b.motion = String(S.motion); b.rail = S.railCollapsed ? 'collapsed' : 'open'; b.drawer = 'closed';
  const footer = `<footer class="dashboard-footer"><span>${icon('shield')} Fictional records · all actions simulated</span><div>${btn(icon(S.motion ? 'pause' : 'play') + (S.motion ? 'Motion on' : 'Motion off'), 'motion', `aria-pressed="${S.motion}"`, 'text')}</div></footer>`;
  $('#app').innerHTML = rail() + `<main id="main" tabindex="-1">${header()}${ov ? `<div id="metric-area">${metrics()}</div><div id="telemetry-area">${telemetry()}</div>` : ''}${tabsNav()}${isStep(S.tab) ? stepTabs() : ''}<section class="detail-panel" id="detail-panel" aria-label="${ov ? 'Cycle summary' : esc(title())}">${panel()}</section>${footer}</main>`;
  scheduleFit();
}
function drawPanel() { const p = $('#detail-panel'); if (p) p.innerHTML = panel(); scheduleFit(); }
let fitQueued = false;
function scheduleFit() {
  if (fitQueued) return; fitQueued = true;
  requestAnimationFrame(() => { fitQueued = false; const el = $('#list-body'); if (!el) return; const fit = Math.max(1, Math.floor(el.clientHeight / 48)); if (fit !== rowsPerPage) { rowsPerPage = fit; const p = $('#detail-panel'); if (p) p.innerHTML = panel(); } });
}
function go(tab) {
  if (!ROUTES.includes(tab)) tab = 'overview';
  if (location.hash !== '#/' + tab) { history.replaceState(null, '', '#/' + tab); }
  setTab(tab);
}
function setTab(tab) {
  S.tab = tab; if (isStep(tab)) S.lastStep = tab;
  const g = NAV.find(n => !Array.isArray(n) && n.kids.some(k => k[0] === tab || (k[0] === 'monthly' && isStep(tab))));
  if (g) S.navOpen[g.group] = true;
  page = 0; query = ''; menuOpen = null; bellOpen = false; render();
}

/* ---------- the "Watch review" replay ---------- */
let jobTimer = 0;
function startJob() {
  if (job || S.paused) return;
  job = { elapsed: 0, duration: 9000, phase: 0, pct: 0, short: 'Collecting source evidence' }; tickJob(); render();
  jobTimer = setInterval(() => {
    if (S.paused) return; job.elapsed += 300;
    if (job.elapsed >= job.duration) { clearInterval(jobTimer); job = null; record('Investigator + verifier', 'Replayed the review: 9 cleared with reasons, 3 handed to a person with evidence.'); render(); return toast('Review complete. Open a decision to inspect the evidence.'); }
    const before = job.phase; tickJob();
    if (S.tab === 'overview') { if (before !== job.phase) { $('#telemetry-area').innerHTML = telemetry(); } else { $('#agent-detail').textContent = JOB_TEXT[job.phase]; $('.run-meter>span').textContent = job.pct + '%'; $('.run-meter i').style.width = job.pct + '%'; } $('#metric-area').innerHTML = metrics(); }
    else { const s = $('#page-sub'); if (s) s.textContent = pageSub(); }
  }, 300);
}
function tickJob() { const e = job.elapsed; job.phase = e < 1200 ? 0 : e < 2400 ? 1 : e < 3600 ? 2 : e < 6000 ? 3 : e < 8000 ? 4 : 5; job.pct = Math.min(100, Math.floor(e / job.duration * 100)); job.short = ['Collecting source evidence', 'Checking the prepared drafts', 'Rule check', 'Investigator at work', 'Verifier at work', 'Preparing your decision queue'][job.phase]; }

/* ---------- events ---------- */
const noteText = id => ($('#ln-note-' + id)?.value || '').trim();
const today = () => new Date().toISOString().slice(0, 10);
function decide(id, choice) {
  const c = card(id), st = S.cards[id], t = noteText(id);
  if (choice === 'agent') { S.edits[id] = AGENT_LINES[id]().map(l => ({ ...l })); S.approved[id] = true; st.status = 'decided'; st.choice = 'agent'; }
  if (choice === 'console') { delete S.edits[id]; S.approved[id] = true; st.status = 'decided'; st.choice = 'console'; }
  if (choice === 'hold') { S.approved[id] = false; st.status = 'held'; st.choice = null; }
  st.notes.push({ at: today(), choice: choice === 'hold' ? 'neither' : choice, text: t || (choice === 'agent' ? "Used the agents' invoice." : choice === 'console' ? "Kept the console's draft." : 'On hold: not in this batch.') });
  record('Demo Reviewer', `${c.client}: ${choice === 'agent' ? "the agents' invoice is on the draft and approved" : choice === 'console' ? "console's draft approved" : 'on hold, out of this batch'}.`);
  S.needsOpen = null; render();
  toast(choice === 'agent' ? `${c.client}: the agents' invoice is on the draft and approved.` : choice === 'console' ? "Console's draft approved." : 'On hold: this client stays out of the batch.');
}
document.addEventListener('click', e => {
  if (e.target.closest('[data-real]')) return;
  if (e.target.closest('.skip-link')) { e.preventDefault(); $('#main')?.focus(); return; }
  const el = e.target.closest('[data-action]');
  if (!e.target.closest('.hub-search')) closeSearch();
  if (bellOpen && !e.target.closest('.bell-wrap')) { bellOpen = false; const s = $('#bell-slot'); if (s) s.innerHTML = bell(); }
  if (!el || el.disabled) return;
  const act = el.dataset.action, id = el.dataset.id;
  if (act === 'bell') { bellOpen = !bellOpen; const s = $('#bell-slot'); s.innerHTML = bell(); (bellOpen ? s.querySelector('.bell-panel .button') : s.querySelector('.bell'))?.focus(); return; }
  if (act === 'dismiss') return dismiss();
  if (act === 'tab') { if ($('#detail').open) dismiss(); return go(el.dataset.tab); }
  if (act === 'layout') { S.layout = el.dataset.layout; return go('overview'); }
  if (act === 'nav-group') { const g = el.dataset.group; S.navOpen[g] = !S.navOpen[g]; render(); return $(`[data-action=nav-group][data-group=${g}]`)?.focus(); }
  if (act === 'toggle-rail') { S.railCollapsed = !S.railCollapsed; render(); return $('[data-action=toggle-rail]')?.focus(); }
  if (act === 'search-go') { $('#hub-search').value = ''; return goSearch(el.dataset.kind, id); }
  if (act === 'page') { page += Number(el.dataset.delta); return drawPanel(); }
  if (act === 'pause') { S.paused = !S.paused; record('Demo Reviewer', S.paused ? 'Paused demo agent work.' : 'Resumed demo agent work.'); if ($('#detail').open) dismiss(); render(); return toast(S.paused ? 'Agents paused. Human review stays available.' : 'Agents resumed.'); }
  if (act === 'motion') { S.motion = !S.motion; return render(); }
  if (act === 'about') return about();
  if (act === 'controls') return controls();
  if (act === 'watch') return startJob();
  if (act === 'card-go') { S.needsOpen = id; go('needs'); return $('#card-' + id)?.scrollIntoView({ block: 'nearest' }); }
  if (act === 'reset') return openDialog('Choose where to begin.', `<div class="issue-summary"><p>Reset this demo to the start of the review. Nothing outside this page changes.</p></div>`, `${btn('Cancel', 'dismiss', '', 'quiet')}${btn('Start at review', 'reset-go')}`);
  if (act === 'reset-go') { clearInterval(jobTimer); job = null; S = fresh(); dismiss(); go('overview'); return toast('Fresh demo ready.'); }
  // Needs review
  if (act === 'needs-open') { S.needsOpen = S.needsOpen === id ? null : id; drawPanel(); return $(`[data-action=needs-open][data-id=${id}]`)?.focus(); }
  if (act === 'needs-agents') return decide(id, 'agent');
  if (act === 'needs-console') return decide(id, 'console');
  if (act === 'needs-hold') return decide(id, 'hold');
  if (act === 'needs-back') { if (!noteText(id)) { toast('Write the note to the agents first.'); return $('#ln-note-' + id)?.focus(); } return mini.note(REAL('send this note back to the agents. They read it on their next run.'), el); }
  if (act === 'needs-refresh') return toast('Refreshed. Nothing new from the agents.');
  if (act === 'agree-approve') { const ids = agreeIds().filter(x => !S.approved[x]); return openDialog('Approve the clients where agents and console agree?', `<div class="receipt-total"><span>${ids.length} invoices · ${agreeIds().length} clients</span><strong>${money(ids.reduce((n, x) => n + totalOf(inv(x)), 0))}</strong></div><div class="issue-summary"><p>Approving does not send anything. Final checks sends the approved drafts to BC.</p></div>`, `${btn('Cancel', 'dismiss', '', 'quiet')}${btn(icon('check') + ' Approve', 'agree-go')}`); }
  if (act === 'agree-go') { agreeIds().forEach(x => { S.approved[x] = true; }); record('Demo Reviewer', 'Approved the clients where agents and console agree.'); dismiss(); render(); return toast('Approved.'); }
  if (act === 'release-check') return toast('Checked again. Nothing changed.');
  // Drafts
  if (act === 'invoice') { draftEditing = null; draftBuffer = null; return draftDialog(id); }
  if (act === 'draft-view') { draftView = el.dataset.view; return draftDialog(selected); }
  if (act === 'draft-review' || act === 'draft-unreview') { S.approved[selected] = act === 'draft-review'; record('Demo Reviewer', `${inv(selected).name} (${inv(selected).number}) ${act === 'draft-review' ? 'marked reviewed, good to batch' : 'unmarked'}.`); drawPanel(); draftDialog(selected); return toast(act === 'draft-review' ? 'Marked reviewed. It would go in the next batch.' : 'Unmarked.'); }
  if (act === 'draft-edit') { draftEditing = selected; draftBuffer = linesOf(inv(selected)).map(l => ({ ...l })); return draftDialog(selected); }
  if (act === 'draft-cancel') { draftEditing = null; draftBuffer = null; return draftDialog(selected); }
  if (act === 'draft-addline') { draftBuffer = readEditLines(); draftBuffer.push({ item: '', description: '', qty: 1, unit_price: 0 }); return draftDialog(selected); }
  if (act === 'draft-delline') { draftBuffer = readEditLines(); draftBuffer.splice(Number(el.dataset.n), 1); return draftDialog(selected); }
  if (act === 'draft-save') { S.edits[selected] = readEditLines().filter(l => l.description || l.item); S.approved[selected] = false; draftEditing = null; draftBuffer = null; record('Demo Reviewer', `${inv(selected).name} lines edited: ${money(totalOf(inv(selected)))}. Review cleared.`); drawPanel(); draftDialog(selected); return toast('Lines saved in this demo. Mark it reviewed again when it looks right.'); }
  if (act === 'draft-reset') { delete S.edits[selected]; drawPanel(); return draftDialog(selected); }
  // Client emails
  if (act === 'mail-open') { S.mailOpen = S.mailOpen === id ? null : id; drawPanel(); return $(`[data-action=mail-open][data-id=${id}]`)?.focus(); }
  if (act === 'mail-refresh') { S.checkedAgo = 0; drawPanel(); return toast('Checked: no new client emails.'); }
  // Records
  if (act === 'rule') return ruleDialog(id);
  // Select menus
  if (act === 'menu-toggle') return menuOpen === el.dataset.menu ? closeMenu() : openMenu(el.dataset.menu);
  if (act === 'menu-pick') return pickMenu(el.dataset.menu, Number(el.dataset.i));
});
document.addEventListener('input', e => {
  const t = e.target;
  if (t.id === 'hub-search') { searchIndex = 0; return drawSearch(); }
  if (t.classList.contains('dr-in')) { const el = $('#dr-edit-total'); if (el) el.textContent = money(lineSum(readEditLines())); return; }
  if (t.id === 'invoice-search' || t.id === 'rule-search') {
    if (t.id === 'invoice-search') query = t.value; else ruleQuery = t.value;
    page = 0; const n = t.selectionStart; drawPanel(); const input = $('#' + t.id); input.focus(); try { input.setSelectionRange(n, n); } catch { /* search inputs */ }
  }
});
document.addEventListener('keydown', e => {
  const t = e.target, k = e.key;
  if ((e.ctrlKey || e.metaKey) && k.toLowerCase() === 'k') { const i = $('#hub-search'); if (i) { e.preventDefault(); i.focus(); i.select(); } return; }
  if (t.dataset?.action === 'menu-toggle' && ['ArrowDown', 'ArrowUp'].includes(k)) { e.preventDefault(); return openMenu(t.dataset.menu); }
  if (menuOpen && t.id === menuOpen + '-list') {
    const last = flatMenu(menuOpen).length - 1;
    if (k === 'ArrowDown') { e.preventDefault(); moveMenu(menuActive >= last ? 0 : menuActive + 1); } else if (k === 'ArrowUp') { e.preventDefault(); moveMenu(menuActive <= 0 ? last : menuActive - 1); }
    else if (k === 'Enter' || k === ' ') { e.preventDefault(); pickMenu(menuOpen, menuActive); } else if (k === 'Escape') { e.preventDefault(); e.stopPropagation(); closeMenu(); } else if (k === 'Tab') closeMenu(false);
    return;
  }
  if (t.id === 'hub-search') {
    if ((k === 'ArrowDown' || k === 'ArrowUp') && searchItems.length) { e.preventDefault(); searchIndex = (searchIndex + (k === 'ArrowDown' ? 1 : -1) + searchItems.length) % searchItems.length; drawSearch(); }
    else if (k === 'Enter') { const r = searchItems[searchIndex]; if (r) { e.preventDefault(); t.value = ''; goSearch(r.kind, r.id); } }
    else if (k === 'Escape') { t.value = ''; closeSearch(); }
    return;
  }
  if (k === 'Escape' && bellOpen) { bellOpen = false; const s = $('#bell-slot'); s.innerHTML = bell(); s.querySelector('.bell').focus(); }
}, true);
document.addEventListener('mousedown', e => { if (menuOpen && !e.target.closest('#' + menuOpen + '-menu')) closeMenu(false); });
document.addEventListener('mouseover', e => { const o = e.target.closest?.('.select-list .menu-option'); if (o && Number(o.dataset.i) !== menuActive) moveMenu(Number(o.dataset.i)); });
addEventListener('resize', () => { if (menuOpen) closeMenu(false); scheduleFit(); });
addEventListener('hashchange', () => { const tab = location.hash.replace(/^#\/?/, ''); if (ROUTES.includes(tab) && tab !== S.tab) setTab(tab); });

/* ---------- start ---------- */
mini({ label: 'Demo, made-up data', ok: 'OK' });
document.body.insertAdjacentHTML('afterbegin', '<a class="skip-link" href="#main">Skip to workspace</a>');
document.body.insertAdjacentHTML('beforeend', '<div id="toast" role="status" aria-live="polite"></div><dialog id="detail"></dialog>');
$('#detail').addEventListener('close', () => { draftEditing = null; draftBuffer = null; });
go(location.hash.replace(/^#\/?/, '') || 'overview');
