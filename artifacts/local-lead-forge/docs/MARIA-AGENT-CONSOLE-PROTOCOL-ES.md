> **PROTOCOLO HISTÓRICO DE QA — reconciliado el 24 ago 2026.** Las secciones que todavía muestran `PENDING_PHYSICAL`, PR #94 o PR #148 describen la preparación original y ya no son la lista de acciones vigente. El QA físico sintético pasó posteriormente en PR #188; la seguridad local más reciente también quedó probada físicamente en PR #199 (Face ID en los iPhone de Carlos y María; passkey y apertura de consola en desktop de Carlos). Ver `docs/AGENT-CONSOLE-CURRENT-OPERATING-CONTROLLER.md`. No repetir el procedimiento viejo salvo una regresión nueva. **Mensajes reales, customer traffic, push real, pagos, outreach y activaciones de producción siguen bloqueados.**

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

No marcar una comprobación humana como `PASS` hasta obtener evidencia real del dispositivo. Estado histórico de este checkpoint:

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

> Nota vigente: estos valores `PENDING_PHYSICAL` pertenecen al checkpoint previo. PR #188 y PR #199 proporcionan la evidencia física posterior; consultar el controller vigente antes de programar un nuevo test.

## 11. Preparación específica del QA físico

El siguiente procedimiento es histórico. El merge candidate era PR #148 y el **QA carrier autorizado era PR #94 sincronizado**, head `72b028287b45ee19eb4d1188405bcee7b5741dd8`.

Razón histórica: PR #94 estaba 0 behind de `main`, sus checks frescos estaban verdes y el preview `https://deploy-preview-94--symphonious-travesseiro-c9bae1.netlify.app` formaba parte de la allowlist del runtime v11. Los hashes ejecutables críticos coincidían con PR #148; la evidencia está en `docs/PR148-PHYSICAL-QA-EQUIVALENCE.md`.

Para aquella sesión:

1. Carlos y María abrían el mismo preview protegido de PR #94.
2. Verificaban que ese preview correspondiera al head sincronizado y que los checks permanecieran verdes.
3. Si Supabase Auth ya aceptaba el callback de ese origen, no se modificaba configuración. Si no lo aceptaba, se detenía: cualquier cambio de Auth requería autorización separada.
4. Cada persona se autenticaba por separado; no copiar JWT, fragmentos ni tokens.
5. Aprobar únicamente los dispositivos temporales correctos.
6. Ejecutar sincronización inicial, claim simultáneo y resolve.
7. Capturar evidencia sin credenciales ni datos sensibles.
8. Al finalizar, retirar únicamente accesos temporales que realmente se hubieran creado y revocar dispositivos temporales si ya no eran necesarios.

No usar este apartado para crear un nuevo blocker. El controller vigente decide si existe o no una regresión física pendiente.
