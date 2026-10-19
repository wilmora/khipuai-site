// Certified payroll demo: dashboard, job rates with a pay check, weekly
// reports and the wage determination lookup. Made-up jobs and rates.
import { ui, esc, fmt, money } from './kit.js';

const JOBS = {
  j1: { name: 'Library rewire (demo)', wd: 'WD DEMO-0427', rates: { elec: [39.0, 5.8], lab: [22.0, 5.4] } },
  j2: { name: 'Water plant, phase 2 (demo)', wd: 'WD DEMO-0114', rates: { pipe: [41.5, 9.2], oper: [37.0, 8.1], lab: [23.5, 5.4] } },
};
const WEEKS = [[4, '2026-10-09'], [3, '2026-10-02', true], [2, '2026-09-25'], [1, '2026-09-18']];
const FLAGS = [['a', 'Alder Electric (demo)', 'j1'], ['b', 'Birch Mechanical (demo)', 'j2']];
const LOOKUP = { IL: ['Cook', 'Sangamon'], MO: ['Greene', 'Jackson'], TX: ['Harris', 'Travis'] };

export default {
  key: 'payroll',
  tabs: ['dash', 'rates', 'reports', 'lookup'],
  init: () => ({ reviewed: {}, job: 'j1', trade: 'elec', paid: '', st: 'IL', county: 'Cook', kind: 'building', found: false }),
  view: {
    dash: (s, t) => {
      const open = FLAGS.filter(([id]) => !s.reviewed[id]).length;
      return ui.tiles([[t.ready, '2 / 3'], [t.inbox, '0'], [t.month, '7'], [t.toCheck, String(open)]])
        + ui.h(t.wdHead)
        + `<ul class="dm-list">${FLAGS.map(([id, who, job]) => `<li><span class="who"><b>${esc(who)}</b><span>${esc(JOBS[job].name)}: ${esc(t.flag[id])}</span></span>
          ${s.reviewed[id] ? ui.chip(t.reviewedChip, 'ok') : ui.chip(t.openChip, 'warn')}
          ${ui.btn(s.reviewed[id] ? t.undo : t.markReviewed, 'review', id)}</li>`).join('')}</ul>`;
    },
    rates: (s, t, lang) => {
      const job = JOBS[s.job], [base, fringe] = job.rates[s.trade] || Object.values(job.rates)[0];
      const paid = parseFloat(s.paid), total = base + fringe;
      const result = !s.paid ? ui.p(t.payHint)
        : isNaN(paid) ? ui.p(t.payBad)
        : paid + 0.005 >= total ? `<p class="dm-p strong">${ui.chip(t.meets, 'ok')} ${esc(fmt(t.meetsLine, { total: money(total, lang) }))}</p>`
        : `<p class="dm-p strong">${ui.chip(t.under, 'bad')} ${esc(fmt(t.underLine, { gap: money(total - paid, lang) }))}</p>`;
      return `<div class="dm-row">${ui.select(t.job, 'job', Object.entries(JOBS).map(([id, j]) => [id, j.name]), s.job)}${ui.chip(job.wd, 'info')}</div>`
        + ui.table(t.ratesCaption, [t.trade, t.base, t.fringe, t.total], Object.entries(job.rates).map(([tr, [b, f]]) => ({
          cells: [esc(t.trades[tr]), money(b, lang), money(f, lang), `<b>${money(b + f, lang)}</b>`] })), { numeric: [1, 2, 3] })
        + `<div class="dm-box result">${ui.h(t.checkHead)}<div class="dm-row">
          ${ui.select(t.trade, 'trade', Object.keys(job.rates).map(tr => [tr, t.trades[tr]]), s.trade)}
          <label class="dm-field"><span>${esc(t.paid)}</span><input type="number" inputmode="decimal" min="0" step="0.01" data-input="paid" value="${esc(s.paid)}" placeholder="40.00"></label></div>${result}</div>`;
    },
    reports: (s, t) => `<div class="dm-row between">${ui.p(fmt(t.reportsFor, { job: JOBS.j1.name }), 'strong')}${ui.real(t.produce, 'produce', 'main')}</div>`
      + `<ul class="dm-list">${WEEKS.map(([n, end, none]) => `<li><span class="who"><b>${esc(fmt(t.reportNo, { n }))}</b><span>${esc(fmt(t.weekEnding, { end }))}</span></span>
        ${none ? ui.chip(t.noWork, 'info') : ui.chip(t.filed, 'ok')}${ui.real(t.pdf, 'pdf', 'quiet')}</li>`).join('')}</ul>`
      + ui.p(t.reportsNote),
    lookup: (s, t) => `<div class="dm-row">
        ${ui.select(t.state, 'st', Object.keys(LOOKUP).map(k => [k, t.states[k]]), s.st)}
        ${ui.select(t.county, 'county', LOOKUP[s.st].map(c => [c, c]), s.county)}
        ${ui.select(t.kind, 'kind', ['building', 'heavy', 'highway', 'residential'].map(k => [k, t.kinds[k]]), s.kind)}
        ${ui.btn(t.search, 'search', '', { kind: 'main' })}</div>`
      + (s.found ? `<ul class="dm-list">${[['0427', 3, '2026-08-14'], ['0391', 1, '2026-05-02']].map(([n, mod, date]) =>
          `<li><span class="who"><b>DEMO-${esc(s.st)}${n}</b><span>${esc(fmt(t.resultLine, { county: s.county, kind: t.kinds[s.kind], mod, date }))}</span></span>
          ${ui.real(t.openSam, 'sam', 'quiet')}</li>`).join('')}</ul>` : ui.p(t.lookupHint))
      + ui.p(t.lookupNote),
  },
  act: {
    review: (s, id) => { s.reviewed[id] = !s.reviewed[id]; },
    job: (s, v) => { s.job = v; s.trade = Object.keys(JOBS[v].rates)[0]; s.paid = ''; },
    trade: (s, v) => { s.trade = v; },
    paid: (s, v) => { s.paid = v; },
    st: (s, v) => { s.st = v; s.county = LOOKUP[v][0]; s.found = false; },
    county: (s, v) => { s.county = v; s.found = false; },
    kind: (s, v) => { s.kind = v; s.found = false; },
    search: s => { s.found = true; },
  },
  t: {
    en: {
      app: 'Certified payroll',
      tabs: { dash: 'Dashboard', rates: 'Job rates', reports: 'Weekly reports', lookup: 'Wage lookup' },
      ready: 'Ready to file', inbox: 'Sheets in the inbox', month: 'Reports this month', toCheck: 'Rates to check',
      wdHead: 'Wage determinations to check',
      flag: { a: 'one rate no longer matches the determination', b: 'a new modification was published' },
      openChip: 'To check', reviewedChip: 'Reviewed', markReviewed: 'Mark reviewed', undo: 'Undo',
      job: 'Job', ratesCaption: 'Prevailing wage rates for this job', trade: 'Trade', base: 'Base', fringe: 'Fringe', total: 'Total',
      trades: { elec: 'Electrician', lab: 'Laborer', pipe: 'Pipefitter', oper: 'Equipment operator' },
      checkHead: 'Check one worker’s pay', paid: 'Paid per hour, with fringe',
      payHint: 'Type an hourly amount to compare it with the rate for this trade.',
      payBad: 'Type a number, for example 40.00.',
      meets: 'Meets the rate', meetsLine: 'At or above the {total} required.',
      under: 'Underpaid', underLine: '{gap} an hour short. The report stays on hold until this is fixed.',
      reportsFor: 'Weekly certified reports: {job}', produce: 'Produce next week’s report',
      reportNo: 'Report No. {n}', weekEnding: 'Week ending {end}', noWork: 'No work', filed: 'Filed', pdf: 'Download PDF',
      reportsNote: 'Reports are numbered by week, including weeks with no work, so there are no gaps.',
      state: 'State', county: 'County', kind: 'Construction type', search: 'Search',
      states: { IL: 'Illinois', MO: 'Missouri', TX: 'Texas' },
      kinds: { building: 'Building', heavy: 'Heavy', highway: 'Highway', residential: 'Residential' },
      lookupHint: 'Choose a state, county and type of construction, then Search.',
      resultLine: '{county} County, {kind} · modification {mod} · {date}', openSam: 'Open the source',
      lookupNote: 'Reference only. Nothing here changes a job’s rates.',
      real: {
        produce: 'In the real product this would build next week’s certified report from the payroll data, ready for the contractor to review and sign.',
        pdf: 'In the real product this would download that week’s signed report as a PDF.',
        sam: 'In the real product this would open the official wage determination on SAM.gov.',
      },
    },
    es: {
      app: 'Nómina certificada',
      tabs: { dash: 'Tablero', rates: 'Tarifas de obra', reports: 'Reportes semanales', lookup: 'Consulta salarial' },
      ready: 'Listos para presentar', inbox: 'Planillas recibidas', month: 'Reportes del mes', toCheck: 'Tarifas por revisar',
      wdHead: 'Determinaciones salariales por revisar',
      flag: { a: 'una tarifa ya no coincide con la determinación', b: 'se publicó una nueva modificación' },
      openChip: 'Por revisar', reviewedChip: 'Revisada', markReviewed: 'Marcar revisada', undo: 'Deshacer',
      job: 'Obra', ratesCaption: 'Salarios prevalecientes de esta obra', trade: 'Oficio', base: 'Base', fringe: 'Beneficios', total: 'Total',
      trades: { elec: 'Electricista', lab: 'Obrero', pipe: 'Tubero', oper: 'Operador de equipo' },
      checkHead: 'Revisa el pago de un trabajador', paid: 'Pago por hora, con beneficios',
      payHint: 'Escribe un monto por hora para compararlo con la tarifa de este oficio.',
      payBad: 'Escribe un número, por ejemplo 40.00.',
      meets: 'Cumple la tarifa', meetsLine: 'Igual o mayor que los {total} requeridos.',
      under: 'Pago insuficiente', underLine: 'Faltan {gap} por hora. El reporte queda en espera hasta corregirlo.',
      reportsFor: 'Reportes semanales certificados: {job}', produce: 'Generar el reporte de la próxima semana',
      reportNo: 'Reporte N.º {n}', weekEnding: 'Semana que termina el {end}', noWork: 'Sin trabajo', filed: 'Presentado', pdf: 'Descargar PDF',
      reportsNote: 'Los reportes se numeran por semana, incluidas las semanas sin trabajo, para que no haya huecos.',
      state: 'Estado', county: 'Condado', kind: 'Tipo de construcción', search: 'Buscar',
      states: { IL: 'Illinois', MO: 'Misuri', TX: 'Texas' },
      kinds: { building: 'Edificación', heavy: 'Pesada', highway: 'Carreteras', residential: 'Residencial' },
      lookupHint: 'Elige estado, condado y tipo de construcción, y luego Buscar.',
      resultLine: 'Condado de {county}, {kind} · modificación {mod} · {date}', openSam: 'Abrir la fuente',
      lookupNote: 'Solo de referencia. Nada aquí cambia las tarifas de una obra.',
      real: {
        produce: 'En el producto real, esto armaría el reporte certificado de la próxima semana con los datos de nómina, listo para que el contratista lo revise y firme.',
        pdf: 'En el producto real, esto descargaría en PDF el reporte firmado de esa semana.',
        sam: 'En el producto real, esto abriría la determinación salarial oficial en SAM.gov.',
      },
    },
  },
};
