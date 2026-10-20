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
    'What if you do not find much?': 'What if the audit finds few opportunities?',
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
    '¿Y si no encuentras mucho?': '¿Qué pasa si la auditoría encuentra pocas oportunidades?',
    'Entonces te lo digo con honestidad, y habrás invertido una pequeña tarifa acordada para saber que tu operación es más eficiente que la mayoría. Ese es un buen problema que tener.':
      'La auditoría lo dice con franqueza. Una respuesta franca es parte del valor: habrás invertido una tarifa pequeña y acordada para confirmar que tu operación es más eficiente que la mayoría.',
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
