/* Professional wording for the trial (Alex, 2026-10-19: replace casual lines
   with plain, professional business language). The live site reads the same
   shared content files, so the trial swaps exact sentences in a copy of the
   content instead of editing those files. Same meaning and facts; nothing new
   is claimed. A sentence that is not listed passes through unchanged. */
const SWAP = {
  en: {
    'Somewhere in your business, right now, a capable person is:': 'In many service businesses, capable staff are still:',
    'Chasing approvals across inboxes and spreadsheets': 'Following up on approvals across inboxes and spreadsheets',
    'Before you buy another tool, find the work that is actually worth changing.': 'Before you invest in another tool, identify the work most worth improving.',
    'Not in a public chatbot.': 'It is never entered into a public AI chatbot.',
    'It is probably not for you if': 'It is not the right fit if',
    'You are a very small shop with little process.': 'You are a very small business with few established processes.',
    'What if you do not find much?': 'What if there are few opportunities?',
    // Solution Design in place of the audit (Alex, 2026-10-20).
    'In about two weeks, the AI Automation Audit maps the workflows behind your operation, quantifies the bottlenecks, and gives your operations, finance, and IT leaders a defensible first move.':
      'In about two weeks, Solution Design maps the workflows behind your operation, quantifies the bottlenecks, and designs the solution you will own, with a clear plan and price to build it.',
    'Book a 30-minute fit call': 'Book a free discovery call',
    'Book a fit call': 'Book a discovery call',
    'on the fit call': 'on the discovery call',
    'Read-only audit': 'Read-only while we design',
    'nothing changes while we diagnose': 'nothing changes in your systems',
    'from walkthrough to roadmap': 'from walkthrough to solution design',
    'The roadmap is yours. Build it with KHIPUAI, your team, or anyone else.': 'The design is yours. Build it with KHIPUAI, your team, or anyone else.',
    'A full audit trail': 'A complete activity record',
    'Nothing is automated or changed during the audit.': 'Nothing changes in your systems while we design.',
    'Access is read-only during the audit.': 'Access is read-only while we design.',
    'The audit says so.': 'We tell you so.',
    'The roadmap is yours to act on with anyone, including your own team.': 'The design is yours to act on with anyone, including your own team.',
    'What happens after the audit?': 'What happens after Solution Design?',
    'You decide after seeing the roadmap.': 'You decide after seeing the design and the price.',
    'KHIPUAI is an Ontario, Canada studio serving clients remotely across the United States and Canada.': 'KHIPUAI is an Ontario, Canada studio serving clients across the United States and Canada.',
    'wil@khipuai.co': 'alexp@khipuai.co',
    // Alex and Wil, 2026-10-21.
    'No new platform forced on you.': 'Centralize all your applications in one place.',
    'Tools we work with': 'Integrations',
    'That honesty is the product.': 'A candid answer is part of the value.',
    'and we will tell you honestly if it is worth automating.': 'and we will give you a candid assessment of whether it is worth automating.',
  },
  es: {
    'En algún lugar de tu negocio, ahora mismo, una persona capaz está:': 'En muchas empresas de servicios, personas capaces siguen:',
    'Persiguiendo aprobaciones entre bandejas de entrada y hojas de cálculo': 'Dando seguimiento a aprobaciones entre bandejas de entrada y hojas de cálculo',
    'Antes de comprar otra herramienta, encuentra el trabajo que realmente vale la pena cambiar.': 'Antes de invertir en otra herramienta, identifica el trabajo que más conviene mejorar.',
    'No van a un chatbot público.': 'Nunca se introducen en un chatbot público de IA.',
    'Probablemente no es para ti si': 'No es la opción adecuada si',
    'y te diremos con honestidad si vale la pena automatizarlo.': 'y te daremos una evaluación franca de si vale la pena automatizarlo.',
    'KHIPUAI es un estudio de Ontario, Canadá, que atiende de forma remota a clientes en Estados Unidos y Canadá.': 'KHIPUAI es un estudio de Ontario, Canadá, que atiende a clientes en Estados Unidos y Canadá.',
    'wil@khipuai.co': 'alexp@khipuai.co',
    'Sin obligarte a usar una plataforma nueva.': 'Centraliza todas tus aplicaciones en un solo lugar.',
    'Herramientas con las que trabajamos': 'Integraciones',
    '¿Y si no encuentras mucho?': '¿Qué pasa si hay pocas oportunidades?',
    'En unas dos semanas, la Auditoría de Automatización con IA mapea los flujos de tu operación, cuantifica los cuellos de botella y entrega a operaciones, finanzas y TI un primer paso defendible.':
      'En unas dos semanas, el Diseño de la solución mapea los flujos de tu operación, cuantifica los cuellos de botella y diseña la solución que será tuya, con un plan y un precio claros para construirla.',
    'Agenda una llamada de encaje de 30 minutos': 'Agenda una llamada de descubrimiento gratuita',
    'En la llamada de encaje': 'En la llamada de descubrimiento',
    'Auditoría de solo lectura': 'Solo lectura mientras diseñamos',
    'nada cambia mientras diagnosticamos': 'nada cambia en tus sistemas',
    'del recorrido a la hoja de ruta': 'del recorrido al diseño de la solución',
    'La hoja de ruta es tuya. Constrúyela con KHIPUAI, con tu equipo o con quien quieras.': 'El diseño es tuyo. Constrúyelo con KHIPUAI, con tu equipo o con quien quieras.',
    'Registro de auditoría completo': 'Registro completo de actividad',
    'Nada se automatiza ni se cambia durante la auditoría; primero es el diagnóstico.': 'Nada cambia en tus sistemas mientras diseñamos.',
    'Durante la auditoría el acceso es de solo lectura.': 'Mientras diseñamos, el acceso es de solo lectura.',
    'No. La hoja de ruta es tuya. Si construyes con KHIPUAI dentro de los 30 días, la tarifa de la auditoría se acredita a ese trabajo.': 'No. El diseño es tuyo. Si construyes con KHIPUAI dentro de los 30 días, la tarifa del Diseño de la solución se acredita a ese trabajo.',
    '¿Qué pasa después de la auditoría?': '¿Qué pasa después del Diseño de la solución?',
    'Tú decides después de ver la hoja de ruta.': 'Tú decides después de ver el diseño y el precio.',
    'Entonces te lo digo con honestidad, y habrás invertido una pequeña tarifa acordada para saber que tu operación es más eficiente que la mayoría. Ese es un buen problema que tener.':
      'Te lo decimos con franqueza. Una respuesta franca es parte del valor. Si no hay mucho que valga la pena automatizar, habrás invertido una tarifa pequeña y acordada para saberlo, en lugar de un año.',
  },
};

// Whole sentences the trial leaves out (Alex and Wil, 2026-10-21): a list
// item equal to one of these is dropped from its list.
const DROP = {
  en: ['You lead a 20 to 300-person recurring-service business with complex back-office work.'],
  es: ['Diriges una empresa de servicios recurrentes de 20 a 300 personas con trabajo administrativo complejo.'],
};

// Whole strings reworded in the wording editor (exact matches, applied
// before the sentence swaps above).
const OVERRIDE = {
  en: {
    "Rebuilding the same report every week by hand":
      "Rebuilding the same report manually every week",
    "KHIPUAI is an Ontario, Canada studio serving clients remotely across the United States and Canada.":
      "KHIPUAI is an Ontario, Canada studio serving clients across North and South America.",
    "The top 5 to 10 things worth automating, ranked.":
      "The top 5 to 10 automation opportunities, ranked.",
    "Billing exceptions workbench":
      "Billing Exceptions Workbench",
    "Do we have to build with you?":
      "Are we required to build with KHIPUAI?",
    "The full fee credits toward your build if you hire KHIPUAI to implement within 30 days.":
      "The full fee is credited toward implementation if you engage KHIPUAI to build within 30 days.",
    "No big software commitment.":
      "No large software commitment.",
    "Not on the list? We confirm on the fit call whether your system can be connected. Product names are trademarks of their owners; listing them is not a claim of partnership or endorsement.":
      "If your system is not listed, we confirm on the discovery call whether it can be connected. Product names are trademarks of their respective owners; listing them is not a claim of partnership or endorsement.",
    "The code reads the PDFs, emails and spreadsheets, fills in the fields, and drafts the report or the reply. Your team checks and approves instead of retyping.":
      "The code reads the PDFs, emails and spreadsheets, fills in the fields, and drafts the report or the reply. Your team reviews and approves instead of re-entering data.",
    "No open-ended consulting meter.":
      "No open-ended consulting fees.",
    "Human-approved":
      "Human-Approved",
    "The roadmap is yours. Build it with KHIPUAI, your team, or anyone else.":
      "The design is yours. Build it with KHIPUAI, your own team or another provider.",
    "Discovery call":
      "Discovery Call",
    "Client names and measured results stay private until each client approves publication.":
      "",
    "Read-only audit":
      "Read-Only During Design",
    "Roadmap and readout":
      "Roadmap and Readout",
    "Payroll compliance reporting":
      "Payroll Compliance Reporting",
    "Things you can act on right away, no project required.":
      "Improvements you can act on immediately, without a full project.",
    "Priced to your situation, not an hourly meter. The estimator gives you a range; we confirm the number on the discovery call, before any work starts.":
      "Pricing reflects your situation, not hourly billing. The estimator provides a range, and we confirm the final figure on the discovery call before any work begins.",
    "Who approves":
      "Who Approves",
    "A full audit trail":
      "A Complete Activity Record",
    "We don’t sell AI.":
      "We do not sell AI.",
    "How we use AI":
      "The Approach",
    "15 years":
      "15 Years",
    "Not in a public chatbot.":
      "It is never shared with public AI tools.",
    "nothing changes while we diagnose":
      "no changes to your systems",
    "No. The roadmap is yours to act on with anyone, including your own team.":
      "No. The design is yours to implement with any provider, including your own team.",
    "Your staff get more done.":
      "Your staff accomplish more.",
    "What it does":
      "What It Does",
    "Retyping data from PDFs and emails into your systems":
      "Manually re-entering data from PDFs and emails into your systems",
    "Find the manual work costing":
      "Automate what costs",
    "Yes. Access is read-only during the audit. We build and test with made-up or redacted data, so your records are never sent to an AI model while we build. What we deliver runs inside your own security controls, with least-privilege access and a person approving every important action. The security page sets out every practice.":
      "Yes. Access is read-only during design. We build and test with synthetic or redacted data, so your records are never sent to an AI model during the build. What we deliver runs inside your own security controls, with least-privilege access and a person approving every important action. The security page details each practice.",
    "It is probably not for you if":
      "Not the Right Fit If",
    "AI automation for recurring-service operations":
      "AI Automations",
    "A couple of hours of your team’s time across a week, and a look at the workflows involved. Access is read-only. Nothing is automated or changed during the audit.":
      "A couple of hours of your team’s time over one week, and a review of the workflows involved. Access is read-only, and nothing changes in your systems during design.",
    "Book a fit call":
      "Book a Discovery Call",
    "Material lists from drawings":
      "Material Lists from Drawings",
    "Support tickets with AI triage":
      "Support Tickets with AI Triage",
    "WhatsApp quoting assistant":
      "WhatsApp Quoting Assistant",
    "No. Everything is built draft-first: the machine prepares the work, a person approves every entry that matters.":
      "No. Everything is built draft-first: the system prepares the work, and a person approves every material entry.",
    "The audit says so. That honesty is the product. If there is not much worth automating, you have spent a small, agreed fee to find out instead of a year.":
      "We will say so directly. A candid answer is part of the value. If there is little worth automating, you will have learned it for a small, agreed fee rather than over a year.",
    "Your data stays yours.":
      "Your data remains yours.",
    "Read the full security page":
      "View the Full Security Page",
    "Take the 5-minute self-assessment":
      "Take the 5-Minute Self-Assessment",
    "You are a pure-product software company with clean self-serve operations.":
      "You are a pure software product company with streamlined self-serve operations.",
    "you already run.":
      "you already use.",
    "Operator-led":
      "Operator-Led",
    "For your customers":
      "For Your Customers",
    "Reconciling numbers line by line because the systems do not talk":
      "Reconciling numbers line by line because the systems are not integrated",
    "One or two quick wins":
      "One or Two Quick Wins",
    "Least-privilege access":
      "Least-Privilege Access",
    "Returned or deleted":
      "Returned or Deleted",
    "Staff take over anything outside the rules.":
      "Staff handle any request outside the defined rules.",
    "The numbers":
      "The Numbers",
    "Tell us the workflow costing your team the most, and we will tell you honestly if it is worth automating.":
      "",
    "work with the tools your team already uses":
      "compatible with the tools your team already uses",
    "your team the most.":
      "you the most.",
    "We use Claude, by Anthropic, and other large language models (LLMs) to write and test the software, not to handle your records. The code we deliver does the reading, sorting and first drafts the same way every time, inside your systems. Your people make the decisions.":
      "We use Claude, by Anthropic, and other large language models (LLMs) to write and test the software, not to handle your records. The code we deliver handles reading, sorting and first drafts consistently, inside your systems. Your team makes the decisions.",
    "Built with test data":
      "Built with Test Data",
    "AI in live systems":
      "AI in Live Systems",
    "Existing systems":
      "Existing Systems",
    "What to do first, second, third, with rough investment.":
      "What to do first, second and third, with approximate investment.",
    "A recommended sequence":
      "A Recommended Sequence",
    "Security and data governance":
      "Security and Data Governance",
    "A prioritized opportunity map":
      "A Prioritized Opportunity Map",
    "Where a system uses AI while it runs, such as answering customer messages, it goes through Anthropic’s business API, and details like social security numbers are masked or left out.":
      "Where a system uses AI in operation, such as answering customer messages, it runs through Anthropic’s business API, and sensitive details such as Social Security numbers are masked or excluded.",
    "15 years running operations in high-demand businesses across Canada and the US, where every day ran on deadlines and every delay cost money. I know what manual work really costs because I paid for it in overtime, errors and dropped handoffs. Now I build the automation I wished I had.":
      "15 years leading operations in high-demand businesses across Canada and the US, where deadlines drove every day and every delay carried a cost. I know the true cost of manual work because I paid for it in overtime, errors and missed handoffs. Today I build the automation I once needed.",
    "Built for":
      "Built For",
    "A live readout call":
      "A Live Readout Call",
    "Agents answer every ticket. The AI only sorts.":
      "Agents respond to every ticket. The AI only classifies.",
    "We use AI to write and test the code, with made-up or redacted data. Your records are never sent to an AI model while we build.":
      "We use AI to write and test the code with synthetic or redacted data. Your records are never sent to an AI model during the build.",
    "For you":
      "For You",
    "15 years improving real operations":
      "15 years improving operations",
    "I built this offer because I kept seeing the same thing in every business I worked in: good people stuck doing work a computer should do.":
      "I created this service because I saw the same pattern in every business I worked in: capable people occupied with work that a computer should handle.",
    "A document you own":
      "A Document You Own",
    "Separate accounts with only the access the job needs, removed when the work ends.":
      "Separate accounts with only the access the work requires, removed when the engagement ends.",
    "Book a 30-minute fit call":
      "Book a Free Discovery Call",
    "Week two. The written roadmap, and a live call through the top opportunities and the first move.":
      "Week two. A written roadmap and a live review of the top opportunities and the first step.",
    "Free, 20 to 30 minutes. We confirm there is a fit and pick the areas worth looking at.":
      "Free, 20 to 30 minutes. We confirm the fit and identify the areas worth reviewing.",
    "20 to 300 people":
      "20 to 300 People",
    "Somewhere in your business, right now, a capable person is:":
      "Capable staff are still:",
    "In about two weeks, the AI Automation Audit maps the workflows behind your operation, quantifies the bottlenecks, and gives your operations, finance, and IT leaders a defensible first move.":
      "We map the workflows behind your operation, quantify the bottlenecks, and design the solution you will own, with a clear plan and price to build it.",
    "For your staff":
      "For Your Staff",
    "Your systems, your data":
      "Your Systems, Your Data",
    "This is built for you if":
      "The Right Fit If",
    "Your customers get better service.":
      "Your customers receive better service.",
    "About one week. Working sessions to see the real workflows: the systems, the handoffs, the manual steps.":
      "About one week. Working sessions to review the actual workflows: systems, handoffs and manual steps.",
    "One clear sequence":
      "One Clear Sequence",
    "Your team is losing dozens of hours a month, and nobody has counted them.":
      "Your team loses dozens of untracked hours each month.",
    "About two weeks":
      "About Two Weeks",
  },
  es: {
    "Esto es para ti si":
      "Es la opción adecuada si",
    "Respuestas más rápidas y consistentes a cualquier hora, con tus propios precios, reglas y políticas, y un traspaso claro a una persona cuando hace falta.":
      "Respuestas más rápidas y consistentes a cualquier hora, con sus propios precios, reglas y políticas, y un traspaso claro a una persona cuando hace falta.",
    "Ajustado a tu situación, no un contador por horas. El estimador te da un rango; confirmamos la cifra en la llamada de descubrimiento, antes de empezar.":
      "El precio se ajusta a su situación, no a una tarifa por hora. El estimador ofrece un rango, y confirmamos la cifra final en la llamada de descubrimiento antes de comenzar cualquier trabajo.",
    "Siempre que es posible construimos dentro de tu propio entorno, como tu Microsoft Azure, y no guardamos copias.":
      "Siempre que es posible construimos dentro de su propio entorno, como su Microsoft Azure, y no guardamos copias.",
    "trabajamos con las herramientas que tu equipo ya usa":
      "compatible con las herramientas que su equipo ya utiliza",
    "Un documento que es tuyo":
      "Un documento de su propiedad",
    "Si un sistema usa IA al funcionar, como al responder a clientes, va por la API empresarial de Anthropic y oculta datos como números de seguro social.":
      "Cuando un sistema usa IA en operación, como al responder mensajes de clientes, funciona a través de la API empresarial de Anthropic, y los datos sensibles como los números de seguro social se ocultan o se excluyen.",
    "No tienes trabajo administrativo repetitivo que eliminar.":
      "No tiene trabajo administrativo repetitivo que eliminar.",
    "¿Qué necesitas de nosotros?":
      "¿Qué necesitan de nosotros?",
    "Cuentas separadas con solo el acceso que el trabajo necesita, que se eliminan al terminar.":
      "Cuentas separadas con solo el acceso que el trabajo requiere, que se eliminan al finalizar el proyecto.",
    "que ya usas.":
      "que ya utiliza.",
    "Cuéntanos qué flujo le cuesta más a tu equipo y te diremos con honestidad si vale la pena automatizarlo.":
      "Indíquenos qué flujo le cuesta más a su equipo y le daremos una evaluación franca de si conviene automatizarlo.",
    "Creé esta propuesta porque seguía viendo lo mismo en cada empresa en la que trabajé: buena gente atrapada haciendo trabajo que debería hacer una computadora.":
      "Creé este servicio porque vi el mismo patrón en cada empresa en la que trabajé: personas capaces ocupadas en tareas que debería realizar una computadora.",
    "Tus sistemas, tus datos":
      "Sus sistemas, sus datos",
    "Un flujo repetitivo consume tiempo importante o crea riesgo financiero, de servicio o de cumplimiento.":
      "Necesita un plan práctico y no cuenta con un equipo interno dedicado a la automatización.",
    "Volviendo a escribir datos de PDFs y correos en tus sistemas":
      "Ingresando manualmente datos de PDF y correos en sus sistemas",
    "15 años mejorando operaciones reales":
      "15 años mejorando operaciones",
    "Eres una empresa de software puro con operaciones limpias y de autoservicio.":
      "Es una empresa de software puro con operaciones de autoservicio ya optimizadas.",
    "El equipo toma lo que queda fuera de las reglas.":
      "El equipo atiende cualquier solicitud fuera de las reglas definidas.",
    "Tus clientes reciben mejor servicio.":
      "Sus clientes reciben un mejor servicio.",
    "Eres un negocio muy pequeño con pocos procesos.":
      "Es un negocio muy pequeño con pocos procesos establecidos.",
    "Una persona aprueba cada acción importante: todo lo que mueve dinero, cambia un registro o te compromete con un cliente. Cada aprobación queda registrada.":
      "Una persona aprueba cada acción importante: todo lo que mueve dinero, cambia un registro o lo compromete con un cliente. Cada aprobación queda registrada.",
    "Usamos Claude, de Anthropic, y otros modelos de lenguaje (LLM) para escribir y probar el software, no para manejar tus registros. El código que entregamos hace la lectura, la clasificación y los primeros borradores siempre de la misma forma, dentro de tus sistemas. Las decisiones las toma tu gente.":
      "Usamos Claude, de Anthropic, y otros modelos de lenguaje de gran tamaño (LLM) para escribir y probar el software, no para manejar sus registros. El código que entregamos realiza la lectura, la clasificación y los primeros borradores de forma consistente, dentro de sus sistemas. Las decisiones las toma su equipo.",
    "Los agentes responden cada ticket. La IA solo ordena.":
      "Los agentes responden cada ticket. La IA solo clasifica.",
    "Tus datos siguen siendo tuyos.":
      "Sus datos siguen siendo suyos.",
    "Sin obligarte a usar una plataforma nueva.":
      "Centralice todas sus aplicaciones en un solo lugar.",
    "Auditoría de solo lectura":
      "Solo lectura durante el diseño",
    "Para tus clientes":
      "Para sus clientes",
    "Tu equipo pierde decenas de horas al mes, y nadie las ha contado.":
      "Su equipo pierde decenas de horas no contabilizadas cada mes.",
    "Entonces te lo digo con honestidad, y habrás invertido una pequeña tarifa acordada para saber que tu operación es más eficiente que la mayoría. Ese es un buen problema que tener.":
      "Se lo diremos directamente. Una respuesta franca es parte del valor. Si hay poco que valga la pena automatizar, lo habrá sabido por una tarifa pequeña y acordada, en lugar de después de un año.",
    "Alrededor de una semana. Sesiones de trabajo para ver los flujos reales: los sistemas, los traspasos y los pasos manuales.":
      "Alrededor de una semana. Sesiones de trabajo para revisar los flujos reales: sistemas, traspasos y pasos manuales.",
    "Sí. Durante la auditoría el acceso es de solo lectura. Construimos y probamos con datos inventados o anonimizados, así que tus registros nunca se envían a un modelo de IA mientras construimos. Lo que entregamos corre dentro de tus propios controles de seguridad, con acceso de mínimo privilegio y una persona aprobando cada acción importante. La página de seguridad detalla cada práctica.":
      "Sí. Durante el diseño, el acceso es de solo lectura. Construimos y probamos con datos ficticios o anonimizados, por lo que sus registros nunca se envían a un modelo de IA durante la construcción. Lo que entregamos funciona dentro de sus propios controles de seguridad, con acceso de mínimo privilegio y una persona que aprueba cada acción importante. La página de seguridad detalla cada práctica.",
    "Agenda una llamada":
      "Agende una llamada de descubrimiento",
    "Si vale la pena construir la primera oportunidad, KHIPUAI puede definir una implementación de alcance fijo y continuar con mejora administrada. Tú decides después de ver la hoja de ruta.":
      "Si vale la pena construir la primera oportunidad, KHIPUAI puede definir una implementación de alcance fijo y continuar con mejora administrada. Usted decide después de ver el diseño y el precio.",
    "Las 5 a 10 cosas que más vale la pena automatizar, en orden de prioridad.":
      "Las 5 a 10 principales oportunidades de automatización, en orden de prioridad.",
    "Haz la autoevaluación de 5 minutos":
      "Realice la autoevaluación de 5 minutos",
    "Conciliando cifras línea por línea porque los sistemas no se comunican entre sí":
      "Conciliando cifras línea por línea porque los sistemas no están integrados",
    "¿No está en la lista? En la llamada de encaje confirmamos si tu sistema se puede conectar. Los nombres de productos son marcas de sus dueños; mencionarlos no implica una alianza ni un respaldo.":
      "Si su sistema no aparece en la lista, confirmamos en la llamada de descubrimiento si se puede conectar. Los nombres de productos son marcas de sus respectivos propietarios; mencionarlos no implica una alianza ni un respaldo.",
    "Tu equipo rinde más.":
      "Su equipo rinde más.",
    "Para ti":
      "Para usted",
    "Semana dos. La hoja de ruta por escrito y una llamada en vivo sobre las principales oportunidades y el primer paso.":
      "Semana dos. Una hoja de ruta por escrito y una revisión en vivo de las principales oportunidades y el primer paso.",
    "las acciones importantes siguen bajo tu control":
      "las acciones importantes siguen bajo su control",
    "La hoja de ruta es tuya. Constrúyela con KHIPUAI, con tu equipo o con quien quieras.":
      "El diseño es suyo. Constrúyalo con KHIPUAI, con su propio equipo o con otro proveedor.",
    "Antes de comprar otra herramienta, encuentra el trabajo que realmente vale la pena cambiar.":
      "Antes de invertir en otra herramienta, identifique el trabajo que más conviene mejorar.",
    "¿Tenemos que construir contigo?":
      "¿Estamos obligados a construir con KHIPUAI?",
    "Gratis, de 20 a 30 minutos. Confirmamos que encajamos y elegimos las áreas que vale la pena revisar.":
      "Gratuita, de 20 a 30 minutos. Confirmamos la compatibilidad e identificamos las áreas que conviene revisar.",
    "Diriges una empresa de servicios recurrentes de 20 a 300 personas con trabajo administrativo complejo.":
      "Su equipo mueve documentos, datos de clientes, información de facturación o aprobaciones entre varios sistemas.",
    "La tarifa completa se acredita a tu construcción si contratas a KHIPUAI para implementarla dentro de los 30 días.":
      "La tarifa completa se acredita a la implementación si contrata a KHIPUAI para construirla dentro de los 30 días.",
    "No. La hoja de ruta es tuya. Si construyes con KHIPUAI dentro de los 30 días, la tarifa de la auditoría se acredita a ese trabajo.":
      "No. El diseño es suyo. Si construye con KHIPUAI dentro de los 30 días, la tarifa del Diseño de la solución se acredita a ese trabajo.",
    "Un recorrido en lenguaje claro contigo y tu equipo.":
      "Un recorrido en lenguaje claro con usted y su equipo.",
    "Rehaciendo el mismo reporte cada semana a mano":
      "Rehaciendo manualmente el mismo informe cada semana",
    "Al terminar el proyecto, tus datos se devuelven o se eliminan.":
      "Al terminar el proyecto, sus datos se devuelven o se eliminan.",
    "Agenda una llamada de encaje de 30 minutos":
      "Agende una llamada de descubrimiento gratuita",
    "No. Todo funciona como borrador, no como asiento automático: el sistema prepara el trabajo, y una persona revisa y aprueba. Es algo deliberado, y es la salvaguarda.":
      "No. Todo se construye primero como borrador: el sistema prepara el trabajo y una persona aprueba cada registro importante.",
    "No van a un chatbot público.":
      "Nunca se comparten con herramientas públicas de IA.",
    "Cómo aparece tu sitio en las búsquedas de Google":
      "Cómo aparece su sitio en las búsquedas de Google",
    "Lee la página de seguridad completa":
      "Consulte la página de seguridad completa",
    "Cosas sobre las que puedes actuar de inmediato, sin necesidad de un proyecto.":
      "Mejoras que puede aplicar de inmediato, sin necesidad de un proyecto completo.",
    "El código lee los PDFs, correos y hojas de cálculo, completa los campos y redacta el reporte o la respuesta. Tu equipo revisa y aprueba en lugar de volver a escribir.":
      "El código lee los PDF, correos y hojas de cálculo, completa los campos y redacta el informe o la respuesta. Su equipo revisa y aprueba en lugar de volver a capturar los datos.",
    "Sin gran compromiso de software.":
      "Sin un gran compromiso de software.",
    "Un par de horas del tiempo de tu equipo a lo largo de una semana, y una mirada a los flujos de trabajo y sistemas involucrados. Nada se automatiza ni se cambia durante la auditoría; primero es el diagnóstico.":
      "Un par de horas del tiempo de su equipo a lo largo de una semana, y una revisión de los flujos de trabajo involucrados. El acceso es de solo lectura y nada cambia en sus sistemas durante el diseño.",
    "Para tu equipo":
      "Para su equipo",
    "Sin contador de consultoría abierto.":
      "Sin honorarios de consultoría indefinidos.",
    "Usamos IA para escribir y probar el código, con datos inventados o anonimizados. Tus registros nunca se envían a un modelo de IA mientras construimos.":
      "Usamos IA para escribir y probar el código con datos ficticios o anonimizados. Sus registros nunca se envían a un modelo de IA durante la construcción.",
    "15 años dirigiendo operaciones en empresas de alta demanda en Canadá y Estados Unidos, donde cada día corría contra el reloj y cada retraso costaba dinero. Sé lo que de verdad cuesta el trabajo manual porque lo pagué en horas extra, errores y traspasos que se caían. Hoy construyo la automatización que me hubiera gustado tener.":
      "15 años dirigiendo operaciones en empresas de alta demanda en Canadá y Estados Unidos, donde los plazos marcaban cada jornada y cada retraso tenía un costo. Conozco el verdadero costo del trabajo manual porque lo pagué en horas extra, errores y traspasos fallidos. Hoy construyo la automatización que en su momento necesité.",
    "nada cambia mientras diagnosticamos":
      "sin cambios en sus sistemas",
  },
};

// A copy of the content with each listed sentence replaced, wherever it sits
// (a whole string or a sentence inside a longer one).
export function tone(C, lang) {
  const swaps = Object.entries(SWAP[lang] || {}), drop = DROP[lang] || [];
  const over = OVERRIDE[lang] || {};
  const walk = v => typeof v === 'string' ? (Object.hasOwn(over, v) ? over[v] : swaps.reduce((s, [a, b]) => s.split(a).join(b), v))
    : Array.isArray(v) ? v.filter(x => !drop.includes(x)).map(walk)
    : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, walk(x)]))
    : v;
  return walk(C);
}
export const SWAPS = SWAP;
