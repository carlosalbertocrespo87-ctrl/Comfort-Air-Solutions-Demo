# Local Lead Forge — Protocolo operativo de María

Estado: ENTRENAMIENTO / QA SINTÉTICO

Este protocolo prepara a María para operar la Consola del Agente desde su iPhone. No autoriza mensajes reales, cambios en cuentas de clientes, cambios de rutas de leads ni promesas comerciales. Mientras el PR #93 permanezca en QA, solo se utilizan conversaciones marcadas `[QA]`.

## 1. Antes de comenzar el turno

1. Abrir la consola únicamente desde el iPhone aprobado.
2. Confirmar que la página identifica a `María · trusted device`.
3. Si aparece solicitud de acceso, passkey o código, detenerse y avisar a Carlos; no compartir códigos ni capturas que revelen credenciales.
4. Elegir la disponibilidad correcta:
   - `AVAILABLE`: puede atender ahora.
   - `BUSY`: puede recibir aviso, pero no garantiza atención inmediata.
   - `OFFLINE`: no está atendiendo.
5. Confirmar que la consola diga `synthetic data only` durante QA.

## 2. Orden de prioridad

1. `CLIENT / Client Portal` — prioridad alta.
2. `PROSPECT / Public Website` — prioridad normal.
3. Dentro de la misma prioridad, atender primero la conversación que lleve más tiempo esperando.

La prioridad no autoriza improvisar. Si una solicitud afecta dinero, contrato, seguridad, acceso, datos personales, precio, garantía, ruta de leads o configuración del cliente, María debe escalarla a Carlos.

## 3. Cómo revisar una conversación

Antes de reclamarla, leer:

- tipo: cliente o prospecto;
- canal de entrada;
- nombre y compañía;
- historial completo;
- resumen de transferencia de IA;
- pregunta abierta;
- próximo paso sugerido.

No pedir al usuario que repita información que ya aparece en la conversación.

## 4. Cómo reclamarla

1. Pulsar `Take as María` una sola vez.
2. Esperar confirmación del backend.
3. Confirmar que el estado cambió a `Agent active` y que María aparece como responsable.
4. Si Carlos u otro agente ya la tomó, no intentar intervenir.
5. Si el sistema rechaza la acción, actualizar una vez. Si continúa, registrar la hora y avisar a Carlos.

El primer reclamo válido bloquea un segundo propietario. Nunca se debe intentar eludir ese bloqueo.

## 5. Regla de respuesta segura para la futura fase en vivo

El envío continúa deshabilitado durante QA. Cuando se autorice por separado, María utilizará esta estructura:

1. Reconocer la solicitud.
2. Confirmar únicamente los datos ya verificados.
3. Explicar el próximo paso autorizado.
4. Solicitar solo el dato mínimo que falte.
5. No prometer precio, fecha, disponibilidad, resultado, garantía ni tiempo de llegada sin fuente aprobada.

Ejemplo seguro:

> Gracias, ya veo la información que compartió. Voy a verificar este punto con el responsable autorizado y le confirmaremos el próximo paso. No realizaré ningún cambio hasta recibir esa aprobación.

## 6. Escalamiento obligatorio a Carlos

Escalar inmediatamente cuando la conversación incluya:

- cambios de correo o destino de leads;
- cobros, reembolsos, facturas o métodos de pago;
- contraseñas, códigos, llaves, credenciales o acceso administrativo;
- quejas, amenazas, disputas o solicitud legal;
- solicitud de borrar/exportar datos personales;
- cambios en contrato, precio, promoción o garantía;
- publicación o modificación de información del cliente;
- una pregunta sin respuesta aprobada;
- posible emergencia o riesgo para una persona;
- cualquier duda sobre identidad o autorización.

María preserva el contexto y no ejecuta el cambio. Carlos decide o lo eleva al propietario del negocio correspondiente.

## 7. Cómo cerrar

Durante QA sintético:

1. Confirmar que la conversación está asignada a María.
2. Verificar que el escenario solicitado fue revisado, sin enviar mensajes externos ni cambiar sistemas.
3. Pulsar `Resolve`.
4. Confirmar que el estado cambió a `Resolved`.
5. No usar `Return to AI`; permanece bloqueado hasta una fase posterior.

En producción, una conversación solo podrá cerrarse cuando exista evidencia de que la pregunta fue respondida, el próximo paso quedó claro o la escalación fue registrada.

## 8. Datos que nunca deben introducirse

- contraseñas o passkeys;
- códigos de recuperación o autenticación;
- números completos de tarjetas;
- SSN o documentos de identidad;
- llaves API;
- información médica;
- datos personales que no sean necesarios para la solicitud.

## 9. Cierre del turno

1. Revisar si queda alguna conversación asignada a María.
2. Escalar lo que no pueda cerrar de forma segura.
3. Cambiar disponibilidad a `OFFLINE`.
4. Cerrar la sesión si el teléfono se compartirá, se entregará a otra persona o se pierde control físico del dispositivo.
5. Informar de cualquier comportamiento extraño, sesión inesperada o dispositivo desconocido.

## 10. Prueba obligatoria antes de mensajes reales

- Inicio de sesión desde el iPhone confiable: PASS.
- Dispositivo no confiable bloqueado: PASS.
- Cambio de disponibilidad: PASS.
- Lectura de solo conversaciones `[QA]`: PASS.
- Reclamo por María: PASS.
- Segundo reclamo simultáneo bloqueado: PASS.
- Resolución sintética: PASS.
- Intento de `send_message` bloqueado: PASS.
- Conversación real/no sintética inaccesible por la ruta QA: PASS.
- Registros de dispositivo, auditoría e interacción presentes: PASS.

Hasta completar todos los puntos, la consola permanece en QA y no se habilitan clientes, prospectos, notificaciones push ni mensajes reales.
