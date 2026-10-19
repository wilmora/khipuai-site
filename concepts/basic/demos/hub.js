// Operations web hub demo: home, billing exceptions, the guided monthly close
// and client profiles. Made-up clients and amounts.
import { ui, esc, fmt, money } from './kit.js';

const CLIENTS = {
  c1: { name: 'Harbor Dental (demo)', people: 18, plan: 'standard' },
  c2: { name: 'Pine Roofing (demo)', people: 42, plan: 'plus' },
  c3: { name: 'Lumen Studio (demo)', people: 9, plan: 'standard' },
  c4: { name: 'Quarry Supply (demo)', people: 64, plan: 'plus' },
};
const EXC = [['e1', 'c1', 'credit', -99], ['e2', 'c2', 'termination', -105], ['e3', 'c3', 'offcycle', 25], ['e4', 'c4', 'headcount', 14]];

export default {
  key: 'hub',
  tabs: ['home', 'exceptions', 'close', 'clients'],
  init: () => ({ done: { e4: true }, filter: 'open', close: 3, client: 'c2' }),
  view: {
    home: (s, t) => {
      const open = EXC.filter(([id]) => !s.done[id]).length;
      return ui.tiles([[t.openExc, String(open)], [t.closeStep, `${Math.min(s.close + 1, t.steps.length)} / ${t.steps.length}`], [t.clients, String(Object.keys(CLIENTS).length)]])
        + ui.h(t.shortcuts)
        + `<div class="dm-row">${ui.btn(t.goExc, 'goto', 'exceptions')}${ui.btn(t.goClose, 'goto', 'close')}${ui.btn(t.goClients, 'goto', 'clients')}</div>`
        + ui.p(t.homeNote);
    },
    exceptions: (s, t, lang) => {
      const rows = EXC.filter(([id]) => s.filter === 'all' || (s.filter === 'open') === !s.done[id]);
      return `<div class="dm-row" role="group" aria-label="${esc(t.filterLabel)}">${['open', 'done', 'all'].map(f => ui.btn(t.filters[f], 'filter', f, { pressed: s.filter === f })).join('')}</div>`
        + (rows.length ? `<ul class="dm-list">${rows.map(([id, c, kind, amt]) => `<li><span class="who"><b>${esc(CLIENTS[c].name)}</b><span>${esc(t.kinds[kind])} · ${money(amt, lang)}</span></span>
          ${s.done[id] ? ui.chip(t.resolved, 'ok') : ui.chip(t.open, 'warn')}${ui.btn(s.done[id] ? t.reopen : t.resolve, 'toggle', id)}</li>`).join('')}</ul>` : ui.p(t.none));
    },
    close: (s, t) => ui.steps(t.steps, s.close)
      + `<div class="dm-row">${s.close < t.steps.length - 1 ? ui.btn(fmt(t.markDone, { step: t.steps[s.close] }), 'advance', '', { kind: 'main' }) : ui.real(t.send, 'post', 'main')}
        ${s.close > 0 ? ui.btn(t.back, 'back', '') : ''}</div>` + ui.p(t.closeNote),
    clients: (s, t) => {
      const c = CLIENTS[s.client], open = EXC.filter(([id, cl]) => cl === s.client && !s.done[id]).length;
      return `<div class="dm-row">${Object.entries(CLIENTS).map(([id, x]) => ui.btn(x.name, 'client', id, { pressed: s.client === id })).join('')}</div>`
        + `<div class="dm-box result">${ui.h(c.name)}
          ${ui.tiles([[t.plan, t.plans[c.plan]], [t.people, String(c.people)], [t.openExc, String(open)]])}
          <p class="dm-p">${esc(t.contact)}: billing@example.com</p></div>`
        + `<div class="dm-row">${ui.real(t.edit, 'edit')}</div>`;
    },
  },
  act: {
    goto: (s, tab) => tab,
    filter: (s, f) => { s.filter = f; },
    toggle: (s, id) => { s.done[id] = !s.done[id]; },
    advance: s => { s.close += 1; },
    back: s => { s.close -= 1; },
    client: (s, id) => { s.client = id; },
  },
  t: {
    en: {
      app: 'Operations web hub',
      tabs: { home: 'Home', exceptions: 'Billing exceptions', close: 'Monthly close', clients: 'Client profiles' },
      openExc: 'Open exceptions', closeStep: 'Monthly close step', clients: 'Clients',
      shortcuts: 'Jump to', goExc: 'Billing exceptions', goClose: 'Monthly close', goClients: 'Client profiles',
      homeNote: 'One place for the team’s internal tools, instead of a separate spreadsheet for each task.',
      filterLabel: 'Show', filters: { open: 'Open', done: 'Resolved', all: 'All' },
      kinds: { credit: 'Missing credit', termination: 'Termination fee', offcycle: 'Off-cycle payroll fee', headcount: 'Headcount changed' },
      open: 'Open', resolved: 'Resolved', resolve: 'Resolve', reopen: 'Reopen', none: 'Nothing here. Try another filter.',
      steps: ['Data arrived', 'Invoices drafted', 'Checks run', 'Your review', 'Final check', 'Drafts ready for the accounting system'],
      markDone: 'Mark done: {step}', back: 'Back one step', send: 'Send the drafts to the accounting system',
      closeNote: 'Drafts only. Posting stays manual in the accounting system.',
      plan: 'Plan', plans: { standard: 'Standard', plus: 'Plus' }, people: 'Employees', contact: 'Billing contact', edit: 'Edit this profile',
      real: {
        post: 'In the real product this would create the month’s invoice drafts in the accounting system. A person still posts them there.',
        edit: 'In the real product this would open the client’s profile for editing, with every change recorded.',
      },
    },
    es: {
      app: 'Centro web de operaciones',
      tabs: { home: 'Inicio', exceptions: 'Excepciones de facturación', close: 'Cierre mensual', clients: 'Perfiles de clientes' },
      openExc: 'Excepciones abiertas', closeStep: 'Paso del cierre mensual', clients: 'Clientes',
      shortcuts: 'Ir a', goExc: 'Excepciones de facturación', goClose: 'Cierre mensual', goClients: 'Perfiles de clientes',
      homeNote: 'Un solo lugar para las herramientas internas del equipo, en vez de una hoja de cálculo para cada tarea.',
      filterLabel: 'Mostrar', filters: { open: 'Abiertas', done: 'Resueltas', all: 'Todas' },
      kinds: { credit: 'Crédito faltante', termination: 'Cargo por baja', offcycle: 'Cargo por nómina fuera de ciclo', headcount: 'Cambió el número de empleados' },
      open: 'Abierta', resolved: 'Resuelta', resolve: 'Resolver', reopen: 'Reabrir', none: 'No hay nada aquí. Prueba otro filtro.',
      steps: ['Llegaron los datos', 'Facturas en borrador', 'Revisiones hechas', 'Tu revisión', 'Revisión final', 'Borradores listos para el sistema contable'],
      markDone: 'Marcar como hecho: {step}', back: 'Volver un paso', send: 'Enviar los borradores al sistema contable',
      closeNote: 'Solo borradores. El asiento sigue siendo manual en el sistema contable.',
      plan: 'Plan', plans: { standard: 'Estándar', plus: 'Plus' }, people: 'Empleados', contact: 'Contacto de facturación', edit: 'Editar este perfil',
      real: {
        post: 'En el producto real, esto crearía los borradores de factura del mes en el sistema contable. Una persona igual los asienta ahí.',
        edit: 'En el producto real, esto abriría el perfil del cliente para editarlo, con cada cambio registrado.',
      },
    },
  },
};
