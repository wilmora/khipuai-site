// Support ticket triage demo: the inbox with a suggested topic and urgency,
// one ticket where a person accepts or changes the routing, the routing
// rules, and a summary. Made-up tickets.
import { ui, esc, fmt } from './kit.js';

const TICKETS = {
  k1: { topic: 'payroll', urgent: true, team: 'payroll' },
  k2: { topic: 'access', urgent: false, team: 'it' },
  k3: { topic: 'billing', urgent: false, team: 'billing' },
  k4: { topic: 'payroll', urgent: true, team: 'payroll' },
};
const TEAMS = ['payroll', 'billing', 'it'];

export default {
  key: 'support',
  tabs: ['inbox', 'ticket', 'rules', 'summary'],
  init: () => ({ filter: 'all', sel: 'k1', routed: {}, team: {} }),
  view: {
    inbox: (s, t) => {
      const ids = Object.keys(TICKETS).filter(id => s.filter === 'all' || (s.filter === 'urgent') === TICKETS[id].urgent);
      return `<div class="dm-row" role="group" aria-label="${esc(t.filterLabel)}">${['all', 'urgent', 'normal'].map(f => ui.btn(t.filters[f], 'filter', f, { pressed: s.filter === f })).join('')}</div>`
        + `<ul class="dm-list">${ids.map(id => { const k = TICKETS[id]; return `<li><span class="who"><b>${esc(t.subjects[id])}</b>
          <span>${esc(t.topics[k.topic])} · ${esc(s.routed[id] ? fmt(t.sentTo, { team: t.teams[s.team[id] || k.team] }) : t.notRouted)}</span></span>
          ${k.urgent ? ui.chip(t.urgent, 'bad') : ui.chip(t.normal, 'info')}${ui.btn(t.open, 'open', id)}</li>`; }).join('')}</ul>`;
    },
    ticket: (s, t) => {
      const k = TICKETS[s.sel], team = s.team[s.sel] || k.team;
      return ui.h(t.subjects[s.sel]) + `<div class="dm-box"><p class="dm-p">${esc(t.bodies[s.sel])}</p></div>`
        + `<div class="dm-box result">${ui.h(t.suggested)}<div class="dm-row">${ui.chip(t.topics[k.topic], 'info')}${k.urgent ? ui.chip(t.urgent, 'bad') : ui.chip(t.normal, 'info')}</div>
          <div class="dm-row">${ui.select(t.team, 'team', TEAMS.map(x => [x, t.teams[x]]), team)}
          ${s.routed[s.sel] ? ui.chip(fmt(t.sentTo, { team: t.teams[team] }), 'ok') : ui.btn(t.accept, 'accept', s.sel, { kind: 'main' })}</div>
          ${ui.p(t.personNote)}</div>`
        + `<div class="dm-row">${ui.real(t.reply, 'reply')}${ui.btn(t.back, 'goto', 'inbox')}</div>`;
    },
    rules: (s, t) => ui.table(t.rulesCaption, [t.topic, t.goesTo, t.urgentIf], Object.keys(t.topics).map(tp => ({
      cells: [esc(t.topics[tp]), esc(t.teams[{ payroll: 'payroll', billing: 'billing', access: 'it' }[tp]]), esc(t.urgentWhen[tp])] })))
      + `<div class="dm-row">${ui.real(t.addRule, 'rule')}</div>`,
    summary: (s, t) => {
      const ids = Object.keys(TICKETS), routed = ids.filter(id => s.routed[id]).length;
      return ui.tiles([[t.newToday, String(ids.length)], [t.urgent, String(ids.filter(id => TICKETS[id].urgent).length)], [t.routedCount, `${routed} / ${ids.length}`]])
        + ui.table(t.byTopic, [t.topic, t.count], Object.keys(t.topics).map(tp => ({ cells: [esc(t.topics[tp]), String(ids.filter(id => TICKETS[id].topic === tp).length)] })), { numeric: [1] });
    },
  },
  act: {
    filter: (s, f) => { s.filter = f; },
    open: (s, id) => { s.sel = id; return 'ticket'; },
    team: (s, v) => { s.team[s.sel] = v; },
    accept: (s, id) => { s.routed[id] = true; },
    goto: (s, tab) => tab,
  },
  t: {
    en: {
      app: 'Support tickets with AI triage',
      tabs: { inbox: 'Inbox', ticket: 'Ticket', rules: 'Routing rules', summary: 'Summary' },
      filterLabel: 'Show', filters: { all: 'All', urgent: 'Urgent', normal: 'Normal' },
      subjects: { k1: 'Payroll did not run for two employees', k2: 'New manager cannot log in', k3: 'Question about this month’s invoice', k4: 'Wrong tax amount on a pay stub' },
      bodies: {
        k1: 'Two people on our team did not get paid this morning. Payday is today. Can someone look right away?',
        k2: 'Our new manager started Monday and still cannot log in to the portal.',
        k3: 'The invoice shows a charge we do not recognise. Could you explain it?',
        k4: 'One pay stub shows a tax amount that looks too high. Please check before the next run.',
      },
      topics: { payroll: 'Payroll', access: 'Access', billing: 'Billing' },
      teams: { payroll: 'Payroll team', billing: 'Billing team', it: 'IT help' },
      urgent: 'Urgent', normal: 'Normal', open: 'Open', notRouted: 'Waiting for a person', sentTo: 'Sent to {team}',
      suggested: 'Suggested topic and urgency', team: 'Send to', accept: 'Accept and send',
      personNote: 'The suggestion is only a starting point. A person accepts or changes it.',
      reply: 'Reply to the customer', back: 'Back to the inbox',
      rulesCaption: 'Which team gets each topic', topic: 'Topic', goesTo: 'Goes to', urgentIf: 'Urgent when',
      urgentWhen: { payroll: 'Someone was not paid, or payday is today', access: 'Nobody on the account can log in', billing: 'A payment failed' },
      addRule: 'Add a rule',
      newToday: 'New today', routedCount: 'Sent to a team', byTopic: 'Tickets by topic', count: 'Tickets',
      real: {
        reply: 'In the real product this would open a reply for a person to write and send.',
        rule: 'In the real product this would open a form to add a routing rule.',
      },
    },
    es: {
      app: 'Tickets de soporte con clasificación por IA',
      tabs: { inbox: 'Bandeja', ticket: 'Ticket', rules: 'Reglas de envío', summary: 'Resumen' },
      filterLabel: 'Mostrar', filters: { all: 'Todos', urgent: 'Urgentes', normal: 'Normales' },
      subjects: { k1: 'La nómina no se pagó a dos empleados', k2: 'Un gerente nuevo no puede ingresar', k3: 'Pregunta sobre la factura de este mes', k4: 'Impuesto incorrecto en una boleta de pago' },
      bodies: {
        k1: 'A dos personas de nuestro equipo no les pagaron esta mañana. Hoy es día de pago. ¿Alguien puede revisarlo ya?',
        k2: 'Nuestro gerente nuevo empezó el lunes y todavía no puede ingresar al portal.',
        k3: 'La factura muestra un cargo que no reconocemos. ¿Nos lo pueden explicar?',
        k4: 'Una boleta de pago muestra un impuesto que parece muy alto. Revísenlo antes de la próxima corrida, por favor.',
      },
      topics: { payroll: 'Nómina', access: 'Acceso', billing: 'Facturación' },
      teams: { payroll: 'Equipo de nómina', billing: 'Equipo de facturación', it: 'Soporte de TI' },
      urgent: 'Urgente', normal: 'Normal', open: 'Abrir', notRouted: 'Esperando a una persona', sentTo: 'Enviado a {team}',
      suggested: 'Tema y urgencia sugeridos', team: 'Enviar a', accept: 'Aceptar y enviar',
      personNote: 'La sugerencia es solo un punto de partida. Una persona la acepta o la cambia.',
      reply: 'Responder al cliente', back: 'Volver a la bandeja',
      rulesCaption: 'Qué equipo recibe cada tema', topic: 'Tema', goesTo: 'Va a', urgentIf: 'Urgente cuando',
      urgentWhen: { payroll: 'A alguien no le pagaron, o hoy es día de pago', access: 'Nadie de la cuenta puede ingresar', billing: 'Falló un pago' },
      addRule: 'Agregar una regla',
      newToday: 'Nuevos hoy', routedCount: 'Enviados a un equipo', byTopic: 'Tickets por tema', count: 'Tickets',
      real: {
        reply: 'En el producto real, esto abriría una respuesta para que una persona la escriba y la envíe.',
        rule: 'En el producto real, esto abriría un formulario para agregar una regla de envío.',
      },
    },
  },
};
