/* Project cards for the trial's portfolio (concepts/basic/ only; the live
   homepage keeps its table from shared/content.js).

   Five projects reuse the shared portfolio wording word for word (title, what
   it does, who approves) by index into C.portfolio.items. Each card adds one
   "why we built it" line, and two projects are new here. Everything marked
   NEW below is draft copy awaiting Wil's fact check: no client names, no
   results, no numbers.

   Screenshots: made-up or demo data only, client branding hidden. Only the
   payroll screen has been captured and checked; the rest show a placeholder
   until screenshots are approved (see the report for why). */
export const PROJECTS = {
  en: {
    why: 'Why we built it',
    learn: 'Learn more',
    close: 'Close',
    pending: 'Screenshot not shown yet.',
    shotNote: 'Screens show sample or empty data. Client names are removed.',
    items: [
      { key: 'payroll', from: 0, shots: ['payroll-wage-determinations.jpg'],
        alt: ['The wage determinations screen: look up prevailing wage rates by state, county and type of construction'],
        why: 'NEW: Reports like these were assembled by hand, so an underpaid worker could slip through to a signed report.' },
      { key: 'hub', shots: [],
        t: 'Operations web hub',
        d: 'NEW: One place for a team’s internal tools: billing exceptions, a guided monthly billing close, client profiles and dashboards.',
        why: 'NEW: So staff stop switching between separate tools and spreadsheets for every task.',
        who: 'NEW: Drafts only. Posting stays manual in the accounting system.' },
      { key: 'workbench', from: 3, shots: [],
        why: 'NEW: Exceptions were tracked on a separate board, away from the customer details needed to fix them.' },
      { key: 'review', shots: [],
        t: 'Monthly billing review',
        d: 'NEW: Prepares each month’s invoice drafts and checks every one against the pricing rules, with the evidence behind each finding.',
        why: 'NEW: So the monthly close starts from checked drafts instead of a blank spreadsheet.',
        who: 'NEW: A person reviews every finding. Drafts go to the accounting system and posting happens there.' },
      { key: 'support', from: 4, shots: [],
        why: 'NEW: So urgent requests reach the right person first instead of waiting in one shared inbox.' },
      { key: 'materials', from: 1, shots: [],
        why: 'NEW: Building a material list from plans by hand is slow and easy to get wrong.' },
      { key: 'whatsapp', from: 2, shots: [],
        why: 'NEW: Customers ask for prices at all hours, often outside office time.' },
    ],
  },
  es: {
    why: 'Por qué lo construimos',
    learn: 'Ver más',
    close: 'Cerrar',
    pending: 'Captura aún no disponible.',
    shotNote: 'Las pantallas muestran datos de ejemplo o vacíos. Los nombres de clientes se eliminaron.',
    items: [
      { key: 'payroll', from: 0, shots: ['payroll-wage-determinations.jpg'],
        alt: ['La pantalla de determinaciones salariales: consulta de tarifas por estado, condado y tipo de construcción'],
        why: 'NEW: Estos reportes se armaban a mano, y un trabajador mal pagado podía pasar a un reporte firmado.' },
      { key: 'hub', shots: [],
        t: 'Centro web de operaciones',
        d: 'NEW: Un solo lugar para las herramientas internas del equipo: excepciones de facturación, un cierre mensual guiado, perfiles de clientes y tableros.',
        why: 'NEW: Para que el equipo deje de saltar entre herramientas y hojas de cálculo distintas para cada tarea.',
        who: 'NEW: Solo borradores. El asiento sigue siendo manual en el sistema contable.' },
      { key: 'workbench', from: 3, shots: [],
        why: 'NEW: Las excepciones se seguían en un tablero aparte, lejos de los datos del cliente necesarios para resolverlas.' },
      { key: 'review', shots: [],
        t: 'Revisión mensual de facturación',
        d: 'NEW: Prepara los borradores de factura del mes y revisa cada uno contra las reglas de precios, con la evidencia de cada hallazgo.',
        why: 'NEW: Para que el cierre mensual empiece con borradores revisados y no con una hoja en blanco.',
        who: 'NEW: Una persona revisa cada hallazgo. Los borradores van al sistema contable y el asiento se hace ahí.' },
      { key: 'support', from: 4, shots: [],
        why: 'NEW: Para que lo urgente llegue primero a la persona correcta y no espere en una bandeja compartida.' },
      { key: 'materials', from: 1, shots: [],
        why: 'NEW: Armar una lista de materiales desde planos a mano es lento y fácil de equivocar.' },
      { key: 'whatsapp', from: 2, shots: [],
        why: 'NEW: Los clientes piden precios a cualquier hora, muchas veces fuera del horario de oficina.' },
    ],
  },
};

// Drops the NEW: review marker for display; the marker stays in the source so
// draft copy is easy to find for the fact check.
export const shown = s => String(s).replace(/^NEW: /, '');
