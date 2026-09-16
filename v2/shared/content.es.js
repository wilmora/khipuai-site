/* Spanish content, mirroring shared/content.js key for key.
 *
 * Not a translation written here. Every string is lifted from the live
 * Spanish site (es/index.html), which was written for this business and is
 * what it already ranks on. Translating afresh would have produced a second,
 * competing Spanish voice for no gain.
 *
 * The two files must keep the same shape: the page templates and the engine
 * index into them identically, so a key present in one and missing in the
 * other breaks the Spanish page and nothing else. checkContentParity in
 * kinetic.js guards that.
 *
 * Numbers, prices and client results are NOT translated or restated - they
 * are the same facts. Client anonymization is a hard rule here too.
 */
export const C = {
  brand: { name: 'KHIPUAI', founder: 'Wil Mora', email: 'wil@khipuai.co', domain: 'khipuai.co' },
  booking: 'https://calendly.com/wmorapal/30min',

  hero: {
    eyebrow: 'IA aplicada para equipos administrativos',
    headline: 'Descubre exactamente qué',
    headlineEm: 'debería automatizar tu equipo.',
    sub: 'La Auditoría de Automatización con IA: ajustada a tu situación, alrededor de dos semanas. Mapeo el trabajo manual, le pongo cifras de horas y dólares a cada tarea, y te entrego un primer paso claro.',
    cta: 'Agenda una llamada gratuita de 30 minutos',
    ctaAlt: 'Haz la autoevaluación de 5 minutos',
  },

  trust: [
    ['15 años', 'dirigiendo operaciones reales'],
    ['Con seguro E&O', 'responsabilidad profesional'],
    ['Acceso de solo lectura', 'nada cambia durante la auditoría'],
    ['EE. UU. y Canadá', 'remoto, estudio en Ontario'],
  ],

  stats: [
    ['hasta 80%', 'más rápida la revisión de especificaciones'],
    ['~$150K', 'ahorrados al año'],
    ['95%', 'de coincidencia con el cierre manual'],
  ],

  problem: {
    title: 'Tu equipo pierde decenas de horas al mes, y nadie las ha contado.',
    lead: 'En algún lugar de tu negocio, ahora mismo, una persona capaz está:',
    items: [
      'Volviendo a escribir datos de PDFs y correos en tus sistemas',
      'Persiguiendo aprobaciones entre bandejas de entrada y hojas de cálculo',
      'Rehaciendo el mismo reporte cada semana a mano',
      'Copiando los mismos datos de clientes o proveedores en tres herramientas distintas',
      'Conciliando cifras línea por línea porque los sistemas no se comunican entre sí',
    ],
    close: 'No es un problema de presupuesto. Es un problema de claridad.',
  },

  steps: [
    ['Llamada de descubrimiento', 'Gratis, de 20 a 30 minutos. Confirmamos que encajamos y elegimos las áreas que vale la pena revisar.'],
    ['Recorrido', 'Alrededor de una semana. Sesiones de trabajo para ver los flujos reales: los sistemas, los traspasos y los pasos manuales.'],
    ['Hoja de ruta y presentación', 'Semana dos. La hoja de ruta por escrito y una llamada en vivo sobre las principales oportunidades y el primer paso.'],
  ],

  deliverables: [
    ['Un mapa de oportunidades priorizado', 'Las 5 a 10 cosas que más vale la pena automatizar, en orden de prioridad.'],
    ['Las cifras', 'Horas ahorradas al mes, valor en dólares al año y esfuerzo de construcción.'],
    ['Una o dos victorias rápidas', 'Cosas sobre las que puedes actuar de inmediato, sin necesidad de un proyecto.'],
    ['Una secuencia recomendada', 'Qué hacer primero, segundo y tercero, con una inversión aproximada.'],
    ['Una llamada de presentación', 'Un recorrido en lenguaje claro contigo y tu equipo.'],
    ['Un documento que es tuyo', 'La hoja de ruta es tuya. Constrúyela con KHIPUAI, con tu equipo o con quien quieras.'],
  ],

  pricing: {
    note: 'Ajustado a tu situación, no un contador por horas. El estimador te da un rango; confirmamos la cifra en la llamada de descubrimiento, antes de empezar.',
    credit: 'La tarifa completa se acredita a tu construcción si contratas a KHIPUAI para implementarla dentro de los 30 días.',
    tiers: [
      { name: 'Estándar', amount: '$2,500', unit: 'USD, fija', for: 'La mayoría de empresas pequeñas y medianas; uno o dos departamentos.', featured: true },
      { name: 'Plus', amount: '$5,000', unit: 'USD, fija', for: 'Empresas más grandes o con varios departamentos; varios flujos de trabajo.' },
    ],
  },

  // The figures are identical to the English file on purpose: they are the
  // same results, not a separate set.
  work: [
    { t: 'Revisión de especificaciones asistida por IA', big: '~$150K / año', lab: 'ahorrados, con la revisión técnica hasta 80% más rápida',
      d: 'Un sistema asistido por IA para revisar especificaciones técnicas en una empresa norteamericana de materiales de construcción. El flujo de contratos se reconstruyó a su alrededor.' },
    { t: 'Documentos entran, registros ERP salen', big: '0', lab: 'registros asentados sin que una persona los apruebe',
      d: 'Para una firma norteamericana de servicios administrativos, un flujo que lee PDFs de facturas de proveedores y deja registros en borrador listos para aprobar dentro de su propio ERP, con la fuente adjunta.' },
    { t: 'Control de calidad de nivel financiero', big: '6 cifras', lab: 'de fugas recurrentes detectadas, con ~95% de coincidencia con el cierre manual',
      d: 'Un evaluador de confianza VERDE/AMARILLO/ROJO sobre registros contables generados por máquina, más un motor de contratos contra reales.' },
    { t: 'Logística y despacho', big: '~15%', lab: 'menos costos de distribución, en 20 plantas y más de 280 camiones',
      d: 'Programación y ruteo para un productor de concreto premezclado que mueve más de un millón de metros cúbicos al año.' },
    { t: 'Analítica ejecutiva', big: '~95%', lab: 'de precisión en los KPIs que la dirección realmente usaba',
      d: 'Un tablero ejecutivo de ventas sobre SQL, Qlik Sense y AWS Redshift, que reemplazó reportes manuales lentos.' },
    { t: 'Rediseño del proceso de ventas', big: '~$1M', lab: 'en ventas adicionales, con 20% más proyectos revisados',
      d: 'Un proceso de ventas y control de calidad reconstruido con pasos claros y herramientas digitales en una empresa de materiales de construcción.' },
  ],

  founder: {
    name: 'Wil Mora',
    role: 'Fundador, KHIPUAI',
    quote: 'Creé esta propuesta porque seguía viendo lo mismo en cada empresa en la que trabajé: buena gente atrapada haciendo trabajo que debería hacer una computadora.',
    bio: '15 años del lado operativo de empresas reales en Perú, Estados Unidos y Canadá, con una carrera en finanzas como base. Supervisó plantas de producción de alto volumen y luego dirigió logística y servicio al cliente en 20 plantas y más de 280 camiones.',
  },

  faq: [
    ['¿Qué necesitas de nosotros?', 'Un par de horas del tiempo de tu equipo a lo largo de una semana, y una mirada a los flujos de trabajo y sistemas involucrados. Nada se automatiza ni se cambia durante la auditoría; primero es el diagnóstico.'],
    ['¿Están seguros nuestros datos?', 'Sí. Miro cómo fluye el trabajo, no tus secretos. Cualquier cosa que construya después corre dentro de tus propios controles de seguridad, con acceso de mínimo privilegio. Recibes un resumen de seguridad de una página para tu equipo de TI.'],
    ['¿La IA hará cambios por su cuenta?', 'No. Todo funciona como borrador, no como asiento automático: el sistema prepara el trabajo, y una persona revisa y aprueba. Es algo deliberado, y es la salvaguarda.'],
    ['¿Y si no encuentras mucho?', 'Entonces te lo digo con honestidad, y habrás invertido una pequeña tarifa acordada para saber que tu operación es más eficiente que la mayoría. Ese es un buen problema que tener.'],
    ['¿Tenemos que construir contigo?', 'No. La hoja de ruta es tuya. Si construyes con KHIPUAI dentro de los 30 días, la tarifa de la auditoría se acredita a ese trabajo.'],
  ],

  disclaimer: 'Los resultados descritos son el resultado de una sola empresa y no son un resultado típico ni garantizado.',
  legal: 'KHIPUAI es un estudio de Ontario, Canadá, que atiende a clientes en Estados Unidos y Canadá, y cuenta con seguro de responsabilidad profesional (E&O).',
};
