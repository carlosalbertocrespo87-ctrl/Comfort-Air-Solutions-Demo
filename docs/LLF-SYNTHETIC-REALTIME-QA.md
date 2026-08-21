# LLF — Consola Realtime sintética: despliegue y QA

**Fecha de reconciliación:** 21 de agosto de 2026  
**PR:** #94  
**Estado:** DESPLEGADO PARA QA SINTÉTICO / HOLD PARA MERGE / NO APROBADO PARA PRODUCCIÓN REAL

## 1. Objetivo

Validar la Consola del Agente con persistencia y sincronización Realtime entre Carlos (PC) y María (iPhone), usando únicamente datos sintéticos. Este gate no autoriza mensajes reales, notificaciones push, conversaciones reales ni tráfico de clientes.

## 2. Estado autoritativo actual

Lecturas frescas de Supabase confirman:

- proyecto `Local-Lead-Forge`: `ACTIVE_HEALTHY`;
- Edge Function desplegada `llf-agent-ops`: **v11 ACTIVE**;
- conversaciones sintéticas: **2**;
- conversaciones reales: **0**;
- mensajes sintéticos: **4**;
- dispositivos `TRUSTED`: **2**;
- dispositivos `PENDING`: **0**;
- RLS en `llf_conversations`: **activo**;
- RLS en `llf_conversation_messages`: **activo**;
- `REALTIME_CONVERSATIONS`: **BLOCKED**;
- `SECURE_IPHONE_PUSH`: **BLOCKED**.

Las referencias anteriores a v7 y v8 corresponden a checkpoints históricos del mismo trabajo. **v11 es el runtime desplegado vigente en este registro.**

## 3. Superficie permitida

Durante QA solo se permite:

- iniciar sesión como agente LLF activo;
- registrar/consultar el dispositivo;
- cambiar disponibilidad desde un dispositivo confiable;
- listar conversaciones `is_synthetic = true`;
- reclamar una conversación sintética;
- resolver una conversación sintética;
- recibir una señal privada Realtime de actualización sin contenido de conversación.

No se permite:

- enviar mensajes;
- devolver conversaciones a IA;
- habilitar push;
- consultar/modificar conversaciones reales;
- saltar el control de dispositivo confiable;
- publicar el preview de forma abierta para facilitar el QA.

## 4. Controles de seguridad vigentes

### Sesión y dispositivo

La Edge Function:

1. valida el bearer token con Supabase Auth;
2. exige perfil LLF activo;
3. registra/consulta un fingerprint hash de instalación;
4. exige `TRUSTED` para acciones protegidas;
5. actualiza `last_seen_at`;
6. registra acciones relevantes en auditoría.

### Separación sintética

- La ruta protegida lista solo `is_synthetic = true`.
- Claim y resolve incluyen filtro `is_synthetic = true`.
- Un ID no sintético no puede resolverse mediante esta ruta QA.
- `send_message` devuelve `messaging_capability_blocked`.
- El frontend mantiene Reply/Send y Return to AI deshabilitados.

### Realtime

- Canal privado: `llf-agent-console-synthetic`.
- La señal contiene únicamente motivo/entidad de refresh; no transmite nombre, teléfono, correo ni mensaje.
- La conversación se vuelve a consultar mediante el backend protegido.

### CORS

El runtime v11 allowlista exactamente:

- `https://localleadforge.com`
- `https://www.localleadforge.com`
- `https://deploy-preview-94--symphonious-travesseiro-c9bae1.netlify.app`

No se usa `Access-Control-Allow-Origin: *`.

El origen del preview es temporal y debe retirarse cuando deje de ser necesario.

## 5. Gate automático

Workflow: `.github/workflows/agent-console-security.yml`.

El gate ejecuta invariantes fail-closed, typecheck y build. A partir de esta reconciliación también vigila que la documentación operativa no declare falsamente completado el QA físico.

La suite está diseñada para detectar, entre otros:

- pérdida de allowlist exacta;
- introducción de CORS wildcard;
- pérdida de filtros sintéticos;
- habilitación accidental de mensajería o Return to AI;
- pérdida del gate de dispositivo confiable;
- documentación que vuelva a marcar como PASS una prueba física aún no observada.

Los checks automáticos son necesarios, pero **no sustituyen** la prueba PC ↔ iPhone.

## 6. Bloqueos del Deploy Preview

El preview de PR #94 está protegido por Netlify Team Protection. Esto es deseado; no se debe hacer público solo para facilitar el QA.

Además, el preview tiene un origen distinto a `localleadforge.com`, por lo que:

- `sessionStorage` no comparte la sesión de producción;
- `localStorage` no comparte el identificador de dispositivo de producción;
- cada agente necesita autenticación propia para el preview;
- cada navegador del preview crea un registro de dispositivo independiente.

## 7. Preparación del QA físico

Antes de iniciar la prueba:

1. Carlos abre el mismo Deploy Preview en Chrome/PC.
2. María abre el mismo Deploy Preview en Safari/iPhone.
3. Ambos superan la protección privada de Netlify con acceso autorizado.
4. Si Supabase Auth aún no permite ese callback, agregar temporalmente la URL exacta del preview a Redirect URLs.
5. Mantener `https://localleadforge.com` como Site URL principal.
6. Generar magic links separados cuyo redirect termine en el preview exacto.
7. Abrir cada enlace directamente en el dispositivo correspondiente.
8. No copiar JWT, fragmentos de URL, access tokens ni sessionStorage entre dominios.
9. Aprobar únicamente los nuevos registros de dispositivo que correspondan a la PC de Carlos y al iPhone de María.
10. Confirmar `trusted device` en ambos.

## 8. Prueba manual PC ↔ iPhone

### Caso A — Sincronización inicial

1. Ambos deben ver exactamente dos conversaciones `[QA]`.
2. Ambos deben ver Realtime privado conectado.
3. No debe aparecer información de clientes reales.

**PASS físico:** ambas pantallas muestran el mismo estado sin recarga manual necesaria para converger.

### Caso B — Claim simultáneo

1. Ambos seleccionan la misma conversación `[QA]` en espera.
2. Ambos presionan Take lo más simultáneamente posible.
3. Exactamente una solicitud gana.
4. El segundo agente recibe rechazo o ve el propietario actualizado.
5. Ambas pantallas convergen en un solo propietario.

**PASS físico:** no existe doble ownership ni acción posterior del agente perdedor.

### Caso C — Resolución sincronizada

1. El propietario presiona Resolve.
2. Ambos dispositivos deben reflejar `Resolved`.
3. El no propietario no puede resolver la conversación.

**PASS físico:** estado consistente + auditoría del agente correcto.

### Caso D — Capacidades bloqueadas

1. Reply/Send permanece deshabilitado.
2. Return to AI permanece deshabilitado.
3. No se genera email, SMS, WhatsApp ni push.

**PASS físico:** cero salida externa.

### Caso E — Dispositivo no confiable

1. Abrir la consola desde un navegador/dispositivo no aprobado.
2. Autenticar sin aprobar ese dispositivo.
3. Intentar listar o ejecutar una acción protegida.

**PASS:** `trusted_device_required`; cuando corresponde debe registrarse `UNTRUSTED_DEVICE_BLOCKED`.

## 9. Evidencia que debe guardarse

Para cada caso físico:

- fecha/hora;
- agente;
- dispositivo/navegador;
- conversación QA usada;
- resultado esperado;
- resultado real;
- PASS/FAIL;
- captura sin credenciales, tokens ni datos sensibles;
- incidente/fix y retest si falla.

No usar una confirmación verbal como sustituto de evidencia.

## 10. Limpieza posterior

Cuando termine el QA:

1. retirar el callback temporal del preview si ya no se utilizará;
2. retirar el origen CORS temporal cuando deje de ser necesario;
3. revocar/eliminar los dispositivos temporales del preview que ya no sean necesarios;
4. conservar auditoría útil para evidencia;
5. mantener mensajería, push y conversaciones reales bloqueados hasta un gate de producción separado.

## 11. Criterio de merge

PR #94 puede pasar de DRAFT/HOLD a revisión únicamente cuando:

- todos los checks automáticos del head final estén en verde;
- Casos A–D tengan evidencia física PASS;
- claim simultáneo tenga un solo ganador;
- resolve sincronice en ambos dispositivos;
- no exista salida externa;
- no aparezcan datos reales;
- cualquier fallo haya sido corregido y revalidado.

Caso E es seguridad adicional recomendada antes de ampliar acceso a más agentes y puede ejecutarse durante la misma sesión si resulta práctico.

## 12. Decisión actual

**HOLD.** Backend, datos sintéticos, RLS, capability blocks y runtime v11 están preparados para QA autenticado. Falta observar la conducta simultánea real de Carlos PC ↔ María iPhone y capturar evidencia. Hasta entonces:

- PR #94 permanece Draft;
- no se fusiona por conveniencia;
- no se habilita mensajería;
- no se habilita push;
- no se habilitan conversaciones reales;
- `REALTIME_CONVERSATIONS` y `SECURE_IPHONE_PUSH` permanecen `BLOCKED`.
