/* "Portal de ventas" miniature: the sales portal of a 3D printing shop that
   answers WhatsApp with an assistant, redrawn as static HTML with the app's own
   classes and made-up data. Five screens work: Inicio, Conversaciones, Pedidos,
   Inventario and Informes. The other menu entries, and anything that would send,
   save, export or call the assistant, show a note. */
import { mini, esc, svg } from '../mini.js';
import { I } from './icons.js';
import { HOY, HOY_TEXTO, PEDIDOS, CONVERSACIONES, INVENTARIO, INFORME } from './data.js';

const ic = (n, size = 18, stroke = 1.75, cls = '') => svg(I[n], { size, stroke, cls });
const REAL = what => `En el producto real, esto ${what}`;
const nf = n => Number(n || 0).toLocaleString('es-PE');
const soles = n => 'S/ ' + Number(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const S0 = n => 'S/ ' + Math.round(n).toLocaleString('es-PE');
const tel = t => { const d = String(t || '').replace(/\D/g, ''); return d.length === 11 ? `+${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5, 8)} ${d.slice(8)}` : d; };
const MESES = ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'set.', 'oct.', 'nov.', 'dic.'];
const fechaDia = ymd => ymd ? `${Number(ymd.slice(8, 10))} ${MESES[Number(ymd.slice(5, 7)) - 1]}` : '';
const dateOf = ymd => new Date(ymd + 'T12:00:00Z');
const ymdOf = d => d.toISOString().slice(0, 10);
function habiles(desde, hasta) { // business days from desde to hasta (negative when hasta is earlier)
  let a = dateOf(desde), b = dateOf(hasta), sign = 1, n = 0;
  if (b < a) { [a, b] = [b, a]; sign = -1; }
  for (let d = new Date(a); d < b; d.setUTCDate(d.getUTCDate() + 1)) { const x = new Date(d); x.setUTCDate(x.getUTCDate() + 1); if (x.getUTCDay() % 6) n++; }
  return n * sign;
}
function sumarHabiles(ymd, n) { const d = dateOf(ymd); while (n > 0) { d.setUTCDate(d.getUTCDate() + 1); if (d.getUTCDay() % 6) n--; } return ymdOf(d); }
const faltan = h => h === 0 ? 'hoy' : h > 0 ? `en ${h} ${h === 1 ? 'día' : 'días'}` : `${-h} ${h === -1 ? 'día' : 'días'} tarde`;

/* ---------- menu (secciones.ts) ---------- */
const SECCIONES = [
  { to: 'inicio', label: 'Inicio', icon: 'House', que: 'Todo el portal en un lugar' },
  { to: 'panel', label: 'Panel', icon: 'BarChart3', que: 'Las cifras del mes y de dónde vienen los clientes', real: 'abre el Panel con las cifras del mes, las ventas por día y de dónde llegan los clientes.' },
  { to: 'conversaciones', label: 'Conversaciones', icon: 'MessageSquare', que: 'Los chats de WhatsApp con el Asistente y el equipo' },
  { to: 'contactos', label: 'Contactos', icon: 'Users', que: 'La libreta de clientes, con lo que consultó cada uno', real: 'abre la libreta de clientes, con lo que consultó cada uno y su historial de compras.' },
  { to: 'ventas', label: 'Ventas', icon: 'Banknote', que: 'Clientes por cerrar, pagos por verificar y ventas', real: 'abre Ventas: los clientes por cerrar, los pagos por verificar con su comprobante y las ventas del mes.' },
  { to: 'pedidos', label: 'Pedidos', icon: 'Package', que: 'Cada pedido, de la venta a la entrega' },
  { to: 'inventario', label: 'Inventario', icon: 'Warehouse', que: 'Lo que hay en el sistema de inventario, con unidades y precios' },
  { to: 'revisar', label: 'Revisar', icon: 'ListChecks', que: 'Corregir al Asistente para que aprenda', real: 'abre Revisar: las respuestas del Asistente que el equipo corrige, para que aprenda.' },
  { to: 'informes', label: 'Informes', icon: 'FileText', que: 'El informe de cada mes, listo para PDF' },
  { to: 'configuracion', label: 'Configuración', icon: 'Settings', que: 'Precios, documentos, usuarios y conexiones', real: 'abre Configuración: precios, documentos, usuarios y las conexiones con WhatsApp y el sistema de inventario.' },
  { to: 'como-usar', label: 'Cómo usar', icon: 'BookOpen', que: 'Guías y recorridos con voz de cada pantalla', real: 'abre las guías de cada pantalla, con un recorrido con voz.' },
];
const ROUTES = ['inicio', 'conversaciones', 'pedidos', 'inventario', 'informes', 'signin'];
const isRoute = r => ROUTES.includes(r);
const sec = to => SECCIONES.find(s => s.to === to);
const linkAttrs = s => s.real ? `data-real="${esc(REAL(s.real))}"` : `data-go="${s.to}"`;

const ESTADOS = ['recibido', 'diseno', 'produccion', 'listo', 'entregado'];
const estadoLabel = { recibido: 'Recibido', diseno: 'Falta diseño', produccion: 'En producción', listo: 'Listo', entregado: 'Entregado' };
const estadoIcon = { recibido: ['Inbox', 'amber'], diseno: ['Image', 'slate'], produccion: ['Clock', 'blue'], listo: ['Package', 'violet'], entregado: ['Check', 'teal'] };
const siguiente = { recibido: 'produccion', diseno: 'produccion', produccion: 'listo', listo: 'entregado' };
const pillEstado = { entregado: 'p-humano', listo: 'p-asistente', diseno: 'p-espera', recibido: 'p-derivado', produccion: 'p-derivado' };

const S = {
  route: 'inicio', plegado: false, buscar: false, q: '', qSel: 0, bell: false,
  pedidos: PEDIDOS.map(p => ({ ...p })), filtro: 'activos', pq: '', ppage: 1, nuevo: false, plazo: '5', diseno: false, nCliente: '', nTel: '', nDesc: '', nCant: '', flash: '',
  convos: CONVERSACIONES.map(c => ({ ...c, mensajes: [...c.mensajes] })), sel: 'c1', vista: 'abiertas', cfiltro: 'todas', orden: 'reciente', cq: '', cpage: 1, texto: '', bottom: true,
  inv: 'venta', iq: '', ipage: 1,
  infMes: '2026-09', infFull: false, activa: 'numeros', pedidosEquipo: INFORME.pedidos.map(p => p[2]),
};

/* ---------- shared pieces (ui.tsx) ---------- */
const TONE = { warning: 'bg-warning-bg border-warning-border text-warning-fg', critical: 'bg-critical-bg border-critical-border text-critical-fg', info: 'bg-info-bg border-info-border text-info-fg' };
const badge = (tone, text) => `<span class="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 text-caption font-medium ${TONE[tone]} font-semibold">${esc(text)}</span>`;
const guias = (recorrido = false) => `<div class="mt-2 flex flex-wrap items-center gap-4">
  <button type="button" class="inline-flex items-center gap-1.5 text-body-sm font-semibold text-brand-dark hover:underline" data-real="${esc(REAL('abre la guía corta de esta pantalla.'))}">${ic('BookOpen', 14)}Cómo usar</button>
  ${recorrido ? `<button type="button" class="inline-flex items-center gap-1.5 text-body-sm font-semibold text-brand-dark hover:underline" data-real="${esc(REAL('inicia un recorrido con voz de un minuto por esta pantalla.'))}">${ic('CirclePlay', 14)}Recorrido</button>` : ''}</div>`;
const pageHeader = ({ title, count, subtitle, actions, links = '' }) => `<header class="page-header mb-5 flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-end sm:justify-between">
  <div class="min-w-0"><div class="mb-1.5 text-label uppercase text-brand">Portal</div>
    <h1 class="flex flex-wrap items-center gap-3 text-page text-ink">${esc(title)}${count ? badge('warning', count) : ''}</h1>
    ${subtitle ? `<p title="${esc(subtitle)}" class="page-sub mt-1.5 max-w-3xl text-body-sm text-ink-muted">${esc(subtitle)}</p>` : ''}${links}</div>
  ${actions ? `<div class="flex min-w-0 flex-wrap items-center gap-2 sm:max-w-[65%] sm:justify-end">${actions}</div>` : ''}</header>`;
const ICON_TONE = { blue: 'bg-tile-blue text-tile-blue-fg', violet: 'bg-tile-violet text-tile-violet-fg', slate: 'bg-tile-slate text-tile-slate-fg', amber: 'bg-tile-amber text-warning-solid', teal: 'bg-success-bg text-success-fg' };
function kpi({ label, value, foot, icon, tone, attrs = '', pressed }) {
  const body = `<div class="kpi-body flex h-full items-start gap-4 p-5"><span aria-hidden="true" class="flex h-10 w-10 shrink-0 items-center justify-center rounded-control ${ICON_TONE[tone]}">${ic(icon, 20)}</span>
    <div class="min-w-0 pt-0.5"><div class="kpi-label text-body-sm font-medium text-ink-muted" title="${esc(label)}">${esc(label)}</div>
    <div class="kpi-value mt-1.5 truncate text-metric tabular-nums text-ink">${esc(value)}</div>
    ${foot ? `<div title="${esc(foot)}" class="kpi-foot mt-1.5 text-caption text-ink-subtle">${esc(foot)}</div>` : ''}</div></div>`;
  return attrs
    ? `<button type="button" ${attrs} aria-pressed="${!!pressed}" class="block w-full rounded-card bg-surface text-left shadow-e4 transition-shadow duration-120 hover:shadow-lift ${pressed ? 'shadow-[0_0_0_2px_#283a8f]' : ''}">${body}</button>`
    : `<div class="block w-full rounded-card bg-surface text-left shadow-e4">${body}</div>`;
}
function tabs(label, value, list, attr, right = '') {
  const row = `<div role="tablist" aria-label="${esc(label)}" class="${right ? '' : 'mb-5 '}flex max-w-full flex-wrap gap-1 px-1 pt-1 shadow-[inset_0_-1px_0_#e2e8f0]">${list.map(t => {
    const on = t.id === value, show = t.count !== undefined && t.count !== null && t.count !== '' && t.count !== 0;
    return `<button type="button" role="tab" aria-selected="${on}" tabindex="${on ? 0 : -1}" ${t.real ? `data-real="${esc(REAL(t.real))}"` : `${attr}="${t.id}"`} class="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-t-control border-b-2 px-3 pb-2.5 pt-1.5 text-body-sm font-semibold transition-colors duration-120 ${on ? 'border-brand text-brand-dark' : 'border-transparent text-ink-muted hover:text-ink'}">${esc(t.label)}${show ? `<span class="rounded-full px-1.5 py-px text-[12px] font-semibold tabular-nums bg-tile-slate text-ink-muted">${esc(t.count)}</span>` : ''}</button>`;
  }).join('')}</div>`;
  if (!right) return row;
  return `<div class="mb-4 flex flex-wrap items-end justify-between gap-x-4 gap-y-2 shadow-[inset_0_-1px_0_#e2e8f0]"><div class="min-w-0 [&>[role=tablist]]:shadow-none">${row}</div><div class="mb-2 w-full sm:w-auto sm:shrink-0">${right}</div></div>`;
}
const pager = (page, pages, total, unidad, attr) => pages <= 1 ? '' : `<div class="pager"><span>Página ${page} de ${pages} · ${nf(total)} ${unidad}</span><div>
  <button type="button" class="btn btn-sm" ${attr}="${page - 1}" ${page <= 1 ? 'disabled' : ''}>Anterior</button><button type="button" class="btn btn-sm" ${attr}="${page + 1}" ${page >= pages ? 'disabled' : ''}>Siguiente</button></div></div>`;
const emptyState = (icon, title, text) => `<div class="rounded-card border border-dashed border-line-strong bg-surface px-6 py-10 text-center"><div aria-hidden="true" class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted text-ink-faint">${ic(icon, 26)}</div><div class="text-title text-ink">${esc(title)}</div>${text ? `<div class="mx-auto mt-1 max-w-md text-body-sm text-ink-subtle">${text}</div>` : ''}</div>`;

/* ---------- frame (Layout.tsx) ---------- */
const ROW = 'nav-item group relative flex min-h-[44px] w-full items-center gap-3 rounded-control px-3 text-body-sm transition-colors duration-120 lg:min-h-[42px] ';
function rail() {
  const p = S.plegado;
  return `<nav id="menu-principal" aria-label="Secciones del portal" class="sidebar fixed inset-y-0 left-0 z-40 flex w-[272px] shrink-0 flex-col overflow-y-auto overflow-x-hidden border-r border-rail-line bg-rail px-3 pb-4 text-rail-text shadow-e8 transition-transform duration-260 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:shadow-none lg:transition-[width] ${p ? 'lg:w-[72px] lg:px-2' : 'lg:w-rail'} -translate-x-full">
    <div class="flex h-[4.5rem] shrink-0 items-center gap-2 px-3${p ? ' lg:justify-center lg:px-0' : ''}"><span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-brand text-[15px] font-bold text-white" aria-hidden="true">T</span>${p ? '' : '<span class="text-[15px] font-bold tracking-[-0.01em] text-ink">Tienda demo</span>'}</div>
    <div class="mb-2 mt-2 px-3 text-label uppercase text-rail-muted${p ? ' lg:invisible' : ''}">Portal</div>
    <div class="grid gap-0.5">${SECCIONES.map(s => {
      const on = s.to === S.route;
      return `<button type="button" ${linkAttrs(s)} ${p ? `title="${esc(s.label)}"` : ''} ${on ? 'aria-current="page"' : ''} class="${ROW}${p ? 'lg:justify-center lg:px-0 ' : ''}${on ? 'active bg-rail-raised font-semibold text-brand-dark' : 'font-medium text-rail-text hover:bg-rail-hover hover:text-ink'}">
        <span class="text-rail-icon group-hover:text-ink group-[.active]:text-brand">${ic(s.icon)}</span> <span class="${p ? 'lg:sr-only' : ''}">${esc(s.label)}</span></button>`;
    }).join('')}</div>
    <div class="mt-auto border-t border-rail-line px-3 pt-4 text-caption leading-snug text-rail-muted${p ? ' lg:hidden' : ''}">Portal · operado por KHIPUAI</div></nav>`;
}
const vencidos = () => S.pedidos.filter(vencido);
function topbar() {
  const n = 1;
  return `<div class="noprint sticky top-0 z-20 bg-canvas/95 px-4 pt-3 backdrop-blur sm:px-8 sm:pt-4">
  <div class="flex h-14 items-center justify-between gap-3 rounded-card border border-line bg-surface px-3 shadow-e1 sm:px-4">
    <div class="flex min-w-max items-center gap-3 md:flex-1">
      <button type="button" data-plegar class="hidden h-10 w-10 shrink-0 items-center justify-center rounded-control border border-line text-ink-muted hover:bg-subtle hover:text-ink lg:inline-flex" aria-label="${S.plegado ? 'Expandir el menú' : 'Plegar el menú'}" title="${S.plegado ? 'Expandir el menú' : 'Plegar el menú'}" aria-pressed="${S.plegado}">${ic('PanelLeft')}</button>
      <span class="hidden min-w-0 items-center gap-2 truncate text-body-sm lg:flex"><span class="text-ink-subtle">Portal</span><span aria-hidden="true" class="text-ink-faint">/</span><b class="font-semibold text-ink">${esc(sec(S.route).label)}</b></span></div>
    <div class="hidden min-w-0 flex-[0_1_460px] justify-center md:flex"><button type="button" class="tb-search" data-buscar aria-haspopup="dialog" aria-keyshortcuts="Control+K Meta+K">
      ${svg([['path', { d: 'm20 20-5-5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0' }]], { size: 17, stroke: 1.9 })}<span class="tb-search-ph">Buscar…</span><kbd>⌘ K</kbd></button></div>
    <div class="flex items-center justify-end gap-2 md:flex-1">
      <span class="hidden sm:inline-flex"><span class="env-trigger env-sandbox" aria-label="Entorno: Sandbox" title="Entorno: Sandbox">${svg([['path', { d: 'M9 3h6M10 3v6.5L5.3 18a2 2 0 0 0 1.8 3h9.8a2 2 0 0 0 1.8-3L14 9.5V3M7.5 15h9' }]], { size: 15, stroke: 1.8 })}<span>Sandbox</span></span></span>
      <button type="button" class="help-btn inline-flex h-10 shrink-0 items-center gap-1.5 rounded-control border border-line bg-surface px-2.5 text-[13px] font-semibold text-ink-muted hover:bg-subtle hover:text-ink xl:px-3" title="Soporte" aria-label="Soporte" data-real="${esc(REAL('abre el chat de soporte de KHIPUAI, que guarda la pantalla en la que usted estaba.'))}">${ic('LifeBuoy', 17)}<span class="hidden xl:inline">Soporte</span></button>
      <button type="button" class="hidden h-10 w-10 shrink-0 items-center justify-center rounded-control border border-line bg-surface text-ink-muted hover:bg-subtle hover:text-ink lg:inline-flex" aria-label="Pantalla completa" title="Pantalla completa: todo el portal a lo ancho de la pantalla" data-real="${esc(REAL('pone todo el portal en pantalla completa, a lo ancho de la pantalla.'))}">${ic('Maximize2', 17)}</button>
      <div class="bell"><button type="button" class="bell-btn" data-bell aria-haspopup="menu" aria-expanded="${S.bell}" aria-label="Notificaciones (${n})">
        ${svg([['path', { d: 'M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9' }], ['path', { d: 'M13.7 21a2 2 0 0 1-3.4 0' }]], { size: 20, stroke: 1.8 })}<span class="bell-badge">${n}</span></button>
        ${S.bell ? `<div class="bell-menu" role="menu"><div class="bell-head">Notificaciones<span class="bell-count">${n}</span></div><div class="bell-list">
          <div class="bell-item alta"><span class="bell-ic" aria-hidden="true">${ic('AlertTriangle', 16)}</span><div class="bell-body"><b>Pedido vencido: Inversiones Brisa Demo EIRL</b><p class="bell-detail">200 llaveros planos. La entrega era el 15 oct.; el responsable recibió el aviso por WhatsApp.</p>
          <div class="bell-foot"><span class="bell-time">19-oct., 08:00 a. m.</span><button type="button" class="bell-resolve" data-real="${esc(REAL('marca el aviso como resuelto para todo el equipo.'))}">Marcar resuelto</button></div></div></div></div></div>` : ''}</div>
      <button type="button" class="profile-btn" aria-haspopup="dialog" title="Cuenta y entorno" data-real="${esc(REAL('abre el panel de su cuenta: cambiar la clave, ver el entorno y salir.'))}"><span class="profile-avatar" aria-hidden="true">AD</span><span class="profile-who"><b>Administrador demo</b><small>Administrador</small></span>${ic('ChevronDown', 16, 1.8, 'profile-caret')}</button>
    </div></div></div>`;
}
function buscador() {
  if (!S.buscar) return '';
  const t = S.q.trim().toLowerCase();
  const res = SECCIONES.filter(s => !t || s.label.toLowerCase().includes(t));
  const sel = Math.min(S.qSel, Math.max(0, res.length - 1));
  return `<div class="search-overlay" data-cerrar-buscar><div class="search-modal" role="dialog" aria-modal="true" aria-label="Buscar en el portal">
    <div class="search-input-row">${svg([['path', { d: 'm20 20-5-5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0' }]], { size: 19, stroke: 1.9 })}<input data-input="q" data-qbox value="${esc(S.q)}" placeholder="Buscar páginas y contactos…" aria-label="Buscar páginas y contactos"><button type="button" class="search-esc" data-cerrar-buscar aria-label="Cerrar">Esc</button></div>
    <div class="search-results">${res.length ? res.map((s, i) => `<button type="button" class="search-item${i === sel ? ' sel' : ''}" ${linkAttrs(s)}><span class="search-ico" aria-hidden="true">${ic(s.icon, 16)}</span><span class="search-lbl"><b>${esc(s.label)}</b></span><span class="search-kind">Página</span></button>`).join('') : '<div class="search-empty">Sin resultados.</div>'}</div></div></div>`;
}

/* ---------- Inicio ---------- */
function aviso(to) {
  const v = vencidos().length, ag = INVENTARIO.filter(i => i.venta && i.stock === 0).length;
  return { ventas: ['2 por verificar', 'rojo'], pedidos: v ? [`${v} ${v === 1 ? 'vencido' : 'vencidos'}`, 'rojo'] : null, inventario: ag ? [`${ag} agotados`, 'ambar'] : null,
    revisar: ['2 por revisar', 'rojo'], informes: ['setiembre listo', 'azul'], configuracion: ['1 por aprobar', 'ambar'] }[to] || null;
}
function inicio() {
  const secs = SECCIONES.filter(s => s.to !== 'inicio');
  return `<div class="page inicio"><header class="inicio-hero"><p class="inicio-migas">Portal <span aria-hidden="true">/</span> Inicio</p>
    <h1>Bienvenido, <span class="inicio-acento">Administrador</span></h1><p class="inicio-sub">El portal de la tienda, todo en un lugar. <span class="inicio-fecha">${HOY_TEXTO}</span></p></header>
    <div class="inicio-recorrido"><span class="inicio-recorrido-icono" aria-hidden="true">${ic('BookOpen')}</span><span class="inicio-recorrido-texto"><b>Cómo usar el portal</b><span>Una guía corta y un recorrido con voz para cada pantalla. Empiece por este, de un minuto.</span></span>
      <button type="button" class="btn btn-primary btn-sm" data-real="${esc(REAL('inicia el recorrido con voz del portal, de un minuto.'))}">Empezar</button><button type="button" class="btn btn-sm" data-real="${esc(REAL('abre las guías de cada pantalla.'))}">Ver las guías</button></div>
    <p class="inicio-titulo-lista">Secciones <span>${secs.length}</span></p>
    <nav aria-label="Secciones del portal" class="inicio-burbujas">${secs.map(s => { const a = aviso(s.to);
      return `<a href="#/${s.to}" class="inicio-burbuja" ${s.real ? `data-real="${esc(REAL(s.real))}"` : ''} aria-label="Abrir ${esc(s.label)}${a ? ': ' + esc(a[0]) : ''}" title="${esc(s.que)}">
        <span class="inicio-burbuja-icono" aria-hidden="true">${ic(s.icon, 20)}</span><span class="inicio-burbuja-texto"><span class="inicio-burbuja-fila"><span class="inicio-burbuja-nombre">${esc(s.label)}</span>${a ? `<span class="inicio-aviso ${a[1]}">${esc(a[0])}</span>` : ''}</span><span class="inicio-burbuja-que">${esc(s.que)}</span></span>
        <span class="inicio-burbuja-flecha" aria-hidden="true">${ic('ArrowRight', 16)}</span></a>`; }).join('')}</nav></div>`;
}

/* ---------- Conversaciones ---------- */
const estadoConvo = { asistente: 'Asistente', derivado: 'Derivado', humano: 'Equipo' };
const wa = t => esc(t).replace(/\*([^*\n]+)\*/g, '<b>$1</b>');
function conversaciones() {
  const q = S.cq.trim().toLowerCase();
  const lista = S.convos.filter(c => S.vista === 'archivadas' ? c.archivado : !c.archivado)
    .filter(c => S.cfiltro === 'todas' || (S.cfiltro === 'sinleer' ? c.noLeidos > 0 : c.estado === S.cfiltro))
    .filter(c => !q || c.cliente.toLowerCase().includes(q) || c.telefono.includes(q) || c.mensajes.at(-1).texto.toLowerCase().includes(q))
    .sort((a, b) => S.orden === 'reciente' ? b.orden - a.orden : a.orden - b.orden);
  const POR = 4, pages = Math.max(1, Math.ceil(lista.length / POR)), pag = Math.min(S.cpage, pages), vis = lista.slice((pag - 1) * POR, pag * POR);
  const nArch = S.convos.filter(c => c.archivado).length;
  const sel = S.convos.find(c => c.id === S.sel);
  const ultimo = c => c.mensajes.at(-1);
  const item = c => `<button type="button" data-convo="${c.id}" class="convo-item${sel?.id === c.id ? ' sel' : ''}"><div class="flex justify-between gap-2"><span class="name">${esc(c.cliente)}</span><span class="pill p-${c.estado}">${estadoConvo[c.estado]}</span></div>
    <div class="prev">${esc(ultimo(c).texto || (ultimo(c).media ? ultimo(c).media.nombre : ''))}</div><div class="prev">${esc(ultimo(c).ts)} · ${tel(c.telefono)}</div></button>`;
  const lado = `<div class="convo-list" data-keep="clist"><label class="search-box">${ic('Search', 16)}<input data-input="cq" value="${esc(S.cq)}" aria-label="Buscar conversación por nombre, número o texto" placeholder="Buscar chat…" title="Busca por nombre, número o texto"></label>
    ${tabs('Bandeja', S.vista, [{ id: 'abiertas', label: 'Abiertas' }, { id: 'archivadas', label: 'Archivadas', count: nArch || undefined }, { id: 'historial', label: 'Historial', real: 'abre el historial de chats importado del sistema anterior, de solo lectura.' }], 'data-vista')}
    <div class="flex gap-1.5"><select class="input flex-1 !px-2.5 !py-2" data-select="cfiltro" aria-label="Filtrar la lista">${[['todas', 'Todas'], ['sinleer', 'Sin leer'], ['asistente', 'Con el Asistente'], ['humano', 'Con el equipo']].map(([v, l]) => `<option value="${v}"${S.cfiltro === v ? ' selected' : ''}>${l}</option>`).join('')}</select>
      <button type="button" class="btn" data-orden title="Cambiar el orden">${S.orden === 'reciente' ? 'Recientes primero' : 'Antiguas primero'}</button></div>
    <div class="grid gap-2">${vis.map(item).join('')}</div>
    ${lista.length > POR ? `<div class="flex items-center gap-1.5 px-0.5 py-0.5"><button type="button" class="btn btn-sm" aria-label="Página anterior" data-cpage="${pag - 1}" ${pag <= 1 ? 'disabled' : ''}>‹</button><span class="note flex-1 text-center">Página ${pag} de ${pages} · ${lista.length} conversaciones</span><button type="button" class="btn btn-sm" aria-label="Página siguiente" data-cpage="${pag + 1}" ${pag >= pages ? 'disabled' : ''}>›</button></div>` : ''}
    ${lista.length === 0 ? `<div class="card note">${q || S.cfiltro !== 'todas' ? 'Nada coincide con la búsqueda o el filtro.' : 'No hay conversaciones archivadas.'}</div>` : ''}</div>`;
  let leer;
  if (!sel) {
    const ab = S.convos.filter(c => !c.archivado).length, eq = S.convos.filter(c => c.estado === 'humano').length;
    leer = emptyState('MessageSquare', 'Seleccione una conversación', `Elija un chat de la lista para leerlo y responder. Al escribir, usted toma el chat y el Asistente espera hasta que se lo devuelva.<span class="mt-4 flex justify-center gap-8">${[['abiertas', ab], ['sin leer', 0], ['con el equipo', eq]].map(([l, n]) => `<span class="flex flex-col items-center"><b class="text-title text-ink">${n}</b><span class="text-caption">${l}</span></span>`).join('')}</span>`);
  } else {
    const meta = m => m.de === 'equipo' ? m.autor : m.de === 'asistente' ? 'Asistente 🤖' : sel.cliente;
    leer = `<div class="mb-2.5 flex flex-wrap items-center justify-between gap-2"><div><b>${esc(sel.cliente)}</b> <span class="note">${tel(sel.telefono)}</span> ${sel.estado === 'humano' ? '<span class="pill p-humano">Equipo al mando</span>' : ''}
        ${sel.libreta ? `<div class="note mt-1.5 text-[13px]">Ya era cliente de la libreta: <b>${esc(sel.libreta.nombre)}</b> · consultó ${esc(sel.libreta.consulto)} · última vez ${esc(sel.libreta.ultima)}</div>` : ''}</div>
      <div class="flex gap-1.5">${sel.estado === 'humano' ? '<button type="button" class="btn btn-ghost" data-devolver>Devolver al Asistente 🤖</button>' : '<button type="button" class="btn btn-blue" data-tomar title="El Asistente deja de responder en esta conversación hasta que usted la devuelva">La tomo yo 🙋</button>'}
        ${sel.archivado ? '<button type="button" class="btn btn-ghost" data-archivar="0">Restaurar</button>' : '<button type="button" class="btn btn-ghost" data-archivar="1" title="Ocultar de la lista de abiertas; vuelve sola si el cliente escribe">Archivar ✓</button>'}</div></div>
      <div class="thread" data-keep="thread">${sel.mensajes.map(m => `<div class="bubble b-${m.de}">${m.media ? `<button type="button" class="mb-1 block text-left font-bold text-ink" data-real="${esc(REAL('abre el archivo que se envió por WhatsApp.'))}">📄 ${esc(m.media.nombre)}</button>` : ''}${wa(m.texto)}<div class="meta">${esc(meta(m))} · ${esc(m.ts)}</div></div>`).join('')}</div>
      <form class="replybox"><button type="button" class="btn btn-ghost" title="Adjuntar imagen o PDF" data-real="${esc(REAL('adjunta una imagen o un PDF y lo envía al cliente por WhatsApp.'))}">📎</button>
        <button type="button" class="btn btn-ghost" title="Grabar nota de voz" data-real="${esc(REAL('graba una nota de voz con el micrófono y la envía al cliente por WhatsApp.'))}">🎤</button>
        <input data-input="texto" value="${esc(S.texto)}" placeholder="Escribir como la tienda…" maxlength="4096" aria-label="Mensaje para el cliente">
        <button type="button" class="btn btn-blue" data-enviar ${S.texto.trim() ? '' : 'disabled'} data-real="${esc(REAL('envía su mensaje al cliente por WhatsApp. Al escribir, usted toma el chat y el Asistente espera.'))}">Enviar</button></form>`;
  }
  return `<div class="page">${pageHeader({ title: 'Conversaciones', links: guias(true) })}<div class="convo-layout" data-fill="48">${lado}<div class="card convo-read">${leer}</div></div></div>`;
}

/* ---------- Pedidos ---------- */
function vencido(p) { return (p.estado === 'recibido' || p.estado === 'produccion') && p.fecha && p.fecha < HOY; }
const counts = () => Object.fromEntries(ESTADOS.map(e => [e, S.pedidos.filter(p => p.estado === e).length]));
function pedidos() {
  const n = counts(), all = S.pedidos, v = vencidos().length, t = S.pq.trim().toLowerCase();
  const lista = all.filter(p => S.filtro === 'activos' ? p.estado !== 'entregado' : S.filtro === 'todos' ? true : p.estado === S.filtro)
    .filter(p => !t || `${p.cliente} ${p.telefono} ${p.descripcion}`.toLowerCase().includes(t))
    .sort((a, b) => (a.fecha || '9999').localeCompare(b.fecha || '9999'));
  const POR = 4, pages = Math.max(1, Math.ceil(lista.length / POR)), pag = Math.min(S.ppage, pages), vis = lista.slice((pag - 1) * POR, pag * POR);
  const debajo = p => p.estado === 'diseno' ? `plazo ${p.plazoDias} días` : p.estado === 'listo' ? '' : faltan(habiles(HOY, p.fecha));
  const fila = p => { const late = vencido(p), nx = siguiente[p.estado];
    return `<tr${late ? ' class="row-late"' : ''}><td class="nowrap${late ? ' fecha-vencida' : ''}">${p.estado === 'entregado' ? fechaDia(p.fecha) : `<button type="button" class="entrega-btn" aria-haspopup="dialog" title="Clic para ${p.estado === 'diseno' ? 'cambiar el plazo' : 'cambiar la fecha'}." data-real="${esc(REAL(p.estado === 'diseno' ? 'abre el plazo en días hábiles que corre cuando llegue el diseño.' : 'abre un calendario para cambiar la fecha de entrega y avisa al responsable.'))}"><span class="entrega-fecha">${p.estado === 'diseno' ? 'Sin fecha' : fechaDia(p.fecha)}</span>${debajo(p) ? `<span class="entrega-falta">${debajo(p)}</span>` : ''}</button>`}${late ? '<span class="pill p-arreglo ml-2">Vencido</span>' : ''}</td>
      <td class="whitespace-nowrap"><span class="cell-main">${esc(p.cliente)}</span><span class="cell-sub">${tel(p.telefono)}</span></td>
      <td class="truncate min-w-[110px] max-w-0 w-full" title="${esc(p.descripcion)}">${p.adjuntos ? `<span class="mr-1.5 inline-flex items-center gap-0.5 align-middle text-ink-subtle" title="${p.adjuntos} adjunto">${ic('FileText', 14)}<span class="text-caption">${p.adjuntos}</span><span class="bi-sr-only"> adjunto</span></span>` : ''}${esc(p.descripcion)}</td>
      <td class="num">${p.cantidad}</td><td class="2xl:whitespace-nowrap">${p.responsable ? esc(p.responsable) : '<span class="note">Sin asignar</span>'}</td>
      <td><span class="pill ${pillEstado[p.estado]}">${estadoLabel[p.estado]}</span></td>
      <td class="num whitespace-nowrap"><div class="acciones-pedido"><button type="button" class="btn btn-sm btn-ghost px-2" aria-label="Editar el pedido de ${esc(p.cliente)}" title="Editar fecha, datos y adjuntos" data-real="${esc(REAL('abre el pedido para cambiar la fecha, los datos, el responsable y los adjuntos.'))}">${ic('Pencil', 16)}</button>
        ${nx ? `<button type="button" class="btn btn-sm paso-pedido" data-avanzar="${p.id}" aria-label="Pasar el pedido de ${esc(p.cliente)} a ${estadoLabel[nx]}"><span class="hidden 2xl:inline">Pasar a ${estadoLabel[nx]}</span><span class="inline-flex items-center gap-1 2xl:hidden">${ic('ArrowRight', 14)}${nx === 'produccion' ? 'Producción' : estadoLabel[nx]}</span></button>` : '<span class="paso-pedido" aria-hidden="true"></span>'}</div></td></tr>`; };
  const RAPIDOS = [['0', 'Hoy'], ['3', '3 días'], ['5', '5 días'], ['10', '10 días']];
  const form = S.nuevo ? `<form class="card accent" aria-label="Nuevo pedido"><div class="card-head mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-1"><div class="min-w-0"><h2 class="flex items-center gap-2 text-section text-ink">Nuevo pedido</h2><p class="card-sub mt-0.5 text-body-sm text-ink-subtle">Los campos con * son obligatorios. El responsable recibe los recordatorios por WhatsApp.</p></div></div>
    <div class="form-row"><label class="field grow"><span>Cliente *</span><input data-input="nCliente" value="${esc(S.nCliente)}"></label><label class="field w-[170px]"><span>Teléfono</span><input data-input="nTel" value="${esc(S.nTel)}" inputmode="tel" placeholder="51..."></label><label class="field grow"><span>Descripción *</span><input data-input="nDesc" value="${esc(S.nDesc)}" placeholder="ej. 100 llaveros, logo 1 cara"></label></div>
    <div class="form-row mt-2.5"><label class="field w-[110px]"><span>Cantidad</span><input data-input="nCant" value="${esc(S.nCant)}" inputmode="numeric"></label><label class="field w-[210px]"><span>Responsable</span><select><option>Sin asignar</option><option>Administrador demo</option><option>Equipo demo</option></select></label></div>
    <div class="form-row mt-2.5"><div class="plazo-entrega" role="group" aria-label="Plazo de entrega"><span class="plazo-titulo">Plazo de entrega * <span class="note">(días hábiles, lunes a viernes sin feriados)</span></span>
      <div class="plazo-fila"><div class="segmented plazo-rapidos" role="group" aria-label="Plazos rápidos">${RAPIDOS.map(([n, l]) => `<button type="button" data-plazo="${n}" aria-pressed="${S.plazo === n}">${l}</button>`).join('')}</div>
        <span class="note">${S.diseno ? `${S.plazo} días hábiles desde que llegue el diseño` : `${S.plazo} días hábiles = ${fechaDia(sumarHabiles(HOY, Number(S.plazo)))}`}</span></div>
      <label class="plazo-diseno"><input type="checkbox" data-diseno ${S.diseno ? 'checked' : ''}> Falta el diseño del cliente: el plazo empieza cuando llegue (mientras tanto el pedido no se vence)</label></div>
      <div class="btn-row"><button type="button" class="btn btn-primary" data-real="${esc(REAL('crea el pedido y le envía al responsable los recordatorios por WhatsApp.'))}">Crear pedido</button><button type="button" class="btn" data-nuevo>Cancelar</button></div></div></form>` : '';
  return `<div class="page stack">${pageHeader({ title: 'Pedidos', count: v ? `${v} vencido${v === 1 ? '' : 's'}` : '',
      subtitle: 'Los pedidos en curso y sus fechas de entrega. El responsable recibe un recordatorio por WhatsApp 48 h y 24 h antes, y una alerta si se vence.', links: guias(false),
      actions: `<label class="search-box w-56 lg:w-64" title="Busca por cliente, teléfono o descripción">${ic('Search', 16)}<input data-input="pq" value="${esc(S.pq)}" aria-label="Buscar pedido por cliente, teléfono o descripción" placeholder="Buscar pedido…"></label>
        <button type="button" class="btn" title="Un recorrido de un minuto por esta página" data-real="${esc(REAL('inicia un recorrido guiado de un minuto por Pedidos: estados, plazos en días hábiles y avisos.'))}">${ic('LifeBuoy', 16)}Recorrido</button>
        <button type="button" class="btn btn-primary" data-nuevo aria-expanded="${S.nuevo}">${ic('Plus', 16)}Nuevo pedido</button>` })}
    <div class="kpi-grid kpi-5">${ESTADOS.map(e => kpi({ label: estadoLabel[e], value: n[e], icon: estadoIcon[e][0], tone: estadoIcon[e][1], foot: S.filtro === e ? 'Mostrando solo este estado' : 'Ver solo este estado', attrs: `data-kpi="${e}"`, pressed: S.filtro === e })).join('')}</div>
    ${form}${S.flash ? `<div role="status" class="flash">${esc(S.flash)}</div>` : ''}
    <section class="card" id="lista-pedidos">${tabs('Pedidos por estado', S.filtro, [
      { id: 'activos', label: 'Activos', count: all.filter(p => p.estado !== 'entregado').length }, { id: 'recibido', label: 'Recibidos', count: n.recibido },
      ...(n.diseno || S.filtro === 'diseno' ? [{ id: 'diseno', label: 'Falta diseño', count: n.diseno }] : []),
      { id: 'produccion', label: 'En producción', count: n.produccion }, { id: 'listo', label: 'Listos', count: n.listo }, { id: 'entregado', label: 'Entregados', count: n.entregado }, { id: 'todos', label: 'Todos', count: all.length }], 'data-filtro')}
      ${lista.length === 0 ? emptyState('Package', 'Sin pedidos en esta vista', t ? 'Nada coincide con la búsqueda.' : 'Cuando se confirme una venta o creen un pedido, aparece aquí.')
        : `<div class="table-scroll"><table class="cfg tabla-pedidos"><thead><tr><th>Entrega</th><th>Cliente</th><th>Descripción</th><th class="num">Cant.</th><th>Responsable</th><th>Estado</th><th><span class="bi-sr-only">Acción</span></th></tr></thead><tbody>${vis.map(fila).join('')}</tbody></table></div>${pager(pag, pages, lista.length, 'pedidos', 'data-ppage')}`}</section></div>`;
}

/* ---------- Inventario (Stock.tsx) ---------- */
const tituloCat = t => t.toLowerCase().replace(/(^|\s)\S/g, c => c.toUpperCase());
function inventario() {
  const venta = INVENTARIO.filter(i => i.venta), base = S.inv === 'venta' ? venta : INVENTARIO;
  const pal = S.iq.trim().toUpperCase().split(/\s+/).filter(Boolean);
  const lista = base.filter(i => pal.every(p => `${i.nombre} ${i.marca} ${i.categoria}`.toUpperCase().includes(p))).sort((a, b) => a.categoria.localeCompare(b.categoria) || a.nombre.localeCompare(b.nombre));
  const POR = 5, pages = Math.max(1, Math.ceil(lista.length / POR)), pag = Math.min(S.ipage, pages), vis = lista.slice((pag - 1) * POR, pag * POR);
  const con = venta.filter(i => i.stock > 0).length, ag = venta.filter(i => i.stock === 0).length, pocos = venta.filter(i => i.stock > 0 && i.stock <= 3).length;
  return `<div class="page stack">${pageHeader({ title: 'Inventario', subtitle: 'Lo que hay hoy en el almacén de insumos del sistema de inventario, copiado cada 5 minutos. Es la misma lista con la que el Asistente confirma colores y unidades de filamentos y resinas. Solo lectura: los cambios se hacen en el sistema de inventario.', links: guias(false) })}
    <div class="kpi-grid">${kpi({ label: 'Disponibles', value: `${con} de ${venta.length}`, foot: 'Filamentos y resinas que el Asistente ofrece hoy', icon: 'Check', tone: 'teal' })}${kpi({ label: 'Agotados', value: ag, foot: 'El Asistente ofrece otro color o material', icon: 'AlertTriangle', tone: 'amber' })}
      ${kpi({ label: 'Quedan pocas', value: pocos, foot: '3 unidades o menos', icon: 'Clock', tone: 'violet' })}${kpi({ label: 'Actualizado desde el inventario', value: 'Hace 3 min', foot: '19-oct., 09:12 a. m. · se renueva cada 5 min', icon: 'RefreshCw', tone: 'blue' })}</div>
    <section class="card">${tabs('Qué productos ver', S.inv, [{ id: 'venta', label: 'Filamentos y resinas', count: venta.length }, { id: 'todo', label: 'Todos los insumos', count: INVENTARIO.length }], 'data-inv',
      `<label class="search-box w-full sm:w-64" title="Busca por nombre, color, marca o categoría">${ic('Search', 16)}<input data-input="iq" value="${esc(S.iq)}" aria-label="Buscar producto por nombre, color, marca o categoría" placeholder="Buscar producto…"></label>`)}
      ${lista.length === 0 ? emptyState('Search', 'Ningún producto coincide', 'Pruebe con otro nombre, color o marca.') : `<div class="table-scroll"><table class="cfg"><thead><tr><th>Producto</th><th>Marca</th><th>Categoría</th><th class="num">Unidades</th><th class="num">Precio de lista</th></tr></thead><tbody>${vis.map(i =>
        `<tr><td><span class="cell-main">${esc(i.nombre)}</span></td><td>${esc(i.marca)}</td><td>${esc(tituloCat(i.categoria))}</td><td class="num nowrap">${i.stock === 0 ? '<span class="pill p-arreglo">Agotado</span>' : nf(i.stock)}</td><td class="num nowrap">${soles(i.precio)}</td></tr>`).join('')}</tbody></table></div>`}
      ${pager(pag, pages, lista.length, 'productos', 'data-ipage')}</section></div>`;
}

/* ---------- Informes ---------- */
const INF_SECS = [['numeros', 'Los grandes números de setiembre'], ['mes', 'Cómo se movió el mes'], ['ventas', 'Ventas'], ['cierre', 'Por qué no cierran las ventas'], ['bien', 'Lo que salió bien'], ['mal', 'Lo que no funcionó'], ['lecciones', 'Lecciones aprendidas'], ['plan', 'Plan para vender más'], ['equipo', 'Lo que necesitamos del equipo']];
const MES_OPC = [['2026-10', 'octubre 2026 (en curso)'], ['2026-09', 'setiembre 2026'], ['2026-08', 'agosto 2026 (sin generar)']];
const barras = (filas, max, colores) => { const tope = max ?? Math.max(1, ...filas.map(f => f[1]));
  return `<div class="inf-bars">${filas.map(([nombre, valor, etiqueta], i) => `<div class="inf-bar"><span class="inf-bar-name">${esc(nombre)}</span><span class="inf-bar-track"><i style="width:${Math.max(2, valor / tope * 100)}%;background:${colores[i] || colores.at(-1)}"></i></span><b class="inf-bar-val">${esc(etiqueta ?? nf(valor))}</b></div>`).join('')}</div>`; };
const seccion = (id, n, titulo, body, nota = '') => `<section id="inf-${id}" class="inf-sec" data-sec="${id}"><h2 class="inf-h"><span>${n}.</span> ${esc(titulo)}</h2>${nota ? `<p class="inf-sub">${esc(nota)}</p>` : ''}${body}</section>`;
const conTitulo = s => { const i = s.indexOf(':'); return i > 0 ? `<b>${esc(s.slice(0, i + 1))}</b>${esc(s.slice(i + 1))}` : esc(s); };
function informes() {
  const R = INFORME;
  const acciones = `<div class="flex flex-wrap items-center gap-2"><select class="input !w-auto min-w-[190px]" data-select="infMes" aria-label="Mes del informe">${MES_OPC.map(([v, l]) => `<option value="${v}"${S.infMes === v ? ' selected' : ''}>${l}</option>`).join('')}</select>
    ${S.infMes === '2026-09' ? `<button type="button" class="btn" data-full title="Ver el informe en pantalla completa (Esc para salir)">${ic('Maximize2', 16)}Pantalla completa</button>
    <button type="button" class="btn" data-real="${esc(REAL('abre la ventana de impresión para guardar el informe como PDF.'))}">${ic('Printer', 16)}Imprimir / PDF</button>
    <button type="button" class="btn" data-real="${esc(REAL('abre el informe para editar a mano el análisis, el plan y los pedidos al equipo.'))}">${ic('Pencil', 16)}Editar</button>` : ''}
    <button type="button" class="btn btn-primary" data-real="${esc(REAL('vuelve a calcular los números del mes y el asistente reescribe el análisis (se pierden las ediciones hechas a mano).'))}">${ic('Sparkles', 16)}${S.infMes === '2026-09' ? 'Regenerar' : 'Generar informe'}</button></div>`;
  const head = `<div class="noprint">${pageHeader({ title: 'Informes mensuales', subtitle: 'El informe del mes para revisar con el equipo: los números del portal, el análisis del asistente y el plan. Se puede editar y exportar a PDF.', links: guias(true), actions: acciones })}</div>`;
  if (S.infMes !== '2026-09') {
    const curso = S.infMes === '2026-10';
    return `<div class="page">${head}<div class="empty-state">${ic('FileText', 28)}<b>Aún no hay informe de ${curso ? 'octubre 2026' : 'agosto 2026'}</b><span>${curso ? 'Octubre 2026 está en curso. Su informe se genera solo el último día del mes a las 23:59 y queda listo el día 1.' : 'Presione "Generar informe" para calcular los números del mes y redactar el análisis.'}</span></div></div>`;
  }
  const kpis = [['c-navy', '4', 'conversaciones con clientes', '4 clientes nuevos y 0 que ya estaban en la libreta. Semanas: 0, 0, 0, 3, 1.'], ['c-green', '100%', 'atendidas', '4 de 4 recibieron respuesta. Ninguna quedó sin contestar.'],
    ['c-green', '1 min', 'primera respuesta (mediana)', '9 de cada 10 en 1 min o menos, de día y de noche.'], ['c-amber', '25%', 'escribieron fuera de horario', '1 conversaciones empezaron fuera de lunes a viernes de 9 a 18. El 100% fue atendida igual.'],
    ['c-navy', '100%', 'recibieron un precio', '4 clientes tuvieron una cotización en el chat.'], ['c-green', '5', 'ventas verificadas · S/ 3,464', 'Con pago confirmado. Ticket promedio S/ 693. El Asistente cerró 3 (S/ 2,104), el equipo 2.']];
  const tope = Math.max(1, ...R.semanas, ...R.ventasSemanas);
  const tabla = (cols, filas) => `<table class="inf-table"><thead><tr>${cols.map(([c, num]) => `<th${num ? ' class="num"' : ''}>${c}</th>`).join('')}</tr></thead><tbody>${filas.map(f => `<tr>${f.map((x, i) => `<td${cols[i][1] ? ' class="num"' : ''}>${x}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  const cuerpo = [
    seccion('numeros', 1, INF_SECS[0][1], `<div class="inf-kpis">${kpis.map(([c, v, b, p]) => `<div class="inf-kpi"><strong class="${c}">${v}</strong><b>${b}</b><p>${p}</p></div>`).join('')}</div>
      <p class="inf-nota">Conversión: 100% de todas las conversaciones y 100% de las que recibieron precio. Solo cuentan las ventas registradas en el portal con pago verificado. Quedan 2 pagos por verificar (S/ 252).</p>`),
    seccion('mes', 2, INF_SECS[1][1], `<div class="inf-2col"><div class="inf-box"><h3>Del primer mensaje a la venta</h3>${barras([['Conversaciones', 4], ['Atendidas', 4], ['Recibieron precio', 4], ['Ventas verificadas', 5]], 5, ['#283a8f', '#3c51b5', '#6274d4', '#0f8a6a'])}<p class="inf-nota">Las ventas incluyen las que el equipo cerró por teléfono o en tienda y registró en el portal, por eso pueden ser más que los chats.</p></div>
      <div class="inf-box"><h3>Semana a semana</h3><div class="inf-weeks" role="img" aria-label="Conversaciones y ventas por semana">${R.semanas.map((c, i) => { const v = R.ventasSemanas[i];
        return `<div class="inf-week"><div class="inf-week-bars"><i class="w-conv" style="height:${c / tope * 100}%" title="${c} conversaciones"><em>${c || ''}</em></i><i class="w-venta" style="height:${v / tope * 100}%" title="${v} ventas"><em>${v || ''}</em></i></div><span>Sem ${i + 1}</span></div>`; }).join('')}</div>
        <div class="inf-legend"><span><i class="w-conv"></i>Conversaciones</span><span><i class="w-venta"></i>Ventas verificadas</span></div></div></div>
      <div class="inf-2col"><div class="inf-box"><h3>De dónde vienen las consultas</h3>${tabla([['Origen'], ['Chats', 1], ['Ventas', 1], ['Monto', 1]], R.origenes.map(([o, n, v, m]) => [esc(o), n, v, S0(m)]))}</div>
        <div class="inf-box"><h3>Interés por producto</h3>${barras(R.productos, undefined, ['#283a8f'])}<p class="inf-nota">Clasificación orientativa por las palabras del cliente.</p></div></div>`),
    seccion('ventas', 3, INF_SECS[2][1], `<div class="inf-2col"><div class="inf-box"><h3>Quién cerró</h3><div class="inf-split" role="img" aria-label="Asistente 3, equipo 2"><i class="s-asistente" style="flex:3"></i><i class="s-equipo" style="flex:2"></i></div>
      <div class="inf-split-legend"><div><i class="s-asistente"></i><b>Asistente</b> 3 ventas · S/ 2,104</div><div><i class="s-equipo"></i><b>Equipo</b> 2 ventas · S/ 1,360</div></div>
      <div class="inf-mini"><div><strong>S/ 693</strong><span>ticket promedio</span></div><div><strong>25%</strong><span>chats donde intervino el equipo (1)</span></div><div><strong>2</strong><span>pagos por verificar · S/ 252</span></div></div></div>
      <div class="inf-box"><h3>Lo que más se vendió</h3>${tabla([['Producto'], ['Ventas', 1], ['Monto', 1]], R.ventasPorProducto.map(([p, n, m]) => [esc(p), n, S0(m)]))}</div></div>`),
    seccion('cierre', 4, INF_SECS[3][1], `${barras(R.motivos.map(([m, p]) => [m, p, p + '%']), 100, ['#e6242a', '#d98a00', '#283a8f'])}
      <div class="inf-2col"><div class="inf-card c-red"><h4>Callados después del precio</h4><p>De 2 chats que recibieron un precio y no compraron, <b>1 (50%) no volvió a escribir</b>. En 1 el último mensaje fue el precio.</p></div>
        <div class="inf-card c-navy"><h4>Pedidos perdidos</h4><p>Ningún pedido se marcó como perdido este mes.</p></div></div>
      <blockquote class="inf-cita">"¿Tienen PLA azul? Lo necesito para el viernes." (cliente demo, sin respuesta con alternativa)</blockquote>`, '2 clientes recibieron un precio y no compraron este mes.'),
    seccion('bien', 5, INF_SECS[4][1], `<div class="inf-2col">${R.bien.map(([t, d]) => `<div class="inf-card c-green"><h4>${esc(t)}</h4><p>${esc(d)}</p></div>`).join('')}</div>`),
    seccion('mal', 6, INF_SECS[5][1], `<div class="inf-2col">${R.mal.map(([t, d]) => `<div class="inf-card c-red"><h4>${esc(t)}</h4><p>${esc(d)}</p></div>`).join('')}</div>`),
    seccion('lecciones', 7, INF_SECS[6][1], `<div class="inf-2col"><div class="inf-card c-navy"><h4>Para el Asistente</h4><ul>${R.leccionesAsistente.map(l => `<li>${conTitulo(l)}</li>`).join('')}</ul></div><div class="inf-card c-amber"><h4>Para el equipo</h4><ul>${R.leccionesEquipo.map(l => `<li>${conTitulo(l)}</li>`).join('')}</ul></div></div>`),
    seccion('plan', 8, INF_SECS[7][1], `<table class="inf-table inf-plan"><thead><tr><th>#</th><th>Qué hacemos</th><th>Cómo se ve en la práctica</th><th>Dueño</th><th>Cuándo</th></tr></thead><tbody>${R.plan.map(([q, c, d, w], i) => `<tr><td>${i + 1}</td><td><b>${esc(q)}</b></td><td>${esc(c)}</td><td>${esc(d)}</td><td>${esc(w)}</td></tr>`).join('')}</tbody></table>
      <div class="inf-metas">${R.metas.map(([a, b, q, n]) => `<div class="inf-kpi"><strong class="c-amber">${a} → ${b}</strong><b>${esc(q)}</b><p>${esc(n)}</p></div>`).join('')}</div><p class="inf-nota">Son metas propuestas, no pronósticos.</p>`),
    seccion('equipo', 9, INF_SECS[8][1], `<ul class="inf-check">${R.pedidos.map(([q, t], i) => `<li class="${S.pedidosEquipo[i] ? 'hecho' : ''}"><label><input type="checkbox" data-hecho="${i}" ${S.pedidosEquipo[i] ? 'checked' : ''}><span><b>${esc(q)}:</b> ${esc(t)}</span></label></li>`).join('')}</ul>`),
  ].join('');
  const titulo = 'Asistente en setiembre de 2026: resultados, lecciones y plan (demo)';
  return `<div class="page">${head}<div class="inf-layout${S.infFull ? ' inf-full' : ''}">
    ${S.infFull ? `<div class="inf-full-bar noprint"><span class="truncate">${esc(titulo)}</span><button type="button" class="btn btn-sm" data-real="${esc(REAL('abre la ventana de impresión para guardar el informe como PDF.'))}">${ic('Printer', 16)}Imprimir / PDF</button><button type="button" class="btn btn-sm btn-primary" data-full>${ic('Minimize2', 16)}Salir de pantalla completa</button></div>` : ''}
    <nav class="inf-nav noprint" aria-label="Secciones del informe" data-fill><div class="inf-nav-lbl">En este informe</div>${INF_SECS.map(([id, t], i) => `<button type="button" data-ir="${id}" class="${S.activa === id ? 'on' : ''}"><span>${i + 1}</span>${esc(t)}</button>`).join('')}
      <div class="inf-nav-meta">Generado ${R.generado} por ${R.generadoPor}</div></nav>
    <div class="inf-scroll fill-scroll" data-fill data-keep="inf"><article class="inf-hoja"><header class="inf-cab"><div class="min-w-0"><h1 class="inf-titulo">${esc(titulo)}</h1><div class="inf-meta">la tienda · 1 al 30 de setiembre de 2026 · Para el equipo · Preparado por KHIPUAI</div></div><div class="inf-cab-der"><b>Para revisar en equipo</b><span>Datos del portal, no estimaciones</span></div></header>
      <div class="inf-frase"><b>En una frase:</b> ${esc(R.frase)}</div>${cuerpo}
      <footer class="inf-fuentes">Fuentes: portal de la tienda (conversaciones, ventas, pedidos y correcciones del 1 al 30 de setiembre de 2026). Ningún número es estimado; donde dice "meta" es una meta propuesta. El análisis lo redactó el asistente con esos datos. Informe de demostración con datos inventados.</footer></article></div></div></div>`;
}


/* ---------- Sign-in (pages/Login.tsx) ---------- */
const lsvg = (paths, size = 20, sw = 1.9) => svg(paths.map(d => ['path', { d }]), { size, stroke: sw });
const BENEFITS = [
  [['M12 20h9', 'M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z'], 'Diseño', 'De la idea al modelo listo.'],
  [['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z'], 'Precisión', 'Piezas exactas, capa por capa.'],
  [['M12 2 3 7v10l9 5 9-5V7l-9-5z', 'M3.3 7 12 12l8.7-5', 'M12 22V12'], 'Tecnología 3D', 'Impresión y prototipado rápido.'],
];
// Neutral drawing of a 3D printer in place of the app's workshop photo.
const ESCENA = `<svg viewBox="0 0 560 340" role="img" aria-label="Ilustración de una impresora 3D imprimiendo una pieza en un taller."><defs><linearGradient id="esc-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#dfe7fb"/><stop offset="1" stop-color="#c9d4f4"/></linearGradient></defs>
  <rect width="560" height="340" fill="url(#esc-bg)"/><rect y="262" width="560" height="78" fill="#b7c3ea"/><rect x="40" y="250" width="480" height="14" rx="4" fill="#8f9fd6"/>
  <rect x="170" y="60" width="220" height="192" rx="12" fill="#283a8f"/><rect x="186" y="76" width="188" height="160" rx="6" fill="#eef2fd"/>
  <rect x="196" y="98" width="168" height="10" rx="5" fill="#9aa8d8"/><rect x="258" y="104" width="44" height="26" rx="5" fill="#ee7d84"/><path d="M276 130h8l-4 10z" fill="#283a8f"/>
  <rect x="200" y="214" width="160" height="10" rx="3" fill="#9aa8d8"/><path d="M246 214v-50h68v50z" fill="#6274d4" opacity=".85"/><path d="M246 176h68M246 188h68M246 200h68" stroke="#eef2fd" stroke-width="2" opacity=".6"/>
  <rect x="72" y="214" width="62" height="36" rx="6" fill="#ffffff" opacity=".8"/><rect x="84" y="196" width="38" height="20" rx="4" fill="#0f8a6a" opacity=".75"/>
  <rect x="420" y="200" width="70" height="50" rx="6" fill="#ffffff" opacity=".8"/><circle cx="455" cy="225" r="16" fill="#d98a00" opacity=".75"/></svg>`;
function signin() {
  return `<div class="login-page"><div class="login-bg" aria-hidden="true"><span class="glow g1"></span><span class="glow g2"></span><span class="glow g3"></span>
    <svg class="login-wave" viewBox="0 0 1440 640" preserveAspectRatio="none"><defs><linearGradient id="login-wave-grad" x1="0" y1="0.35" x2="1" y2="0.65"><stop offset="0" stop-color="#c8cef8" stop-opacity="0.5"/><stop offset="0.45" stop-color="#aab2f4" stop-opacity="0.62"/><stop offset="0.78" stop-color="#bcd2fb" stop-opacity="0.4"/><stop offset="1" stop-color="#e3edfd" stop-opacity="0.28"/></linearGradient>
      <linearGradient id="login-wave-sheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity="0.5"/><stop offset="1" stop-color="#ffffff" stop-opacity="0.06"/></linearGradient></defs>
      <path fill="url(#login-wave-grad)" d="M0 640 C 150 560, 300 470, 430 360 C 560 250, 700 120, 880 110 C 1080 98, 1280 190, 1440 250 L1440 640 Z"/><path fill="url(#login-wave-sheen)" d="M170 640 C 320 520, 440 390, 590 320 C 720 260, 880 270, 1030 330 C 1190 395, 1320 460, 1440 435 L1440 640 Z"/></svg></div>
    <header class="login-top"><span class="login-mark" aria-label="Tienda demo"><span aria-hidden="true">T</span>Tienda demo</span><span class="login-top-sep" aria-hidden="true"></span><span class="login-top-name">Portal del equipo</span>
      <span class="login-top-secure">${lsvg(['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', 'm9 12 2 2 4-4'])} Acceso seguro</span></header>
    <main class="login-main"><div class="login-intro"><div class="login-eyebrow">Tienda demo · Portal de ventas</div><h1 class="login-h1">Ventas y pedidos, en un solo lugar.</h1>
      <p class="login-lead">Chats de WhatsApp, pedidos, inventario e informes: todo el espacio de trabajo del equipo, en un solo lugar.</p></div>
      <div class="login-extras"><div class="login-showcase"><figure class="login-scene">${ESCENA}<figcaption class="scene-badge"><span class="dot" aria-hidden="true"></span> Impresión en curso</figcaption></figure>
        ${BENEFITS.map(([icon, b, t], i) => `<span class="bf bf-${i + 1}"><span class="bi">${lsvg(icon)}</span><span class="bf-txt"><b>${b}</b><small>${t}</small></span></span>`).join('')}</div></div>
      <form class="login-card" data-login><span class="login-mark login-logo" aria-label="Tienda demo"><span aria-hidden="true">T</span>Tienda demo</span>
        <h2 class="login-title">Portal de ventas</h2><p class="login-tag">Accede a tu espacio de trabajo</p>
        <label class="login-lbl" for="u">USUARIO</label><div class="login-field">${lsvg(['M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2', 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z'])}<input id="u" placeholder="Usuario" value="demo@example.com" autocomplete="username"></div>
        <label class="login-lbl" for="p">CLAVE</label><div class="login-field">${svg([['rect', { x: 4, y: 11, width: 16, height: 10, rx: 2 }], ['path', { d: 'M8 11V7a4 4 0 0 1 8 0v4' }]], { size: 19, stroke: 1.8 })}<input id="p" type="password" placeholder="Clave" autocomplete="current-password"></div>
        <button type="submit" class="login-submit" data-entrar><span>Entrar</span></button>
        <div class="login-o" aria-hidden="true"><span>o</span></div>
        <button type="button" class="login-google" data-real="${esc(REAL('abre el inicio de sesión con Google; solo entran las cuentas que un administrador enlazó a un usuario del portal.'))}">${svg([['circle', { cx: 12, cy: 12, r: 9 }], ['path', { d: 'M16.5 12H12' }], ['path', { d: 'M16.4 10.5A4.5 4.5 0 1 0 15.2 15.2' }]], { size: 18, stroke: 2.2 })}<span>Entrar con Google</span></button>
        <p class="login-foot">Operado por KHIPUAI · Acceso solo para el equipo de la tienda</p></form></main></div>`;
}

/* ---------- render and events ---------- */
const PAGES = { inicio, conversaciones, pedidos, inventario, informes, signin };
const app = document.getElementById('app');
const keep = {};
function fill() {
  if (window.innerWidth < 860) return;
  app.querySelectorAll('[data-fill]').forEach(el => { if (S.infFull && el.closest('.inf-full')) { el.style.height = ''; return; } el.style.height = Math.max(240, window.innerHeight - el.getBoundingClientRect().top - window.scrollY - (Number(el.dataset.fill) || 20)) + 'px'; });
}
function render(focusSel) {
  app.querySelectorAll('[data-keep]').forEach(el => { keep[el.dataset.keep] = el.scrollTop; });
  const active = document.activeElement, sel = focusSel || (active && active !== document.body && keyOf(active)), caret = active?.selectionStart;
  app.innerHTML = S.route === 'signin' ? signin() : `<div class="app-shell dashboard-shell flex min-h-screen">${rail()}<main class="min-w-0 flex-1">${topbar()}<div class="portal-main mx-auto max-w-[1600px] px-4 py-6 sm:px-8 sm:py-5" tabindex="-1">${PAGES[S.route]()}</div></main>${buscador()}</div>`;
  const de = document.documentElement;
  if (de.dataset.route === S.route) de.dataset.still = '1'; else delete de.dataset.still;
  de.dataset.route = S.route;
  fill();
  app.querySelectorAll('[data-keep]').forEach(el => { if (el.dataset.keep === 'thread' && S.bottom) el.scrollTop = el.scrollHeight; else if (keep[el.dataset.keep] != null) el.scrollTop = keep[el.dataset.keep]; });
  S.bottom = false;
  if (sel) { const el = app.querySelector(sel); if (el) { el.focus({ preventScroll: true }); if (caret != null && el.setSelectionRange) try { el.setSelectionRange(caret, caret); } catch {} } }
}
function keyOf(el) {
  for (const a of ['data-input', 'data-select', 'data-go', 'data-vista', 'data-filtro', 'data-inv', 'data-kpi', 'data-convo', 'data-ir', 'data-plazo', 'data-hecho', 'data-ppage', 'data-cpage', 'data-ipage', 'data-avanzar'])
    if (el.hasAttribute?.(a)) return `[${a}="${CSS.escape(el.getAttribute(a))}"]`;
  for (const a of ['data-plegar', 'data-bell', 'data-nuevo', 'data-orden', 'data-tomar', 'data-devolver', 'data-full', 'data-diseno']) if (el.hasAttribute?.(a)) return `[${a}]`;
  return null;
}
function go(r) {
  if (!isRoute(r)) return;
  Object.assign(S, { route: r, buscar: false, q: '', bell: false, flash: '', infFull: false });
  if (r === 'conversaciones') S.bottom = true;
  for (const k in keep) delete keep[k];
  if (location.hash !== '#/' + r) history.replaceState(null, '', '#/' + r);
  render(); window.scrollTo(0, 0); app.querySelector('.portal-main')?.focus({ preventScroll: true });
}
app.addEventListener('click', e => {
  const t = e.target.closest('button, a[href^="#/"], [data-cerrar-buscar]');
  if (!t || t.disabled || t.closest('[data-real]')) { if (S.bell && !e.target.closest('.bell')) { S.bell = false; render(); } return; }
  const d = t.dataset;
  if (t.matches('a[href^="#/"]')) { e.preventDefault(); return go(t.getAttribute('href').slice(2)); }
  if (d.go) return go(d.go);
  if (t.hasAttribute('data-entrar')) { e.preventDefault(); return go('inicio'); }
  if (t.hasAttribute('data-cerrar-buscar')) { if (e.target.closest('.search-modal') && !e.target.closest('button[data-cerrar-buscar]')) return; S.buscar = false; }
  else if (t.hasAttribute('data-buscar')) { S.buscar = true; S.q = ''; S.qSel = 0; return render('[data-qbox]'); }
  else if (t.hasAttribute('data-plegar')) S.plegado = !S.plegado;
  else if (t.hasAttribute('data-bell')) S.bell = !S.bell;
  else if (d.kpi) { S.filtro = S.filtro === d.kpi ? 'activos' : d.kpi; S.ppage = 1; }
  else if (d.filtro) { S.filtro = d.filtro; S.ppage = 1; }
  else if (d.ppage) S.ppage = Number(d.ppage);
  else if (t.hasAttribute('data-nuevo')) { S.nuevo = !S.nuevo; S.flash = ''; }
  else if (d.plazo) S.plazo = d.plazo;
  else if (d.avanzar) {
    const p = S.pedidos.find(x => x.id === d.avanzar), nx = siguiente[p.estado]; if (!nx) return;
    if (p.estado === 'diseno') { p.fecha = sumarHabiles(HOY, p.plazoDias || 5); S.flash = `${p.cliente}: llegó el diseño, pasa a producción con entrega el ${fechaDia(p.fecha)} (${p.plazoDias || 5} días hábiles).`; }
    else S.flash = `${p.cliente}: ${estadoLabel[nx]}.`;
    p.estado = nx;
  }
  else if (d.vista) { S.vista = d.vista; S.cpage = 1; }
  else if (t.hasAttribute('data-orden')) S.orden = S.orden === 'reciente' ? 'antigua' : 'reciente';
  else if (d.cpage) S.cpage = Number(d.cpage);
  else if (d.convo) { S.sel = d.convo; S.bottom = true; S.texto = ''; }
  else if (t.hasAttribute('data-tomar')) S.convos.find(c => c.id === S.sel).estado = 'humano';
  else if (t.hasAttribute('data-devolver')) S.convos.find(c => c.id === S.sel).estado = 'asistente';
  else if (d.archivar) { S.convos.find(c => c.id === S.sel).archivado = d.archivar === '1'; S.sel = null; }
  else if (d.inv) { S.inv = d.inv; S.ipage = 1; }
  else if (d.ipage) S.ipage = Number(d.ipage);
  else if (t.hasAttribute('data-full')) S.infFull = !S.infFull;
  else if (d.ir) { S.activa = d.ir; render(); app.querySelector('#inf-' + d.ir)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
  else return;
  render();
});
app.addEventListener('submit', e => { if (e.target.matches('[data-login]')) { e.preventDefault(); go('inicio'); } });
app.addEventListener('change', e => {
  const t = e.target;
  if (t.dataset.select) { S[t.dataset.select] = t.value; S.cpage = 1; if (t.dataset.select === 'infMes') S.infFull = false; render(); }
  else if (t.hasAttribute('data-diseno')) { S.diseno = t.checked; render('[data-diseno]'); }
  else if (t.dataset.hecho) { S.pedidosEquipo[Number(t.dataset.hecho)] = t.checked; render(); }
});
app.addEventListener('input', e => {
  const t = e.target, k = t.dataset.input; if (!k) return;
  S[k] = t.value;
  if (['nCliente', 'nTel', 'nDesc', 'nCant'].includes(k)) return;
  if (k === 'texto') { const b = app.querySelector('[data-enviar]'); if (b) b.disabled = !t.value.trim(); return; }
  if (k === 'pq') S.ppage = 1; if (k === 'cq') S.cpage = 1; if (k === 'iq') S.ipage = 1; if (k === 'q') S.qSel = 0;
  render();
});
app.addEventListener('scroll', e => {
  const box = e.target; if (!box.matches?.('.inf-scroll')) return;
  const top = box.getBoundingClientRect().top + box.clientHeight * 0.3;
  let on = INF_SECS[0][0];
  box.querySelectorAll('[data-sec]').forEach(s => { if (s.getBoundingClientRect().top <= top) on = s.dataset.sec; });
  if (box.scrollTop + box.clientHeight >= box.scrollHeight - 4) on = INF_SECS.at(-1)[0];
  if (on !== S.activa) { S.activa = on; app.querySelectorAll('.inf-nav [data-ir]').forEach(b => b.classList.toggle('on', b.dataset.ir === on)); }
}, true);
app.addEventListener('keydown', e => {
  const tab = e.target.closest?.('[role="tab"]');
  if (tab && ['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(e.key)) {
    const all = [...tab.parentElement.querySelectorAll('[role="tab"]')], i = all.indexOf(tab), n = all.length;
    const to = e.key === 'ArrowRight' ? (i + 1) % n : e.key === 'ArrowLeft' ? (i - 1 + n) % n : e.key === 'Home' ? 0 : n - 1;
    e.preventDefault(); all[to].focus(); if (!all[to].dataset.real) all[to].click(); return;
  }
  if (e.target.matches?.('[data-qbox]')) {
    const res = [...app.querySelectorAll('.search-item')];
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); S.qSel = Math.max(0, Math.min(res.length - 1, S.qSel + (e.key === 'ArrowDown' ? 1 : -1))); render(); }
    else if (e.key === 'Enter') { e.preventDefault(); res[Math.min(S.qSel, res.length - 1)]?.click(); }
  }
});
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); S.buscar = !S.buscar; S.q = ''; S.qSel = 0; render(S.buscar ? '[data-qbox]' : null); }
  else if (e.key === 'Escape' && !document.querySelector('.mini-note.on')) {
    if (S.buscar) { S.buscar = false; render('[data-buscar]'); } else if (S.bell) { S.bell = false; render('[data-bell]'); } else if (S.infFull) { S.infFull = false; render('[data-full]'); }
  }
});
window.addEventListener('resize', fill);
window.addEventListener('hashchange', () => { const r = location.hash.replace('#/', ''); if (isRoute(r) && r !== S.route) go(r); });
const start = location.hash.replace('#/', '');
if (isRoute(start)) S.route = start;
if (S.route === 'conversaciones') S.bottom = true;
mini({ label: 'Demo, datos inventados', ok: 'Entendido' });
render();
