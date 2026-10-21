/* English for the sales portal miniature (Alex and Wil, 2026-10-21: the
   portfolio shows it in English). The miniature is held at its Home screen, so only the
   Home screen's words are listed: each visible text and label is swapped for
   its English, exactly, after every draw. Words not listed stay as they are. */
const T = {
  'Tienda demo': 'Demo store', 'Portal': 'Portal', 'Inicio': 'Home', 'Panel': 'Dashboard',
  'Conversaciones': 'Conversations', 'Contactos': 'Contacts', 'Ventas': 'Sales', 'Pedidos': 'Orders',
  'Inventario': 'Inventory', 'Revisar': 'Review', 'Informes': 'Reports', 'Configuración': 'Settings',
  'Cómo usar': 'How to use', 'Portal · operado por KHIPUAI': 'Portal · run by KHIPUAI',
  'Buscar…': 'Search…', 'Soporte': 'Support', 'Administrador demo': 'Demo administrator',
  'Administrador': 'Administrator', 'Bienvenido,': 'Welcome,',
  'El portal de la tienda, todo en un lugar.': 'The store’s portal, all in one place.',
  'Lunes, 19 de octubre': 'Monday, October 19',
  'Cómo usar el portal': 'How to use the portal',
  'Una guía corta y un recorrido con voz para cada pantalla. Empiece por este, de un minuto.': 'A short guide and a voiced tour for each screen. Start with this one-minute tour.',
  'Empezar': 'Start', 'Ver las guías': 'See the guides', 'Secciones': 'Sections',
  'Las cifras del mes y de dónde vienen los clientes': 'This month’s numbers and where customers come from',
  'Los chats de WhatsApp con el Asistente y el equipo': 'WhatsApp chats with the assistant and the team',
  'La libreta de clientes, con lo que consultó cada uno': 'The customer book, with what each one asked about',
  '2 por verificar': '2 to verify', 'Clientes por cerrar, pagos por verificar y ventas': 'Customers to close, payments to verify, and sales',
  '1 vencido': '1 overdue', 'Cada pedido, de la venta a la entrega': 'Every order, from sale to delivery',
  '2 agotados': '2 out of stock', 'Lo que hay en el sistema de inventario, con unidades y precios': 'What the inventory system holds, with units and prices',
  '2 por revisar': '2 to review', 'Corregir al Asistente para que aprenda': 'Correct the assistant so it learns',
  'setiembre listo': 'September ready', 'El informe de cada mes, listo para PDF': 'Each month’s report, ready as a PDF',
  '1 por aprobar': '1 to approve', 'Precios, documentos, usuarios y conexiones': 'Prices, documents, users and connections',
  'Guías y recorridos con voz de cada pantalla': 'Guides and voiced tours of each screen',
  'Secciones del portal': 'Portal sections', 'Plegar el menú': 'Collapse the menu', 'Entorno: Sandbox': 'Environment: Sandbox',
  'Pantalla completa': 'Full screen', 'Pantalla completa: todo el portal a lo ancho de la pantalla': 'Full screen: the whole portal across the screen',
  'Notificaciones (1)': 'Notifications (1)', 'Cuenta y entorno': 'Account and environment',
};
const swap = v => {
  const t = v.trim(); if (!t) return v;
  if (T[t]) return v.replace(t, T[t]);
  // "Abrir Ventas: 2 por verificar" and the like
  const m = t.match(/^Abrir (.+?)(?:: (.+))?$/);
  if (m && T[m[1]]) return v.replace(t, `Open ${T[m[1]]}${m[2] ? ': ' + (T[m[2]] || m[2]) : ''}`);
  return v;
};
export function english(root = document.body) {
  const run = () => {
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let n; (n = w.nextNode());) { const v = swap(n.nodeValue); if (v !== n.nodeValue) n.nodeValue = v; }
    root.querySelectorAll('[aria-label], [title], [placeholder]').forEach(e => ['aria-label', 'title', 'placeholder'].forEach(a => {
      const v = e.getAttribute(a); if (v) { const s = swap(v); if (s !== v) e.setAttribute(a, s); }
    }));
  };
  run();
  new MutationObserver(run).observe(root, { childList: true, subtree: true, characterData: true });
}
