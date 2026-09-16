/* =========================================================================
   The quote bot: a conversation, not a form.

   THE ONE DESIGN DECISION THAT MATTERS
   ------------------------------------
   The model never picks a price. It reads what the visitor writes and fills
   four slots - scope, systems, rigour, region - and the rate table in
   quote.js turns those into a number.

   That is deliberate. An LLM asked to produce a price will eventually produce
   a wrong one, and on a public page a wrong price is a screenshot. It also
   kills the obvious attack: there is no point talking the bot into quoting $1,
   because the bot has no number to give. The worst a hostile visitor achieves
   is a misclassified slot, which moves the estimate one band.

   TWO BRAINS, SAME CONVERSATION
   -----------------------------
   local  - keyword matching. Not AI, and does not pretend to be: it looks for
            words it knows, asks a direct question when it cannot tell, and
            never free-associates. Runs today with no key and no backend.
   remote - posts the transcript to the Worker, which holds the key. Switched
            on by setting QUOTE_API in quote.js.

   Both return the same shape, so the UI does not know or care which answered.
   ========================================================================= */
import { QUOTE_API, localQuote, REGIONS } from './quote.js';

const SLOTS = ['scope', 'systems', 'rigour', 'region'];

/* ---- what the local brain listens for -------------------------------------
   Deliberately small and explicit. A visitor who writes something it does not
   recognise gets asked directly rather than guessed at - a wrong guess here
   moves the price, so silence is better than invention. */
const PATTERNS = {
  en: {
    scope: [
      [/\b(several|multiple|many)\s+(departments|teams)|whole compan|across the (business|company)|every (team|department)/i, 'multi'],
      [/\b(a |one |whole |entire )?(department|team)\b|finance team|ap team|accounts payable team/i, 'dept'],
      [/\b(two|three|2|3|a few|couple|several)\s+(workflows|processes|things)/i, 'few'],
      [/\b(one|a single|just one|1)\s+(workflow|process|thing)|^only\b/i, 'one'],
    ],
    systems: [
      [/\b(more than five|6|7|8|9|10|ten|lots of|loads of|many)\s*(systems|tools|apps)?/i, 'many'],
      [/\b(three|four|five|3|4|5)\s*(systems|tools|apps)/i, 'some'],
      [/\b(one|two|1|2)\s*(systems?|tools?|apps?)|just (excel|a spreadsheet)/i, 'one'],
      [/\b(not sure|no idea|dunno|don'?t know|hard to say)\b/i, 'dunno'],
    ],
    rigour: [
      [/\b(audit|auditor|compliance|regulated|sox|financial statements?|external review)\b/i, 'yes'],
      [/\b(some of it|partly|partially|some are)\b/i, 'some'],
      [/\b(internal|just us|in-house|no audit|not audited)\b/i, 'no'],
    ],
    region: [
      [/\b(canada|canadian|toronto|ontario|vancouver|usa|u\.s\.|united states|america|american|new york|texas|california)\b/i, 'na'],
      [/\b(peru|mexico|colombia|chile|argentina|brazil|latin america|latam|bogot|lima|santiago)\b/i, 'latam'],
      [/\b(uk|united kingdom|england|london|ireland|spain|france|germany|italy|netherlands|europe|eu)\b/i, 'eu'],
      [/\b(australia|new zealand|singapore|japan|india|south africa|dubai|uae)\b/i, 'row'],
    ],
  },
  es: {
    scope: [
      [/\b(varios|múltiples)\s+(departamentos|equipos)|toda la (empresa|compañía)/i, 'multi'],
      [/\b(un |el |todo el )?(departamento|equipo)\b/i, 'dept'],
      [/\b(dos|tres|2|3|algunos|un par)\s+(flujos|procesos)/i, 'few'],
      [/\b(uno|un solo|sólo uno|1)\s+(flujo|proceso)/i, 'one'],
    ],
    systems: [
      [/\b(más de cinco|6|7|8|9|10|diez|muchos)\s*(sistemas|herramientas)?/i, 'many'],
      [/\b(tres|cuatro|cinco|3|4|5)\s*(sistemas|herramientas)/i, 'some'],
      [/\b(uno|dos|1|2)\s*(sistemas?|herramientas?)|solo (excel|una hoja)/i, 'one'],
      [/\b(no estoy seguro|ni idea|no sé|no lo sé)\b/i, 'dunno'],
    ],
    rigour: [
      [/\b(auditoría|auditor|cumplimiento|regulad|estados financieros|revisión externa)\b/i, 'yes'],
      [/\b(una parte|parcialmente|algunos)\b/i, 'some'],
      [/\b(interno|solo nosotros|sin auditoría)\b/i, 'no'],
    ],
    region: [
      [/\b(canadá|canada|estados unidos|ee\.? ?uu|usa|norteamérica)\b/i, 'na'],
      [/\b(perú|peru|méxico|mexico|colombia|chile|argentina|brasil|lima|bogot)\b/i, 'latam'],
      [/\b(españa|reino unido|inglaterra|londres|francia|alemania|italia|europa)\b/i, 'eu'],
      [/\b(australia|singapur|japón|india|sudáfrica|dubái)\b/i, 'row'],
    ],
  },
};

const ASK = {
  en: {
    scope:   'How much are we looking at — one workflow, a few, or a whole department?',
    systems: 'Roughly how many systems does that work touch?',
    rigour:  'Does the output need to stand up to a finance or audit review?',
    region:  'Last one — where is the business based?',
    opener:  'Tell me what your team is doing by hand, and I will work out what an audit would cost.',
    ack:     'Got it.',
    stuck:   'I did not catch that — could you put it another way?',
    done:    'That is everything I need.',
  },
  es: {
    scope:   '¿De cuánto hablamos: un flujo, unos pocos, o un departamento entero?',
    systems: '¿Cuántos sistemas toca ese trabajo, más o menos?',
    rigour:  '¿El resultado tiene que resistir una revisión financiera o de auditoría?',
    region:  'La última — ¿dónde está el negocio?',
    opener:  'Cuéntame qué hace tu equipo a mano y calculo cuánto costaría una auditoría.',
    ack:     'Entendido.',
    stuck:   'No te he entendido — ¿puedes decirlo de otra forma?',
    done:    'Eso es todo lo que necesito.',
  },
};

function extract(text, lang){
  const found = {};
  const sets = PATTERNS[lang] || PATTERNS.en;
  for (const slot of SLOTS) {
    for (const [re, value] of sets[slot]) {
      if (re.test(text)) { found[slot] = value; break; }
    }
  }
  return found;
}

/* One bot per visitor. Holds the slots it has filled and the transcript it
   would send to the Worker. */
export function createBot(lang = 'en'){
  const t = ASK[lang] || ASK.en;
  const slots = {};
  const messages = [];
  let misses = 0;

  const missing = () => SLOTS.filter(s => !(s in slots));

  async function local(text){
    Object.assign(slots, extract(text, lang));
    const left = missing();
    if (!left.length) {
      return { reply: t.done, done: true, quote: localQuote(slots, lang), slots: { ...slots } };
    }
    const understood = Object.keys(slots).length;
    if (!understood && ++misses >= 2) {
      // Twice with nothing recognised: stop guessing and ask plainly.
      return { reply: t.stuck + ' ' + t[left[0]], done: false };
    }
    return { reply: (understood ? t.ack + ' ' : '') + t[left[0]], done: false };
  }

  async function remote(text){
    const r = await fetch(QUOTE_API, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ messages, lang }),
    });
    if (!r.ok) throw new Error('bot endpoint ' + r.status);
    const data = await r.json();
    if (data.slots) Object.assign(slots, data.slots);
    // The price is computed here from the table, never taken from the model.
    return {
      reply: String(data.reply || '').slice(0, 600),
      done: !!data.done,
      quote: data.done ? localQuote(slots, lang) : null,
      slots: { ...slots },
    };
  }

  return {
    opener: t.opener,
    slots,
    async send(text){
      const clean = String(text || '').trim().slice(0, 500);
      if (!clean) return { reply: t.stuck, done: false };
      messages.push({ role: 'user', content: clean });
      let out;
      try {
        out = QUOTE_API ? await remote(clean) : await local(clean);
      } catch {
        out = await local(clean);        // endpoint down: keep the conversation alive
      }
      messages.push({ role: 'assistant', content: out.reply });
      return out;
    },
  };
}

export { REGIONS };
