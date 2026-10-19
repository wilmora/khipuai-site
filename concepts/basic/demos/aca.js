// ACA filing demo: monthly IRS codes with plain-word explanations, the forms
// and their release, the client's review and approval, and filing. The codes
// are the IRS's own public 1095-C codes; the people are made up.
import { ui, esc, fmt } from './kit.js';

const M = (a, b) => Array(12).fill(0).map((_, i) => (i < a ? b[0] : i < (b[2] ?? 12) ? b[1] : b[3]));
const PEOPLE = {
  p1: { name: 'Rivera, A. (demo)', l14: M(12, ['1E']), l15: M(12, ['150.00']), l16: M(12, ['2C']) },
  p2: { name: 'Chen, J. (demo)', l14: M(3, ['1H', '1H', 5, '1E']), l15: M(5, ['', '', 5, '150.00']), l16: M(3, ['2A', '2D', 5, '2H']) },
  p3: { name: 'Okafor, M. (demo)', l14: M(12, ['1E']), l15: M(12, ['0.00']), l16: M(12, ['2C']) },
};
const STEPS = 5; // data, codes, preview released, client approved, filed

export default {
  key: 'aca',
  tabs: ['codes', 'forms', 'portal', 'efile'],
  init: () => ({ who: 'p2', half: 0, code: null, step: 2 }),
  view: {
    codes: (s, t) => {
      const p = PEOPLE[s.who], months = t.months.slice(s.half * 6, s.half * 6 + 6);
      const cell = (line, i) => { const v = p[line][s.half * 6 + i];
        return ui.btn(v || t.blank, 'code', `${line}:${v || 'blank'}`, { kind: 'quiet', pressed: s.code === `${line}:${v || 'blank'}` }); };
      const [line, code] = (s.code || '').split(':');
      return `<div class="dm-row">${Object.entries(PEOPLE).map(([id, x]) => ui.btn(x.name, 'who', id, { pressed: s.who === id })).join('')}</div>
        <div class="dm-row between">${ui.p(t.masked)}<span class="dm-row">${ui.btn(t.h1, 'half', '0', { pressed: s.half === 0 })}${ui.btn(t.h2, 'half', '1', { pressed: s.half === 1 })}</span></div>`
        + `<div class="dm-box result" aria-live="polite">${s.code ? `<b>${esc(t.lineName[line])} · ${esc(code === 'blank' ? t.blank : code)}</b><br>${esc(t.explain[line === 'l15' ? (code === 'blank' ? 'l15blank' : 'l15') : code] || '')}` : esc(t.codeHint)}</div>`
        + ui.table(t.gridCaption, [t.month, t.l14, t.l15, t.l16], months.map((m, i) => ({ cells: [esc(m), cell('l14', i), cell('l15', i), cell('l16', i)] })));
    },
    forms: (s, t) => ui.steps(t.steps, s.step)
      + (s.step === 2 ? `<div class="dm-row">${ui.btn(t.release, 'release', '', { kind: 'main' })}</div>` : '')
      + ui.h(t.packet)
      + `<ul class="dm-list"><li><span class="who"><b>1094-C</b><span>${esc(t.transmittal)}</span></span>${ui.real(t.preview, 'preview', 'quiet')}</li>
        ${Object.values(PEOPLE).map(p => `<li><span class="who"><b>1095-C · ${esc(p.name)}</b><span>XXX-XX-XXXX</span></span>${ui.real(t.preview, 'preview', 'quiet')}</li>`).join('')}</ul>
        <div class="dm-row">${ui.real(t.wholePacket, 'packet')}</div>`,
    portal: (s, t) => {
      if (s.step < 3) return ui.p(t.portalWait, 'strong') + `<div class="dm-row">${ui.btn(t.goForms, 'goto', 'forms')}</div>`;
      return `<div class="dm-row between">${ui.p(fmt(t.portalHead, { year: 2025 }), 'strong')}${s.step >= 4 ? ui.chip(t.approvedChip, 'ok') : ui.chip(t.reviewChip, 'warn')}</div>`
        + `<ul class="dm-list">${Object.values(PEOPLE).map(p => `<li><span class="who"><b>${esc(p.name)}</b><span>${esc(t.portalLine)}</span></span>${ui.real(t.view, 'preview', 'quiet')}</li>`).join('')}</ul>`
        + `<div class="dm-row">${s.step === 3 ? ui.btn(t.approve, 'approve', '', { kind: 'main' }) : ''}${ui.real(t.correct, 'upload')}</div>`;
    },
    efile: (s, t) => ui.tiles([[t.taxYear, '2025'], [t.forms1095, String(Object.keys(PEOPLE).length)], [t.status, s.step >= 5 ? t.filedChip : s.step >= 4 ? t.readyChip : t.waitChip]])
      + (s.step >= 4 ? `<div class="dm-row">${ui.real(t.file, 'efile', 'main')}</div>` : ui.p(t.efileWait))
      + ui.p(t.efileNote),
  },
  act: {
    who: (s, id) => { s.who = id; s.code = null; },
    half: (s, h) => { s.half = Number(h); s.code = null; },
    code: (s, c) => { s.code = s.code === c ? null : c; },
    release: s => { s.step = 3; },
    approve: s => { s.step = 4; },
    goto: (s, tab) => tab,
  },
  t: {
    en: {
      app: 'ACA filing',
      tabs: { codes: 'Codes', forms: 'Forms', portal: 'Client portal', efile: 'E-file' },
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      h1: 'Jan to Jun', h2: 'Jul to Dec', month: 'Month', l14: 'Line 14', l15: 'Line 15', l16: 'Line 16', blank: 'blank',
      lineName: { l14: 'Line 14, offer', l15: 'Line 15, employee share', l16: 'Line 16, relief' },
      gridCaption: 'Monthly codes worked out from the payroll upload', masked: 'Codes worked out from the payroll upload. SSNs stay masked.',
      codeHint: 'Click any code to see what it means in plain words.',
      explain: {
        '1E': 'Coverage was offered to the employee, spouse and dependants.',
        '1H': 'No offer of coverage that month.',
        '2A': 'Not employed that month.',
        '2C': 'The employee enrolled in the coverage offered.',
        '2D': 'In a waiting period, so no penalty applies.',
        '2H': 'The offer counts as affordable based on the employee’s rate of pay.',
        blank: 'Correctly blank: no relief code is needed this month.',
        l15: 'The employee’s monthly share of the lowest-cost plan offered.',
        l15blank: 'Blank because no coverage was offered that month.',
      },
      steps: ['Payroll data uploaded', 'Codes checked by staff', 'Preview released to the client', 'Client approved', 'Filed with the IRS'],
      release: 'Release the preview to the client', packet: 'Form 1094-C and the packet',
      transmittal: 'The transmittal for the whole filing', preview: 'Preview', wholePacket: 'Download the whole packet',
      portalWait: 'Nothing to review yet. Release the preview from the Forms tab first.', goForms: 'Go to Forms',
      portalHead: 'Tax year {year}: your forms are ready to review', reviewChip: 'Waiting for you', approvedChip: 'Approved, waiting to be filed',
      portalLine: 'Each code shown with a plain-words explanation', view: 'View',
      approve: 'Approve these forms', correct: 'Send corrected data',
      taxYear: 'Tax year', forms1095: 'Forms 1095-C', status: 'Status',
      waitChip: 'Waiting', readyChip: 'Ready to file', filedChip: 'Filed',
      efileWait: 'Filing opens once the client approves the exact version of the forms.',
      file: 'File with the IRS', efileNote: 'Staff file only the version the client approved.',
      real: {
        preview: 'In the real product this would open the form as a PDF with a PREVIEW watermark.',
        packet: 'In the real product this would download the 1094-C and every 1095-C as one PDF.',
        upload: 'In the real product this would let the client upload a corrected data file, which replaces the preview.',
        efile: 'In the real product this would submit the approved forms to the IRS and record the receipt.',
      },
    },
    es: {
      app: 'Presentación ACA',
      tabs: { codes: 'Códigos', forms: 'Formularios', portal: 'Portal del cliente', efile: 'Presentación' },
      months: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic'],
      h1: 'Ene a Jun', h2: 'Jul a Dic', month: 'Mes', l14: 'Línea 14', l15: 'Línea 15', l16: 'Línea 16', blank: 'vacío',
      lineName: { l14: 'Línea 14, oferta', l15: 'Línea 15, aporte del empleado', l16: 'Línea 16, alivio' },
      gridCaption: 'Códigos mensuales calculados a partir de la carga de nómina', masked: 'Códigos calculados a partir de la carga de nómina. Los SSN siguen ocultos.',
      codeHint: 'Haz clic en cualquier código para ver qué significa en palabras simples.',
      explain: {
        '1E': 'Se ofreció cobertura al empleado, su cónyuge y sus dependientes.',
        '1H': 'No hubo oferta de cobertura ese mes.',
        '2A': 'No trabajaba en la empresa ese mes.',
        '2C': 'El empleado se inscribió en la cobertura ofrecida.',
        '2D': 'En período de espera, así que no aplica penalidad.',
        '2H': 'La oferta se considera asequible según la tarifa de pago del empleado.',
        blank: 'Vacío a propósito: este mes no hace falta código de alivio.',
        l15: 'El aporte mensual del empleado al plan de menor costo ofrecido.',
        l15blank: 'Vacío porque ese mes no se ofreció cobertura.',
      },
      steps: ['Datos de nómina cargados', 'Códigos revisados por el equipo', 'Vista previa enviada al cliente', 'Aprobado por el cliente', 'Presentado al IRS'],
      release: 'Enviar la vista previa al cliente', packet: 'Formulario 1094-C y el paquete',
      transmittal: 'La carátula de toda la presentación', preview: 'Vista previa', wholePacket: 'Descargar el paquete completo',
      portalWait: 'Aún no hay nada que revisar. Primero envía la vista previa desde la pestaña Formularios.', goForms: 'Ir a Formularios',
      portalHead: 'Año fiscal {year}: tus formularios están listos para revisar', reviewChip: 'Esperando tu revisión', approvedChip: 'Aprobado, en espera de presentarse',
      portalLine: 'Cada código con una explicación en palabras simples', view: 'Ver',
      approve: 'Aprobar estos formularios', correct: 'Enviar datos corregidos',
      taxYear: 'Año fiscal', forms1095: 'Formularios 1095-C', status: 'Estado',
      waitChip: 'En espera', readyChip: 'Listo para presentar', filedChip: 'Presentado',
      efileWait: 'La presentación se habilita cuando el cliente aprueba la versión exacta de los formularios.',
      file: 'Presentar al IRS', efileNote: 'El equipo solo presenta la versión que el cliente aprobó.',
      real: {
        preview: 'En el producto real, esto abriría el formulario en PDF con una marca de agua de VISTA PREVIA.',
        packet: 'En el producto real, esto descargaría el 1094-C y cada 1095-C en un solo PDF.',
        upload: 'En el producto real, esto permitiría al cliente cargar un archivo de datos corregido, que reemplaza la vista previa.',
        efile: 'En el producto real, esto enviaría los formularios aprobados al IRS y guardaría el acuse.',
      },
    },
  },
};
