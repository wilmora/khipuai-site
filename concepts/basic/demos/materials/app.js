/* Material List miniature: the app's own layout (walnut rail, glass top bar,
   project hero, tabs, Grid Report, Project Questions, Rules Book) redrawn as
   static HTML with the app's own CSS classes and made-up data. State lives in
   memory only. Anything that would upload, build, download, export, save to
   the server or sign out shows a note instead. */
import { mini, esc } from '../mini.js';
import { HOUSES } from './houses.js';
import { USER, FOLDERS, PROJECTS, PQ_GROUPS, PQ_ANSWERS, SECTIONS, ACTIONS, CONFIRM_ROWS, NONE_ROWS, RULES } from './data.js';

mini({ label: 'Demo, made-up data', ok: 'OK' });
const REAL = what => `In the real product this would ${what}`;
const app = document.getElementById('app');

/* ---------- icons: the app's own inline line icons ---------- */
const P = {
  home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9.5 21v-6h5v6"/>',
  folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  help: '<circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  side: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  caret: '<path d="m6 9 6 6 6-6"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  play: '<path d="m9 8 7 4-7 4z"/><circle cx="12" cy="12" r="9.5"/>',
  layers: '<path d="M12 3 3 8l9 5 9-5z"/><path d="M3 13l9 5 9-5"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  list: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  tiles: '<rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/>',
  dots: '<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
  back: '<path d="M15 18l-6-6 6-6"/>',
  funnel: '<path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/>',
  chevR: '<path d="m8 5 7 7-7 7"/>',
  // _pq.html set
  qlist: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 3v2h6V3M9 10h6M9 14h6M9 18h3"/>',
  pencil: '<path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4z"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  checkc: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
  circle: '<circle cx="12" cy="12" r="8.5"/>',
  alert: '<circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 16.5v.01"/>',
  note: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  foundation: '<path d="M3 11 12 4l9 7"/><path d="M5 10v6h14v-6"/><path d="M2 20h20M4 16v4M20 16v4M9.5 16v4M14.5 16v4"/>',
  package: '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
  porch: '<path d="M2 11 12 4l10 7"/><path d="M4 10v10M20 10v10M9 20v-6M15 20v-6M2 20h20M4 14h16"/>',
  ruler: '<path d="M3 17 17 3l4 4L7 21z"/><path d="M7 13l2 2M10 10l2 2M13 7l2 2"/>',
  percent: '<path d="M19 5 5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>',
};
const ico = (n, cls = '') => `<svg viewBox="0 0 24 24" class="ico ${cls}" aria-hidden="true">${P[n]}</svg>`;
const catIco = name => {
  const n = name.toLowerCase();
  if (n.includes('foundation') || n.includes('structure')) return ico('foundation');
  if (n.includes('measure') || n.includes('stock') || n.includes('board')) return ico('ruler');
  if (n.includes('package') || n.includes('option')) return ico('package');
  if (n.includes('porch') || n.includes('deck') || n.includes('attached')) return ico('porch');
  if (n.includes('waste') || n.includes('spare')) return ico('percent');
  if (n.includes('floor') || n.includes('framing') || n.includes('roof')) return ico('layers');
  return ico('dots');
};

/* ---------- state ---------- */
const clone = o => JSON.parse(JSON.stringify(o));
const S = {
  view: 'list', sort: 'newest', bsearch: '', panel: '',
  projects: clone(PROJECTS), answers: clone(PQ_ANSWERS), notes: {}, ctx: {},
  edits: {}, undo: [], cmts: {},
  g: { statusF: 'all', search: '', open: {}, showNA: false, lvlSection: true, lvlSub: true, groupsView: false,
       showF: false, colF: {}, sort: { k: null, dir: 0 }, vals: { qty: true, lf: true, bf: true }, colsMain: true, colsMore: false, colsVals: false, cols: null },
  qv: { type: 'all', sec: '', q: '', by: 'act', showNone: false, state: {}, open: new Set() },
  pq: { search: '', filter: 'all', only: false, open: new Set(['pq-cat-h1']) },
  rb: { search: '', filter: 'all', open: new Set(['pq-cat-h1']), detail: new Set(), editing: new Set() },
  renaming: false,
};
const proj = id => S.projects.find(p => p.id === id) || S.projects[0];

/* ---------- the material list model (grid_model, simplified) ---------- */
const STATUS_OF = { f: 'filled', g: 'guess', q: 'question', m: 'formula', n: 'na' };
let ROWN = 20;
const SECS = SECTIONS.map(sec => ({
  code: sec.code, title: sec.title,
  subs: sec.subs.map(sb => ({ code: sb.code, title: sb.title, rows: sb.rows.map(a => {
    const r = { r: ROWN, cell: 'G' + ROWN, code: '', desc: a[0], qty: a[1] === '' ? '' : a[1], w: a[2], d: a[3], ft: a[4], inch: a[5],
      spec: a[6], unit: a[7], status: STATUS_OF[a[8]], grp: a[9] || '', reason: a[10] || '', kind: 'item', sub: sb.title, sec: sec.code };
    r.editable = true;
    if (r.status === 'question') r.reason = 'No count for this line on the schedule or the quote. ' + ACTIONS.fill;
    ROWN += 1;
    return r;
  }) })),
}));
const ROWS = {};
SECS.forEach(s => s.subs.forEach(b => b.rows.forEach(r => { ROWS[r.r] = r; })));
const num = v => { const n = parseFloat(v); return isNaN(n) ? null : n; };
const qtyOf = r => (S.edits[r.cell] != null ? S.edits[r.cell] : r.qty);
function bfOf(r) {
  const q = num(qtyOf(r)), w = num(r.w), d = num(r.d), ft = num(r.ft);
  if (q == null || w == null || d == null || ft == null || r.unit !== 'PC') return 0;
  return q * w * d * ft / 12;
}
// Which answer takes a section off the plan, and whether it is given.
function settledOf(code, pid = 'sample') {
  for (const g of PQ_GROUPS) for (const q of g.questions) {
    if (q.excl && q.excl[1].includes(code) && S.answers[pid][q.id] === q.excl[0]) return { question: q.text, answer: q.excl[0] };
  }
  return null;
}
function sectionModel() {
  return SECS.map(sec => {
    const st = settledOf(sec.code);
    const all = sec.subs.flatMap(b => b.rows);
    const live = r => !(st && r.status === 'question');
    const settled = st ? { ...st, asks: all.filter(r => r.status === 'question').length,
      kept: all.filter(r => ['filled', 'guess', 'formula'].includes(r.status)).length } : null;
    const subs = sec.subs.map(b => ({ ...b, rows: b.rows.filter(live) }));
    const counts = {};
    subs.forEach(b => b.rows.forEach(r => {
      counts[r.status] = (counts[r.status] || 0) + 1;
      if (S.edits[r.cell] != null) counts.edited = (counts.edited || 0) + 1;
    }));
    return { ...sec, subs, settled, counts };
  });
}
// The questions left for you: one per open question row.
function questionList() {
  const out = [];
  sectionModel().forEach(sec => {
    if (sec.settled) return;
    sec.subs.forEach(b => b.rows.forEach(r => {
      if (r.status !== 'question') return;
      const type = NONE_ROWS.includes(r.desc) ? 'none' : CONFIRM_ROWS.includes(r.desc) ? 'confirm' : 'fill';
      out.push({ cell: r.cell, label: r.cell, field: `${b.title} / ${r.desc}`, type, action: ACTIONS[type],
        sec: sec.title, secno: +sec.code, seclabel: titleCase(sec.title), rowr: r.r,
        why: type === 'confirm' ? 'The schedule and the drawings disagree on this size, so the tool left it for a person.'
          : type === 'none' ? 'The quote carries this as a priced line, so the list does not count it.'
          : 'No document gives a count for this line, and no rule computes one.',
        where: type === 'confirm' ? ['Framing sheet', 'Schedule'] : ['Quote', 'Plan set'],
        full: `${sec.title}: ${b.title}: ${r.desc}. ${type === 'fill' ? 'Enter the quantity, or 0 if this house needs none.' : ACTIONS[type]}` });
    }));
  });
  return out;
}
const titleCase = s => s.toLowerCase().replace(/(^|[\s(/])([a-z])/g, (m, a, b) => a + b.toUpperCase());
function coverage() {
  let filled = 0, asks = 0, flagged = 0, untouched = 0;
  sectionModel().forEach(sec => sec.subs.forEach(b => b.rows.forEach(r => {
    if (r.status === 'filled' || r.status === 'formula') filled += [r.qty, r.w, r.d, r.ft, r.spec].filter(v => v !== '' && v != null).length;
    if (r.status === 'guess') { flagged += 1; filled += 4; }
    if (r.status === 'na') untouched += 1;
  })));
  asks = questionList().filter(q => (S.qv.state[q.cell] || 'open') === 'open').length;
  return { filled, asks, flagged, untouched };
}

/* ---------- project state (project.html projectState) ---------- */
function pqStats(pid) {
  let req = 0, done = 0, opt = 0, optDone = 0, std = 0, cus = 0;
  PQ_GROUPS.forEach(g => g.questions.forEach(q => {
    if (q.custom) cus += 1; else std += 1;
    const v = S.answers[pid][q.id];
    if (q.optional) { opt += 1; if (v) optDone += 1; } else { req += 1; if (v) done += 1; }
  }));
  return { req, done, opt, optDone, std, cus, open: req - done, complete: req === done };
}
function projectState(p) {
  const files = p.files, q = pqStats(p.id), result = p.built, cov = p.built ? coverage() : {};
  const st = { files, questions: q, result, cov };
  const base = `#/project/${p.id}`;
  if (!files.length) Object.assign(st, { tone: 'wait', badge: 'Getting started', label: 'Add the source documents',
    detail: 'Start with the drawing set, quote, and schedule export.', action: base + '/documents', cta: 'Add the documents', state: 'waiting' });
  else if (!q.complete) Object.assign(st, { tone: 'ask', badge: 'Questions open', label: `Answer ${q.open} project question${q.open === 1 ? '' : 's'}`,
    detail: 'These choices decide which parts of the material list apply to this house.', action: base + '/questions', cta: 'Answer the project questions', state: 'attention' });
  else if (result) Object.assign(st, { tone: cov.asks ? 'ask' : 'ok', badge: cov.asks ? 'Ready for review' : 'Complete',
    label: cov.asks ? `Review ${cov.asks} open item${cov.asks === 1 ? '' : 's'}` : 'Review the completed material list',
    detail: cov.asks ? 'Start in Grid Review, then work through the items that still need a decision.' : 'The build is ready to open in Grid Review.',
    action: base + '/grid', cta: 'Open Grid Review', state: cov.asks ? 'attention' : 'ready' });
  else Object.assign(st, { tone: 'ok', badge: 'Ready to build', label: 'Build the material list',
    detail: 'The source documents and project choices are ready.', action: base + '/build', cta: 'Go to the build', state: 'ready' });
  return st;
}
function cardState(p) {
  if (p.built) return ['ok', 'Ready', 'The material list is built and ready to download'];
  if (p.files.length) return ['warn', 'Pending', 'Documents are in. Nothing has been built from them yet'];
  return ['idle', 'Empty', 'No documents have been uploaded to this project yet'];
}

/* ---------- shell (base.html) ---------- */
const NAV = [
  ['home', 'Home', 'home', ['home']],
  ['projects', 'Projects', 'folder', ['projects', 'project', 'grid']],
  ['questions', 'Project Questions', 'help', ['questions']],
  ['rules', 'Rules Book', 'book', ['rules']],
];
function shell(route, crumb, content, topExtra = '') {
  const item = ([to, label, icon, on]) => `<a href="#/${to}" data-label="${label}" class="nav-item ${on.includes(route) ? 'on' : ''}"${on.includes(route) ? ' aria-current="page"' : ''}>${ico(icon)}<span>${label}</span></a>`;
  const min = document.documentElement.classList.contains('side-min');
  return `<div class="app">
  <aside class="side" id="side" aria-label="Main navigation">
    <a class="brand mini-brand" href="#/home" aria-label="Material List, home">
      <span class="brand-text"><span class="brand-co">Material</span><span class="brand-sub">List</span><span class="brand-prod">Demo</span></span>
    </a>
    <nav class="nav">
      <div class="nav-label">Work</div>
      ${NAV.map(item).join('')}
      <a href="#" data-label="Help" class="nav-item" data-real="${esc(REAL('open the illustrated help book, with a short video for every page.'))}">${ico('help')}<span>Help</span></a>
      <div class="nav-label">Admin</div>
      <a href="#" data-label="Settings" class="nav-item" data-real="${esc(REAL('open Settings: your account, the people who can sign in, and email notifications.'))}">${ico('gear')}<span>Settings</span></a>
    </nav>
    <div class="side-foot">
      <img class="foot-art" src="rail-ridge.png" alt="" aria-hidden="true" width="440" height="449" decoding="async">
      <span class="foot-credit">Built by <span class="klogo">KHIPU<span>AI</span></span></span>
    </div>
  </aside>
  <div class="main">
    <header class="topbar">
      <button type="button" class="sidebtn" id="sidebtn" aria-label="Collapse or expand the sidebar" aria-expanded="${!min}" title="${min ? 'Expand the sidebar' : 'Collapse the sidebar'}">${ico('side')}</button>
      <span class="crumb">${crumb}</span>
      <div class="grow"></div>
      ${topExtra}
      <button type="button" class="themebtn" id="themebtn" aria-label="Switch between clear and dark">${ico('moon', 'ico-moon')}${ico('sun', 'ico-sun')}</button>
      <div class="usermenu">
        <button type="button" class="userchip local" data-real="${esc(REAL('open your account panel and the two environments.'))}" aria-label="${USER.name}, local copy. Open account.">
          <span class="avatar" aria-hidden="true">${USER.initial}</span>
          <span class="uwrap"><span class="uname">${USER.name}</span><span class="urole"><span class="dot grey"></span>Local</span></span>
          ${ico('caret', 'caret')}
        </button>
        <button type="button" class="btn ghost small" data-real="${esc(REAL('sign you out.'))}">Sign out</button>
      </div>
    </header>
    <main class="page" id="page">${content}</main>
  </div>
</div>`;
}

/* ---------- project cards (_projcard.html) ---------- */
const DOCSLOTS = [['schedule', 'Excel'], ['schedule-pdf', 'PDF'], ['quote', 'Quote'], ['drawings', 'Plans']];
function projcard(p) {
  const [k, label, help] = cardState(p);
  const asks = p.built ? coverage().asks : null;
  const lines = p.built ? SECS.reduce((t, s) => t + s.subs.reduce((u, b) => u + b.rows.length, 0), 0) : null;
  const has = slot => p.files.some(f => f.kind === slot || (f.kind === 'pdf' && f.role === slot));
  return `<div class="projcard" data-name="${esc(p.name.toLowerCase())}" data-state="${k}">
    <div class="projplate illo-${p.pal}${p.files.length ? '' : ' illo-new'}" aria-hidden="true">
      <svg viewBox="0 0 480 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false" role="none"><use href="#${p.illo}"></use></svg></div>
    <div class="projtop"><span class="statusdot ${k}" aria-hidden="true"></span><span class="statustx ${k}" title="${esc(help)}">${label}</span>
      <div class="projmenu"><button type="button" class="menubtn" aria-label="Folder for ${esc(p.name)}" data-real="${esc(REAL('let you move this project to another folder.'))}">${ico('dots')}</button></div></div>
    <div class="projhead"><a class="projlink" href="#/project/${p.id}">${esc(p.name)}</a></div>
    <div class="projdocs">${DOCSLOTS.map(([slot, l]) => has(slot)
      ? `<button type="button" class="doctag" data-real="${esc(REAL('open this document in a preview pane beside the board.'))}">${l}</button>`
      : `<span class="doctag off" aria-disabled="true" title="This project has no ${l} document">${l}</span>`).join('')}</div>
    <div class="projasks projnum">${asks != null ? `<span class="num ${asks >= 150 ? 'hot' : ''}" title="${asks} questions left to answer on this list">${asks}</span>` : '<span class="num na" title="Nothing built yet, so there are no questions">-</span>'}</div>
    <div class="projlines projnum">${lines != null ? `<span class="num" title="${lines} lines on the material list">${lines}</span>` : '<span class="num na" title="Nothing built yet">-</span>'}</div>
    <div class="projmeta"><span class="pm-owner">${esc(p.owner)}</span><span class="pm-sep">&middot;</span><span class="pm-files">${p.files.length} file${p.files.length === 1 ? '' : 's'}</span><span class="pm-sep">&middot;</span><span class="pm-when">${p.touched}</span></div>
  </div>`;
}

/* ---------- Home (dashboard.html) ---------- */
function home() {
  const ps = S.projects, ready = ps.filter(p => p.built), waiting = ps.filter(p => !p.built && p.files.length);
  const asks = ready.reduce(() => coverage().asks, 0), flagged = ready.length ? coverage().flagged : 0;
  const recent = ps.slice().sort((a, b) => b.touched.localeCompare(a.touched));
  return HOUSES + `<section class="hero">
  <div class="hero-copy">
    <span class="eyebrow">Welcome back, ${USER.name}</span>
    <h1>Turn plans into accurate material lists.</h1>
    <p>Upload the schedule, the quote and the drawings. Material List reads them, fills the workbook, and carries every figure back to the document it came from.</p>
    <div class="hero-actions">
      <a class="btn primary" href="#/projects?new=1">${ico('plus')}Start a material list</a>
      <a class="btn ghost" href="#" data-real="${esc(REAL('open the help book and its short how-it-works videos.'))}">${ico('play')}How it works</a>
    </div>
  </div>
  <div class="hero-art" aria-hidden="true"><img src="hero-cabin.jpg" alt="" width="1400" height="871" decoding="async"></div>
</section>
<div class="statrow">
  <a class="stat" href="#/projects"><span class="stat-n">${ps.length}</span><span class="stat-l">Projects</span><span class="stat-s">${FOLDERS.length} folders</span></a>
  <a class="stat ok" href="#/projects"><span class="stat-n">${ready.length}</span><span class="stat-l">Lists built</span><span class="stat-s">${waiting.length ? waiting.length + ' waiting to build' : 'nothing in the queue'}</span></a>
  <a class="stat warn" href="#/projects"><span class="stat-n">${asks}</span><span class="stat-l">Questions waiting</span><span class="stat-s">across ${ready.length} built list${ready.length === 1 ? '' : 's'}</span></a>
  <a class="stat" href="#/projects"><span class="stat-n">${flagged}</span><span class="stat-l">Lines flagged</span><span class="stat-s">no failed builds</span></a>
</div>
<nav class="quickrow" aria-label="Quick actions">
  <a class="qcard" href="#/projects">${ico('folder')}<b>Projects</b><span>Every house, filed by folder</span></a>
  <a class="qcard" href="#/questions">${ico('help')}<b>Project Questions</b><span>Answer before a build runs</span></a>
  <a class="qcard" href="#/rules">${ico('book')}<b>Rules Book</b><span>The rule behind each quantity</span></a>
  <a class="qcard" href="#" data-real="${esc(REAL('open the help book.'))}">${ico('layers')}<b>Help</b><span>How Material List works</span></a>
  <a class="qcard" href="#" data-real="${esc(REAL('open Settings: people and preferences.'))}">${ico('gear')}<b>Settings</b><span>People and preferences</span></a>
</nav>
<div class="dashcols">
  <section class="dashmain">
    <div class="dashhead"><h2>Recent projects</h2><a class="seeall" href="#/projects">All projects ${ico('arrow')}</a></div>
    <div class="projgrid viewgrid">${recent.slice(0, 6).map(projcard).join('')}</div>
  </section>
  <aside class="dashside">
    <div class="dashhead"><h2>Needs a look</h2></div>
    ${waiting.length ? `<ul class="attnlist">${waiting.map(p => `<li class="attn warn"><a href="#/project/${p.id}">${esc(p.name)}</a><span>${p.files.length} document${p.files.length === 1 ? '' : 's'} in, nothing built yet</span></li>`).join('')}</ul>`
      : '<p class="attn-none">Nothing is waiting. Every project with documents has a built list, and no build has failed.</p>'}
    <div class="dashhead mt"><h2>Most questions</h2></div>
    ${asks ? `<ul class="asklist">${ready.map(p => `<li><a href="#/project/${p.id}/grid">${esc(p.name)}</a><span class="askn">${asks}</span></li>`).join('')}</ul>
    <p class="asknote">A question is a cell Material List would not fill from the documents. Open the Grid Report to answer them in place.</p>` : '<p class="attn-none">No built list has questions outstanding.</p>'}
  </aside>
</div>`;
}

/* ---------- Projects board (home.html) ---------- */
const SORTS = [['newest', 'Newest first'], ['status', 'Readiness'], ['questions', 'Most questions'], ['touched', 'Last activity'], ['name', 'Name'], ['lines', 'Longest list']];
function sortProjects(list) {
  const rank = p => (p.built ? 0 : p.files.length ? 1 : 2);
  const by = {
    newest: (a, b) => b.created.localeCompare(a.created), touched: (a, b) => b.touched.localeCompare(a.touched),
    name: (a, b) => a.name.localeCompare(b.name), status: (a, b) => rank(a) - rank(b),
    questions: (a, b) => (b.built ? 1 : 0) - (a.built ? 1 : 0), lines: (a, b) => (b.built ? 1 : 0) - (a.built ? 1 : 0),
  }[S.sort];
  return list.slice().sort(by);
}
function board() {
  const ps = S.projects, nready = ps.filter(p => p.built).length;
  const colhead = `<div class="projhead-row" role="row"><span class="ch ch-status">Status</span>
    <button type="button" class="ch ch-name sortcol" data-bsort="name">Project<span class="caret"></span></button>
    <span class="ch ch-docs">Documents</span>
    <button type="button" class="ch ch-asks sortcol" data-bsort="questions" title="Questions still to answer on the built list">Questions<span class="caret"></span></button>
    <button type="button" class="ch ch-lines sortcol" data-bsort="lines" title="Lines on the built material list">Lines<span class="caret"></span></button>
    <span class="ch ch-owner">Owner</span><span class="ch ch-files">Files</span>
    <button type="button" class="ch ch-when sortcol" data-bsort="touched">Updated<span class="caret"></span></button><span class="ch ch-menu"></span></div>`;
  const groups = FOLDERS.map(f => [f, ps.filter(p => p.folder === f.id)]);
  const unfiled = ps.filter(p => !FOLDERS.some(f => f.id === p.folder));
  const sec = (f, members) => {
    const fr = members.filter(p => p.built).length;
    return `<div class="foldersec" data-folder="${f ? f.id : ''}"><div class="folderhead">${ico('folder')}<h2>${f ? esc(f.name) : 'Unfiled'}</h2>
      <span class="foldercount">${members.length}</span>${members.length ? `<span class="foldersum">${fr} ready &middot; ${members.length - fr} in progress</span>` : ''}
      ${f ? `<div class="folderdel"><button class="btn ghost small" type="button" title="Remove folder (projects are kept)" data-real="${esc(REAL('remove the folder. Its projects are kept and become unfiled.'))}">Remove</button></div>` : ''}</div>
      ${members.length ? `<div class="projgrid">${colhead}${sortProjects(members).map(projcard).join('')}</div>`
        : `<div class="empty small">${f ? 'Nothing in this folder yet. Use the folder menu on a project card to move one in.' : 'Every project is filed.'}</div>`}</div>`;
  };
  return HOUSES + `<div class="boardsplit" id="boardsplit"><div class="boardmain" id="boardmain">
  <div class="pagehead"><h1>Projects</h1>
    <p class="muted">One project per house. Create it, name it, drop in the documents, and download the filled Material List. Folders keep the board organized, with test runs in one place and real houses in another.</p></div>
  <div class="boardbar">
    <div class="boardstats"><span class="bstat"><b>${ps.length}</b> projects</span><span class="bstat ok"><span class="statusdot ok"></span>${nready} ready</span><span class="bstat"><span class="statusdot idle"></span>${ps.length - nready} in progress</span></div>
    <div class="boardactions">
      <div class="viewtoggle" role="group" aria-label="Board view">
        <button type="button" id="view-list" class="vt ${S.view === 'list' ? 'on' : ''}" aria-pressed="${S.view === 'list'}" title="List view">${ico('list')}List</button>
        <button type="button" id="view-grid" class="vt ${S.view === 'list' ? '' : 'on'}" aria-pressed="${S.view !== 'list'}" title="Tile view">${ico('tiles')}Tiles</button>
      </div>
      <label class="sortby"><span>Sort</span><select id="board-sort" aria-label="Sort the projects in every folder">${SORTS.map(([v, l]) => `<option value="${v}"${S.sort === v ? ' selected' : ''}>${l}</option>`).join('')}</select></label>
      <button type="button" class="btn soft small" data-panel="panel-folder" aria-expanded="${S.panel === 'panel-folder'}">${ico('folder')}New folder</button>
      <button type="button" class="btn primary small" data-panel="panel-project" aria-expanded="${S.panel === 'panel-project'}">${ico('plus')}New project</button>
    </div>
  </div>
  <form class="newpanel card" id="panel-project"${S.panel === 'panel-project' ? '' : ' hidden'}>
    <input name="name" placeholder="New project name, for example the customer or the plan" maxlength="80" aria-label="New project name">
    <select name="folder" aria-label="Folder for the new project"><option value="">No folder</option>${FOLDERS.map(f => `<option value="${f.id}">${esc(f.name)}</option>`).join('')}</select>
    <button class="btn primary" type="button" data-real="${esc(REAL('create the project and open it, ready for its documents.'))}">Create project</button>
  </form>
  <form class="newpanel card" id="panel-folder"${S.panel === 'panel-folder' ? '' : ' hidden'}>
    <input name="name" placeholder="New folder, for example Internal tests or 2026 builds" maxlength="60" aria-label="New folder name">
    <input name="client" placeholder="Client (optional)" maxlength="60" aria-label="Client (optional)">
    <button class="btn soft" type="button" data-real="${esc(REAL('create the folder on the board.'))}">Create folder</button>
  </form>
  <div id="board" class="${S.view === 'list' ? 'viewlist' : 'viewgrid'}">${groups.map(([f, m]) => sec(f, m)).join('')}${sec(null, unfiled)}
    <div class="empty" id="nohits" style="display:none">No projects match that search.</div></div>
</div></div>`;
}
const boardSearch = `<div class="search">${ico('search')}<input id="q" type="search" placeholder="Search projects" autocomplete="off" aria-label="Search projects" value="${esc(S.bsearch)}"></div>`;
function applyBoardSearch() {
  const t = S.bsearch.trim().toLowerCase();
  let shown = 0;
  document.querySelectorAll('#board .projcard').forEach(c => { const ok = !t || c.dataset.name.includes(t); c.style.display = ok ? '' : 'none'; if (ok) shown += 1; });
  const nh = document.getElementById('nohits'); if (nh) nh.style.display = shown ? 'none' : '';
}

/* ---------- Project page (project.html) ---------- */
const TABS = [['overview', 'Overview', ''], ['documents', 'Documents', '/documents'], ['build', 'Build', '/build'], ['results', 'Review results', '/results'], ['settings', 'Project settings', '/settings']];
const KIND = { schedule: 'Excel schedule', quote: 'Quote', pdf: 'PDF', book: 'Your finished list' };
const fmtSize = n => (n > 1048576 ? (n / 1048576).toFixed(1) + ' MB' : n > 1024 ? Math.round(n / 1024) + ' KB' : n + ' B');
function hero(p, st) {
  const bits = [`<span class="hero-badge ${st.tone}">${esc(st.badge)}</span>`];
  const fact = (v, l) => bits.push(`<span class="hero-fact"><b>${esc(String(v))}</b> ${esc(l)}</span>`);
  fact(st.files.length, st.files.length === 1 ? 'document' : 'documents');
  if (st.questions.complete) fact('All', 'questions answered'); else fact(st.questions.open, 'questions open');
  if (st.result) { fact(st.cov.filled, 'cells filled'); if (st.cov.asks) fact(st.cov.asks, 'left to answer'); fact(p.template, 'template'); }
  return `<header class="project-hero" id="overview"><div class="hero-body">
    <div class="crumb"><a href="#/projects">Projects</a> / ${esc(p.name)}</div>
    <div class="namerow" id="namerow"${S.renaming ? ' style="display:none"' : ''}><h1>${esc(p.name)}</h1><button type="button" class="btn ghost small" id="renamebtn">Rename</button></div>
    <form class="renameform" id="renameform"${S.renaming ? '' : ' style="display:none"'}>
      <input name="name" maxlength="80" value="${esc(p.name)}" aria-label="New project name" id="renamein">
      <button class="btn primary small" type="button" id="renamesave">Save name</button>
      <button class="btn ghost small" type="button" id="renamecancel">Cancel</button></form>
    <p class="hero-sub">One house, its documents, and the Material List built from them. Started ${p.created} by ${esc(p.owner.toLowerCase())}.</p>
    <div class="hero-facts" id="hero-facts">${bits.join('')}</div>
    <div class="hero-actions" id="hero-actions"><a class="btn primary" href="${st.action}">${esc(st.cta)}</a>${st.result
      ? `<button type="button" class="btn soft" data-real="${esc(REAL('download the filled workbook (.xlsm), formulas and macros untouched.'))}">Download the workbook</button>` : ''}</div>
  </div><img class="hero-art" src="hero-cabin.jpg" alt="" width="1400" height="871" decoding="async"></header>`;
}
function tile(n, label, cls, sub = '', act = '') {
  const tag = act ? 'button' : 'div';
  return `<${tag} class="stat ${cls}${act ? ' act' : ''}"${act ? ` type="button" data-act="${act}"` : ''}><div class="n">${n}</div><div class="l">${label}</div>${sub ? `<div class="sub">${sub}</div>` : ''}${act ? '<span class="go" aria-hidden="true">&rarr;</span>' : ''}</${tag}>`;
}
function projectPage(p, tab) {
  const st = projectState(p), base = `#/project/${p.id}`;
  let body = '';
  if (tab === 'overview') {
    const flow = [['Documents', 'Source files', st.files.length ? 'done' : 'active'],
      ['Questions', 'Project choices', st.questions.complete ? 'done' : st.files.length ? 'active' : ''],
      ['Material list', 'Build and review', st.result ? 'done' : st.questions.complete && st.files.length ? 'active' : '']];
    body = `<section class="card project-section" aria-labelledby="nextstep-title">
      <div class="section-head"><div><span class="eyebrow">Where this stands</span><h2 id="nextstep-title">What to do next</h2>
        <p class="muted">The next thing this house needs, and the stage it is at.</p></div></div>
      <div id="project-summary" class="project-summary"><div class="next-action ${st.state}"><div><span class="action-kicker">Recommended next step</span>
        <strong>${esc(st.label)}</strong><p>${esc(st.detail)}</p></div><a class="btn primary" href="${st.action}">Continue</a></div></div>
      <ol class="project-flow" aria-label="Material list workflow">${flow.map(([b, s, c], i) => `<li class="${c}"><span>${i + 1}</span><div><b>${b}</b><small>${s}</small></div></li>`).join('')}</ol>
    </section>`;
  }
  if (tab === 'documents') {
    body = `<section class="card project-section" id="documents" aria-labelledby="documents-title">
      <div class="section-head"><div><span class="eyebrow">Project intake</span><h2 id="documents-title">Source documents</h2>
        <p class="muted">Files used to understand this house and build its material list.</p></div></div>
      <button type="button" id="dzshow" class="dzshow"${st.files.length ? '' : ' hidden'}>${ico('plus')}Add or replace a document</button>
      <div id="dropzone" class="dropzone"${st.files.length ? ' hidden' : ''}><div class="dz-icon">&#8682;</div>
        <div class="dz-text"><b>Drop files here</b> or <button type="button" class="dz-browse" data-real="${esc(REAL('open your file picker and upload the schedule, the quote or the drawing PDFs, then read each one.'))}">browse</button></div>
        <div class="dz-hint">The schedule export, the quote, and the drawing PDFs. Add a finished list of your own and the Grid Report will compare the two line by line.</div></div>
      <ul id="filelist" class="filelist">${st.files.map(f => `<li class="file ready"><div class="file-main"><span class="file-kind">${KIND[f.kind] || 'File'}</span>
        <span class="file-name">${esc(f.name)}</span><span class="file-size">${fmtSize(f.size)}</span><span class="check">&#10003;</span>
        <button type="button" class="file-rn" aria-label="Rename ${esc(f.name)}" title="Rename this file" data-real="${esc(REAL('rename the stored file.'))}">&#9998;</button>
        <button type="button" class="file-rm" aria-label="Remove ${esc(f.name)}" title="Remove this file from the project" data-real="${esc(REAL('remove this file from the project.'))}">&#10005;</button></div>
        ${f.note ? `<div class="file-note">${esc(f.note)}</div>` : ''}</li>`).join('')}</ul>
    </section>${st.files.length && !st.questions.complete ? `<div id="qprompt" class="qprompt"><div><span class="eyebrow">Before the next build</span>
      <b>Answer the project questions before building.</b> <span>${st.questions.open === 1 ? 'One is still unanswered.' : st.questions.open + ' are still unanswered.'}</span>
      They decide which sections of the list apply to this house.</div><a class="btn primary" href="${base}/questions">Open Project Questions</a></div>` : ''}`;
  }
  if (tab === 'build') {
    const q = st.questions, cov = st.cov || {};
    const step = (name, state, mark, note) => `<li class="bw-step ${state}"><span class="bw-mark" aria-hidden="true">${mark}</span><span class="bw-name">${esc(name)}</span><span class="bw-note">${esc(note)}</span></li>`;
    const n = st.files.length;
    const flow = (n ? step('Documents', 'done', '&#10003;', n + ' uploaded') : step('Documents', 'todo', '1', 'None yet')) +
      (q.complete ? step('Project questions', 'done', '&#10003;', 'All answered') : q.done ? step('Project questions', 'attention', '!', q.open + ' remaining') : step('Project questions', 'todo', '2', 'Not started')) +
      (st.result ? step('Material list', 'done', '&#10003;', cov.filled.toLocaleString() + ' cells filled') : step('Material list', 'todo', '3', 'Not built')) +
      (!st.result ? step('Review', 'todo', '4', 'After the build') : cov.asks ? step('Review', 'attention', '!', cov.asks + ' items to review') : step('Review', 'done', '&#10003;', 'Nothing open'));
    const CHIP = { ask: 'warn', attention: 'warn', bad: 'bad', busy: 'busy', ok: 'ok', ready: 'ok', wait: '' };
    const buildReal = esc(REAL('start the build: read the documents, apply the rules and your answers, and fill the workbook. It takes a few minutes.'));
    const dl = `<button type="button" class="btn soft small" data-real="${esc(REAL('download the filled workbook (.xlsm).'))}">Download the workbook</button>`;
    let acts;
    if (!n) acts = `<button class="btn primary" type="button" disabled>Build material list</button><a class="btn soft small" href="${base}/questions">Project questions</a>`;
    else if (!q.complete) acts = `<a class="btn primary" href="${base}/questions">Answer project questions</a><button class="btn soft small" type="button" disabled title="Answer the project questions before building.">Build material list</button>`;
    else if (st.result) acts = `<a class="btn primary" href="${base}/grid">Open Grid Review</a>${dl}<a class="btn soft small" href="${base}/questions">Project questions</a>
      <button type="button" class="btn soft small" data-real="${esc(REAL('show the drawing set and the 3D model of this house.'))}">See the 3D model</button><button class="btn soft small" type="button" data-real="${buildReal}">Rebuild the list</button>`;
    else acts = `<button class="btn primary" type="button" data-real="${buildReal}">Build material list</button><a class="btn soft small" href="${base}/questions">Project questions</a>`;
    body = `<section class="card buildspace" id="workflow" aria-labelledby="buildspace-title">
      <header class="bw-head"><div><span class="eyebrow">Build</span><h2 id="buildspace-title">Material list workspace</h2>
        <p class="muted">Your project documents and decisions are used to create a review-ready material list.</p></div></header>
      <ol class="bw-flow" id="bw-flow" aria-label="Material list workflow">${flow}</ol>
      <div class="bw-lead ${st.tone}" id="bw-lead"><div class="bw-lead-body"><b>${esc(st.label)}</b><p>${esc(st.detail)}</p></div><span class="chip ${CHIP[st.tone]}">${esc(st.badge)}</span></div>
      <div class="bw-actions" id="bw-actions">${acts}
        <details class="actionmenu"><summary class="btn soft small">More actions</summary><div class="actionmenu-pop">
          <button class="menuaction" type="button" data-real="${esc(REAL('copy this project and all its documents as the next revision. The original stays as it is.'))}">Create a new revision</button></div></details></div>
    </section>`;
  }
  if (tab === 'results') {
    if (!st.result) body = '<div class="empty review-empty"><b>No material list yet.</b><br>Complete the project questions, then build the list to start its review.</div>';
    else {
      const c = st.cov, lines = SECS.reduce((t, s) => t + s.subs.reduce((u, b) => u + b.rows.length, 0), 0);
      body = qvSection() + `<div id="results"><section class="card resultcard" aria-labelledby="result-title">
        <div class="result-head"><div><span class="eyebrow">Build complete</span><h2 id="result-title">Material list ready</h2></div>
        <div class="result-actions"><a class="btn primary" href="${base}/grid">Open Grid Review</a>
          <details class="actionmenu"><summary class="btn soft">Export &amp; tools</summary><div class="actionmenu-pop">
            <button type="button" class="menuaction" data-real="${esc(REAL('download the filled workbook (.xlsm).'))}">Download the filled workbook (.xlsm)</button>
            <button type="button" class="menuaction" data-real="${esc(REAL('compare this build with an earlier revision, line by line.'))}">Compare revisions</button>
            <button type="button" class="menuaction" data-real="${esc(REAL('download the review list (.docx) with every open question.'))}">Download the review list (.docx)</button></div></details></div></div>
        <p class="muted">Your own template ${p.template}. Customer Info and Material List tabs answered, formulas and macros untouched. ${lines} draft lines across ${SECS.length} groups.</p>
        <div class="stats">${tile(c.filled, 'cells filled', 'ok')}${tile(c.flagged, 'best-guess lines (yellow)', 'warn')}${tile(c.asks, 'questions left for you', 'ask', '', 'asks')}${tile(c.untouched, 'left untouched on purpose', '')}</div>
      </section></div>`;
    }
  }
  if (tab === 'settings') {
    body = `<div class="dangerzone" id="project-admin"><h2>Delete this project</h2>
      <p class="muted">Removes the project, its uploaded documents and its built Material List. This cannot be undone and nothing is kept.</p>
      <button class="btn danger" type="button" data-real="${esc(REAL('delete the project, its documents and its built list, after you confirm.'))}">Delete project</button></div>`;
  }
  const rail = tab === 'overview' ? `<aside class="project-rail" aria-label="Project history"><section class="card railcard" aria-labelledby="activity-title">
    <span class="eyebrow">History</span><h2 id="activity-title">Recent activity</h2>
    <ol class="activitylist">${p.activity.map(a => `<li><b>${esc(a.what)}</b>${a.detail ? `<span class="act-detail">${esc(a.detail)}</span>` : ''}<span class="act-when">${a.when} &middot; ${esc(a.who)}</span></li>`).join('')}</ol></section></aside>` : '';
  return hero(p, st) + `<nav class="project-nav" aria-label="Project sections">${TABS.map(([k, l, s]) => `<a href="${base}${s || '/overview'}"${k === tab ? ' class="on" aria-current="page"' : ''}>${l}</a>`).join('')}</nav>
  <div class="project-layout${tab !== 'overview' ? ' solo' : ''}"><div class="project-main">${body}</div>${rail}</div>`;
}

/* ---------- Review results: questions left for you (_questions.html) ---------- */
function qvSection() {
  const qs = questionList();
  const stOf = q => S.qv.state[q.cell] || 'open';
  const summ = { fill: 0, confirm: 0, none: 0, done: 0 };
  qs.forEach(q => { if (stOf(q) !== 'open') summ.done += 1; else summ[q.type] += 1; });
  const secs = [];
  qs.forEach(q => { if (!secs.some(s => s.key === q.sec)) secs.push({ key: q.sec, label: q.seclabel, no: q.secno, n: qs.filter(x => x.sec === q.sec).length }); });
  secs.sort((a, b) => a.no - b.no);
  const T = (f, n, l) => `<button type="button" class="qv-tile${S.qv.type === f ? ' on' : ''}${f === 'done' ? ' qv-tile-done' : ''}" data-f="${f}" aria-pressed="${S.qv.type === f}"><b>${n}</b><span>${l}</span></button>`;
  return `<section class="qv" id="qv">
  <header class="qv-head"><h3>Questions left for you <span class="cnt">${qs.length}</span></h3>
    <a class="qv-old" href="#" data-real="${esc(REAL('switch to the older, single list view of the questions.'))}">Old view</a></header>
  <div class="qv-strip" role="group" aria-label="Filter by what the question needs">${T('all', qs.length, 'all')}${T('fill', summ.fill, 'to fill')}${T('confirm', summ.confirm, 'to confirm')}${T('none', summ.none, 'no action')}${T('done', summ.done, 'done')}</div>
  <div class="qv-bar gb-strip">
    <div class="search qv-search">${ico('search')}<input id="qv-q" placeholder="Search the questions" autocomplete="off" aria-label="Search by label, action or cell" value="${esc(S.qv.q)}"></div>
    <div class="gb-menu"><button class="gb-alt gb-drop${S.qv.sec ? ' set' : ''}" id="qv-sec-btn" type="button" aria-haspopup="true" aria-expanded="false" aria-controls="qv-pop-sec" title="Show one section of the workbook at a time"><span id="qv-sec-lbl">${S.qv.sec ? esc(titleCase(S.qv.sec)) : 'All sections'}</span> <span class="car">&#9662;</span></button>
      <div class="gb-pop" id="qv-pop-sec" hidden role="dialog" aria-label="Section"><div class="gb-pop-body"><div class="rail-h">Section</div>
        <div class="rail-pane rail-n" id="qv-sec-pane"><label><input type="radio" name="qvsec" value=""${S.qv.sec ? '' : ' checked'}> <span>All sections</span> <span class="n">${qs.length}</span></label>
        ${secs.map(s => `<label title="${esc(s.key)}"><input type="radio" name="qvsec" value="${esc(s.key)}"${S.qv.sec === s.key ? ' checked' : ''}> <span>${esc(s.label)}</span> <span class="n">${s.n}</span></label>`).join('')}</div></div>
        <div class="gb-pop-foot"><div class="foot-count">${secs.length} sections</div><div class="foot-actions"><button type="button" class="rail-link" id="qv-sec-reset"${S.qv.sec ? '' : ' hidden'}>Show all</button></div></div></div></div>
    <div class="gb-menu"><button class="gb-alt gb-drop" id="qv-by-btn" type="button" aria-haspopup="true" aria-expanded="false" aria-controls="qv-pop-by" title="How the list is batched"><span id="qv-by-lbl">Group by: ${S.qv.by === 'act' ? 'Action' : 'Section'}</span><span class="car">&#9662;</span></button>
      <div class="gb-pop" id="qv-pop-by" hidden role="dialog" aria-label="Group by"><div class="gb-pop-body"><div class="rail-h">Grouped by</div><div class="rail-pane" id="qv-by-pane">
        <label><input type="radio" name="qvby" value="act"${S.qv.by === 'act' ? ' checked' : ''}> Action</label><label><input type="radio" name="qvby" value="sec"${S.qv.by === 'sec' ? ' checked' : ''}> Section</label></div></div></div></div>
    <button type="button" class="gb-alt" id="qv-open">Expand all</button><button type="button" class="gb-alt" id="qv-close">Collapse all</button>
  </div>
  <p class="muted qv-note">Each row says what to do. Open one for why the tool could not answer it, what the finished books did, and the original wording. Answer them in the workbook, then build again.</p>
  <ol class="qv-list${S.qv.by === 'act' ? ' by-act' : ''}" id="qv-list">${qvRows(qs)}</ol>
  ${qvNoneBar(qs)}
  <p class="empty qv-empty"${qvLive(qs).length ? ' hidden' : ''}>Nothing here matches that.</p>
</section>`;
}
function qvMatch(q) {
  const st = S.qv.state[q.cell] || 'open';
  if (S.qv.type === 'done') { if (st === 'open') return false; }
  else {
    if (st !== 'open') return false;
    if (S.qv.type !== 'all' && q.type !== S.qv.type) return false;
    if (S.qv.type === 'all' && q.type === 'none' && !S.qv.showNone) return false;
  }
  if (S.qv.sec && q.sec !== S.qv.sec) return false;
  const t = S.qv.q.trim().toLowerCase();
  if (t && !`${q.field} ${q.action} ${q.label} ${q.sec}`.toLowerCase().includes(t)) return false;
  return true;
}
const qvLive = qs => qs.filter(qvMatch);
function qvRows(qs) {
  const live = qvLive(qs), key = S.qv.by === 'sec' ? 'sec' : 'action';
  const order = [], buckets = {};
  live.forEach(q => { const k = q[key]; if (!buckets[k]) { buckets[k] = []; order.push(k); } buckets[k].push(q); });
  if (S.qv.by === 'act') order.sort((a, b) => buckets[b].length - buckets[a].length);
  else order.sort((a, b) => buckets[a][0].secno - buckets[b][0].secno);
  return order.map(k => `<li class="qv-grouphead"><span>${esc(S.qv.by === 'sec' ? buckets[k][0].seclabel : k)}</span><span class="qv-secn">${buckets[k].length}</span></li>` +
    buckets[k].map(q => {
      const st = S.qv.state[q.cell] || 'open', open = S.qv.open.has(q.cell);
      return `<li class="qv-row st-${st} t-${q.type}${open ? ' open' : ''}" data-cell="${q.cell}">
      <div class="qv-main"><button type="button" class="qv-toggle" aria-expanded="${open}" aria-controls="qb-${q.cell}">
        <svg viewBox="0 0 24 24" class="qv-chev" aria-hidden="true">${P.chevR}</svg><span class="qv-cell mono">${q.label}</span><span class="qv-label">${esc(q.field)}</span>
        <span class="qv-act">${esc(q.action)}</span></button>
        <label class="qv-state"><select class="qv-sel" data-cell="${q.cell}" aria-label="Status for ${q.label}, ${esc(q.field)}">${['open', 'done', 'skipped'].map(s => `<option value="${s}"${st === s ? ' selected' : ''}>${s[0].toUpperCase() + s.slice(1)}</option>`).join('')}</select></label></div>
      <div class="qv-body" id="qb-${q.cell}"${open ? '' : ' hidden'}>
        <div class="qv-block"><span class="qv-k">Why it is not filled</span><p>${esc(q.why)}</p></div>
        <div class="qv-block"><span class="qv-k">What the finished books did</span><table class="qv-prec"><tbody><tr><th>Finished list A</th><td>fills this line</td></tr><tr><th>Finished list B</th><td>leaves it at 0</td></tr></tbody></table></div>
        <details class="qv-orig"><summary>Show the original wording</summary><p>${esc(q.full)}</p></details></div></li>`;
    }).join('')).join('');
}
function qvNoneBar(qs) {
  const n = qs.filter(q => S.qv.type === 'all' && !S.qv.showNone && q.type === 'none' && (S.qv.state[q.cell] || 'open') === 'open').length;
  return `<p class="qv-nonebar" id="qv-nonebar"${n ? '' : ' hidden'}><span id="qv-nonecount">${n} ${n === 1 ? 'row needs nothing' : 'rows need nothing'}</span> <button type="button" class="btn ghost small" id="qv-noneshow">Show them</button></p>`;
}

/* ---------- Grid Report (grid.html) ---------- */
const COLS = [
  { k: 'grp', label: 'Load #', cls: 'num c-narrow' }, { k: 'codeA', label: 'Mat code', cls: 'c-code', off: true, more: true },
  { k: 'desc', label: 'Description', cls: 'c-desc' }, { k: 'qty', label: 'Qty', cls: 'num' },
  { k: 'w', label: 'Width', cls: 'num c-narrow' }, { k: 'd', label: 'Depth', cls: 'num c-narrow' },
  { k: 'ft', label: 'Feet', cls: 'num c-narrow' }, { k: 'inch', label: 'Inches', cls: 'num c-narrow' },
  { k: 'spec', label: 'Grade/Species', cls: 'c-spec' }, { k: 'wt', label: 'Weight', cls: 'num c-narrow', off: true, more: true },
  { k: 'bf', label: 'Quantity (BF/LF)', cls: 'num c-narrow', off: true, more: true }, { k: 'unit', label: 'Unit', cls: 'c-spec c-narrow' },
  { k: 'price', label: 'Unit price', cls: 'num c-narrow', off: true, more: true }, { k: 'ext', label: 'Ext. price', cls: 'num c-narrow', off: true, more: true },
  { k: 'cmt', label: 'Notes', cls: 'c-cmt', filter: 'none' }, { k: 'status', label: 'Status', cls: 'c-status', filter: 'none' },
];
const defaultCols = () => Object.fromEntries(COLS.map(c => [c.k, !c.off]));
S.g.cols = defaultCols();
const STATUS = { filled: ['st-f', 'Filled'], guess: ['st-g', 'Best guess'], question: ['st-q', 'Question'], formula: ['st-m2', 'Formula'], na: ['st-n', 'n/a'], missing: ['st-x', 'Missing'] };
const visCols = () => COLS.filter(c => S.g.cols[c.k]);
const fmtN = x => Math.round(x * 10) / 10;
function cellVal(r, k) {
  if (k === 'bf') { const b = bfOf(r); return b ? fmtN(b) : ''; }
  if (k === 'codeA') return r.cell.replace('G', 'M-');
  if (k === 'wt' || k === 'price' || k === 'ext') return '';
  return r[k] == null ? '' : r[k];
}
function rowVisible(r) {
  const g = S.g, edited = S.edits[r.cell] != null;
  if (g.statusF === 'edited') { if (!edited) return false; }
  else if (g.statusF === 'notes') { if (!(S.cmts[r.cell] || []).length) return false; }
  else if (g.statusF === 'unanswered') { if (r.status !== 'question' || edited) return false; }
  else if (g.statusF === 'answered') { if (r.status !== 'question' || !edited) return false; }
  else if (g.statusF === 'differs' || g.statusF === 'missing') return false;
  else if (g.statusF !== 'all' && r.status !== g.statusF) return false;
  if (g.search) { const hay = `${r.desc} ${r.spec} ${r.grp} ${r.cell}`.toLowerCase(); if (!hay.includes(g.search)) return false; }
  for (const k in g.colF) { const f = g.colF[k]; if (f && !String(cellVal(r, k)).toLowerCase().includes(f)) return false; }
  return true;
}
function totals(rows) {
  const t = { qty: 0, lf: 0, bf: 0 };
  rows.forEach(r => { const q = num(qtyOf(r)); if (q != null) t.qty += q; const ft = num(r.ft); if (q != null && ft != null) t.lf += q * (ft + (num(r.inch) || 0) / 12); t.bf += bfOf(r); });
  return t;
}
function subtotalHtml(t) {
  const b = [];
  if (S.g.vals.qty && t.qty) b.push('&Sigma; ' + fmtN(t.qty) + ' pcs');
  if (S.g.vals.lf && t.lf) b.push(fmtN(t.lf) + ' LF');
  if (S.g.vals.bf && t.bf) b.push(fmtN(t.bf) + ' BF');
  return b.length ? `<span class="subtot">${b.join(' &middot; ')}</span>` : '';
}
function chips(c) {
  return [['question', 'q', 'question', 'questions'], ['guess', 'g', 'guess', 'guesses'], ['missing', 'x', 'missing', 'missing'], ['filled', 'f', 'filled', 'filled'], ['na', 'n', 'n/a', 'n/a'], ['edited', 'e', 'edited', 'edited']]
    .map(([k, cls, one, many]) => (c[k] ? `<span class="cnt ${cls}">${c[k]} ${c[k] > 1 ? many : one}</span>` : '')).join('');
}
function sortVal(r, k) {
  const v = k === 'qty' ? qtyOf(r) : cellVal(r, k);
  if (v == null || v === '') return null;
  const n = parseFloat(String(v)); return !isNaN(n) && /^[-+]?[\d.,\s]+$/.test(String(v)) ? n : String(v).toLowerCase();
}
function sortRows(rows) {
  const { k, dir } = S.g.sort; if (!k || !dir) return rows;
  return rows.slice().sort((a, b) => { const x = sortVal(a, k), y = sortVal(b, k);
    if (x === null && y === null) return 0; if (x === null) return 1; if (y === null) return -1;
    if (typeof x === 'number' && typeof y === 'number') return (x - y) * dir; return (String(x) < String(y) ? -1 : String(x) > String(y) ? 1 : 0) * dir; });
}
function cellHtml(c, r) {
  const dc = ` data-col="${c.k}"`, ed = S.edits[r.cell];
  if (c.k === 'cmt') { const n = (S.cmts[r.cell] || []).length; return `<td class="c-cmt"${dc}><button type="button" class="cmt-btn${n ? ' has' : ''}" data-row="${r.r}" title="Row notes" aria-label="Row notes for ${esc(r.desc)}">${n || '+'}</button></td>`; }
  if (c.k === 'status') { const st = STATUS[r.status] || ['st-t', '']; return `<td class="c-status"${dc}>${st[1] ? `<span class="tag ${st[0]}">${st[1]}</span>` : ''}${ed != null ? ' <span class="tag st-e">edited</span>' : ''}</td>`; }
  if (c.k === 'qty') return `<td class="num qty"${dc} data-editable="1" tabindex="-1" title="Click to change the quantity">${ed != null ? `<span class="q-old">${esc(r.qty)}</span><span class="q-new">${esc(ed)}</span>` : esc(r.qty)}</td>`;
  if (c.k === 'desc') return `<td class="c-desc lv2"${dc} title="${esc(r.desc)}">${esc(r.desc)}${r.reason ? `<button type="button" class="why" title="Why" aria-label="Why this line has this status">i</button><div class="whytext">${esc(r.reason)}</div>` : ''}</td>`;
  return `<td class="${c.cls}"${dc}>${esc(cellVal(r, c.k))}</td>`;
}
function gridTable() {
  if (S.g.groupsView) return gridGroups();
  const cols = visCols(), span = cols.length, g = S.g;
  let h = '<table class="gr-table"><thead><tr class="h-row"><th class="c-rail">Code</th>' + cols.map(c => {
    const on = g.sort.k === c.k && g.sort.dir;
    return `<th class="${c.cls} sortable${on ? ' sorted' : ''}" data-col="${c.k}" aria-sort="${on ? (g.sort.dir > 0 ? 'ascending' : 'descending') : 'none'}"><button type="button" class="sortbtn" data-sort="${c.k}" title="Sort by ${esc(c.label)} within each section">${esc(c.label)}<span class="sortarrow">${on ? (g.sort.dir > 0 ? '&#9650;' : '&#9660;') : '&#8693;'}</span></button></th>`;
  }).join('') + (g.showF ? '</tr><tr class="f-row"><th class="c-rail"></th>' + cols.map(c => (c.filter === 'none' ? `<th data-col="${c.k}"></th>`
    : `<th data-col="${c.k}"><input class="cf" data-col="${c.k}" value="${esc(g.colF[c.k] || '')}" aria-label="Filter ${esc(c.label)}"></th>`)).join('') : '') + '</tr></thead>';
  sectionModel().forEach((sec, si) => {
    if (sec.settled && !sec.settled.kept && !g.showNA) return;
    const all = sec.subs.flatMap(b => b.rows), vis = all.filter(rowVisible);
    if (!vis.length) return;
    const open = !!g.open[si] || (g.statusF !== 'all' || g.search ? g.open[si] !== false : false);
    let flags = '';
    if (sec.settled) {
      flags += ` <span class="tag st-n" title="${esc(sec.settled.question + ' - you answered: ' + sec.settled.answer)}">not on this plan &middot; you answered ${esc(sec.settled.answer)}${sec.settled.asks ? `, ${sec.settled.asks} question${sec.settled.asks === 1 ? '' : 's'} settled` : ''}</span>`;
      if (sec.settled.kept) flags += ` <span class="tag st-q">but ${sec.settled.kept} line${sec.settled.kept === 1 ? '' : 's'} still computed</span>`;
    }
    if (g.lvlSection) h += `<tbody class="gr-sechead${sec.settled ? ' ghostsec' : ''}"><tr class="gr-sec" tabindex="0" data-sec="${si}" aria-expanded="${open}"><td class="c-rail"><span class="tw">${open ? '&#9662;' : '&#9656;'}</span>${esc(sec.code)}</td>
      <td class="secname" colspan="${span}"><b>${esc(sec.title)}</b>${flags}${subtotalHtml(totals(vis))}<span class="counts">${chips(sec.counts)}</span></td></tr></tbody>`;
    let inner = '';
    sec.subs.forEach(b => {
      const rows = b.rows.filter(rowVisible); if (!rows.length) return;
      if (g.lvlSub) inner += `<tr class="gr-sub"><td class="c-rail">${esc(b.code)}</td><td class="secname" colspan="${span}">${esc(b.title)}${subtotalHtml(totals(rows))}</td></tr>`;
      inner += sortRows(rows).map(r => `<tr class="gr-row ${(STATUS[r.status] || ['st-t'])[0]}" tabindex="-1" data-cell="${r.cell}" data-r="${r.r}"><td class="c-rail leaf">${esc(r.code)}</td>${cols.map(c => cellHtml(c, r)).join('')}</tr>`).join('');
    });
    h += `<tbody class="gr-secbody" data-secbody="${si}"${g.lvlSection && !open ? ' style="display:none"' : ''}>${inner}</tbody>`;
  });
  return h + '</table>';
}
function gridGroups() {
  const groups = {};
  sectionModel().forEach(sec => { if (sec.settled) return; sec.subs.forEach(b => b.rows.forEach(r => { if (!r.grp) return; (groups[r.grp] = groups[r.grp] || []).push(r); })); });
  let h = '<table class="gr-table"><thead><tr><th class="c-rail"></th><th>Group</th><th class="num">Qty</th><th class="c-desc">Item</th><th class="num">Dims</th></tr></thead>';
  Object.keys(groups).sort((a, b) => a - b).forEach(k => {
    const rows = groups[k].filter(r => !S.g.search || r.desc.toLowerCase().includes(S.g.search)), key = 'g' + k, open = !!S.g.open[key];
    const tq = rows.reduce((t, r) => t + (num(qtyOf(r)) || 0), 0);
    h += `<tbody class="gr-sechead"><tr class="gr-sec" tabindex="0" data-sec="${key}" aria-expanded="${open}"><td class="c-rail"><span class="tw">${open ? '&#9662;' : '&#9656;'}</span></td><td class="secname" colspan="4"><b>Load ${k}</b><span class="subtot">&Sigma; ${fmtN(tq)} pcs &middot; ${rows.length} lines</span></td></tr></tbody>
      <tbody class="gr-secbody" data-secbody="${key}"${open ? '' : ' style="display:none"'}>${rows.map(r => `<tr class="gr-row st-t"><td class="c-rail"></td><td></td><td class="num">${esc(qtyOf(r))}</td><td class="c-desc">${esc(r.desc)}</td><td class="num">${[r.w, r.d].filter(Boolean).join('x')}${r.ft ? ' x ' + r.ft + "'" : ''}</td></tr>`).join('')}</tbody>`;
  });
  return h + '</table>';
}
function gridStrips() {
  const g = S.g, act = [];
  for (const k in g.colF) if (g.colF[k]) act.push({ kind: 'col', k, label: COLS.find(c => c.k === k).label + ': ' + g.colF[k] });
  if (g.statusF !== 'all') act.push({ kind: 'status', label: STATUSF.find(s => s[0] === g.statusF)[1] });
  if (g.search) act.push({ kind: 'search', label: 'Search: ' + g.search });
  const settled = sectionModel().filter(s => s.settled), hidden = g.showNA ? [] : settled.filter(s => !s.settled.kept);
  const active = act.length ? `<div class="gb-active" id="gb-active"><span class="gb-active-lbl">Filtering</span>${act.map(a => `<button type="button" class="fchip" data-kind="${a.kind}" data-k="${esc(a.k || '')}">${esc(a.label)} <b>&times;</b></button>`).join('')}<button type="button" class="gb-clear" id="strip-clear">Clear all</button></div>` : '<div class="gb-active" id="gb-active" hidden></div>';
  const na = settled.length ? `<div class="gb-active" id="gb-hidden"><span class="gb-active-lbl">Not on this plan</span>${g.showNA
    ? `<span class="rail-quiet">${settled.length} section${settled.length === 1 ? '' : 's'} you answered out are being shown</span><button type="button" class="gb-clear" id="na-toggle">Hide them again</button>`
    : `<span class="rail-quiet">${hidden.length} section${hidden.length === 1 ? '' : 's'} hidden: ${esc(hidden.map(s => s.title).join(', '))}</span><button type="button" class="gb-clear" id="na-toggle">Show them</button>`}</div>` : '<div class="gb-active" id="gb-hidden" hidden></div>';
  return { active, na, nAct: act.length };
}
const STATUSF = [['all', 'All'], ['question', 'Questions'], ['guess', 'Best guesses'], ['filled', 'Filled'], ['missing', 'Missing vs book'], ['differs', 'Differs from your list'], ['na', 'Not on this plan'], ['edited', 'Edited'], ['notes', 'Notes'], ['unanswered', 'Unanswered'], ['answered', 'Answered']];
function colsPane() {
  const on = COLS.filter(c => S.g.cols[c.k]).length, dflt = defaultCols(), isDefault = COLS.every(c => !!S.g.cols[c.k] === !!dflt[c.k]);
  const row = c => `<label><input type="checkbox" data-colk="${c.k}"${S.g.cols[c.k] ? ' checked' : ''}> ${esc(c.label)}</label>`;
  const sect = (id, title, count, open) => `<button type="button" class="rail-h rail-sect" id="${id}" aria-expanded="${open}"><svg viewBox="0 0 24 24" class="ico chev" aria-hidden="true">${P.caret}</svg>${title}<span class="n">${count}</span></button>`;
  const core = COLS.filter(c => !c.more), more = COLS.filter(c => c.more);
  return { pane: sect('cols-main', 'Columns', core.length, S.g.colsMain) + (S.g.colsMain ? core.map(row).join('') : '') + sect('cols-more', 'Ordering', more.length, S.g.colsMore) + (S.g.colsMore ? more.map(row).join('') : ''),
    sub: `<span>${on} of ${COLS.length} shown</span>${isDefault ? '' : '<button type="button" class="rail-link" id="col-reset">Reset</button>'}` };
}
function gridPage(p) {
  const g = S.g, strips = gridStrips(), cp = colsPane();
  const pending = Object.keys(S.edits).length;
  const lvls = []; if (g.lvlSection) lvls.push('Section'); if (g.lvlSub) lvls.push('Subsection');
  const viewDefault = g.lvlSection && g.lvlSub && !g.groupsView;
  const lines = SECS.reduce((t, s) => t + s.subs.reduce((u, b) => u + b.rows.length, 0), 0);
  return `<div class="pagehead slim"><div class="crumb"><a href="#/projects">Projects</a> / <a href="#/project/${p.id}">${esc(p.name)}</a> / Grid Report</div>
  <h1>${esc(p.name)}: Grid Report <span class="chip proto">Prototype</span></h1></div>
<div class="gridwrap" id="gridwrap">
  <div class="gr-header"><div class="gr-fact"><span>House</span><b>${esc(p.name)}</b></div><div class="gr-fact"><span>Template</span><b>${p.template}</b></div>
    <div class="gr-fact"><span>Built</span><b>${p.touched}</b></div><div class="gr-fact"><span>Lines</span><b>${lines}</b></div><div class="gr-fact"><span>Sections</span><b>${SECS.length}</b></div></div>
  <div class="gr-note pending" id="gr-pending"${pending ? '' : ' style="display:none"'}><b><span id="gr-pending-n">${pending}</span> edit(s) captured</b> They apply on the next build of this project.
    <button type="button" class="btn ghost small" id="gr-undo"${S.undo.length ? '' : ' hidden'} title="Undo the last quantity you changed (Ctrl+Z)">Undo last edit</button></div>
  <div class="gr-layout"><div class="gr-main">
    <div class="gr-groupbar gb-strip">
      <a class="gb-back" href="#/project/${p.id}" title="Back to ${esc(p.name)}: its documents, downloads and revisions">${ico('back')}Project</a>
      <span class="gb-div"></span>
      <input id="gr-search" class="gb-search" type="search" placeholder="Search the list" aria-label="Search all columns" value="${esc(g.search)}">
      <div class="gb-menu"><button class="gb-alt gb-drop${g.statusF !== 'all' ? ' set' : ''}" id="gb-filters-btn" type="button" aria-haspopup="true" aria-expanded="false" aria-controls="pop-filters" title="Filters - narrow the list down" aria-label="Filters">${ico('funnel')}<span class="car">&#9662;</span></button>
        <div class="gb-pop" id="pop-filters" hidden role="dialog" aria-label="Filters"><div class="gb-pop-head"><div class="rail-sub" id="filter-sub"><span>${strips.nAct ? strips.nAct + (strips.nAct === 1 ? ' filter on' : ' filters on') : 'No filters on'}</span>${strips.nAct ? '<button type="button" class="rail-link" id="filter-clear">Clear all</button>' : ''}</div></div>
          <div class="gb-pop-body"><div class="rail-h">Status</div><div class="rail-pane" id="status-chips">${STATUSF.map(([f, l]) => `<label><input type="radio" name="statusf" data-f="${f}"${g.statusF === f ? ' checked' : ''}>${l}</label>`).join('')}</div>
          <div class="rail-h">By column</div><div class="rail-pane"><label title="Adds a small filter box under every column heading"><input type="checkbox" id="toggle-frow"${g.showF ? ' checked' : ''}> Filter box under each heading</label></div></div></div></div>
      <div class="gb-menu"><button class="gb-alt gb-drop" id="gb-cols-btn" type="button" aria-haspopup="true" aria-expanded="false" aria-controls="pop-cols" title="Choose which columns the table shows">Columns <span class="car">&#9662;</span></button>
        <div class="gb-pop" id="pop-cols" hidden role="dialog" aria-label="Columns"><div class="gb-pop-body"><div class="rail-pane" id="pane-cols">${cp.pane}</div>
          <button type="button" class="rail-h rail-sect" id="vals-h" aria-expanded="${g.colsVals}" title="Which totals are summed under each section and subsection heading"><svg viewBox="0 0 24 24" class="ico chev" aria-hidden="true">${P.caret}</svg>Values<span class="n">3</span></button>
          <div class="rail-vals" id="rail-vals"${g.colsVals ? '' : ' hidden'}>${[['qty', 'Sum(Qty)'], ['lf', 'Sum(LF)'], ['bf', 'Sum(BF)']].map(([v, l]) => `<label><input type="checkbox" data-v="${v}"${g.vals[v] ? ' checked' : ''}> ${l}</label>`).join('')}</div></div>
          <div class="gb-pop-foot"><div class="foot-count" id="cols-sub">${cp.sub}</div><div class="foot-actions"><button type="button" class="rail-link" id="cols-all">Show all</button><button type="button" class="rail-link" id="cols-none">Hide all</button></div></div></div></div>
      <div class="gb-menu"><button class="gb-alt gb-drop" id="gb-view-btn" type="button" aria-haspopup="true" aria-expanded="false" aria-controls="pop-view" title="How the list is grouped and laid out">View <span class="car">&#9662;</span></button>
        <div class="gb-pop" id="pop-view" hidden role="dialog" aria-label="View"><div class="gb-pop-head"><div class="rail-sub" id="view-sub"><span>${g.groupsView ? 'Groups 1-12' : lvls.length ? lvls.join(' &rsaquo; ') : 'No grouping'}</span>${viewDefault ? '' : '<button type="button" class="rail-link" id="view-reset">Reset</button>'}</div></div>
          <div class="gb-pop-body"><div class="rail-h">Grouped by</div><div class="rail-pane" id="lvl-pane"><label><input type="checkbox" class="lvl" data-lvl="section"${g.lvlSection ? ' checked' : ''}> Section</label><label><input type="checkbox" class="lvl" data-lvl="sub"${g.lvlSub ? ' checked' : ''}> Subsection</label></div>
          <div class="rail-h">Layout</div><div class="rail-pane"><label title="One row per load group, 1 to 12"><input type="checkbox" id="gb-groups"${g.groupsView ? ' checked' : ''}> Groups 1-12 view</label></div>
          <div class="rail-h">Sections</div><div class="rail-tools"><button id="gr-expand" type="button">Expand all</button><button id="gr-collapse" type="button">Collapse all</button></div></div></div></div>
      <div class="gb-grow"></div>
      <button class="gb-alt" id="gb-csv" type="button" title="Download exactly what is on screen as a CSV: current filters, sort and columns" data-real="${esc(REAL('download exactly what is on screen as a CSV: the current filters, sort and columns.'))}">&#8681; CSV</button>
      <button class="gb-alt gb-full${document.body.classList.contains('gr-full') ? ' on' : ''}" id="gb-full" type="button" title="Give the table the whole window (Esc returns)">${document.body.classList.contains('gr-full') ? '&#x2716; Exit full screen' : '&#x26F6; Full screen'}</button>
    </div>
    ${strips.active}${strips.na}
    <div class="gr-tablewrap"><div id="gr-body">${gridTable()}</div></div>
  </div></div>
  <div class="gr-downloads"><span class="gr-dl-label">Downloads</span>
    <button type="button" class="btn primary small" data-real="${esc(REAL('download the filled workbook (.xlsm).'))}">The filled workbook (.xlsm)</button>
    <button type="button" class="btn soft small" data-real="${esc(REAL('download the review list (.docx).'))}">The review list (.docx)</button>
    <a class="btn ghost small" href="#/project/${p.id}">Back to the project</a></div>
</div>`;
}

/* ---------- Project Questions (questions.html + _pq.html) ---------- */
function pqPage(p) {
  const s = pqStats(p.id), pct = s.req ? Math.round(s.done / s.req * 100) : 100, ans = S.answers[p.id];
  const excluded = [];
  PQ_GROUPS.forEach(g => g.questions.forEach(q => { if (q.excl && ans[q.id] === q.excl[0]) q.excl[1].forEach(c => excluded.push([c, titleCase(SECS.find(x => x.code === c).title)])); }));
  const fopts = [['all', 'All questions'], ['required', 'Questions that need an answer'], ['standard', 'Standard questions'], ['custom', 'Added by your team'], ['optional', 'Optional measurements']];
  const qrow = q => {
    const v = ans[q.id] || '', note = S.notes[p.id + q.id] || '';
    const na = q.excl ? `<span class="pq-badge na" title="${q.excl[1].map(c => c + ' ' + titleCase(SECS.find(x => x.code === c).title)).join('; ')}">${q.excl[0]} &#8594; section ${q.excl[1].join(', ')} n/a</span>` : '';
    return `<div class="pq-q" data-q="${q.id}" data-text="${esc(q.text.toLowerCase())}" data-kind="${q.custom ? 'custom' : 'standard'}" data-optional="${q.optional ? 1 : 0}" data-answered="${v ? 1 : 0}">
      <div class="pq-q-main"><span class="pq-q-text" id="pq-t-${q.id}">${esc(q.text)}</span>
        <span class="pq-badges">${q.custom ? '<span class="pq-badge custom">Added by Demo</span>' : '<span class="pq-badge">Standard</span>'}${q.optional ? '<span class="pq-badge opt">Optional</span>' : ''}${q.source === 'quote' && p.files.length ? `<span class="pq-badge quote">${q.id === 'joist_oc' ? 'Read off the drawings' : 'From the quote'}</span>` : ''}${na}</span>
        ${q.hint ? `<div class="pq-q-hint">${esc(q.hint)}</div>` : ''}${v ? '<div class="pq-q-by">Answered by Demo</div>' : ''}</div>
      <div class="pq-seg-wrap">${q.type === 'number'
        ? `<span class="pq-numin"><input type="number" class="pq-num-in" min="0" step="0.25" value="${esc(v)}" placeholder="${q.unit || 'number'}" aria-labelledby="pq-t-${q.id}"><span class="unit">${q.unit}</span>
           <button type="button" class="btn soft pq-mini pq-num-save">${v ? 'Update' : 'Save'}</button>${v ? '<button type="button" class="btn ghost pq-mini pq-num-clear" title="Clear it: the drawing read is used instead">Clear</button>' : ''}</span>`
        : `<span class="pq-seg" role="group" aria-labelledby="pq-t-${q.id}">${q.options.map(o => `<button type="button" class="pq-opt" data-v="${esc(o)}" aria-pressed="${v === o}">${ico('check')}${esc(o)}</button>`).join('')}</span>`}
        <button type="button" class="pq-notebtn ${note ? 'has' : ''}" aria-expanded="false" aria-label="${note ? 'Edit' : 'Add'} a note about this answer" title="Add a note in your own words">${ico('note')}</button></div>
      ${v ? `<span class="pq-status done">${ico('checkc')}Answered</span>` : q.optional ? `<span class="pq-status opt">${ico('circle')}Optional</span>` : `<span class="pq-status open">${ico('circle')}Not answered</span>`}
      <div class="pq-note" hidden><label class="sr-only" for="pq-n-${q.id}">Note about this answer</label>
        <textarea id="pq-n-${q.id}" maxlength="600" placeholder="Anything the next reviewer should know about this answer. For example: walkout wall was added in revision 2, see sheet A-4">${esc(note)}</textarea>
        <div class="pq-note-row"><button type="button" class="btn ghost small pq-note-save">Save note</button></div></div>
      ${note ? `<div class="pq-note-peek">&#8220;${esc(note)}&#8221;</div>` : ''}</div>`;
  };
  return `<div class="pq"><div class="pq-head"><div><h1>Project Questions</h1>
    <p class="pq-lead">Answer the questions below about ${esc(p.name)} before its material list is built.</p>
    <p class="pq-sub">Answers already found on the quote are filled in for you, so change anything the quote got wrong. The list adapts to your answers: a slab house is never asked about basement walls. Need to ask something on every house? <a href="#" data-real="${esc(REAL('open the question manager, where your team adds a question to every house.'))}">Add a question</a>.</p></div>
    <a class="pq-help" href="#" data-real="${esc(REAL('open the help page for Project Questions.'))}">${ico('help')}Need help?</a></div>
  <div class="pq-summary">
    <div class="pq-card pq-stat"><span class="pq-stat-ico">${ico('qlist')}</span><span><span class="pq-stat-n">${s.std}</span><span class="pq-stat-l">Standard questions</span><span class="pq-stat-d">Pre-set questions that apply to this house.</span></span></div>
    <div class="pq-card pq-stat"><span class="pq-stat-ico">${ico('pencil')}</span><span><span class="pq-stat-n">${s.cus}</span><span class="pq-stat-l">Custom question${s.cus === 1 ? '' : 's'}</span><span class="pq-stat-d">Questions your team added.</span></span></div>
    ${s.complete ? `<div class="pq-card pq-stat good"><span class="pq-stat-ico">${ico('check')}</span><span><span class="pq-stat-l">Ready to build</span><span class="pq-stat-d">Every question that needs an answer has one.</span></span></div>`
      : `<div class="pq-card pq-stat warn"><span class="pq-stat-ico">${ico('alert')}</span><span><span class="pq-stat-n">${s.open}</span><span class="pq-stat-l">Still to answer</span><span class="pq-stat-d">The material list can be built once these are answered.</span></span></div>`}
  </div>
  <div class="pq-card pq-progress"><div class="pq-progress-top"><b>${s.done} of ${s.req} answered</b><span>${s.open ? s.open + ' left to answer' : 'All done'} &middot; optional measurements: ${s.optDone} of ${s.opt} filled in</span></div>
    <div class="pq-bar ${pct === 100 ? 'done' : ''}" role="progressbar" aria-valuemin="0" aria-valuemax="${s.req}" aria-valuenow="${s.done}" aria-label="${s.done} of ${s.req} questions answered"><i style="width: ${pct}%"></i></div></div>
  ${excluded.length ? `<div class="alert info"><b>Not applicable to this house, from your answers:</b> ${excluded.map(([c, l]) => `<span class="mono">${c}</span> ${esc(l)}`).join(', ')}. The build does not raise questions in these sections. Nothing already filled in is removed.</div>` : ''}
  <div class="pq-tools" role="search"><label class="pq-search"><span class="sr-only">Search questions</span>${ico('search')}<input type="search" id="pq-search" placeholder="Search questions..." autocomplete="off" value="${esc(S.pq.search)}"></label>
    <label><span class="sr-only">Which questions to show</span><select id="pq-filter">${fopts.map(([v, l]) => `<option value="${v}"${S.pq.filter === v ? ' selected' : ''}>${l}</option>`).join('')}</select></label>
    <label class="pq-toggle"><input type="checkbox" id="pq-unanswered"${S.pq.only ? ' checked' : ''}><span class="pq-switch" aria-hidden="true"></span>Show only unanswered</label>
    <span class="pq-count" id="pq-count" aria-live="polite"></span></div>
  ${PQ_GROUPS.map((g, i) => catSection(i + 1, g.name, `${g.questions.length} question${g.questions.length === 1 ? '' : 's'}`, S.pq.open, g.questions.map(qrow).join(''))).join('')}
  <div class="pq-card pq-empty" id="pq-noresults" hidden><h3>No questions found</h3><p>Try a different search or clear your filters.</p><button type="button" class="btn ghost" id="pq-clear">Clear search and filters</button></div>
  <div class="pq-card pq-box pq-context"><h2><label for="projctx">Anything else about this house?</label></h2>
    <p class="muted">Room for anything no question covers: special orders, revision history, things to watch. Saved with the project for every reviewer.</p>
    <textarea id="projctx" maxlength="4000" rows="4" placeholder="For example: the customer switched from decks to a wraparound porch after the final quote, so the porch numbers govern.">${esc(S.ctx[p.id] || '')}</textarea>
    <div class="pq-note-row"><button type="button" class="btn soft small" id="projctx-save">Save notes</button><span class="muted" id="projctx-msg"></span></div></div>
  <div class="pq-card pq-foot">${s.complete
    ? `<button type="button" class="btn primary" id="buildnow" data-real="${esc(REAL('start the build with these answers, then open the Grid Report when it finishes.'))}">Ready to build materials list</button><a class="btn ghost" href="#/project/${p.id}">Back to the project</a>`
    : `<span class="muted">Answer the remaining ${s.open} to unlock the build.</span><a class="btn ghost" href="#/project/${p.id}">Back to the project</a>`}</div>
</div>`;
}
function catSection(idx, name, count, openSet, inner) {
  const open = openSet.has('pq-cat-h' + idx);
  return `<section class="pq-card pq-cat"><button type="button" class="pq-cat-head" id="pq-cat-h${idx}" aria-expanded="${open}" aria-controls="pq-cat-b${idx}">
    <span class="pq-cat-ico">${catIco(name)}</span><span class="pq-cat-name">${esc(name)}</span><span class="pq-pill" data-count-for="${idx}" data-total="${count}">${count}</span>${ico('caret', 'pq-cat-chev')}</button>
    <div class="pq-cat-body" id="pq-cat-b${idx}" role="region" aria-labelledby="pq-cat-h${idx}"${open ? '' : ' hidden'}>${inner}</div></section>`;
}
// pq.js apply(): search, filter and the unanswered switch over the rows.
function pqApply(noun, st) {
  const q = st.search.trim().toLowerCase(), f = st.filter, un = !!st.only, active = !!q || f !== 'all' || un;
  let shown = 0;
  document.querySelectorAll('.pq-cat').forEach(cat => {
    const rows = [...cat.querySelectorAll('.pq-q')]; let n = 0;
    rows.forEach(r => {
      let ok = true;
      if (q && !(r.dataset.text || '').includes(q)) ok = false;
      if (f === 'standard' && r.dataset.kind !== 'standard') ok = false;
      if (f === 'custom' && r.dataset.kind !== 'custom') ok = false;
      if (f === 'optional' && r.dataset.optional !== '1') ok = false;
      if (f === 'required' && r.dataset.optional === '1') ok = false;
      if (un && r.dataset.answered === '1') ok = false;
      if (['enforced', 'pending', 'edited'].includes(f) && !(r.dataset.state || '').split(' ').includes(f)) ok = false;
      r.hidden = !ok; if (ok) n += 1;
    });
    shown += n; cat.hidden = n === 0;
    const pill = cat.querySelector('[data-count-for]'), total = rows.length;
    if (pill) pill.textContent = (active ? n + ' of ' + total : total) + (total === 1 && !active ? ' ' + noun : ' ' + noun + 's');
    if (active && n) { const h = cat.querySelector('.pq-cat-head'); h.setAttribute('aria-expanded', 'true'); document.getElementById(h.getAttribute('aria-controls')).hidden = false; }
  });
  const none = document.getElementById('pq-noresults'); if (none) none.hidden = shown !== 0;
  const c = document.getElementById('pq-count'); if (c) c.textContent = active ? `${shown} ${noun}${shown === 1 ? '' : 's'} shown` : '';
}

/* ---------- Rules Book (rules.html) ---------- */
function rulesPage() {
  const all = RULES.flatMap(c => c.rules), live = all.filter(r => r.enforced).length;
  const tileB = (f, icon, n, l, d, cls) => `<button type="button" class="pq-card pq-stat rb-tile ${cls}" data-filter="${f}" aria-pressed="${S.rb.filter === f}"><span class="pq-stat-ico">${ico(icon)}</span><span><span class="pq-stat-n">${n}</span><span class="pq-stat-l">${l}</span><span class="pq-stat-d">${d}</span></span></button>`;
  const rule = r => {
    const open = S.rb.detail.has(r.id), editing = S.rb.editing.has(r.id);
    return `<div class="pq-q rb-rule" id="rule-${r.id}" data-text="${esc((r.name + ' ' + r.formula + ' ' + r.source + ' ' + r.code).toLowerCase())}" data-state="${r.enforced ? 'enforced' : 'pending'}">
      <div class="pq-q-main"><span class="pq-q-text" id="rb-t-${r.id}">${esc(r.name)}</span><span class="pq-badges"></span><div class="rb-formula">${esc(r.formula)}</div></div>
      ${r.enforced ? `<span class="pq-status done">${ico('checkc')}Applied automatically</span>` : `<span class="pq-status open">${ico('circle')}Not yet automated</span>`}
      <button type="button" class="btn ghost pq-mini rb-more" aria-expanded="${open}" aria-controls="rb-d-${r.id}" data-rule="${r.id}">${r.params ? 'Details &amp; numbers' : 'Details'}${ico('caret', 'rb-chev')}</button>
      <div class="rb-detail" id="rb-d-${r.id}"${open ? '' : ' hidden'}>
        ${r.params ? `<div class="rb-params">${Object.entries(r.params).map(([l, v], i) => `<div class="rb-param"><label class="rb-plabel" for="rb-${r.id}-${i}">${esc(l)}</label>
          <div class="rb-prow"><input id="rb-${r.id}-${i}"${editing ? '' : ' readonly'} value="${esc(v)}"><button type="button" class="btn primary pq-mini rp-save"${editing ? '' : ' hidden'} data-real="${esc(REAL('record your suggested number under your name for the build team. The tool keeps using the current number until they build it in.'))}">Save suggestion</button></div></div>`).join('')}</div>
          <button type="button" class="btn soft pq-mini rb-edit" data-rule="${r.id}">${ico('pencil')}${editing ? 'Stop editing' : 'Suggest different numbers'}</button>` : ''}
        <dl class="rb-cite"><div><dt>Where it came from</dt><dd>${esc(r.source)}</dd></div><div><dt>For the build team</dt><dd>${esc(r.code)}</dd></div></dl></div></div>`;
  };
  return `<div class="pq"><div class="pq-head"><div><h1>Rules Book</h1>
    <p class="pq-lead">Every rule the tool follows to turn your schedules and quotes into a material list.</p>
    <p class="pq-sub">Each rule says where it came from: your own template, a call, or one of your finished lists. Think a number is wrong, or a rule is missing? Suggest a change below. It is recorded under your name for the build team.</p></div>
    <a class="pq-help" href="#" data-real="${esc(REAL('open the help page for the Rules Book.'))}">${ico('help')}Need help?</a></div>
  <div class="pq-summary rb-summary" role="group" aria-label="Show rules by status">
    ${tileB('all', 'book', all.length, 'Rules on record', 'Show every rule.', '')}${tileB('enforced', 'check', live, 'Applied automatically', 'The tool uses these on every build.', 'good')}
    ${tileB('pending', 'alert', all.length - live, 'Not yet automated', 'Written down, still done by hand.', 'warn')}${tileB('edited', 'pencil', 0, 'Changes suggested', 'Waiting for the build team.', '')}</div>
  <div class="rb-honest" role="note">${ico('alert')}<span><b>Suggestions are recorded, not applied.</b> A suggested change or a new rule does not change the tool's math until the build team builds it in. Each one records who made it and when.</span></div>
  <section class="pq-card pq-add rb-add" aria-labelledby="rb-add-title"><h2 class="pq-add-title" id="rb-add-title">Suggest a new rule</h2>
    <div class="pq-steps">
      <label class="pq-step"><span class="pq-step-top"><span class="pq-num" aria-hidden="true">1</span><span><span class="pq-step-title">Name the rule</span><span class="pq-step-help">A short name your team would recognise.</span></span></span><input id="pf-name" maxlength="80" placeholder="e.g. Deck post spacing"></label>
      <span class="pq-arrow">${ico('arrow')}</span>
      <label class="pq-step"><span class="pq-step-top"><span class="pq-num" aria-hidden="true">2</span><span><span class="pq-step-title">Choose a category</span><span class="pq-step-help">Where it belongs in the book.</span></span></span>
        <select id="pf-cat"><option value="">Select a category</option>${RULES.map(c => `<option>${esc(c.name)}</option>`).join('')}</select></label>
      <span class="pq-arrow">${ico('arrow')}</span>
      <label class="pq-step"><span class="pq-step-top"><span class="pq-num" aria-hidden="true">3</span><span><span class="pq-step-title">Describe it in plain words</span><span class="pq-step-help">What should the tool do, and when?</span></span></span><input id="pf-formula" maxlength="400" placeholder="e.g. One 6x6 post every 8 feet of deck beam"></label>
      <span class="pq-addwrap"><button type="button" class="btn primary pq-addbtn" id="pf-submit" data-real="${esc(REAL('record the suggested rule under your name for the build team.'))}">${ico('plus')}Suggest rule</button></span>
    </div><p class="pq-formmsg" id="pf-msg" role="status" aria-live="polite"></p></section>
  <div class="pq-tools" role="search"><label class="pq-search"><span class="sr-only">Search rules</span>${ico('search')}<input type="search" id="pq-search" placeholder="Search rules, numbers or where they came from..." autocomplete="off" value="${esc(S.rb.search)}"></label>
    <label><span class="sr-only">Which rules to show</span><select id="pq-filter">${[['all', 'All rules'], ['enforced', 'Applied automatically'], ['pending', 'Not yet automated'], ['edited', 'With a suggested change']].map(([v, l]) => `<option value="${v}"${S.rb.filter === v ? ' selected' : ''}>${l}</option>`).join('')}</select></label>
    <button type="button" class="btn ghost pq-mini" id="rb-openall">Open all</button><button type="button" class="btn ghost pq-mini" id="rb-closeall">Close all</button>
    <span class="pq-count" id="pq-count" aria-live="polite"></span></div>
  ${RULES.map((c, i) => catSection(i + 1, c.name, `${c.rules.length} rule${c.rules.length === 1 ? '' : 's'}`, S.rb.open, c.rules.map(rule).join(''))).join('')}
  <div class="pq-card pq-empty" id="pq-noresults" hidden><h3>No rules found</h3><p>Try a different search or clear your filters.</p><button type="button" class="btn ghost" id="pq-clear">Clear search and filters</button></div>
</div>`;
}


/* ---------- Sign in (login.html) ---------- */
function signinPage() {
  const chk = `<svg viewBox="0 0 24 24" class="ico" aria-hidden="true">${P.check}</svg>`;
  const prov = (mark, label, what) => `<a class="btn soft wide provider" href="#" data-real="${esc(REAL(what))}">${mark}<span>${label}</span></a>`;
  return `<div class="authsplit">
  <div class="auth-side">
    <div class="auth-mast"><span class="wordmark"><b>Material</b><i>List</i></span></div>
    <div class="auth-art" aria-hidden="true"><img src="hero-cabin.jpg" alt="" width="1400" height="871" decoding="async"></div>
    <div class="auth-hero">
      <div class="auth-rule"></div>
      <h1>Material List</h1>
      <p class="auth-lede">From plans to a finished material list.</p>
      <p>Upload schedules, quotes and drawings and turn them into accurate, traceable material lists for your next build.</p>
      <ul class="auth-points">
        <li>${chk}<div><b>Source traceability</b>Every number carries its source.</div></li>
        <li>${chk}<div><b>Review flags</b>Anything uncertain is clearly flagged for review.</div></li>
        <li>${chk}<div><b>Your workbook, preserved</b>Existing formulas and structure remain intact.</div></li>
      </ul>
    </div>
    <div class="auth-base"><div class="foot">Built by <span class="klogo">KHIPU<span>AI</span></span></div></div>
  </div>
  <div class="auth-form" role="main">
    <div class="authcard">
      <div class="auth-brand"><h1>Welcome to Material List</h1><p class="muted">Sign in to access your material planning workspace.</p></div>
      <div class="provider-list">
        ${prov('<svg class="provider-mark" viewBox="0 0 21 21" aria-hidden="true"><rect x="1" y="1" width="9" height="9" fill="#f25022"/><rect x="11" y="1" width="9" height="9" fill="#7fba00"/><rect x="1" y="11" width="9" height="9" fill="#00a4ef"/><rect x="11" y="11" width="9" height="9" fill="#ffb900"/></svg>', 'Continue with Microsoft', 'sign you in with your work Microsoft account.')}
        ${prov('<svg class="provider-mark stroke" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>', 'Email me a sign-in code', 'email you a one-time sign-in code.')}
      </div>
      <div class="auth-or"><span>or</span></div>
      <form class="stack" id="loginform">
        <label>Username <input name="username" autocomplete="username" value="demo"></label>
        <label>Password <span class="pwfield"><input name="password" id="pw" type="password" autocomplete="current-password">
          <button type="button" class="pwtoggle" id="pwtoggle" aria-controls="pw" aria-pressed="false" aria-label="Show password" title="Show password">
            <svg viewBox="0 0 24 24" class="ico eye-open" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
            <svg viewBox="0 0 24 24" class="ico eye-shut" aria-hidden="true"><path d="M2 12s3.6-7 10-7c2 0 3.8.7 5.3 1.6M22 12s-3.6 7-10 7c-2 0-3.8-.7-5.3-1.6"/><path d="m3 3 18 18"/></svg>
          </button></span></label>
        <button class="btn primary wide" type="submit" id="loginbtn"><span class="btn-label">Sign in</span></button>
      </form>
      <div class="auth-foot">Trouble signing in? <a href="#" data-real="${esc(REAL('open a message to your administrator to reset your sign-in.'))}">Contact your administrator</a>.</div>
    </div>
  </div>
</div>`;
}
function bindSignin() {
  const pw = document.getElementById('pw'), t = document.getElementById('pwtoggle');
  t.onclick = () => { const shown = pw.type === 'text'; pw.type = shown ? 'password' : 'text'; t.setAttribute('aria-pressed', String(!shown));
    const l = shown ? 'Show password' : 'Hide password'; t.setAttribute('aria-label', l); t.title = l; pw.focus(); };
  const form = document.getElementById('loginform'), btn = document.getElementById('loginbtn');
  form.addEventListener('submit', e => { e.preventDefault(); btn.classList.add('busy'); btn.disabled = true; btn.querySelector('.btn-label').textContent = 'Signing in';
    setTimeout(() => { location.hash = '#/home'; }, 350); });
}
/* ---------- routing ---------- */
function parse() {
  const h = (location.hash || '').replace(/^#\/?/, '');
  const [path, qs] = h.split('?');
  const parts = path.split('/').filter(Boolean);
  if (!parts.length) return { route: 'home' };
  if (parts[0] === 'project') {
    const p = proj(parts[1]); const sub = parts[2] || 'overview';
    if (sub === 'grid') return p.built ? { route: 'grid', p } : { route: 'project', p, tab: 'results' };
    if (sub === 'questions') return { route: 'questions', p };
    return { route: 'project', p, tab: TABS.some(t => t[0] === sub) ? sub : 'overview' };
  }
  if (parts[0] === 'questions') return { route: 'questions', p: proj('sample') };
  if (parts[0] === 'signin') return { route: 'signin' };
  if (['home', 'projects', 'rules'].includes(parts[0])) return { route: parts[0], qs: qs || '' };
  return { route: 'home' };
}
let R = parse();
function render(keepScroll = false) {
  R = parse();
  const y = window.scrollY;
  if (R.route !== 'grid') document.body.classList.remove('gr-full');
  let crumb = 'Projects', content = '', extra = '';
  if (R.route === 'signin') { app.innerHTML = signinPage(); bindSignin(); window.scrollTo(0, 0); return; }
  if (R.route === 'home') { crumb = 'Home'; content = home(); }
  else if (R.route === 'projects') { if (R.qs.includes('new=1')) S.panel = 'panel-project'; content = board(); extra = boardSearch; }
  else if (R.route === 'project') content = projectPage(R.p, R.tab);
  else if (R.route === 'grid') { crumb = 'Grid Report'; content = gridPage(R.p); }
  else if (R.route === 'questions') { crumb = `<a class="crumb-up" href="#/projects">Projects</a> <span class="crumb-sep" aria-hidden="true">&#8250;</span> <a class="crumb-up" href="#/project/${R.p.id}">${esc(R.p.name)}</a> <span class="crumb-sep" aria-hidden="true">&#8250;</span> Project Questions`; content = pqPage(R.p); }
  else if (R.route === 'rules') { crumb = 'Rules Book'; content = rulesPage(); }
  app.innerHTML = shell(R.route, crumb, content, extra);
  bind();
  window.scrollTo(0, keepScroll ? y : 0);
}
// Re-render the current screen but keep focus on the control that caused it.
function rerender(focusSel) {
  render(true);
  if (focusSel) { const el = document.querySelector(focusSel); if (el) { el.focus({ preventScroll: true }); if (el.tagName === 'TEXTAREA' || (el.tagName === 'INPUT' && ['text', 'search', ''].includes(el.getAttribute('type') || ''))) el.setSelectionRange(el.value.length, el.value.length); } }
}
window.addEventListener('hashchange', () => render(false));

/* ---------- behaviour ---------- */
const MENUS = [['gb-filters-btn', 'pop-filters'], ['gb-cols-btn', 'pop-cols'], ['gb-view-btn', 'pop-view'], ['qv-sec-btn', 'qv-pop-sec'], ['qv-by-btn', 'qv-pop-by']];
let openMenu = null;
function closeMenus(except) {
  MENUS.forEach(([b, p]) => {
    if (p === except) return; const pop = document.getElementById(p), btn = document.getElementById(b);
    if (!pop) return; pop.hidden = true; btn.setAttribute('aria-expanded', 'false'); btn.classList.remove('on');
  });
  if (!except) openMenu = null;
}
function reopenMenu() {
  if (!openMenu) return; const m = MENUS.find(x => x[1] === openMenu); if (!m) return;
  const pop = document.getElementById(m[1]), btn = document.getElementById(m[0]); if (!pop) return;
  pop.hidden = false; btn.setAttribute('aria-expanded', 'true'); btn.classList.add('on');
}
function bind() {
  const $ = id => document.getElementById(id);
  $('sidebtn').onclick = () => { document.documentElement.classList.toggle('side-min'); rerender('#sidebtn'); };
  $('themebtn').onclick = () => { const r = document.documentElement; if (r.getAttribute('data-theme') === 'dark') r.removeAttribute('data-theme'); else r.setAttribute('data-theme', 'dark'); };
  MENUS.forEach(([b, p]) => {
    const btn = $(b), pop = $(p); if (!btn || !pop) return;
    btn.onclick = e => { e.stopPropagation(); const open = pop.hidden; closeMenus(open ? p : null); pop.hidden = !open; btn.setAttribute('aria-expanded', String(open)); btn.classList.toggle('on', open); openMenu = open ? p : null; };
    pop.addEventListener('click', e => e.stopPropagation());
  });
  if (R.route === 'projects') bindBoard();
  if (R.route === 'project') bindProject();
  if (R.route === 'grid') bindGrid();
  if (R.route === 'questions') bindPQ();
  if (R.route === 'rules') bindRules();
  if (document.getElementById('qv')) bindQV();
}
document.addEventListener('click', () => closeMenus(null));
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (openMenu) { const m = MENUS.find(x => x[1] === openMenu); closeMenus(null); const b = m && document.getElementById(m[0]); if (b) b.focus(); return; }
  if (document.body.classList.contains('gr-full')) { document.body.classList.remove('gr-full'); rerender('#gb-full'); }
});

function bindBoard() {
  const q = document.getElementById('q');
  q.oninput = () => { S.bsearch = q.value; applyBoardSearch(); };
  applyBoardSearch();
  document.getElementById('view-list').onclick = () => { S.view = 'list'; rerender('#view-list'); };
  document.getElementById('view-grid').onclick = () => { S.view = 'grid'; rerender('#view-grid'); };
  document.getElementById('board-sort').onchange = e => { S.sort = e.target.value; rerender('#board-sort'); };
  document.querySelectorAll('[data-bsort]').forEach(b => { b.onclick = () => { S.sort = b.dataset.bsort; rerender(`[data-bsort="${b.dataset.bsort}"]`); }; });
  document.querySelectorAll('[data-panel]').forEach(b => { b.onclick = () => {
    S.panel = S.panel === b.dataset.panel ? '' : b.dataset.panel;
    if (location.hash.includes('new=1')) history.replaceState(null, '', '#/projects');
    rerender(S.panel ? `#${S.panel} input` : `[data-panel="${b.dataset.panel}"]`);
  }; });
  document.querySelectorAll('.projcard').forEach(c => c.addEventListener('click', e => {
    if (e.target.closest('button, a, select')) return; const a = c.querySelector('.projlink'); if (a) location.hash = a.getAttribute('href');
  }));
}
function bindProject() {
  const p = R.p;
  const rb = document.getElementById('renamebtn');
  if (rb) rb.onclick = () => { S.renaming = true; rerender('#renamein'); };
  const rc = document.getElementById('renamecancel'); if (rc) rc.onclick = () => { S.renaming = false; rerender('#renamebtn'); };
  const rs = document.getElementById('renamesave');
  const save = () => { const v = document.getElementById('renamein').value.trim(); if (v) p.name = v.slice(0, 80); S.renaming = false; rerender('#renamebtn'); };
  if (rs) rs.onclick = save;
  const ri = document.getElementById('renamein'); if (ri) ri.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); save(); } if (e.key === 'Escape') { S.renaming = false; rerender('#renamebtn'); } };
  const dz = document.getElementById('dzshow');
  if (dz) dz.onclick = () => { document.getElementById('dropzone').hidden = false; dz.hidden = true; document.querySelector('.dz-browse').focus(); };
  document.querySelectorAll('[data-act="asks"]').forEach(b => { b.onclick = () => { const qv = document.getElementById('qv'); if (qv) { qv.scrollIntoView({ block: 'start' }); const t = qv.querySelector('.qv-tile'); if (t) t.focus({ preventScroll: true }); } }; });
}
function bindQV() {
  document.querySelectorAll('.qv-tile').forEach(b => { b.onclick = () => { S.qv.type = b.dataset.f; rerender(`.qv-tile[data-f="${b.dataset.f}"]`); }; });
  const q = document.getElementById('qv-q');
  q.oninput = () => { S.qv.q = q.value; const qs = questionList(); document.getElementById('qv-list').innerHTML = qvRows(qs); document.querySelector('.qv-empty').hidden = !!qvLive(qs).length; bindQVRows(); };
  document.querySelectorAll('#qv-sec-pane input').forEach(r => { r.onchange = () => { S.qv.sec = r.value; openMenu = null; rerender('#qv-sec-btn'); }; });
  const reset = document.getElementById('qv-sec-reset'); if (reset) reset.onclick = () => { S.qv.sec = ''; openMenu = null; rerender('#qv-sec-btn'); };
  document.querySelectorAll('#qv-by-pane input').forEach(r => { r.onchange = () => { S.qv.by = r.value; openMenu = null; rerender('#qv-by-btn'); }; });
  document.getElementById('qv-open').onclick = () => { questionList().filter(qvMatch).forEach(x => S.qv.open.add(x.cell)); rerender('#qv-open'); };
  document.getElementById('qv-close').onclick = () => { S.qv.open.clear(); rerender('#qv-close'); };
  const ns = document.getElementById('qv-noneshow'); if (ns) ns.onclick = () => { S.qv.showNone = true; rerender('#qv-list'); };
  bindQVRows();
}
function bindQVRows() {
  document.querySelectorAll('.qv-row').forEach(li => {
    const cell = li.dataset.cell;
    li.querySelector('.qv-toggle').onclick = () => {
      const body = li.querySelector('.qv-body'), on = body.hidden; body.hidden = !on;
      li.querySelector('.qv-toggle').setAttribute('aria-expanded', String(on)); li.classList.toggle('open', on);
      if (on) S.qv.open.add(cell); else S.qv.open.delete(cell);
    };
    li.querySelector('.qv-sel').onchange = e => { S.qv.state[cell] = e.target.value; rerender('#qv-q'); };
  });
}
function bindPQ() {
  const p = R.p;
  pqApply('question', S.pq);
  bindCats(S.pq.open);
  const se = document.getElementById('pq-search'), fi = document.getElementById('pq-filter'), un = document.getElementById('pq-unanswered');
  se.oninput = () => { S.pq.search = se.value; pqApply('question', S.pq); };
  fi.onchange = () => { S.pq.filter = fi.value; pqApply('question', S.pq); };
  un.onchange = () => { S.pq.only = un.checked; pqApply('question', S.pq); };
  document.getElementById('pq-clear').onclick = () => { S.pq.search = ''; S.pq.filter = 'all'; S.pq.only = false; rerender('#pq-search'); };
  document.querySelectorAll('.pq-q[data-q]').forEach(row => {
    const qid = row.dataset.q;
    row.querySelectorAll('.pq-opt').forEach(b => { b.onclick = () => { S.answers[p.id][qid] = b.dataset.v; rerender(`.pq-q[data-q="${qid}"] .pq-opt[data-v="${CSS.escape(b.dataset.v)}"]`); }; });
    const num = row.querySelector('.pq-num-in');
    if (num) {
      const send = v => { S.answers[p.id][qid] = String(v).trim(); rerender(`.pq-q[data-q="${qid}"] .pq-num-in`); };
      row.querySelector('.pq-num-save').onclick = () => send(num.value);
      num.onkeydown = e => { if (e.key === 'Enter') send(num.value); };
      const clr = row.querySelector('.pq-num-clear'); if (clr) clr.onclick = () => send('');
    }
    const nb = row.querySelector('.pq-notebtn'), note = row.querySelector('.pq-note');
    nb.onclick = () => { note.hidden = !note.hidden; nb.setAttribute('aria-expanded', String(!note.hidden)); if (!note.hidden) note.querySelector('textarea').focus(); };
    note.querySelector('.pq-note-save').onclick = () => { S.notes[p.id + qid] = note.querySelector('textarea').value.trim(); rerender(`.pq-q[data-q="${qid}"] .pq-notebtn`); };
  });
  document.getElementById('projctx-save').onclick = () => { S.ctx[p.id] = document.getElementById('projctx').value; document.getElementById('projctx-msg').textContent = 'Saved in this demo only'; };
}
function bindCats(openSet) {
  document.querySelectorAll('.pq-cat-head').forEach(h => { h.onclick = () => {
    const open = h.getAttribute('aria-expanded') !== 'true'; h.setAttribute('aria-expanded', String(open));
    const b = document.getElementById(h.getAttribute('aria-controls')); b.hidden = !open;
    if (open) { openSet.add(h.id); b.classList.remove('opening'); void b.offsetWidth; b.classList.add('opening'); } else openSet.delete(h.id);
  }; });
}
function bindRules() {
  pqApply('rule', S.rb);
  bindCats(S.rb.open);
  const se = document.getElementById('pq-search'), fi = document.getElementById('pq-filter');
  se.oninput = () => { S.rb.search = se.value; pqApply('rule', S.rb); };
  fi.onchange = () => { S.rb.filter = fi.value; rerender('#pq-filter'); };
  document.querySelectorAll('.rb-tile').forEach(t => { t.onclick = () => { S.rb.filter = t.dataset.filter; rerender(`.rb-tile[data-filter="${t.dataset.filter}"]`); }; });
  document.getElementById('pq-clear').onclick = () => { S.rb.search = ''; S.rb.filter = 'all'; rerender('#pq-search'); };
  document.getElementById('rb-openall').onclick = () => { RULES.forEach((c, i) => S.rb.open.add('pq-cat-h' + (i + 1))); rerender('#rb-openall'); };
  document.getElementById('rb-closeall').onclick = () => { S.rb.open.clear(); rerender('#rb-closeall'); };
  document.querySelectorAll('.rb-more').forEach(b => { b.onclick = () => { const id = b.dataset.rule; if (S.rb.detail.has(id)) S.rb.detail.delete(id); else S.rb.detail.add(id); rerender(`.rb-more[data-rule="${id}"]`); }; });
  document.querySelectorAll('.rb-edit').forEach(b => { b.onclick = () => { const id = b.dataset.rule; if (S.rb.editing.has(id)) S.rb.editing.delete(id); else S.rb.editing.add(id); rerender(S.rb.editing.has(id) ? `#rb-${id}-0` : `.rb-edit[data-rule="${id}"]`); }; });
}
function bindGrid() {
  const g = S.g, $ = id => document.getElementById(id), body = $('gr-body');
  reopenMenu();
  const sr = $('gr-search');
  sr.oninput = () => { g.search = sr.value.trim().toLowerCase(); rerender('#gr-search'); };
  document.querySelectorAll('#status-chips input').forEach(i => { i.onchange = () => { g.statusF = i.dataset.f; g.open = {}; rerender(`#status-chips input[data-f="${i.dataset.f}"]`); }; });
  $('toggle-frow').onchange = e => { g.showF = e.target.checked; rerender('#toggle-frow'); };
  const fc = $('filter-clear'); if (fc) fc.onclick = () => { g.colF = {}; g.search = ''; g.statusF = 'all'; rerender('#gb-filters-btn'); };
  document.querySelectorAll('#pane-cols input[data-colk]').forEach(i => { i.onchange = () => { g.cols[i.dataset.colk] = i.checked; rerender(`#pane-cols input[data-colk="${i.dataset.colk}"]`); }; });
  $('cols-main').onclick = () => { g.colsMain = !g.colsMain; rerender('#cols-main'); };
  $('cols-more').onclick = () => { g.colsMore = !g.colsMore; rerender('#cols-more'); };
  $('vals-h').onclick = () => { g.colsVals = !g.colsVals; rerender('#vals-h'); };
  document.querySelectorAll('#rail-vals input').forEach(i => { i.onchange = () => { g.vals[i.dataset.v] = i.checked; rerender(`#rail-vals input[data-v="${i.dataset.v}"]`); }; });
  $('cols-all').onclick = () => { COLS.forEach(c => { g.cols[c.k] = true; }); rerender('#cols-all'); };
  $('cols-none').onclick = () => { COLS.forEach(c => { g.cols[c.k] = c.k === 'desc'; }); rerender('#cols-none'); };
  const cr = $('col-reset'); if (cr) cr.onclick = () => { g.cols = defaultCols(); rerender('#cols-all'); };
  document.querySelectorAll('#lvl-pane .lvl').forEach(i => { i.onchange = () => { if (i.dataset.lvl === 'section') g.lvlSection = i.checked; else g.lvlSub = i.checked; rerender(`#lvl-pane .lvl[data-lvl="${i.dataset.lvl}"]`); }; });
  $('gb-groups').onchange = e => { g.groupsView = e.target.checked; rerender('#gb-groups'); };
  const vr = $('view-reset'); if (vr) vr.onclick = () => { g.lvlSection = true; g.lvlSub = true; g.groupsView = false; rerender('#gb-view-btn'); };
  const all = open => { body.querySelectorAll('.gr-sec').forEach(s => { g.open[s.dataset.sec] = open; }); rerender(open ? '#gr-expand' : '#gr-collapse'); };
  $('gr-expand').onclick = () => all(true); $('gr-collapse').onclick = () => all(false);
  $('gb-full').onclick = () => { document.body.classList.toggle('gr-full'); openMenu = null; rerender('#gb-full'); };
  const na = $('na-toggle'); if (na) na.onclick = () => { g.showNA = !g.showNA; rerender('#na-toggle'); };
  const sc = $('strip-clear'); if (sc) sc.onclick = () => { g.colF = {}; g.search = ''; g.statusF = 'all'; rerender('#gr-search'); };
  document.querySelectorAll('.fchip').forEach(b => { b.onclick = () => { const k = b.dataset.kind; if (k === 'col') delete g.colF[b.dataset.k]; else if (k === 'status') g.statusF = 'all'; else g.search = ''; rerender('#gr-search'); }; });
  const undo = $('gr-undo'); if (undo) undo.onclick = undoLast;
  body.querySelectorAll('.cf').forEach(i => { i.oninput = () => { g.colF[i.dataset.col] = i.value.trim().toLowerCase(); rerender(`.cf[data-col="${i.dataset.col}"]`); }; });
  body.querySelectorAll('.sortbtn').forEach(b => { b.onclick = () => {
    const k = b.dataset.sort; if (g.sort.k !== k) g.sort = { k, dir: 1 }; else g.sort.dir = g.sort.dir === 1 ? -1 : g.sort.dir === -1 ? 0 : 1;
    rerender(`.sortbtn[data-sort="${k}"]`);
  }; });
  body.onclick = e => {
    const why = e.target.closest('.why'); if (why) { why.parentElement.classList.toggle('open'); return; }
    const sec = e.target.closest('.gr-sec');
    if (sec) { const k = sec.dataset.sec, tb = body.querySelector(`[data-secbody="${k}"]`), open = tb.style.display !== 'none';
      tb.style.display = open ? 'none' : ''; g.open[k] = !open; sec.querySelector('.tw').innerHTML = open ? '&#9656;' : '&#9662;'; sec.setAttribute('aria-expanded', String(!open)); return; }
    const cb = e.target.closest('.cmt-btn'); if (cb) { openThread(cb); return; }
    const qty = e.target.closest('[data-editable="1"]'); if (qty && !qty.querySelector('input')) editQty(qty);
  };
  body.onkeydown = e => {
    if (/^(INPUT|SELECT|TEXTAREA|BUTTON)$/.test(e.target.tagName)) return;
    const sec = e.target.closest('.gr-sec');
    if (sec && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); sec.click(); return; }
    const td = e.target.closest('[data-editable="1"]'); if (td && e.key === 'Enter') { e.preventDefault(); editQty(td); }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      const rows = [...body.querySelectorAll('.gr-sec, .gr-row')].filter(x => x.offsetParent !== null);
      const i = rows.indexOf(e.target.closest('tr')); const n = rows[Math.max(0, Math.min(rows.length - 1, i + (e.key === 'ArrowDown' ? 1 : -1)))];
      if (n) { e.preventDefault(); rows.forEach(x => { if (x.classList.contains('gr-row')) x.tabIndex = -1; }); n.tabIndex = 0; n.focus(); }
    }
  };
  body.addEventListener('focusin', e => { const tr = e.target.closest('.gr-row'); if (tr) tr.querySelectorAll('[data-editable="1"]').forEach(td => { td.tabIndex = 0; }); });
}
function editQty(td) {
  const tr = td.closest('.gr-row'), r = ROWS[+tr.dataset.r];
  const cur = S.edits[r.cell] != null ? S.edits[r.cell] : r.qty;
  td.innerHTML = `<input class="q-in" value="${esc(cur)}" aria-label="New quantity for ${esc(r.desc)}"><button type="button" class="q-save btn primary small">Save</button>`;
  const inp = td.querySelector('input'); inp.focus(); inp.select();
  const save = () => {
    const v = inp.value.trim();
    S.undo.push({ cell: r.cell, prev: S.edits[r.cell] });
    if (v === '' || v === String(r.qty)) delete S.edits[r.cell]; else S.edits[r.cell] = v;
    // Answering the cell in the grid settles its question on the Review results tab too.
    if (r.status === 'question') S.qv.state[r.cell] = S.edits[r.cell] != null ? 'done' : 'open';
    rerender(`.gr-row[data-r="${r.r}"] [data-editable="1"]`);
  };
  td.querySelector('.q-save').onclick = ev => { ev.stopPropagation(); save(); };
  inp.onclick = ev => ev.stopPropagation();
  inp.onkeydown = ev => { ev.stopPropagation(); if (ev.key === 'Enter') save(); if (ev.key === 'Escape') rerender(`.gr-row[data-r="${r.r}"] [data-editable="1"]`); };
}
function undoLast() {
  const u = S.undo.pop(); if (!u) return;
  if (u.prev == null) delete S.edits[u.cell]; else S.edits[u.cell] = u.prev;
  const r = Object.values(ROWS).find(x => x.cell === u.cell);
  if (r && r.status === 'question') S.qv.state[u.cell] = S.edits[u.cell] != null ? 'done' : 'open';
  rerender(S.undo.length ? '#gr-undo' : '#gr-search');
}
document.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key === 'z' && R.route === 'grid' && !/^(INPUT|TEXTAREA)$/.test(e.target.tagName) && S.undo.length) { e.preventDefault(); undoLast(); } });
// Row notes: the thread popover, kept in memory.
let pop = null;
function openThread(btn) {
  if (pop) pop.remove();
  const r = ROWS[+btn.dataset.row], list = S.cmts[r.cell] || [];
  pop = document.createElement('div'); pop.className = 'cmt-pop'; pop.setAttribute('role', 'dialog'); pop.setAttribute('aria-label', 'Row notes');
  pop.innerHTML = `<div class="cmt-head">Row ${r.r} &middot; ${esc(r.desc)}<button type="button" class="cmt-x" title="Close" aria-label="Close">&times;</button></div>
    <div class="cmt-list">${list.length ? list.map(c => `<div class="cmt-item"><span class="cmt-role">Estimator</span><span class="cmt-at">just now</span><div class="cmt-text">${esc(c)}</div></div>`).join('') : '<div class="cmt-empty">No notes on this row yet.</div>'}</div>
    <div class="cmt-form"><select class="cmt-role-sel" aria-label="Answer as"><option>Estimator</option><option>Reviewer</option></select>
      <select class="cmt-kind" aria-label="Note or question"><option value="note">Note, no answer needed</option><option value="ask">Question, waiting on an answer</option></select>
      <textarea class="cmt-in" rows="2" aria-label="Note" placeholder="Add a note or ask a question about this row"></textarea><button type="button" class="cmt-save btn primary small">Save note</button></div>`;
  document.body.appendChild(pop);
  const b = btn.getBoundingClientRect(), w = pop.offsetWidth || 340;
  pop.style.top = (window.scrollY + b.bottom + 6) + 'px';
  pop.style.left = Math.max(8, Math.min(window.scrollX + b.right - w, window.scrollX + document.documentElement.clientWidth - w - 8)) + 'px';
  const close = () => { pop.remove(); pop = null; const again = document.querySelector(`.cmt-btn[data-row="${r.r}"]`); if (again) again.focus(); };
  pop.querySelector('.cmt-x').onclick = close;
  pop.addEventListener('click', e => e.stopPropagation());
  pop.onkeydown = e => { if (e.key === 'Escape') { e.stopPropagation(); close(); } };
  pop.querySelector('.cmt-save').onclick = () => { const v = pop.querySelector('.cmt-in').value.trim(); if (!v) return; (S.cmts[r.cell] = S.cmts[r.cell] || []).push(v); pop.remove(); pop = null; rerender(`.cmt-btn[data-row="${r.r}"]`); };
  pop.querySelector('.cmt-in').focus();
}
document.addEventListener('click', e => { if (pop && !e.target.closest('.cmt-btn')) { pop.remove(); pop = null; } });

render();
