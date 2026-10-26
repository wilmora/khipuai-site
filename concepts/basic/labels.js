/* The trial's labels in English and Spanish: the homepage and the trial's
   other pages (about, security...) share them, so the menus read the same
   everywhere. Wording comes from the shared content files and the live
   homepage headings. */
export const LABELS = {
  en: {
    lang: 'en',
    title: 'KHIPUAI | AI Automation Solutions',
    bookShort: 'Book a Call',
    welcome: { kick: 'Welcome', see: 'Learn More' },
    problem: ['The hidden cost of manual work.', ''],
    steps: ['From the first call', 'to a product you own.'],
    // The four steps (Alex, 2026-10-20), replacing the shared three.
    flow: [
      ['Discovery Call', 'Free, 20 to 30 minutes. We confirm the fit and identify the areas worth reviewing.'],
      ['Walkthrough', 'About one week. Working sessions to review the actual workflows: systems, handoffs and manual steps.'],
      ['Solution Design', 'Week two. The design of a solution you will own, the plan and the price to build it.'],
      ['Build', 'Optional. Built by us, your team or another provider.'],
    ],
    own: ['A Product You Own', ''],
    get: ['The Deliverable', 'An action plan', 'to put in place.'],
    fit: ['The Fit', 'Who we are for.', ''],
    faq: ['Frequently asked', 'questions.'],
    aboutKick: 'The Team',
    founderAlt: 'Wil Mora, Founder of KHIPUAI',
    alex: { alt: 'Alex Pena, Developer at KHIPUAI', role: 'Developer',
      bio: 'Builds and tests the underlying systems: the website and the internal tools through which the automation is delivered.' },
    aboutHref: '/concepts/basic/about/', aboutLink: 'How KHIPUAI Works',
    pager: { pages: 'Pages', back: 'Back', next: 'Next', page: 'Page' },
    nav: { services: 'Services', menu: 'Menu', team: '' },
    tabs: { home: 'Home', start: 'Overview', ai: 'AI', get: 'Results', work: 'Portfolio', tools: 'Tools', security: 'Security', fit: 'Fit', questions: 'FAQs', operator: 'About' },
    securityHref: '/concepts/basic/security/',
    // Integrations (Alex and Wil, 2026-10-21): added to the shared tool list.
    // The whole Integrations row is switched off for now (SHOW_INTEGRATIONS
    // in basic.js).
    integrations: [['WhatsApp', 'Business messaging with your customers'], ['GitHub', 'Code hosting, reviews and version history'], ['3D Modelling Software', 'Models and drawings for design and production']],
    design: { nav: 'Solution Design', desc: 'The design, the plan and the price to build it.' },
    portal: { nav: 'Build Your Portal', desc: 'Select a template and features to see a draft price.' },
  },
  es: {
    lang: 'es',
    title: 'KHIPUAI | Soluciones de automatización con IA',
    bookShort: 'Agende una llamada',
    welcome: { kick: 'Le damos la bienvenida', see: 'Ver cómo trabajamos' },
    problem: ['Decenas de horas al mes', 'que nunca se han medido.'],
    steps: ['De la primera llamada', 'a un producto de su propiedad.'],
    flow: [
      ['Llamada de descubrimiento', 'Gratuita, de 20 a 30 minutos. Confirmamos la compatibilidad e identificamos las áreas que conviene revisar.'],
      ['Recorrido', 'Alrededor de una semana. Sesiones de trabajo para revisar los flujos reales: sistemas, traspasos y pasos manuales.'],
      ['Diseño de la solución', 'Semana dos. El diseño de una solución que será de su propiedad, el plan y el precio para construirla.'],
      ['Construcción', 'Opcional. La construimos nosotros, su equipo u otro proveedor.'],
    ],
    own: ['Un producto de su propiedad', 'El producto es tuyo.'],
    get: ['Qué recibe', 'Un plan de acción', 'para poner en marcha.'],
    fit: ['Para quién es', 'Para quién es el Diseño de la solución.', ''],
    faq: ['Preguntas', 'frecuentes.'],
    aboutKick: 'Liderazgo',
    founderAlt: 'Wil Mora, fundador de KHIPUAI',
    alex: { alt: 'Alex Pena, desarrollador en KHIPUAI', role: 'Desarrollador',
      bio: 'Construye y prueba los sistemas de base: el sitio web y las herramientas internas mediante las cuales se entrega la automatización.' },
    aboutHref: '/concepts/basic/es/about/', aboutLink: 'Cómo trabaja KHIPUAI',
    pager: { pages: 'Páginas', back: 'Atrás', next: 'Siguiente', page: 'Página' },
    nav: { services: 'Servicios', menu: 'Menú', team: 'Wil Mora · Alex Pena' },
    tabs: { home: 'Inicio', start: 'Resumen', ai: 'IA', get: 'Resultados', work: 'Portafolio', tools: 'Herramientas', security: 'Seguridad', fit: 'Para quién es', questions: 'Preguntas', operator: 'Nosotros' },
    securityHref: '/concepts/basic/es/security/',
    integrations: [['WhatsApp', 'Mensajería empresarial con sus clientes'], ['GitHub', 'Alojamiento de código, revisiones e historial de versiones'], ['Software de modelado 3D', 'Modelos y planos para diseño y producción']],
    design: { nav: 'Diseño de la solución', desc: 'Nuestro primer trabajo pagado: el diseño, el plan y el precio para construirla.' },
    portal: { nav: 'Construya su portal', desc: 'Seleccione una plantilla y funciones para ver un precio en borrador.' },
  },
};
