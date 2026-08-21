# Local Lead Forge — Protocolo operativo de María

Estado: ENTRENAMIENTO / QA SINTÉTICO
PR operativo actual: **PR #148** (`feature/synthetic-realtime-console-v2`)

Este protocolo prepara a María para operar la Consola del Agente desde su iPhone. No autoriza mensajes reales, cambios en cuentas de clientes, cambios de rutas de leads ni promesas comerciales. Mientras PR #148 permanezca en QA, solo se utilizan conversaciones marcadas `[QA]`.

## 1. Antes de comenzar el turno

1. Abrir la consola únicamente desde el iPhone aprobado para la sesión de QA.
2. Confirmar que la página identifica a `María · trusted device`.
3. Si aparece solicitud de acceso, passkey o código, detenerse y avisar a Carlos; no compartir códigos ni capturas que revelen credenciales.
4. Elegir la disponibilidad correcta: `AVAILABLE`, `BUSY` u `OFFLINE`.
5. Confirmar que la consola diga `synthetic data only` durante QA.

## 2. Orden de prioridad

1. `CLIENT / Client Portal` — prioridad alta.
2. `PROSPECT / Public Website` — prioridad normal.
3. Dentro de la misma prioridad, atender primero la conversación que lleve más tiempo esperando.

La prioridad no autoriza improvisar. Si una solicitud afecta dinero, contrato, seguridad, acceso, datos personales, precio, garantía, ruta de leads o configuración del cliente, María debe escalarla a Carlos.

## 3. Cómo revisar una conversación

Antes de reclamarla, leer tipo, canal de entrada, nombre/compañía, historial, resumen de transferencia de IA, pregunta abierta y próximo paso sugerido. No pedir al usuario que repita información que ya aparece en la conversación.

## 4. Cómo reclamarla

1. Pulsar `Take as María` una sola vez.
2. Esperar confirmación del backend.
3. Confirmar que el estado cambió a `Agent active` y que María aparece como responsable.
4. Si Carlos u otro agente ya la tomó, no intentar intervenir.
5. Si el sistema rechaza la acción, actualizar una vez. Si continúa, registrar la hora y avisar a Carlos.

El primer reclamo válido bloquea un segundo propietario. Nunca se debe intentar eludir ese bloqueo.

## 5. Regla de respuesta segura para una futura fase en vivo

El envío continúa deshabilitado durante QA. Cuando se autorice por separado, María debe reconocer la solicitud, confirmar solo datos verificados, explicar el próximo paso autorizado y solicitar únicamente el dato mínimo faltante. No prometer precio, fecha, disponibilidad, resultado, garantía ni tiempo de llegada sin fuente aprobada.

## 6. Escalamiento obligatorio a Carlos

Escalar inmediatamente solicitudes sobre cambios de correo/destino de leads; cobros, reembolsos o métodos de pago; credenciales o acceso administrativo; disputas o asuntos legales; borrado/exportación de datos; contratos, precios, promociones o garantías; publicación de información; posibles emergencias; dudas de identidad/autorización o cualquier pregunta sin respuesta aprobada.

María preserva el contexto y no ejecuta el cambio.

## 7. Cómo cerrar

Durante QA sintético:

1. Confirmar que la conversación está asignada a María.
2. Verificar que el escenario fue revisado sin enviar mensajes externos ni cambiar sistemas.
3. Pulsar `Resolve`.
4. Confirmar `Resolved`.
5. No usar `Return to AI`; permanece bloqueado.

## 8. Datos que nunca deben introducirse

No introducir contraseñas/passkeys, códigos de recuperación o autenticación, números completos de tarjetas, SSN/documentos de identidad, llaves API, información médica ni datos personales innecesarios.

## 9. Cierre del turno

1. Revisar si queda alguna conversación asignada.
2. Escalar lo que no pueda cerrarse de forma segura.
3. Cambiar disponibilidad a `OFFLINE`.
4. Cerrar sesión si el teléfono se compartirá, se entregará a otra persona o se pierde control físico.
5. Informar comportamiento extraño, sesiones inesperadas o dispositivos desconocidos.

## 10. Gate obligatorio antes de mensajes reales

No marcar una comprobación humana como `PASS` hasta obtener evidencia del dispositivo real. Estado actual:

- Inicio de sesión desde el iPhone del QA: `PENDING_PHYSICAL`.
- Dispositivo no confiable bloqueado: `AUTOMATED_PASS / PHYSICAL_RECOMMENDED`.
- Cambio de disponibilidad desde iPhone: `PENDING_PHYSICAL`.
- Lectura visual de solo conversaciones `[QA]`: `PENDING_PHYSICAL`.
- Filtro backend `is_synthetic = true`: `AUTOMATED_PASS`.
- Reclamo por María: `PENDING_PHYSICAL`.
- Segundo reclamo simultáneo bloqueado: `PENDING_PHYSICAL`.
- Resolución sintética reflejada en ambos dispositivos: `PENDING_PHYSICAL`.
- Intento de `send_message` bloqueado: `AUTOMATED_PASS`.
- Conversación real/no sintética inaccesible por la ruta QA: `AUTOMATED_PASS`.
- Registros de dispositivo, auditoría e interacción de la sesión física: `PENDING_PHYSICAL`.

Hasta completar la evidencia física requerida, la consola permanece en QA y no se habilitan clientes, prospectos, notificaciones push ni mensajes reales.

## 11. Preparación específica del QA físico PR #148

PR #148 reemplaza técnicamente al PR #94 para la integración contra el `main` actual. El preview esperado usa el origen `https://deploy-preview-148--symphonious-travesseiro-c9bae1.netlify.app`.

Antes de la sesión física:

1. Confirmar que Carlos y María pueden abrir el mismo preview protegido de PR #148.
2. Confirmar que Supabase Auth permite temporalmente el callback exacto del preview, si es necesario.
3. Confirmar que el runtime de `llf-agent-ops` permite el origen exacto de PR #148. El código fuente lo prepara, pero eso no significa que ya esté desplegado.
4. Cada persona debe autenticarse mediante un enlace cuyo redirect termine en el origen exacto del preview; no copiar JWT, fragmentos ni tokens entre dominios.
5. Cada navegador registra un dispositivo independiente porque `localStorage` está aislado por origen.
6. Aprobar únicamente los registros temporales correspondientes a la PC de Carlos y al iPhone de María.
7. Ejecutar sincronización inicial, reclamo simultáneo y resolución.
8. Capturar solamente evidencia sin credenciales ni datos sensibles.
9. Al finalizar, retirar callback/origen CORS temporal cuando deje de utilizarse y revocar dispositivos temporales si ya no son necesarios.

Un fallo mantiene PR #148 en `HOLD`; no se habilita ninguna capacidad real para evitar o saltar el QA.
