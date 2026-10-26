# Seguridad y gobierno de datos

Construir con IA no implica entregar sus registros a un tercero. Así protegemos la información sensible durante el diseño y en todo lo que construimos.

## Cómo usamos la IA

- **Construido con datos de prueba.** La IA escribe y prueba el código con datos sintéticos o anonimizados. Sus registros nunca se envían a un modelo de IA durante la construcción.
- **El código hace el trabajo.** Nuestras entregas leen, clasifican y redactan siempre de la misma forma, dentro de sus sistemas.
- **IA en sistemas en producción.** Cuando un sistema en funcionamiento usa IA, lo hace a través de la API empresarial de Anthropic, cuyos términos no permiten usar los datos para entrenar modelos de IA. Nunca se utilizan aplicaciones de chat para consumidores.
- **Datos sensibles excluidos.** Datos como números de seguro social y cuentas bancarias se ocultan o se excluyen de lo que ve la IA.
- **Aprobación humana.** Una persona aprueba todo lo que mueve dinero, modifica un registro o lo compromete con un cliente.
- **Registro completo de actividad.** Cada acción que prepara el sistema queda registrada con quién la aprobó y cuándo.

## Acceso y almacenamiento

- **Sus sistemas, sus datos.** Siempre que es posible construimos dentro de su propio entorno, como Microsoft Azure, y no guardamos copias.
- **Acceso de mínimo privilegio.** Cuentas separadas con solo el acceso que el trabajo requiere, que se eliminan al finalizar el proyecto.
- **Solo lectura durante el diseño.** Nada cambia en sus sistemas durante el Diseño de la solución.
- **Secretos en una bóveda.** Las claves de API y contraseñas se guardan en el servidor, por ejemplo en Azure Key Vault, nunca en el código.

## Acuerdos y cierre del proyecto

- **NDA a solicitud.** Firmamos un acuerdo de confidencialidad o de tratamiento de datos si usted lo solicita.
- **Datos devueltos o eliminados.** Al finalizar el proyecto, sus datos se devuelven o se eliminan.

## Preguntas de su equipo de TI o de seguridad

Envíelas a [alexp@khipuai.co](mailto:alexp@khipuai.co) o plantéelas en una llamada de descubrimiento gratuita. Por favor, no envíe contraseñas ni registros de clientes por correo electrónico; primero acordaremos una forma segura de compartirlos.

Estamos documentando estas prácticas como políticas y procedimientos formales que su equipo de TI podrá revisar; cada uno aparecerá aquí cuando esté terminado. La forma en que este sitio trata sus datos se describe en la [política de privacidad](https://khipuai.co/es/privacy/).
