# Local Lead Forge — Agent Console QA Scenarios EN/ES

Status: INTERNAL / SYNTHETIC ONLY

Purpose: train Carlos and María and produce repeatable evidence before enabling live conversations, outbound messages, or push notifications.

## Evidence required for every scenario

- Date and time.
- Device and browser.
- Signed-in agent.
- Starting availability.
- Conversation ID and `[QA]` label.
- Expected result.
- Actual result.
- Screenshot without credentials or sensitive data.
- PASS / FAIL.
- Incident note if failed.

## Scenario 1 — English prospect handoff

**Synthetic visitor:** “I like the demo. How long does setup usually take?”

Expected flow:

1. Conversation appears as `PROSPECT / PUBLIC_WEB`.
2. Priority is normal.
3. María reviews transcript, open question and AI handoff summary.
4. María claims the conversation.
5. Console changes to `AGENT_ACTIVE` and assigns María.
6. No external response can be sent during QA.
7. María resolves only after confirming this was a synthetic workflow test.

Safety check: no unsupported implementation date or guarantee is entered.

## Escenario 2 — Transferencia de cliente en español

**Cliente sintético:** “Necesito que los futuros contactos lleguen a otro correo.”

Resultado esperado:

1. Aparece como `CLIENT / CLIENT_PORTAL`.
2. La prioridad es alta.
3. María conserva el contexto y no solicita repetir la información.
4. María reclama la conversación.
5. Reconoce que cambiar la ruta de leads requiere autorización de Carlos.
6. No introduce un correo real ni modifica ningún destino.
7. No envía mensajes externos.
8. Resuelve solamente el ejercicio sintético.

Control de seguridad: la solicitud se escala; no se ejecuta desde el chat.

## Scenario 3 — Simultaneous claim protection

Devices: María's trusted iPhone and Carlos's trusted browser.

Steps:

1. Both agents open the same `[QA]` waiting conversation.
2. Both press claim as close together as practical.
3. Exactly one request succeeds.
4. The other request receives `conversation_not_claimable` or observes the updated owner.
5. Both screens converge on the same owner after Realtime refresh/reload.

PASS criteria: no double ownership and no second agent action on the conversation.

## Escenario 4 — Dispositivo no confiable

1. Abrir la consola en un navegador/dispositivo que no haya sido aprobado.
2. Intentar listar conversaciones sintéticas o cambiar disponibilidad.
3. El backend debe responder `trusted_device_required`.
4. Debe registrarse el evento de seguridad correspondiente cuando exista un dispositivo pendiente conocido.

PASS: no aparecen conversaciones y ninguna acción protegida se ejecuta.

## Scenario 5 — Outbound message must fail closed

1. Use an authenticated trusted QA session.
2. Submit the protected action `send_message` against a synthetic conversation through the controlled test method.
3. Backend must return HTTP 403 with `messaging_capability_blocked`.
4. Confirm no row was inserted in `llf_conversation_messages` by that attempt.
5. Confirm no email, SMS, push or external webhook was invoked.

PASS: zero outbound delivery and zero persisted agent message.

## Escenario 6 — Protección de conversación real

1. Utilizar en la prueba controlada el ID de una conversación que no tenga `is_synthetic = true`.
2. Intentar reclamarla y resolverla mediante la ruta de QA.
3. El backend debe devolver `synthetic_conversation_not_found` o un rechazo equivalente.
4. Confirmar que el registro real no cambió.

PASS: la ruta de QA no puede leer ni modificar la conversación real.

## Scenario 7 — Availability routing

Run the notification-decision checks without enabling live push:

| Carlos | María | Expected recipient plan |
|---|---|---|
| OFFLINE | AVAILABLE | María |
| AVAILABLE | OFFLINE | Carlos |
| AVAILABLE | AVAILABLE | Carlos + María |
| BUSY | OFFLINE | Carlos fallback |
| OFFLINE | OFFLINE | Queue; notify nobody |

Client conversations retain `HIGH` escalation; prospect conversations retain `NORMAL` escalation.

## Escenario 8 — Sesión y cierre seguro

1. Colocar a María en `OFFLINE`.
2. Confirmar que no quedan conversaciones asignadas sin escalación registrada.
3. Cerrar sesión en un dispositivo compartido o fuera de control físico.
4. Intentar usar una sesión vencida.
5. El acceso debe ser rechazado y la sesión local inválida debe eliminarse.

PASS: no se mantiene acceso útil mediante una sesión vencida.

## Release rule

All eight scenarios must be PASS with evidence. A failure keeps live messages, real conversations, push notifications and `REALTIME_CONVERSATIONS` disabled. Retesting must document the fix and produce new evidence; a verbal confirmation is not sufficient.
