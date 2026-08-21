# Local Lead Forge — Protocolo operativo de María

Estado: ENTRENAMIENTO / QA SINTÉTICO
Merge candidate: **PR #148** (`feature/synthetic-realtime-console-v2`)
QA carrier físico: **PR #94** sincronizado (`feature/synthetic-realtime-console`)

Este protocolo prepara a María para operar la Consola del Agente desde su iPhone. No autoriza mensajes reales, cambios en cuentas de clientes, cambios de rutas de leads ni promesas comerciales. Durante QA solo se utilizan conversaciones marcadas `[QA]`.

## 1. Antes de comenzar el turno

1. Abrir la consola únicamente desde el iPhone aprobado para la sesión de QA.
2. Confirmar que la página identifica a `María · trusted device`.
3. Si aparece solicitud de acceso, passkey o código, detenerse y avisar a Carlos; no compartir códigos ni capturas que revelen credenciales.
4. Elegir `AVAILABLE`, `BUSY` u `OFFLINE` según corresponda.
5. Confirmar que la consola diga `synthetic data only` durante QA.

## 2. Orden de prioridad

1. `CLIENT / Client Portal` — prioridad alta.
2. `PROSPECT / Public Website` — prioridad normal.
3. Dentro de la misma prioridad, atender primero la conversación que lleve más tiempo esperando.

La prioridad no autoriza improvisar. Si una solicitud afecta dinero, contrato, seguridad, acceso, datos personales, precio, garantía, ruta de leads o configuración del cliente, María debe escalarla a Carlos.

## 3. Cómo revisar una conversación

Antes de reclamarla, leer tipo, canal, nombre/compañía, historial, resumen de transferencia de IA, pregunta abierta y próximo paso sugerido. No pedir que se repita información ya presente.

## 4. Cómo reclamarla

1. Pulsar `Take as María` una sola vez.
2. Esperar confirmación del backend.
3. Confirmar `Agent active` y que María aparece como responsable.
4. Si Carlos u otro agente ya la tomó, no intervenir.
5. Si el sistema rechaza la acción, actualizar una vez; si continúa, registrar hora y avisar a Carlos.

El primer reclamo válido bloquea un segundo propietario.

## 5. Respuestas futuras

El envío continúa deshabilitado durante QA. Una futura fase en vivo requerirá autorización separada. No prometer precio, fecha, disponibilidad, resultado, garantía ni tiempo de llegada sin fuente aprobada.

## 6. Escalamiento obligatorio a Carlos

Escalar solicitudes sobre cambios de correo/destino de leads; cobros/reembolsos; credenciales; disputas o asuntos legales; borrado/exportación de datos; contratos/precios/promociones/garantías; publicación de información; posibles emergencias; dudas de identidad/autorización o preguntas sin respuesta aprobada.

María preserva el contexto y no ejecuta esos cambios.

## 7. Cómo cerrar

Durante QA sintético:

1. Confirmar que la conversación está asignada a María.
2. Verificar que el escenario se revisó sin enviar mensajes externos ni cambiar sistemas.
3. Pulsar `Resolve`.
4. Confirmar `Resolved`.
5. `Return to AI` permanece bloqueado.

## 8. Datos que nunca deben introducirse

No introducir contraseñas/passkeys, códigos de recuperación o autenticación, tarjetas completas, SSN/documentos, llaves API, información médica ni datos personales innecesarios.

## 9. Cierre del turno

1. Revisar conversaciones asignadas.
2. Escalar lo pendiente.
3. Cambiar disponibilidad a `OFFLINE`.
4. Cerrar sesión si se pierde control físico del teléfono.
5. Reportar sesiones o dispositivos inesperados.

## 10. Gate obligatorio antes de mensajes reales

No marcar una comprobación humana como `PASS` hasta obtener evidencia real del dispositivo. Estado actual:

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
- Auditoría de la sesión física: `PENDING_PHYSICAL`.

## 11. Preparación específica del QA físico

El merge candidate es PR #148, pero el **QA carrier autorizado es PR #94 sincronizado**, head `72b028287b45ee19eb4d1188405bcee7b5741dd8`.

Razón: PR #94 ya está 0 behind de `main`, sus checks frescos están verdes y el preview `https://deploy-preview-94--symphonious-travesseiro-c9bae1.netlify.app` ya forma parte de la allowlist del runtime v11. Los hashes ejecutables críticos coinciden con PR #148; la evidencia está en `docs/PR148-PHYSICAL-QA-EQUIVALENCE.md`.

Para la sesión:

1. Carlos y María abren el mismo preview protegido de PR #94.
2. Verificar que ese preview corresponde al head sincronizado y que los checks permanecen verdes.
3. Si Supabase Auth ya acepta el callback de ese origen, no modificar configuración. Si no lo acepta, detenerse: cualquier cambio de Auth requiere autorización separada.
4. Cada persona se autentica por separado; no copiar JWT, fragmentos ni tokens.
5. Aprobar únicamente los dispositivos temporales correctos.
6. Ejecutar sincronización inicial, claim simultáneo y resolve.
7. Capturar evidencia sin credenciales ni datos sensibles.
8. Al finalizar, retirar únicamente accesos temporales que realmente se hayan creado y revocar dispositivos temporales si ya no son necesarios.

No requiere desplegar una nueva variante de CORS para PR #148. Un fallo mantiene PR #148 en `HOLD` y PR #94 sigue siendo solo un carrier de QA, no un PR para merge.
