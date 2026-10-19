// Billing exceptions workbench demo: one queue, each exception with the
// customer details from several systems side by side, a resolution, and
// the history. Made-up customers and amounts.
import { ui, esc, fmt, money } from './kit.js';

const ITEMS = {
  x1: { who: 'Cedar Lane Clinic (demo)', kind: 'headcount', age: 6, amt: 48, billed: 22, payroll: 24, plan: 'standard', inv: 'DEMO-INV-0042' },
  x2: { who: 'Fox Hill Builders (demo)', kind: 'credit', age: 2, amt: -120, billed: 31, payroll: 31, plan: 'plus', inv: 'DEMO-INV-0057' },
  x3: { who: 'Marsh Street Cafe (demo)', kind: 'offcycle', age: 4, amt: 25, billed: 12, payroll: 12, plan: 'standard', inv: 'DEMO-INV-0061' },
};
const RES = ['credit', 'bill', 'none'];

export default {
  key: 'workbench',
  tabs: ['queue', 'detail', 'history', 'rules'],
  init: () => ({ sort: 'age', sel: 'x1', choice: {}, saved: {}, log: [['x2', 'opened'], ['x3', 'opened']] }),
  view: {
    queue: (s, t, lang) => {
      const ids = Object.keys(ITEMS).sort((a, b) => s.sort === 'age' ? ITEMS[b].age - ITEMS[a].age : Math.abs(ITEMS[b].amt) - Math.abs(ITEMS[a].amt));
      return `<div class="dm-row" role="group" aria-label="${esc(t.sortLabel)}">${ui.btn(t.oldest, 'sort', 'age', { pressed: s.sort === 'age' })}${ui.btn(t.biggest, 'sort', 'amt', { pressed: s.sort === 'amt' })}</div>`
        + `<ul class="dm-list">${ids.map(id => { const x = ITEMS[id]; return `<li${s.sel === id ? ' class="sel"' : ''}><span class="who"><b>${esc(x.who)}</b>
          <span>${esc(t.kinds[x.kind])} · ${money(x.amt, lang)} · ${esc(fmt(t.days, { n: x.age }))}</span></span>
          ${s.saved[id] ? ui.chip(t.done, 'ok') : ui.chip(t.open, 'warn')}${ui.btn(t.openIt, 'open', id)}</li>`; }).join('')}</ul>`;
    },
    detail: (s, t, lang) => {
      const x = ITEMS[s.sel];
      return `<div class="dm-row between">${ui.h(`${x.who} · ${t.kinds[x.kind]}`)}${s.saved[s.sel] ? ui.chip(t.done, 'ok') : ui.chip(t.open, 'warn')}</div>`
        + `<div class="dm-cards">${[[t.accounting, `${x.inv} · ${money(x.amt, lang)}`], [t.payroll, fmt(t.headcount, { billed: x.billed, paid: x.payroll })], [t.crm, `${t.plans[x.plan]} · ${t.contact}`]]
          .map(([h, v]) => `<div class="dm-box">${ui.h(h)}<p class="dm-p">${esc(v)}</p></div>`).join('')}</div>`
        + `<fieldset class="dm-radios"><legend>${esc(t.resolution)}</legend>${RES.map(r => `<label><input type="radio" name="dm-wb-res" value="${r}" data-input="choose"${(s.choice[s.sel] || s.saved[s.sel]) === r ? ' checked' : ''}>${esc(t.res[r])}</label>`).join('')}</fieldset>`
        + `<div class="dm-row">${ui.btn(t.save, 'save', s.sel, { kind: 'main', disabled: !s.choice[s.sel] })}${ui.btn(t.backQueue, 'goto', 'queue')}</div>`;
    },
    history: (s, t) => `<ul class="dm-list">${s.log.slice().reverse().map(([id, what]) =>
      `<li><span class="who"><b>${esc(ITEMS[id].who)}</b><span>${esc(t.logLine[what] || fmt(t.logRes, { res: t.res[what] }))}</span></span></li>`).join('')}</ul>`
      + ui.p(t.historyNote),
    rules: (s, t) => ui.table(t.rulesCaption, [t.check, t.when], t.rules.map(([a, b]) => ({ cells: [esc(a), esc(b)] })))
      + `<div class="dm-row">${ui.real(t.addRule, 'rule')}</div>`,
  },
  act: {
    sort: (s, v) => { s.sort = v; },
    open: (s, id) => { s.sel = id; return 'detail'; },
    choose: (s, v) => { s.choice[s.sel] = v; },
    save: (s, id) => { s.saved[id] = s.choice[id]; s.log.push([id, s.choice[id]]); },
    goto: (s, tab) => tab,
  },
  t: {
    en: {
      app: 'Billing exceptions workbench',
      tabs: { queue: 'Queue', detail: 'Exception', history: 'History', rules: 'Checks' },
      sortLabel: 'Sort the queue', oldest: 'Oldest first', biggest: 'Biggest first',
      kinds: { headcount: 'Billed headcount differs from payroll', credit: 'Credit asked for', offcycle: 'Off-cycle payroll not billed' },
      days: '{n} days open', open: 'Open', done: 'Resolved', openIt: 'View',
      accounting: 'Accounting system', payroll: 'Payroll system', crm: 'Customer records',
      headcount: 'Billed for {billed} people, payroll shows {paid}', plans: { standard: 'Standard plan', plus: 'Plus plan' }, contact: 'contact on file',
      resolution: 'Resolution', res: { credit: 'Credit it on the next invoice', bill: 'Bill the difference', none: 'No change needed' },
      save: 'Save the resolution', backQueue: 'Back to the queue',
      logLine: { opened: 'Exception opened by the nightly check' }, logRes: 'Resolved: {res}',
      historyNote: 'Every change is recorded with who made it and when.',
      rulesCaption: 'Checks run on every account', check: 'Check', when: 'When',
      rules: [['Billed headcount matches payroll headcount', 'Every night'], ['Every off-cycle payroll has its fee', 'Every night'], ['Credits asked for by email are tracked', 'As they arrive']],
      addRule: 'Add a check',
      real: { rule: 'In the real product this would open a form to add a new check, which a person reviews before it runs.' },
    },
    es: {
      app: 'Mesa de excepciones de facturación',
      tabs: { queue: 'Cola', detail: 'Excepción', history: 'Historial', rules: 'Revisiones' },
      sortLabel: 'Ordenar la cola', oldest: 'Más antiguas primero', biggest: 'Más grandes primero',
      kinds: { headcount: 'Los empleados facturados no coinciden con la nómina', credit: 'Pidieron un crédito', offcycle: 'Nómina fuera de ciclo sin facturar' },
      days: '{n} días abierta', open: 'Abierta', done: 'Resuelta', openIt: 'Ver',
      accounting: 'Sistema contable', payroll: 'Sistema de nómina', crm: 'Registro de clientes',
      headcount: 'Se facturaron {billed} personas, la nómina muestra {paid}', plans: { standard: 'Plan Estándar', plus: 'Plan Plus' }, contact: 'contacto registrado',
      resolution: 'Resolución', res: { credit: 'Darle crédito en la próxima factura', bill: 'Facturar la diferencia', none: 'No hace falta cambiar nada' },
      save: 'Guardar la resolución', backQueue: 'Volver a la cola',
      logLine: { opened: 'Excepción abierta por la revisión nocturna' }, logRes: 'Resuelta: {res}',
      historyNote: 'Cada cambio queda registrado con quién lo hizo y cuándo.',
      rulesCaption: 'Revisiones que se hacen en cada cuenta', check: 'Revisión', when: 'Cuándo',
      rules: [['Los empleados facturados coinciden con la nómina', 'Cada noche'], ['Cada nómina fuera de ciclo tiene su cargo', 'Cada noche'], ['Se da seguimiento a los créditos pedidos por correo', 'Al llegar']],
      addRule: 'Agregar una revisión',
      real: { rule: 'En el producto real, esto abriría un formulario para agregar una revisión nueva, que una persona aprueba antes de que corra.' },
    },
  },
};
