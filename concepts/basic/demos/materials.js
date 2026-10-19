// Material list demo: one sample document read, the open questions, the
// material list that fills in as they are answered, and the export. A
// made-up sample house; quantities follow simple fixed rules.
import { ui, esc, fmt } from './kit.js';

const Q = { garage: ['yes', 'no'], deck: ['w4', 'w6'], pitch: ['p4', 'p6'] };
// Each section: [id, pieces, linear feet] given the answers so far.
const SECTIONS = a => [
  ['floor', 68, 1040, true],
  ['walls', 204, 2215, true],
  ['roof', a.pitch ? (a.pitch === 'p6' ? 61 : 54) : null, a.pitch ? (a.pitch === 'p6' ? 1085 : 980) : null, !!a.pitch],
  ['porch', a.deck ? (a.deck === 'w4' ? 54 : 36) : null, a.deck ? 380 : null, !!a.deck],
  ['garage', a.garage === 'yes' ? 38 : null, a.garage === 'yes' ? 610 : null, a.garage !== undefined],
];

export default {
  key: 'materials',
  tabs: ['docs', 'questions', 'list', 'export'],
  init: () => ({ ans: {} }),
  view: {
    docs: (s, t) => `<ul class="dm-list"><li><span class="who"><b>sample_schedule.xlsx</b><span>${esc(t.readOk)}</span></span>${ui.chip(t.read, 'ok')}</li></ul>`
      + `<div class="dm-row">${ui.real(t.add, 'upload')}${ui.btn(t.goQuestions, 'goto', 'questions', { kind: 'main' })}</div>` + ui.p(t.docsNote),
    questions: (s, t) => {
      const left = Object.keys(Q).filter(q => !s.ans[q]).length;
      return ui.p(left ? fmt(t.left, { n: left }) : t.allAnswered, 'strong')
        + `<ul class="dm-list">${Object.entries(Q).map(([q, opts]) => `<li><span class="who"><b>${esc(t.q[q])}</b><span>${esc(t.why[q])}</span></span>
          <span class="dm-row" role="group" aria-label="${esc(t.q[q])}">${opts.map(o => ui.btn(t.opt[o], 'answer', `${q}:${o}`, { pressed: s.ans[q] === o })).join('')}</span></li>`).join('')}</ul>`
        + (left ? '' : `<div class="dm-row">${ui.btn(t.seeList, 'goto', 'list', { kind: 'main' })}</div>`);
    },
    list: (s, t) => ui.table(t.listCaption, [t.section, t.pieces, t.lf, t.status], SECTIONS(s.ans).map(([id, pcs, lf, known]) => {
      const off = id === 'garage' && s.ans.garage === 'no';
      return { cls: known ? '' : 'flag', cells: [esc(t.sections[id]), off ? '' : pcs ?? '?', off ? '' : lf ?? '?',
        off ? ui.chip(t.notOnPlan, 'info') : known ? ui.chip(t.filled, 'ok') : ui.chip(t.needsPerson, 'warn')] };
    }), { numeric: [1, 2] }) + ui.p(t.listNote),
    export: (s, t) => {
      const left = Object.keys(Q).filter(q => !s.ans[q]).length;
      return ui.tiles([[t.answered, `${Object.keys(Q).length - left} / ${Object.keys(Q).length}`], [t.state, left ? t.notReady : t.ready]])
        + `<div class="dm-row">${left ? ui.btn(t.goQuestions, 'goto', 'questions') : ''}${ui.real(t.download, 'workbook', left ? '' : 'main')}</div>` + ui.p(t.exportNote);
    },
  },
  act: {
    goto: (s, tab) => tab,
    answer: (s, v) => { const [q, o] = v.split(':'); if (s.ans[q] === o) delete s.ans[q]; else s.ans[q] = o; },
  },
  t: {
    en: {
      app: 'Material lists from drawings',
      tabs: { docs: 'Documents', questions: 'Questions', list: 'Material list', export: 'Export' },
      readOk: 'Sample house · read OK: 2 tabs, 14 framing members', read: 'Read', add: 'Add plans or a schedule',
      goQuestions: 'Answer the open questions', docsNote: 'The tool reads the plans and schedules it is given and asks about anything they do not say.',
      left: '{n} questions left for you', allAnswered: 'All questions answered.',
      q: { garage: 'Does this house have a garage?', deck: 'Porch decking: which board width?', pitch: 'Roof pitch over the porch?' },
      why: { garage: 'The plans do not show one either way.', deck: 'The schedule leaves the width blank.', pitch: 'Not marked on the drawing.' },
      opt: { yes: 'Yes', no: 'No', w4: '4 inch', w6: '6 inch', p4: '4 in 12', p6: '6 in 12' },
      seeList: 'See the material list',
      listCaption: 'Material list by section', section: 'Section', pieces: 'Pieces', lf: 'Linear feet', status: 'Status',
      sections: { floor: 'First floor system', walls: 'Wall framing', roof: 'Roof system', porch: 'Porch', garage: 'Garage' },
      filled: 'Filled', needsPerson: 'Needs a person', notOnPlan: 'Not on this plan',
      listNote: 'Each line is traced back to the drawing or answer it came from.',
      answered: 'Questions answered', state: 'Workbook', notReady: 'Not ready yet', ready: 'Ready for review',
      download: 'Download the workbook', exportNote: 'A person reviews the list before anything is ordered.',
      real: {
        upload: 'In the real product this would let you upload drawings or a schedule for the tool to read.',
        workbook: 'In the real product this would download the material list as a spreadsheet for review.',
      },
    },
    es: {
      app: 'Listas de materiales desde planos',
      tabs: { docs: 'Documentos', questions: 'Preguntas', list: 'Lista de materiales', export: 'Exportar' },
      readOk: 'Casa de ejemplo · leído: 2 pestañas, 14 piezas de estructura', read: 'Leído', add: 'Agregar planos o un cronograma',
      goQuestions: 'Responder las preguntas abiertas', docsNote: 'La herramienta lee los planos y cronogramas que recibe y pregunta lo que no dicen.',
      left: 'Te quedan {n} preguntas', allAnswered: 'Todas las preguntas respondidas.',
      q: { garage: '¿Esta casa tiene garaje?', deck: 'Piso del porche: ¿qué ancho de tabla?', pitch: '¿Pendiente del techo sobre el porche?' },
      why: { garage: 'Los planos no lo muestran.', deck: 'El cronograma deja el ancho en blanco.', pitch: 'No está marcada en el plano.' },
      opt: { yes: 'Sí', no: 'No', w4: '4 pulgadas', w6: '6 pulgadas', p4: '4 en 12', p6: '6 en 12' },
      seeList: 'Ver la lista de materiales',
      listCaption: 'Lista de materiales por sección', section: 'Sección', pieces: 'Piezas', lf: 'Pies lineales', status: 'Estado',
      sections: { floor: 'Sistema del primer piso', walls: 'Estructura de muros', roof: 'Sistema de techo', porch: 'Porche', garage: 'Garaje' },
      filled: 'Completo', needsPerson: 'Necesita a una persona', notOnPlan: 'No está en este plano',
      listNote: 'Cada línea se puede rastrear hasta el plano o la respuesta de donde salió.',
      answered: 'Preguntas respondidas', state: 'Libro de trabajo', notReady: 'Aún no está listo', ready: 'Listo para revisar',
      download: 'Descargar el libro de trabajo', exportNote: 'Una persona revisa la lista antes de pedir cualquier material.',
      real: {
        upload: 'En el producto real, esto permitiría cargar planos o un cronograma para que la herramienta los lea.',
        workbook: 'En el producto real, esto descargaría la lista de materiales en una hoja de cálculo para revisarla.',
      },
    },
  },
};
