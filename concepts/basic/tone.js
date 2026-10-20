/* Professional wording for the trial (Alex, 2026-10-19: replace casual lines
   with plain, professional business language). The live site reads the same
   shared content files, so the trial swaps exact sentences in a copy of the
   content instead of editing those files. Same meaning and facts; nothing new
   is claimed. A sentence that is not listed passes through unchanged. */
const SWAP = {
  en: {
    'Somewhere in your business, right now, a capable person is:': 'In many service businesses, capable staff are still:',
    'Chasing approvals across inboxes and spreadsheets': 'Following up on approvals across inboxes and spreadsheets',
    'Before you buy another tool, find the work that is actually worth changing.': 'Before you invest in another tool, identify the work most worth improving.',
    'Not in a public chatbot.': 'It is never entered into a public AI chatbot.',
    'It is probably not for you if': 'It is not the right fit if',
    'You are a very small shop with little process.': 'You are a very small business with few established processes.',
    'What if you do not find much?': 'What if there are few opportunities?',
    // Solution Design in place of the audit (Alex, 2026-10-20).
    'In about two weeks, the AI Automation Audit maps the workflows behind your operation, quantifies the bottlenecks, and gives your operations, finance, and IT leaders a defensible first move.':
      'In about two weeks, Solution Design maps the workflows behind your operation, quantifies the bottlenecks, and designs the solution you will own, with a clear plan and price to build it.',
    'Book a 30-minute fit call': 'Book a free discovery call',
    'Book a fit call': 'Book a discovery call',
    'on the fit call': 'on the discovery call',
    'Read-only audit': 'Read-only while we design',
    'nothing changes while we diagnose': 'nothing changes in your systems',
    'from walkthrough to roadmap': 'from walkthrough to solution design',
    'The roadmap is yours. Build it with KHIPUAI, your team, or anyone else.': 'The design is yours. Build it with KHIPUAI, your team, or anyone else.',
    'A full audit trail': 'A complete activity record',
    'Nothing is automated or changed during the audit.': 'Nothing changes in your systems while we design.',
    'Access is read-only during the audit.': 'Access is read-only while we design.',
    'The audit says so.': 'We tell you so.',
    'The roadmap is yours to act on with anyone, including your own team.': 'The design is yours to act on with anyone, including your own team.',
    'What happens after the audit?': 'What happens after Solution Design?',
    'You decide after seeing the roadmap.': 'You decide after seeing the design and the price.',
    'KHIPUAI is an Ontario, Canada studio serving clients remotely across the United States and Canada.': 'KHIPUAI is an Ontario, Canada studio serving clients across the United States and Canada.',
    'wil@khipuai.co': 'hello@khipuai.co',
    'That honesty is the product.': 'A candid answer is part of the value.',
    'and we will tell you honestly if it is worth automating.': 'and we will give you a candid assessment of whether it is worth automating.',
  },
  es: {
    'En algún lugar de tu negocio, ahora mismo, una persona capaz está:': 'En muchas empresas de servicios, personas capaces siguen:',
    'Persiguiendo aprobaciones entre bandejas de entrada y hojas de cálculo': 'Dando seguimiento a aprobaciones entre bandejas de entrada y hojas de cálculo',
    'Antes de comprar otra herramienta, encuentra el trabajo que realmente vale la pena cambiar.': 'Antes de invertir en otra herramienta, identifica el trabajo que más conviene mejorar.',
    'No van a un chatbot público.': 'Nunca se introducen en un chatbot público de IA.',
    'Probablemente no es para ti si': 'No es la opción adecuada si',
    'y te diremos con honestidad si vale la pena automatizarlo.': 'y te daremos una evaluación franca de si vale la pena automatizarlo.',
    'KHIPUAI es un estudio de Ontario, Canadá, que atiende de forma remota a clientes en Estados Unidos y Canadá.': 'KHIPUAI es un estudio de Ontario, Canadá, que atiende a clientes en Estados Unidos y Canadá.',
    'wil@khipuai.co': 'hello@khipuai.co',
    '¿Y si no encuentras mucho?': '¿Qué pasa si hay pocas oportunidades?',
    'En unas dos semanas, la Auditoría de Automatización con IA mapea los flujos de tu operación, cuantifica los cuellos de botella y entrega a operaciones, finanzas y TI un primer paso defendible.':
      'En unas dos semanas, el Diseño de la solución mapea los flujos de tu operación, cuantifica los cuellos de botella y diseña la solución que será tuya, con un plan y un precio claros para construirla.',
    'Agenda una llamada de encaje de 30 minutos': 'Agenda una llamada de descubrimiento gratuita',
    'En la llamada de encaje': 'En la llamada de descubrimiento',
    'Auditoría de solo lectura': 'Solo lectura mientras diseñamos',
    'nada cambia mientras diagnosticamos': 'nada cambia en tus sistemas',
    'del recorrido a la hoja de ruta': 'del recorrido al diseño de la solución',
    'La hoja de ruta es tuya. Constrúyela con KHIPUAI, con tu equipo o con quien quieras.': 'El diseño es tuyo. Constrúyelo con KHIPUAI, con tu equipo o con quien quieras.',
    'Registro de auditoría completo': 'Registro completo de actividad',
    'Nada se automatiza ni se cambia durante la auditoría; primero es el diagnóstico.': 'Nada cambia en tus sistemas mientras diseñamos.',
    'Durante la auditoría el acceso es de solo lectura.': 'Mientras diseñamos, el acceso es de solo lectura.',
    'No. La hoja de ruta es tuya. Si construyes con KHIPUAI dentro de los 30 días, la tarifa de la auditoría se acredita a ese trabajo.': 'No. El diseño es tuyo. Si construyes con KHIPUAI dentro de los 30 días, la tarifa del Diseño de la solución se acredita a ese trabajo.',
    '¿Qué pasa después de la auditoría?': '¿Qué pasa después del Diseño de la solución?',
    'Tú decides después de ver la hoja de ruta.': 'Tú decides después de ver el diseño y el precio.',
    'Entonces te lo digo con honestidad, y habrás invertido una pequeña tarifa acordada para saber que tu operación es más eficiente que la mayoría. Ese es un buen problema que tener.':
      'Te lo decimos con franqueza. Una respuesta franca es parte del valor. Si no hay mucho que valga la pena automatizar, habrás invertido una tarifa pequeña y acordada para saberlo, en lugar de un año.',
  },
};

// A copy of the content with each listed sentence replaced, wherever it sits
// (a whole string or a sentence inside a longer one).
export function tone(C, lang) {
  const swaps = Object.entries(SWAP[lang] || {});
  const walk = v => typeof v === 'string' ? swaps.reduce((s, [a, b]) => s.split(a).join(b), v)
    : Array.isArray(v) ? v.map(walk)
    : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, walk(x)]))
    : v;
  return walk(C);
}
export const SWAPS = SWAP;
