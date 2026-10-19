// Made-up data for the "Portal de ventas" miniature: an invented 3D printing shop
// ("Tienda demo"), invented customers marked (demo), and phone numbers in the
// obviously fake +51 900 000 0xx range. Nothing here comes from a real client.

export const HOY = '2026-10-19'; // lunes
export const HOY_TEXTO = 'Lunes, 19 de octubre';

export const PEDIDOS = [
  { id: 'p1', cliente: 'Inversiones Brisa Demo EIRL', telefono: '51900000018', descripcion: '200 llaveros planos con logo a 1 color', cantidad: 200, responsable: 'Equipo demo', estado: 'produccion', fecha: '2026-10-15', adjuntos: 1 },
  { id: 'p2', cliente: 'Rosa Villanueva (demo)', telefono: '51900000015', descripcion: 'Resina estándar gris 1 kg, recoge en tienda', cantidad: 1, responsable: 'Equipo demo', estado: 'listo', fecha: '2026-10-19' },
  { id: 'p3', cliente: 'Carla Quintana (demo)', telefono: '51900000017', descripcion: 'Mantenimiento básico de impresora 3D de escritorio', cantidad: 1, responsable: 'Administrador demo', estado: 'recibido', fecha: '2026-10-20' },
  { id: 'p4', cliente: 'Colegio Valle Verde (demo)', telefono: '51900000021', descripcion: '30 trofeos 3D personalizados para el campeonato', cantidad: 30, responsable: 'Equipo demo', estado: 'produccion', fecha: '2026-10-21' },
  { id: 'p5', cliente: 'Lucía Paredes (demo)', telefono: '51900000011', descripcion: '3 rollos PLA+ 1 kg (negro, blanco y rojo)', cantidad: 3, responsable: 'Equipo demo', estado: 'recibido', fecha: '2026-10-20' },
  { id: 'p6', cliente: 'Taller Cumbre SAC (demo)', telefono: '51900000012', descripcion: '50 soportes impresos en PETG negro', cantidad: 50, responsable: '', estado: 'diseno', fecha: '', plazoDias: 5 },
  { id: 'p7', cliente: 'Martín Salazar (demo)', telefono: '51900000014', descripcion: 'Filamento PETG 1 kg blanco', cantidad: 2, responsable: 'Equipo demo', estado: 'entregado', fecha: '2026-10-16' },
  { id: 'p8', cliente: 'Ana Torres (demo)', telefono: '51900000019', descripcion: '10 maceteros impresos en PLA mate', cantidad: 10, responsable: 'Administrador demo', estado: 'entregado', fecha: '2026-10-14' },
];

const c = (texto, ts, media) => ({ de: 'cliente', texto, ts, media });
const a = (texto, ts) => ({ de: 'asistente', texto, ts });
const e = (texto, ts, media) => ({ de: 'equipo', autor: 'Equipo demo', texto, ts, media });

export const CONVERSACIONES = [
  { id: 'c1', cliente: 'Lucía Paredes (demo)', telefono: '51900000011', estado: 'asistente', archivado: false, noLeidos: 0, orden: 9,
    libreta: { nombre: 'Lucía Paredes (demo)', consulto: 'filamento', ultima: '19-oct., 08:31 a. m.' },
    mensajes: [
      c('Hola, buenos días. ¿Tienen filamento PLA de 1 kg? Quiero varios colores.', '19-oct., 08:31 a. m.'),
      a('¡Hola! Sí, tenemos *PLA+ de 1 kg* a S/63 el rollo. ¿Qué colores le interesan? Si quiere le enviamos el catálogo de colores.', '19-oct., 08:32 a. m.'),
      c('Sí, por favor, mándeme el catálogo.', '19-oct., 08:33 a. m.'),
      e('', '19-oct., 08:37 a. m.', { nombre: 'Catalogo_colores_demo.pdf' }),
      e('Le envío el catálogo de colores. Hoy tenemos negro, blanco y rojo en stock.', '19-oct., 08:38 a. m.'),
      c('Perfecto, quiero 3 rollos: negro, blanco y rojo. Me llamo Lucía Paredes.', '19-oct., 08:50 a. m.'),
      a('Excelente, Lucía. Su pedido: *3 rollos PLA+ 1 kg (negro, blanco y rojo)* por S/189 en total. ¿Lo recoge en nuestro local o se lo enviamos?', '19-oct., 08:51 a. m.'),
      c('Lo recojo mañana en la tarde.', '19-oct., 08:54 a. m.'),
    ] },
  { id: 'c2', cliente: 'Martín Salazar (demo)', telefono: '51900000014', estado: 'asistente', archivado: false, noLeidos: 0, orden: 8,
    mensajes: [
      c('Buenas noches, ya hice el pago del PETG blanco. Le mando el comprobante.', '18-oct., 07:04 p. m.'),
      c('', '18-oct., 07:05 p. m.', { nombre: 'comprobante_demo.jpg' }),
      a('¡Gracias, Martín! Recibimos su comprobante. El equipo lo verifica y le confirmamos el despacho mañana temprano.', '18-oct., 07:06 p. m.'),
    ] },
  { id: 'c3', cliente: 'Taller Cumbre SAC (demo)', telefono: '51900000012', estado: 'humano', archivado: false, noLeidos: 0, orden: 7,
    mensajes: [
      c('Necesitamos 50 soportes en PETG negro. El diseño lo tiene nuestro ingeniero.', '18-oct., 10:41 a. m.'),
      a('Con gusto. Un asesor del equipo revisa el pedido y le confirma el plazo.', '18-oct., 10:42 a. m.'),
      e('Hola, soy del equipo. Son 5 días hábiles desde que llegue el diseño. ¿Nos lo envía por aquí?', '18-oct., 10:55 a. m.'),
      c('Sí, hoy en la tarde se lo mando.', '18-oct., 10:56 a. m.'),
      e('Perfecto. Apenas llegue el diseño empezamos a imprimir los 50 soportes.', '18-oct., 10:57 a. m.'),
    ] },
  { id: 'c4', cliente: 'Academia Los Pinos (demo)', telefono: '51900000013', estado: 'asistente', archivado: false, noLeidos: 0, orden: 6,
    mensajes: [
      c('¿Hacen trofeos impresos en 3D con el logo de la academia? Serían unos 40.', '17-oct., 04:30 p. m.'),
      a('Sí, hacemos trofeos personalizados. Para 40 unidades con logo el precio depende del tamaño. ¿Qué altura tendrían?', '17-oct., 04:31 p. m.'),
      c('Unos 15 cm. Lo necesitamos para fin de mes.', '17-oct., 04:33 p. m.'),
      a('Perfecto. Un asesor del equipo le escribe para coordinar el diseño y la fecha de entrega.', '17-oct., 04:34 p. m.'),
    ] },
  { id: 'c5', cliente: 'Rosa Villanueva (demo)', telefono: '51900000015', estado: 'derivado', archivado: false, noLeidos: 0, orden: 5,
    mensajes: [
      c('Hola, ¿la resina gris ya está lista para recoger?', '17-oct., 11:18 a. m.'),
      a('¡Hola, Rosa! Le paso el estado de su pedido con el equipo de tienda; en unos minutos le confirman.', '17-oct., 11:20 a. m.'),
    ] },
  { id: 'c6', cliente: 'Carla Quintana (demo)', telefono: '51900000017', estado: 'asistente', archivado: false, noLeidos: 0, orden: 4,
    mensajes: [
      c('Mi impresora hace ruido al mover la cama. ¿Hacen mantenimiento?', '16-oct., 09:05 a. m.'),
      a('Sí, el mantenimiento básico cuesta S/80 e incluye limpieza, ajuste de correas y calibración. ¿Qué día puede traerla?', '16-oct., 09:07 a. m.'),
      c('El martes 20 en la mañana.', '16-oct., 09:10 a. m.'),
      a('Listo, Carla. Agendamos el mantenimiento para el martes 20 en la mañana.', '16-oct., 09:12 a. m.'),
    ] },
  { id: 'c7', cliente: 'Jorge Ríos (demo)', telefono: '51900000016', estado: 'asistente', archivado: false, noLeidos: 0, orden: 3,
    mensajes: [
      c('¿Cuánto cuesta la resina lavable en agua?', '15-oct., 06:38 p. m.'),
      a('Le paso los precios de la resina lavable: S/110 la botella de 1 kg. Hoy tenemos 7 en stock.', '15-oct., 06:40 p. m.'),
    ] },
  { id: 'c8', cliente: 'Ana Torres (demo)', telefono: '51900000019', estado: 'asistente', archivado: true, noLeidos: 0, orden: 2,
    mensajes: [
      c('Ya recogí los maceteros, quedaron muy bonitos. ¡Gracias!', '14-oct., 05:12 p. m.'),
      a('¡Qué bueno que le gustaron, Ana! Gracias por su compra.', '14-oct., 05:13 p. m.'),
    ] },
  { id: 'c9', cliente: 'Pedro Gálvez (demo)', telefono: '51900000020', estado: 'asistente', archivado: true, noLeidos: 0, orden: 1,
    mensajes: [
      c('¿Venden boquillas de 0.4 mm?', '12-oct., 10:02 a. m.'),
      a('Sí, la boquilla de latón de 0.4 mm cuesta S/5. ¿Cuántas necesita?', '12-oct., 10:03 a. m.'),
    ] },
];

// Inventario: copia del sistema de inventario (venta = filamentos y resinas que ofrece el Asistente).
const it = (id, nombre, marca, categoria, stock, precio, venta = true) => ({ id, nombre, marca, categoria, stock, precio, venta });
export const INVENTARIO = [
  it(1, 'PLA+ 1 kg negro', 'Marca demo', 'FILAMENTO PLA', 12, 63),
  it(2, 'PLA+ 1 kg blanco', 'Marca demo', 'FILAMENTO PLA', 8, 63),
  it(3, 'PLA+ 1 kg rojo', 'Marca demo', 'FILAMENTO PLA', 3, 63),
  it(4, 'PLA+ 1 kg azul', 'Marca demo', 'FILAMENTO PLA', 0, 63),
  it(5, 'PLA mate 1 kg gris', 'Genérica', 'FILAMENTO PLA', 5, 58),
  it(6, 'PETG 1 kg negro', 'Marca demo', 'FILAMENTO PETG', 6, 70),
  it(7, 'PETG 1 kg blanco', 'Marca demo', 'FILAMENTO PETG', 2, 70),
  it(8, 'TPU flexible 1 kg natural', 'Genérica', 'FILAMENTO FLEXIBLE', 0, 95),
  it(9, 'Resina estándar 1 kg gris', 'Marca demo', 'RESINA', 4, 98),
  it(10, 'Resina lavable en agua 1 kg', 'Marca demo', 'RESINA', 7, 110),
  it(11, 'Resina transparente 1 kg', 'Genérica', 'RESINA', 1, 115),
  it(12, 'Boquilla de latón 0.4 mm', 'Genérica', 'REPUESTOS', 25, 5, false),
  it(13, 'Cama PEI magnética 235 mm', 'Genérica', 'REPUESTOS', 3, 85, false),
  it(14, 'Alcohol isopropílico 1 L', 'Genérica', 'LIMPIEZA', 10, 22, false),
  it(15, 'Guantes de nitrilo (caja)', 'Genérica', 'LIMPIEZA', 6, 18, false),
  it(16, 'Espátula de acero', 'Genérica', 'HERRAMIENTAS', 9, 12, false),
];

// Informe mensual de setiembre 2026 (demostración).
export const INFORME = {
  mes: '2026-09', etiqueta: 'setiembre 2026', generado: '19 oct.', generadoPor: 'Datos de demostración',
  frase: 'Informe de demostración con datos inventados. En setiembre de 2026 el Asistente atendió 4 de 4 conversaciones y envió precio en 4. Se confirmaron 5 ventas por S/ 3,464.',
  semanas: [0, 0, 0, 3, 1], ventasSemanas: [0, 0, 1, 2, 2],
  origenes: [['WhatsApp directo', 2, 3, 2104], ['Instagram', 1, 1, 680], ['Recomendación', 1, 1, 680]],
  productos: [['Filamento PLA+', 3], ['Resina', 2], ['Trofeos y piezas a medida', 2], ['Mantenimiento', 1]],
  ventasPorProducto: [['Trofeos y piezas a medida', 2, 1640], ['Filamento PLA+', 2, 1144], ['Resina', 1, 680]],
  motivos: [['Pidieron un precio y no volvieron a escribir', 50], ['Buscaban un color agotado', 25], ['El envío a provincia les pareció caro', 25]],
  bien: [['Respuesta en un minuto, de día y de noche', 'Las 4 conversaciones recibieron respuesta; la que llegó un sábado a las 21:40 también.'], ['Precio en el primer intercambio', 'Los 4 clientes recibieron un precio claro antes del tercer mensaje.']],
  mal: [['Colores agotados sin alternativa', 'Un cliente pidió PLA azul y no se le ofreció otro color en stock.'], ['Seguimiento después del precio', 'Dos clientes no respondieron después de la cotización y nadie les volvió a escribir.']],
  leccionesAsistente: ['Ofrecer una alternativa: si un color está agotado, sugerir el más parecido que sí hay.', 'Cerrar con una pregunta: después del precio, preguntar si lo recoge o se lo envían.'],
  leccionesEquipo: ['Verificar pagos el mismo día: dos comprobantes esperaron más de 24 h.', 'Responder los derivados antes de una hora.'],
  plan: [['Seguimiento a las 24 h', 'El Asistente vuelve a escribir a quien recibió precio y no respondió.', 'Asistente', 'Octubre'], ['Alternativas de color', 'Cuando falta un color, se ofrece el más parecido en stock.', 'Asistente', 'Octubre'], ['Pagos verificados el mismo día', 'El equipo revisa los comprobantes dos veces al día.', 'Equipo demo', 'Desde el lunes']],
  metas: [['50%', '75%', 'chats con precio que terminan en venta', 'Con el seguimiento a las 24 h.'], ['24 h', '4 h', 'tiempo para verificar un pago', 'Revisión en la mañana y en la tarde.']],
  pedidos: [['Equipo demo', 'Subir las fotos de los trofeos para el catálogo.', false], ['Administrador demo', 'Confirmar el precio del envío a provincia.', true], ['Equipo demo', 'Avisar cuando llegue el PLA azul.', false]],
};
