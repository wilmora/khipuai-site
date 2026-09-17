/* =========================================================================
   The quote engine.

   Replaces the fixed two-tier pricing. A visitor identifies the kind of work
   that is stuck, answers a few scoping questions, and gets a recommended
   starting point plus a price range for the audit.

   TWO BRAINS, ONE INTERFACE
   -------------------------
   askQuote() is the only thing the page calls. Behind it:

     local  - a deterministic rate table. Runs in the page, no network, no
              cost, and it cannot invent a number. This is what runs today.
     remote - posts the answers to an endpoint that talks to an LLM and
              returns the same shape. Switched on by setting QUOTE_API.

   The remote brain is NOT wired to a key here, and must never be. An API key
   in client-side code is public the moment the page ships: anyone can read it
   from view-source and spend against it. The key belongs on a server that
   this page posts to. See README-quote.md for what that needs.

   WHY THE LOCAL BRAIN STAYS EVEN AFTER THE AI IS LIVE
   --------------------------------------------------
   It is the fallback. If the endpoint is down, rate-limited, or the visitor
   is offline, the page still quotes rather than showing an error where a
   price should be. It is also the reference: if the model ever returns a
   number far from the table, that is worth knowing about.
   ========================================================================= */

/* Set this to your endpoint to switch on the conversational brain.
   Leave null and everything runs locally. */
export const QUOTE_API = null;

/* ---- regions --------------------------------------------------------------
   Genuinely different prices by market, not just currency conversion.

   The numbers below are PLACEHOLDERS with the North America tier set to the
   $2,500 / $5,000 the site has been charging. Every other region is a
   multiplier off that and needs Wil to set it - pricing is his decision, and
   a number invented here would look authoritative on a public page.

   EU note: the EU Geo-blocking Regulation (2018/302) restricts offering
   different terms based on a customer's nationality or place of residence
   for certain services. Charging an EU buyer a different price from a US one
   is generally fine; refusing to serve them, or varying the price between EU
   member states, is where it bites. Worth a lawyer's eye before Europe goes
   live rather than after. */
export const REGIONS = {
  na:    { label: { en:'United States & Canada', es:'Estados Unidos y Canadá' }, currency:'USD', symbol:'$', mult:1.00,
           tax: { en:'plus GST/HST where applicable', es:'más GST/HST cuando aplique' } },
  latam: { label: { en:'Latin America', es:'América Latina' }, currency:'USD', symbol:'$', mult:0.60, tax:null, placeholder:true },
  eu:    { label: { en:'Europe & UK', es:'Europa y Reino Unido' }, currency:'EUR', symbol:'€', mult:0.95,
           tax: { en:'plus VAT', es:'más IVA' }, placeholder:true },
  row:   { label: { en:'Rest of world', es:'Resto del mundo' }, currency:'USD', symbol:'$', mult:0.85, tax:null, placeholder:true },
};

/* Region labels and tax notes are {en,es} pairs; this picks the right one and
   passes plain strings straight through. */
const pick = (v, lang) => (v && typeof v === 'object') ? (v[lang] || v.en) : v;

/* ---- what drives the price -------------------------------------------------
   Three things, because they are the three that actually change the work:
   how many distinct workflows have to be mapped, how tangled the systems are,
   and how much of it needs to survive a finance or audit review. */
const Q = {
  en: [
    { id:'goal', q:'Where is manual work hurting the most?', options:[
      {v:'finance',label:'Finance and operations',weight:0},
      {v:'documents',label:'Documents and specifications',weight:0},
      {v:'customers',label:'Customer conversations',weight:0},
      {v:'visibility',label:'Internal visibility and approvals',weight:0},
      {v:'multiple',label:'Several areas or not sure',weight:0}]},
    { id:'scope', q:'How many separate workflows do you want looked at?', options:[
      {v:'one',label:'One',weight:0},{v:'few',label:'Two or three',weight:1},
      {v:'dept',label:'A whole department',weight:2},{v:'multi',label:'Several departments',weight:3}]},
    { id:'systems', q:'How many systems does that work touch?', options:[
      {v:'one',label:'One or two',weight:0},{v:'some',label:'Three to five',weight:1},
      {v:'many',label:'More than five',weight:2},{v:'dunno',label:'Honestly, not sure',weight:1}]},
    { id:'rigour', q:'Does the output have to stand up to a finance or audit review?', options:[
      {v:'no',label:'No, internal use',weight:0},{v:'some',label:'Some of it',weight:1},
      {v:'yes',label:'Yes, all of it',weight:2}]},
  ],
  es: [
    { id:'goal', q:'¿Dónde está afectando más el trabajo manual?', options:[
      {v:'finance',label:'Finanzas y operaciones',weight:0},
      {v:'documents',label:'Documentos y especificaciones',weight:0},
      {v:'customers',label:'Conversaciones con clientes',weight:0},
      {v:'visibility',label:'Visibilidad interna y aprobaciones',weight:0},
      {v:'multiple',label:'Varias áreas o no estoy seguro',weight:0}]},
    { id:'scope', q:'¿Cuántos flujos de trabajo distintos quieres revisar?', options:[
      {v:'one',label:'Uno',weight:0},{v:'few',label:'Dos o tres',weight:1},
      {v:'dept',label:'Un departamento entero',weight:2},{v:'multi',label:'Varios departamentos',weight:3}]},
    { id:'systems', q:'¿Cuántos sistemas toca ese trabajo?', options:[
      {v:'one',label:'Uno o dos',weight:0},{v:'some',label:'De tres a cinco',weight:1},
      {v:'many',label:'Más de cinco',weight:2},{v:'dunno',label:'La verdad, no estoy seguro',weight:1}]},
    { id:'rigour', q:'¿El resultado tiene que resistir una revisión financiera o de auditoría?', options:[
      {v:'no',label:'No, es uso interno',weight:0},{v:'some',label:'Una parte',weight:1},
      {v:'yes',label:'Sí, todo',weight:2}]},
  ],
};
const REGION_Q = { en:'Where is the business based?', es:'¿Dónde está el negocio?' };

/* The region question is appended rather than written twice, so a region added
   to REGIONS appears in both languages automatically. */
export function getQuestions(lang = 'en'){
  return [...(Q[lang] || Q.en), {
    id: 'region', q: REGION_Q[lang] || REGION_Q.en,
    options: Object.entries(REGIONS).map(([v, r]) => ({ v, label: pick(r.label, lang), weight: 0 })),
  }];
}
export const QUESTIONS = getQuestions('en');

const BASE = 2500;          // the North America starting point, unchanged
const PER_WEIGHT = 550;     // each point of complexity

const MATCHES = {
  en: {
    finance: ['Finance and operations', 'A role-aware operations hub connecting billing, support, reporting, and approvals across existing systems.'],
    documents: ['Document-heavy decisions', 'A reviewable workflow that turns PDFs, drawings, specifications, and spreadsheets into structured outputs with source evidence.'],
    customers: ['Customer conversations', 'A customer-facing assistant that answers questions, applies quoting rules, captures demand, and hands sensitive decisions to a person.'],
    visibility: ['Internal operations hub', 'A role-aware portal bringing workflows, documents, milestones, dashboards, and audit history into one working surface.'],
    multiple: ['Cross-system operations', 'A workflow audit that finds the strongest first move across the tools, handoffs, and teams already involved.'],
  },
  es: {
    finance: ['Finanzas y operaciones', 'Un centro de operaciones por roles que conecta facturación, soporte, reportes y aprobaciones entre los sistemas existentes.'],
    documents: ['Decisiones basadas en documentos', 'Un flujo revisable que convierte PDFs, planos, especificaciones y hojas de cálculo en resultados estructurados con evidencia de la fuente.'],
    customers: ['Conversaciones con clientes', 'Un asistente de atención que responde, aplica reglas de cotización, captura demanda y entrega las decisiones sensibles a una persona.'],
    visibility: ['Centro interno de operaciones', 'Un portal por roles que reúne flujos, documentos, hitos, tableros e historial de auditoría en un solo lugar de trabajo.'],
    multiple: ['Operaciones entre sistemas', 'Una auditoría de flujos que encuentra el mejor primer paso entre las herramientas, los traspasos y los equipos involucrados.'],
  },
};

function recommendation(answers, weight, lang){
  if (weight >= 5) return lang === 'es' ? 'Auditoría de Automatización por etapas' : 'Staged Automation Audit';
  if (answers.scope === 'one' && answers.systems === 'one' && answers.rigour === 'no') {
    return lang === 'es' ? 'Auditoría enfocada en un flujo' : 'Focused Workflow Audit';
  }
  return lang === 'es' ? 'Auditoría de Automatización con IA' : 'AI Automation Audit';
}

/* Returns a RANGE, not a single number, and never a binding quote.
   The site's whole argument is that a person approves anything that matters;
   a machine handing out a firm price on a public page would contradict it. */
export function localQuote(answers, lang = 'en'){
  const weight = getQuestions(lang).reduce((sum, q) => {
    const opt = q.options.find(o => o.v === answers[q.id]);
    return sum + (opt ? opt.weight : 0);
  }, 0);
  const region = REGIONS[answers.region] || REGIONS.na;
  const match = (MATCHES[lang] || MATCHES.en)[answers.goal] || (MATCHES[lang] || MATCHES.en).multiple;
  const mid  = (BASE + weight * PER_WEIGHT) * region.mult;
  const low  = Math.round(mid * 0.9 / 50) * 50;
  const high = Math.round(mid * 1.15 / 50) * 50;
  return {
    low, high, weight,
    currency: region.currency, symbol: region.symbol,
    regionLabel: pick(region.label, lang), tax: pick(region.tax, lang),
    recommendation: recommendation(answers, weight, lang),
    matchTitle: match[0], matchText: match[1],
    placeholder: !!region.placeholder,
    source: 'local',
    note: weight >= 5
      ? (lang === 'es'
          ? 'A este tamaño la auditoría suele hacerse por etapas, y la definimos en la llamada.'
          : 'At this size the audit is usually staged, and we would scope it on the call.')
      : (lang === 'es'
          ? 'Se confirma en la llamada de descubrimiento, antes de empezar.'
          : 'Confirmed on the discovery call before any work starts.'),
  };
}

/* The single entry point. Falls back to the table whenever the endpoint is
   missing, slow or unhappy - a visitor should never see an error where a
   price should be. */
export async function askQuote(answers, { timeoutMs = 6000, lang = 'en' } = {}){
  if (!QUOTE_API) return localQuote(answers, lang);
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    const r = await fetch(QUOTE_API, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ answers, lang }),
      signal: ctrl.signal,
    });
    clearTimeout(t);
    if (!r.ok) throw new Error('quote endpoint ' + r.status);
    const data = await r.json();
    // Never trust a returned price blindly. If the model comes back with
    // something far outside the table, use the table instead and say so.
    const ref = localQuote(answers, lang);
    if (typeof data.low !== 'number' || typeof data.high !== 'number' ||
        data.low < ref.low * 0.4 || data.high > ref.high * 2.5) {
      return { ...ref, source: 'local-fallback' };
    }
    return { ...ref, ...data, source: 'remote' };
  } catch {
    return { ...localQuote(answers, lang), source: 'local-fallback' };
  }
}

export const fmt = (n, symbol) => symbol + n.toLocaleString('en-US');
