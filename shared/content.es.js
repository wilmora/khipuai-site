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

  heroProof: [
    ['15 años', 'mejorando operaciones'],
    ['Aprobado por personas', 'acciones, no cajas negras'],
    ['Creado para', 'operadores reales'],
  ],
  heroLabels: ['Personas', 'Procesos', 'Datos', 'Perspectivas', 'Automatización', 'Impacto'],
  heroAside: ['Sabiduría ancestral.', 'Inteligencia moderna.', 'Impacto real.'],

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
  },

  ai: {
    kick: 'Cómo usamos la IA',
    title: 'Tu equipo rinde más.',
    titleEm: 'Tus clientes reciben mejor servicio.',
    lead: 'Usamos Claude, de Anthropic, y otros modelos de lenguaje (LLM) para escribir y probar el software, no para manejar tus registros. El código que entregamos hace la lectura, la clasificación y los primeros borradores siempre de la misma forma, dentro de tus sistemas. Las decisiones las toma tu gente.',
    points: [
      ['Para tu equipo', 'El código lee los PDFs, correos y hojas de cálculo, completa los campos y redacta el reporte o la respuesta. Tu equipo revisa y aprueba en lugar de volver a escribir.'],
      ['Para tus clientes', 'Respuestas más rápidas y consistentes a cualquier hora, con tus propios precios, reglas y políticas, y un traspaso claro a una persona cuando hace falta.'],
      ['Para ti', 'Una persona aprueba cada acción importante: todo lo que mueve dinero, cambia un registro o te compromete con un cliente. Cada aprobación queda registrada.'],
    ],
  },

  // Solo patrones de capacidad: sin nombres de clientes ni resultados hasta
  // que cada cliente apruebe su publicación.
  portfolio: {
    kick: 'Portafolio',
    title: 'Lo que',
    titleEm: 'hemos construido.',
    cols: ['Proyecto', 'Qué hace', 'Quién aprueba'],
    items: [
      { t: 'Reportes de cumplimiento de nómina',
        d: 'Genera reportes de nómina certificada desde los datos de nómina y revisa el pago de cada trabajador contra las tarifas exigidas.',
        who: 'Nómina revisa las alertas y firma.' },
      { t: 'Listas de materiales desde planos',
        d: 'Lee los planos y prepara la lista de materiales, cada línea vinculada a su plano.',
        who: 'Expertos en producto la revisan antes de cotizar o pedir.' },
      { t: 'Asistente de cotización por WhatsApp',
        d: 'Responde preguntas y prepara cotizaciones por WhatsApp con los precios del negocio, a cualquier hora.',
        who: 'El equipo toma lo que queda fuera de las reglas.' },
      { t: 'Mesa de excepciones de facturación',
        d: 'Una sola cola para cada excepción de facturación, con datos del cliente de varios sistemas en una pantalla.',
        who: 'Facturación resuelve cada una.' },
      { t: 'Tickets de soporte con clasificación por IA',
        d: 'Lee cada ticket nuevo, marca tema y urgencia, y lo dirige a la persona correcta.',
        who: 'Los agentes responden cada ticket. La IA solo ordena.' },
    ],
    next: 'Cuéntanos qué flujo le cuesta más a tu equipo y te diremos con honestidad si vale la pena automatizarlo.',
    nextLink: 'Agenda una llamada',
    note: 'Los nombres de los clientes y los resultados medidos se mantienen privados hasta que cada cliente apruebe su publicación.',
  },

  tools: {
    kick: 'Herramientas con las que trabajamos',
    title: 'Integrado en los sistemas',
    titleEm: 'que ya usas.',
    items: [
      ['Business Central', 'Contabilidad y ERP, parte de Microsoft Dynamics 365'],
      ['Outlook', 'Correo, calendario y aprobaciones en Microsoft 365'],
      ['Azure', 'Alojamiento, identidad y seguridad en la nube de Microsoft'],
      ['Zendesk', 'Tickets de atención al cliente'],
      ['monday.com', 'Proyectos y flujos de trabajo del equipo'],
      ['Google Search Console', 'Cómo aparece tu sitio en las búsquedas de Google'],
      ['Meta', 'WhatsApp, Facebook e Instagram para empresas'],
      ['Claude de Anthropic', 'La IA con la que escribimos y probamos el código'],
    ],
    note: '¿No está en la lista? En la llamada de encaje confirmamos si tu sistema se puede conectar. Los nombres de productos son marcas de sus dueños; mencionarlos no implica una alianza ni un respaldo.',
  },

  // Cada práctica fue confirmada por KHIPUAI el 2026-10-16. No agregar
  // prácticas, certificaciones ni normas sin la misma confirmación.
  security: {
    kick: 'Seguridad y gobierno de datos',
    title: 'Tus datos siguen siendo tuyos.',
    titleEm: 'No van a un chatbot público.',
    points: [
      ['Construido con datos de prueba', 'Usamos IA para escribir y probar el código, con datos inventados o anonimizados. Tus registros nunca se envían a un modelo de IA mientras construimos.'],
      ['Tus sistemas, tus datos', 'Siempre que es posible construimos dentro de tu propio entorno, como tu Microsoft Azure, y no guardamos copias.'],
      ['Acceso de mínimo privilegio', 'Cuentas separadas con solo el acceso que el trabajo necesita, que se eliminan al terminar.'],
      ['IA en sistemas en uso', 'Si un sistema usa IA al funcionar, como al responder a clientes, va por la API empresarial de Anthropic y oculta datos como números de seguro social.'],
      ['Registro de auditoría completo', 'Cada acción que prepara el sistema queda registrada con quién la aprobó y cuándo.'],
      ['Devueltos o eliminados', 'Al terminar el proyecto, tus datos se devuelven o se eliminan.'],
    ],
    link: 'Lee la página de seguridad completa',
  },

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
    bio: '15 años dirigiendo operaciones en empresas de alta demanda en Canadá y Estados Unidos, donde cada día corría contra el reloj y cada retraso costaba dinero. Sé lo que de verdad cuesta el trabajo manual porque lo pagué en horas extra, errores y traspasos que se caían. Hoy construyo la automatización que me hubiera gustado tener.',
  },

  faq: [
    ['¿Qué necesitas de nosotros?', 'Un par de horas del tiempo de tu equipo a lo largo de una semana, y una mirada a los flujos de trabajo y sistemas involucrados. Nada se automatiza ni se cambia durante la auditoría; primero es el diagnóstico.'],
    ['¿Están seguros nuestros datos?', 'Sí. Durante la auditoría el acceso es de solo lectura. Construimos y probamos con datos inventados o anonimizados, así que tus registros nunca se envían a un modelo de IA mientras construimos. Lo que entregamos corre dentro de tus propios controles de seguridad, con acceso de mínimo privilegio y una persona aprobando cada acción importante. La página de seguridad detalla cada práctica.'],
    ['¿La IA hará cambios por su cuenta?', 'No. Todo funciona como borrador, no como asiento automático: el sistema prepara el trabajo, y una persona revisa y aprueba. Es algo deliberado, y es la salvaguarda.'],
    ['¿Y si no encuentras mucho?', 'Entonces te lo digo con honestidad, y habrás invertido una pequeña tarifa acordada para saber que tu operación es más eficiente que la mayoría. Ese es un buen problema que tener.'],
    ['¿Tenemos que construir contigo?', 'No. La hoja de ruta es tuya. Si construyes con KHIPUAI dentro de los 30 días, la tarifa de la auditoría se acredita a ese trabajo.'],
    ['¿Qué pasa después de la auditoría?', 'Si vale la pena construir la primera oportunidad, KHIPUAI puede definir una implementación de alcance fijo y continuar con mejora administrada. Tú decides después de ver la hoja de ruta.'],
  ],

  legal: 'KHIPUAI es un estudio de Ontario, Canadá, que atiende de forma remota a clientes en Estados Unidos y Canadá.',
};
