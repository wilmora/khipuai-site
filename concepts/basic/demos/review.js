// Monthly billing review demo: the month at a glance, the invoices that need
// a person, a line-by-line price check, and client emails sorted with a
// suggested fix. Made-up clients, prices and emails.
import { ui, esc, fmt, money } from './kit.js';

const NEEDS = {
  n1: { who: 'Cedar & Co. (demo)', reason: 'differ', checked: 345, draft: 495 },
  n2: { who: 'Willow Dental Group (demo)', reason: 'ask', checked: 410, draft: 420 },
  n3: { who: 'Harbor House (demo)', reason: 'ask', checked: 270, draft: 270 },
};
const LINES = {
  n1: [['base', 110, 110], ['perPerson', 12.5, 12.5], ['offcycle', 25, 175]],
  n2: [['base', 110, 120], ['perPerson', 12.5, 12.5]],
  n3: [['base', 95, 95], ['perPerson', 11, 11]],
};
const MAIL = [['m1', 'n2', 'mistake'], ['m2', 'n3', 'payment'], ['m3', 'n1', 'question']];

export default {
  key: 'review',
  tabs: ['month', 'needs', 'prices', 'emails'],
  init: () => ({ pick: {}, price: 'n2', mail: 'm1' }),
  view: {
    month: (s, t) => {
      const left = Object.keys(NEEDS).filter(id => !s.pick[id]).length;
      return ui.tiles([[t.drafts, '12'], [t.checked, '12 / 12'], [t.forYou, String(left)]])
        + ui.steps(t.flow, left ? 4 : 5)
        + `<div class="dm-row">${ui.btn(left ? t.startReview : t.reviewDone, 'goto', 'needs', { kind: left ? 'main' : '' })}</div>`
        + ui.p(t.monthNote);
    },
    needs: (s, t, lang) => {
      const done = Object.keys(s.pick).length;
      return ui.p(fmt(t.decided, { n: done, of: Object.keys(NEEDS).length }), 'strong')
        + `<ul class="dm-list">${Object.entries(NEEDS).map(([id, x]) => `<li><span class="who"><b>${esc(x.who)}</b>
          <span>${esc(t.reasons[x.reason])} · ${esc(t.checkedTotal)} ${money(x.checked, lang)} · ${esc(t.draftTotal)} ${money(x.draft, lang)}</span></span>
          <span class="dm-row" role="group" aria-label="${esc(fmt(t.decideFor, { who: x.who }))}">${['checked', 'draft', 'hold'].map(c => ui.btn(t.choices[c], 'pick', `${id}:${c}`, { pressed: s.pick[id] === c })).join('')}</span></li>`).join('')}</ul>`;
    },
    prices: (s, t, lang) => {
      const rows = LINES[s.price], differ = rows.filter(([, a, b]) => a !== b).length;
      return `<div class="dm-row">${ui.select(t.client, 'price', Object.entries(NEEDS).map(([id, x]) => [id, x.who]), s.price)}
          ${differ ? ui.chip(fmt(t.nDiffer, { n: differ }), 'bad') : ''}${ui.chip(fmt(t.nMatch, { n: rows.length - differ }), 'ok')}</div>`
        + ui.table(t.pricesCaption, [t.service, t.record, t.onDraft, t.status], rows.map(([svc, a, b]) => ({ cls: a !== b ? 'flag' : '',
          cells: [esc(t.services[svc]), money(a, lang), money(b, lang), a !== b ? ui.chip(t.differs, 'bad') : ui.chip(t.matches, 'ok')] })), { numeric: [1, 2] })
        + `<div class="dm-row">${ui.real(t.editLines, 'edit')}</div>`;
    },
    emails: (s, t) => `<ul class="dm-list">${MAIL.map(([id, n, kind]) => `<li${s.mail === id ? ' class="sel"' : ''}><span class="who"><b>${esc(t.subjects[id])}</b>
        <span>${esc(NEEDS[n].who)}</span></span>${ui.chip(t.kinds[kind], kind === 'mistake' ? 'bad' : kind === 'payment' ? 'ok' : 'info')}
        ${ui.btn(s.mail === id ? t.hide : t.show, 'mail', id, { expanded: s.mail === id, controls: `dm-rv-${id}` })}
        ${s.mail === id ? `<div class="dm-box" id="dm-rv-${id}"><p class="dm-p">${esc(t.bodies[id])}</p><p class="dm-p strong">${esc(t.suggest[id])}</p>
          <div class="dm-row">${ui.real(t.actions[id], id === 'm1' ? 'credit' : id === 'm2' ? 'route' : 'reply', 'main')}</div></div>` : ''}</li>`).join('')}</ul>`,
  },
  act: {
    goto: (s, tab) => tab,
    pick: (s, v) => { const [id, c] = v.split(':'); if (s.pick[id] === c) delete s.pick[id]; else s.pick[id] = c; },
    price: (s, v) => { s.price = v; },
    mail: (s, id) => { s.mail = s.mail === id ? null : id; },
  },
  t: {
    en: {
      app: 'Monthly billing review',
      tabs: { month: 'This month', needs: 'Needs review', prices: 'Prices side by side', emails: 'Client emails' },
      drafts: 'Invoice drafts', checked: 'Checked against the price list', forYou: 'Need a person',
      flow: ['Collect the month’s data', 'Prepare the drafts', 'Check every line against the price list', 'Look into anything odd', 'Your review'],
      startReview: 'Start the review', reviewDone: 'Review again',
      monthNote: 'Every finding comes with the evidence behind it. Drafts go to the accounting system and posting happens there.',
      decided: '{n} of {of} decided', decideFor: 'Decision for {who}',
      reasons: { differ: 'The two totals differ', ask: 'Flagged for a person' },
      checkedTotal: 'Checked:', draftTotal: 'Draft:',
      choices: { checked: 'Use the checked total', draft: 'Keep the draft', hold: 'Hold' },
      client: 'Client', nDiffer: '{n} differ', nMatch: '{n} match', pricesCaption: 'Draft invoice lines against the price record',
      service: 'Service', record: 'Price record', onDraft: 'On the draft', status: 'Status', differs: 'Differs', matches: 'Matches',
      services: { base: 'Monthly base fee', perPerson: 'Per employee, per month', offcycle: 'Off-cycle payroll' },
      editLines: 'Edit the lines',
      show: 'Open', hide: 'Close',
      subjects: { m1: 'Our base fee is wrong', m2: 'Payment sent by bank transfer', m3: 'Why were we charged for off-cycle payroll?' },
      kinds: { mistake: 'Mistake claim', payment: 'Payment', question: 'Question' },
      bodies: {
        m1: 'Our contract says the base fee is $110, but this month’s invoice charged $120. Please fix it.',
        m2: 'We sent the payment for this month’s invoice today.',
        m3: 'We only ran one extra payroll this month. Can you check the charge?',
      },
      suggest: {
        m1: 'Suggested fix: credit $10.00 on the base fee line. The price record shows $110.00.',
        m2: 'Suggested: send to the person who matches payments.',
        m3: 'Suggested: the price record shows one off-cycle run, not seven. Reply with the corrected line.',
      },
      actions: { m1: 'File the credit', m2: 'Send to that person', m3: 'Draft a reply' },
      real: {
        edit: 'In the real product this would open the draft invoice for editing, and every change would be recorded.',
        credit: 'In the real product this would file the credit for a person to approve, then it lands on the next invoice.',
        route: 'In the real product this would hand the email to the person who matches payments.',
        reply: 'In the real product this would open a reply draft for a person to check and send.',
      },
    },
    es: {
      app: 'Revisión mensual de facturación',
      tabs: { month: 'Este mes', needs: 'Por revisar', prices: 'Precios lado a lado', emails: 'Correos de clientes' },
      drafts: 'Borradores de factura', checked: 'Revisados contra la lista de precios', forYou: 'Necesitan a una persona',
      flow: ['Reunir los datos del mes', 'Preparar los borradores', 'Revisar cada línea contra la lista de precios', 'Investigar lo raro', 'Tu revisión'],
      startReview: 'Empezar la revisión', reviewDone: 'Revisar otra vez',
      monthNote: 'Cada hallazgo trae la evidencia que lo respalda. Los borradores van al sistema contable y el asiento se hace ahí.',
      decided: '{n} de {of} decididos', decideFor: 'Decisión para {who}',
      reasons: { differ: 'Los dos totales no coinciden', ask: 'Marcado para una persona' },
      checkedTotal: 'Revisado:', draftTotal: 'Borrador:',
      choices: { checked: 'Usar el total revisado', draft: 'Mantener el borrador', hold: 'Retener' },
      client: 'Cliente', nDiffer: '{n} distintas', nMatch: '{n} coinciden', pricesCaption: 'Líneas del borrador contra el registro de precios',
      service: 'Servicio', record: 'Registro de precios', onDraft: 'En el borrador', status: 'Estado', differs: 'Distinta', matches: 'Coincide',
      services: { base: 'Cargo base mensual', perPerson: 'Por empleado, al mes', offcycle: 'Nómina fuera de ciclo' },
      editLines: 'Editar las líneas',
      show: 'Abrir', hide: 'Cerrar',
      subjects: { m1: 'El cargo base está mal', m2: 'Pago enviado por transferencia', m3: '¿Por qué nos cobraron nómina fuera de ciclo?' },
      kinds: { mistake: 'Reclamo por error', payment: 'Pago', question: 'Pregunta' },
      bodies: {
        m1: 'Nuestro contrato dice que el cargo base es $110, pero la factura de este mes cobró $120. Por favor corríjanlo.',
        m2: 'Hoy enviamos el pago de la factura de este mes.',
        m3: 'Este mes solo corrimos una nómina extra. ¿Pueden revisar el cargo?',
      },
      suggest: {
        m1: 'Corrección sugerida: crédito de $10.00 en la línea del cargo base. El registro de precios muestra $110.00.',
        m2: 'Sugerido: enviarlo a la persona que concilia los pagos.',
        m3: 'Sugerido: el registro de precios muestra una corrida fuera de ciclo, no siete. Responder con la línea corregida.',
      },
      actions: { m1: 'Registrar el crédito', m2: 'Enviar a esa persona', m3: 'Preparar una respuesta' },
      real: {
        edit: 'En el producto real, esto abriría el borrador de factura para editarlo, y cada cambio quedaría registrado.',
        credit: 'En el producto real, esto registraría el crédito para que una persona lo apruebe, y luego aparecería en la próxima factura.',
        route: 'En el producto real, esto pasaría el correo a la persona que concilia los pagos.',
        reply: 'En el producto real, esto abriría un borrador de respuesta para que una persona lo revise y lo envíe.',
      },
    },
  },
};
