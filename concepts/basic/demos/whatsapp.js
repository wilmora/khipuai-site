// WhatsApp quoting demo: a scripted chat where the assistant quotes from the
// shop's own price list and takes the order, the orders board, stock, and the
// monthly report outline. The replies are a fixed script, not a live model;
// the shop, prices and people are made up.
import { ui, esc, fmt, money } from './kit.js';

const PRICE = 21; // one 1 kg roll of PLA filament, made-up price
const STAGES = ['received', 'design', 'production', 'ready', 'delivered'];
const STOCK0 = { black: 14, white: 3, red: 9, petg: 2, resin: 6 };

export default {
  key: 'whatsapp',
  tabs: ['chat', 'orders', 'stock', 'report'],
  init: () => ({ step: 0, human: false, stock: { ...STOCK0 },
    orders: [['DEMO-015', 'keychains', 'production'], ['DEMO-016', 'trophies', 'received'], ['DEMO-017', 'resin', 'ready']] }),
  view: {
    chat: (s, t, lang) => {
      const lines = [];
      for (let i = 0; i < s.step; i++) lines.push(['them', t.customer[i]], ['us', fmt(t.bot[i], { price: money(PRICE, lang), total: money(PRICE * 3, lang) })]);
      return `<div class="dm-row between">${ui.p(t.chatWith, 'strong')}${ui.btn(s.human ? t.handBack : t.takeOver, 'human', '', { pressed: s.human })}</div>`
        + `<div class="dm-chat" aria-live="polite">${lines.length ? lines.map(([who, text]) =>
          `<div class="dm-msg ${who}">${esc(text)}<small>${esc(who === 'us' ? t.assistant : t.customerName)}</small></div>`).join('') : ui.p(t.chatEmpty)}</div>`
        + (s.step < t.customer.length
          ? `<div class="dm-row" role="group" aria-label="${esc(t.youAre)}">${ui.p(t.youAre)}${ui.btn(t.customer[s.step], 'say', String(s.step), { kind: 'main', disabled: s.human })}</div>`
          : `<div class="dm-row">${ui.chip(t.orderMade, 'ok')}${ui.btn(t.goOrders, 'goto', 'orders')}${ui.btn(t.restart, 'restart', '')}</div>`)
        + `<div class="dm-row">${ui.real(t.catalogue, 'send', 'quiet')}</div>`
        + (s.human ? ui.p(t.humanNote) : ui.p(t.scriptNote));
    },
    orders: (s, t) => `<ul class="dm-list">${s.orders.map(([no, what, stage]) => `<li><span class="who"><b>${esc(no)} · ${esc(t.items[what])}</b>
        <span>${esc(t.owner)}</span></span>${ui.chip(t.stages[stage], stage === 'delivered' ? 'ok' : stage === 'ready' ? 'info' : 'warn')}
        ${stage === 'delivered' ? '' : ui.btn(fmt(t.moveTo, { stage: t.stages[STAGES[STAGES.indexOf(stage) + 1]] }), 'move', no)}</li>`).join('')}</ul>`
      + ui.p(t.ordersNote),
    stock: (s, t) => ui.table(t.stockCaption, [t.item, t.units, t.status], Object.entries(s.stock).map(([k, n]) => ({
      cls: n < 5 ? 'flag' : '', cells: [esc(t.stockItems[k]), String(n), n < 5 ? ui.chip(t.low, 'bad') : ui.chip(t.ok, 'ok')] })), { numeric: [1] })
      + `<div class="dm-row">${ui.real(t.update, 'stock')}</div>`,
    report: (s, t) => ui.tiles([[t.conversations, String(4 + (s.step ? 1 : 0))], [t.answered, '100%'], [t.firstReply, t.oneMin]])
      + ui.h(t.sectionsHead) + `<ol class="dm-steps">${t.sections.map((x, i) => `<li><span aria-hidden="true">${i + 1}</span>${esc(x)}</li>`).join('')}</ol>`
      + `<div class="dm-row">${ui.real(t.generate, 'report', 'main')}${ui.real(t.pdf, 'pdf')}</div>`,
  },
  act: {
    say: s => {
      s.step += 1;
      if (s.step === 3) {
        s.orders.push(['DEMO-018', 'filament', 'received']);
        ['black', 'white', 'red'].forEach(c => { s.stock[c] -= 1; });
      }
    },
    human: s => { s.human = !s.human; },
    restart: s => {
      s.step = 0; s.human = false; s.stock = { ...STOCK0 };
      s.orders = s.orders.filter(([no]) => no !== 'DEMO-018');
    },
    move: (s, no) => { const o = s.orders.find(x => x[0] === no); o[2] = STAGES[STAGES.indexOf(o[2]) + 1]; },
    goto: (s, tab) => tab,
  },
  t: {
    en: {
      app: 'WhatsApp quoting assistant',
      tabs: { chat: 'Chat', orders: 'Orders', stock: 'Stock', report: 'Monthly report' },
      chatWith: 'Chat with a customer (demo)', takeOver: 'Take over the chat', handBack: 'Hand back to the assistant',
      chatEmpty: 'No messages yet. Send the customer’s first message below.',
      youAre: 'You are the customer:',
      customer: ['How much is a roll of PLA filament?', '3 rolls please: black, white and red', 'I will pick it up tomorrow'],
      bot: [
        'A 1 kg roll of PLA filament is {price}. We have black, white and red in stock. How many would you like?',
        'Your order: 3 rolls of PLA filament, 1 kg (black, white and red), {total} in total. Pick up at the shop, or should we deliver?',
        'Done. Your order is booked for pick-up tomorrow from 10 am. Someone from the team will confirm your payment.',
      ],
      assistant: 'Assistant', customerName: 'Customer',
      orderMade: 'Order DEMO-018 added to the board', goOrders: 'See it in Orders', restart: 'Start over',
      catalogue: 'Send the colour catalogue',
      scriptNote: 'The assistant quotes only from the shop’s own price list. The team can take over any chat.',
      humanNote: 'The team is answering this chat. The assistant waits until it is handed back.',
      items: { keychains: '200 keychains', trophies: '30 custom trophies', resin: 'Resin, 1 bottle', filament: '3 rolls of PLA filament' },
      owner: 'Owner: team member (demo)', moveTo: 'Move to {stage}',
      stages: { received: 'Received', design: 'Design', production: 'In production', ready: 'Ready', delivered: 'Delivered' },
      ordersNote: 'The owner of each order gets a reminder before its delivery date.',
      stockCaption: 'Stock on hand', item: 'Item', units: 'Units', status: 'Status', low: 'Low', ok: 'OK',
      stockItems: { black: 'PLA filament, black', white: 'PLA filament, white', red: 'PLA filament, red', petg: 'PETG filament, clear', resin: 'Resin, standard' },
      update: 'Update stock',
      conversations: 'Conversations', answered: 'Answered', firstReply: 'First reply (median)', oneMin: '1 min',
      sectionsHead: 'What the monthly report covers',
      sections: ['The month’s key numbers', 'How the month moved', 'Sales', 'Why some sales did not close', 'What went well', 'Plan for next month'],
      generate: 'Generate this month’s report', pdf: 'Print or save as PDF',
      real: {
        send: 'In the real product this would send the colour catalogue PDF to the customer on WhatsApp.',
        stock: 'In the real product this would update the stock count, and the assistant would quote from the new numbers.',
        report: 'In the real product this would build this month’s report from the portal’s numbers for the team to review.',
        pdf: 'In the real product this would open the report ready to print or save as a PDF.',
      },
    },
    es: {
      app: 'Asistente de cotizaciones por WhatsApp',
      tabs: { chat: 'Chat', orders: 'Pedidos', stock: 'Inventario', report: 'Informe mensual' },
      chatWith: 'Chat con un cliente (demo)', takeOver: 'Tomar el chat', handBack: 'Devolver al asistente',
      chatEmpty: 'Aún no hay mensajes. Envía abajo el primer mensaje del cliente.',
      youAre: 'Tú eres el cliente:',
      customer: ['¿Cuánto cuesta un rollo de filamento PLA?', '3 rollos, por favor: negro, blanco y rojo', 'Lo recojo mañana'],
      bot: [
        'Un rollo de filamento PLA de 1 kg cuesta {price}. Tenemos negro, blanco y rojo en stock. ¿Cuántos quieres?',
        'Tu pedido: 3 rollos de filamento PLA de 1 kg (negro, blanco y rojo), {total} en total. ¿Lo recoges en la tienda o te lo enviamos?',
        'Listo. Tu pedido queda para recoger mañana desde las 10 a. m. Alguien del equipo confirmará tu pago.',
      ],
      assistant: 'Asistente', customerName: 'Cliente',
      orderMade: 'Pedido DEMO-018 agregado al tablero', goOrders: 'Verlo en Pedidos', restart: 'Empezar de nuevo',
      catalogue: 'Enviar el catálogo de colores',
      scriptNote: 'El asistente cotiza solo con la lista de precios de la tienda. El equipo puede tomar cualquier chat.',
      humanNote: 'El equipo está respondiendo este chat. El asistente espera hasta que se lo devuelvan.',
      items: { keychains: '200 llaveros', trophies: '30 trofeos personalizados', resin: 'Resina, 1 botella', filament: '3 rollos de filamento PLA' },
      owner: 'Responsable: miembro del equipo (demo)', moveTo: 'Pasar a {stage}',
      stages: { received: 'Recibido', design: 'Diseño', production: 'En producción', ready: 'Listo', delivered: 'Entregado' },
      ordersNote: 'El responsable de cada pedido recibe un recordatorio antes de la fecha de entrega.',
      stockCaption: 'Inventario disponible', item: 'Producto', units: 'Unidades', status: 'Estado', low: 'Bajo', ok: 'OK',
      stockItems: { black: 'Filamento PLA, negro', white: 'Filamento PLA, blanco', red: 'Filamento PLA, rojo', petg: 'Filamento PETG, transparente', resin: 'Resina, estándar' },
      update: 'Actualizar inventario',
      conversations: 'Conversaciones', answered: 'Atendidas', firstReply: 'Primera respuesta (mediana)', oneMin: '1 min',
      sectionsHead: 'Qué cubre el informe mensual',
      sections: ['Las cifras clave del mes', 'Cómo se movió el mes', 'Ventas', 'Por qué algunas ventas no cerraron', 'Lo que salió bien', 'Plan para el próximo mes'],
      generate: 'Generar el informe de este mes', pdf: 'Imprimir o guardar en PDF',
      real: {
        send: 'En el producto real, esto enviaría al cliente por WhatsApp el PDF del catálogo de colores.',
        stock: 'En el producto real, esto actualizaría el inventario, y el asistente cotizaría con las cifras nuevas.',
        report: 'En el producto real, esto armaría el informe del mes con las cifras del portal para que el equipo lo revise.',
        pdf: 'En el producto real, esto abriría el informe listo para imprimir o guardar en PDF.',
      },
    },
  },
};
