# Seguridad y gobierno de datos

Usamos IA para construir software que ayuda a tu equipo a rendir más y a tus clientes a recibir mejor servicio. Construir con IA no significa entregar tus registros a un tercero. Esta página explica cómo protegemos la información sensible, durante la Auditoría de Automatización con IA y en todo lo que construimos después.

## Cómo usamos la IA

- **Construido con datos de prueba.** Usamos IA para escribir y probar el código, con datos inventados o anonimizados. Tus registros nunca se envían a un modelo de IA mientras construimos.
- **El código hace el trabajo.** Lo que entregamos es código que lee, clasifica y redacta siempre de la misma forma, dentro de tus sistemas.
- **IA en sistemas en uso.** Si un sistema usa IA mientras funciona, como al responder mensajes de clientes o clasificar tickets de soporte, lo hace por la API empresarial de Anthropic, cuyos términos no permiten usar los datos para entrenar modelos de IA. Nunca apps de chat para consumidores.
- **Datos sensibles fuera.** En esos sistemas, datos como números de seguro social y cuentas bancarias se ocultan o se dejan fuera de lo que ve la IA.
- **Las personas aprueban.** El sistema prepara el trabajo. Una persona aprueba todo lo importante antes de que ocurra: todo lo que mueve dinero, cambia un registro o te compromete con un cliente.
- **Registro de auditoría completo.** Cada acción que prepara el sistema queda registrada con quién la aprobó y cuándo.

## Acceso y almacenamiento

- **Tus sistemas, tus datos.** Siempre que es posible construimos dentro de tu propio entorno, como tu Microsoft Azure, y no guardamos copias.
- **Acceso de mínimo privilegio.** Cuentas separadas con solo el acceso que el trabajo necesita, que se eliminan al terminar.
- **Auditoría de solo lectura.** Durante la auditoría nuestro acceso es de solo lectura. Nada se automatiza ni se cambia mientras diagnosticamos.
- **Secretos en una bóveda.** Las claves de API y contraseñas se guardan en el servidor, por ejemplo en Azure Key Vault, nunca en el código.

## Acuerdos y cierre del proyecto

- **NDA si lo pides.** Firmamos un acuerdo de confidencialidad o un acuerdo de tratamiento de datos si lo solicitas.
- **Devueltos o eliminados.** Al terminar el proyecto, tus datos se devuelven o se eliminan.

## Políticas que estamos escribiendo

Estamos convirtiendo estas prácticas en políticas y procedimientos operativos estándar (SOP) que tu equipo de TI puede revisar. Cada uno aparecerá en esta página cuando esté listo.

## Preguntas de tu equipo de TI o de seguridad

Envíalas a [wil@khipuai.co](mailto:wil@khipuai.co), o plantéalas en una [llamada de encaje gratuita de 30 minutos](https://calendly.com/wmorapal/30min). Por favor no envíes contraseñas, registros de clientes ni otros datos sensibles por correo. Si un proyecto necesita esa información, primero acordamos una forma segura de compartirla.

Cómo el sitio web maneja los datos que compartes se explica en la [política de privacidad](https://khipuai.co/privacy.html) (en inglés).
