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
    eyebrow: 'Automatización con IA para operaciones de servicios recurrentes',
    headline: 'Encuentra el trabajo manual que más',
    headlineEm: 'le cuesta a tu equipo.',
    sub: 'En unas dos semanas, la Auditoría de Automatización con IA mapea los flujos de tu operación, cuantifica los cuellos de botella y entrega a operaciones, finanzas y TI un primer paso defendible.',
    cta: 'Agenda una llamada de encaje de 30 minutos',
    ctaAlt: 'Haz la autoevaluación de 5 minutos',
  },

  trust: [
    ['Dirigido por un operador', '15 años mejorando operaciones reales'],
    ['Aprobado por personas', 'las acciones importantes siguen bajo tu control'],
    ['Auditoría de solo lectura', 'nada cambia mientras diagnosticamos'],
    ['Sistemas existentes', 'trabajamos con las herramientas que tu equipo ya usa'],
  ],

  stats: [
    ['20 a 300 personas', 'el perfil principal de cliente'],
    ['Unas dos semanas', 'del recorrido a la hoja de ruta'],
    ['Una secuencia clara', 'qué hacer primero, segundo y tercero'],
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
    close: 'Antes de comprar otra herramienta, encuentra el trabajo que realmente vale la pena cambiar.',
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

  // Solo patrones de capacidad. Los proyectos con nombre y sus resultados se
  // agregan después de revisar la evidencia y el permiso de publicación.
  work: [
    { t: 'Finanzas y operaciones', big: '01', lab: 'Conciliar, preparar, aprobar, reportar',
      d: 'Conecta el trabajo operativo y financiero recurrente entre los sistemas que tu equipo ya usa, dirigiendo las excepciones a la persona correcta.' },
    { t: 'Decisiones basadas en documentos', big: '02', lab: 'Leer, estructurar, calcular, revisar',
      d: 'Convierte PDFs, planos, especificaciones, correos y hojas de cálculo en resultados estructurados, con la fuente y la incertidumbre claramente visibles.' },
    { t: 'Conversaciones con clientes', big: '03', lab: 'Responder, calificar, cotizar, transferir',
      d: 'Da respuestas más rápidas sin perder el control humano sobre los precios, las decisiones sensibles y la transferencia al equipo.' },
    { t: 'Centros internos de operaciones', big: '04', lab: 'Un lugar de trabajo según cada rol',
      d: 'Reúne flujos, documentos, tableros, aprobaciones e historial de auditoría en una interfaz construida alrededor del trabajo real del equipo.' },
  ],

  fit: {
    forTitle: 'Esto es para ti si',
    notTitle: 'Probablemente no es para ti si',
    forYou: [
      'Diriges una empresa de servicios recurrentes de 20 a 300 personas con trabajo administrativo complejo.',
      'Tu equipo mueve documentos, datos de clientes, información de facturación o aprobaciones entre varios sistemas.',
      'Un flujo repetitivo consume tiempo importante o crea riesgo financiero, de servicio o de cumplimiento.',
      'Necesitas un plan práctico y no tienes un equipo interno dedicado a automatización.',
    ],
    notForYou: [
      'Eres una empresa de software puro con operaciones limpias y de autoservicio.',
      'Eres un negocio muy pequeño con pocos procesos.',
      'No tienes trabajo administrativo repetitivo que eliminar.',
    ],
  },

  noLines: ['Sin gran compromiso de software.', 'Sin obligarte a usar una plataforma nueva.', 'Sin contador de consultoría abierto.'],

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
    ['¿Qué pasa después de la auditoría?', 'Si vale la pena construir la primera oportunidad, KHIPUAI puede definir una implementación de alcance fijo y continuar con mejora administrada. Tú decides después de ver la hoja de ruta.'],
  ],

  disclaimer: 'Las historias específicas de clientes y sus resultados medidos se agregarán después de revisar la evidencia y el permiso de publicación.',
  legal: 'KHIPUAI es un estudio de Ontario, Canadá, que atiende de forma remota a clientes en Estados Unidos y Canadá.',
};
