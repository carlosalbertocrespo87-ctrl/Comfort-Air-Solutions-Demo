# LLF — Consola Realtime sintética: despliegue y QA

**Fecha de reconciliación:** 21 de agosto de 2026  
**PR operativo actual:** #148  
**Rama:** `feature/synthetic-realtime-console-v2`  
**Estado:** DRAFT / HOLD / QA SINTÉTICO SOLAMENTE

## 1. Objetivo

Validar la Consola del Agente con persistencia y sincronización Realtime entre PC e iPhone usando únicamente datos sintéticos. Este gate no autoriza mensajes reales, notificaciones push, conversaciones reales, tráfico de clientes ni cambios comerciales.

## 2. Reconciliación de integración

El PR original #94 quedó 101 commits detrás de `main`. En lugar de fusionar esa historia stale, el contenido útil se volvió a portar sobre el `main` actual en PR #148.

Evidencia del port inicial:

- base: `main` `1605497ede639f97e85430604ae1659504ef27ac`;
- port inicial: 1 commit ahead / 0 behind;
- 15 paths intencionales;
- los cinco archivos modificados existentes se verificaron sin cambios en `main` desde el merge base de #94 antes de portarlos;
- Agent Console Security Gate run #18: PASS;
- typecheck: PASS;
- build: PASS.

El PR de sincronización #147 ya no es el camino operativo; PR #148 reemplaza esa necesidad al partir directamente del `main` vigente.

## 3. Estado autoritativo de plataforma observado

La lectura de Supabase realizada durante la reconciliación confirmó:

- proyecto `Local-Lead-Forge`: `ACTIVE_HEALTHY`;
- Edge Function `llf-agent-ops`: **v11 ACTIVE**;
- 2 conversaciones sintéticas;
- 0 conversaciones reales;
- 4 mensajes sintéticos;
- 2 dispositivos `TRUSTED`;
- 0 dispositivos `PENDING` en ese checkpoint;
- RLS activo en conversaciones y mensajes;
- `REALTIME_CONVERSATIONS = BLOCKED`;
- `SECURE_IPHONE_PUSH = BLOCKED`.

La v11 desplegada exige agente activo, dispositivo confiable, filtros `is_synthetic = true` y bloquea `send_message`.

## 4. Separación fuente ↔ runtime

Estado del origen de preview de PR #148: **SOURCE_ONLY_NOT_DEPLOYED**.

El source control de PR #148 prepara:

- `https://localleadforge.com`;
- `https://www.localleadforge.com`;
- origen legacy temporal de preview #94;
- `https://deploy-preview-148--symphonious-travesseiro-c9bae1.netlify.app`.

La v11 activa observada en Supabase todavía corresponde al runtime anterior que allowlista el preview #94, no el nuevo preview #148. Este PR **no autoriza desplegar** la variante de source, cambiar CORS/Auth en producción ni modificar la Edge Function activa.

Por lo tanto, el QA físico del preview #148 no debe comenzar hasta que el acceso exacto del preview haya sido autorizado y aplicado por separado, con rollback claro y sin habilitar tráfico real.

## 5. Superficie permitida durante QA

Solo se permite:

- iniciar sesión como agente LLF activo;
- registrar/consultar dispositivo;
- cambiar disponibilidad desde dispositivo confiable;
- listar conversaciones `is_synthetic = true`;
- reclamar conversación sintética;
- resolver conversación sintética;
- recibir señal privada Realtime de refresh sin contenido de conversación.

No se permite:

- enviar mensajes;
- Return to AI;
- push live;
- consultar/modificar conversaciones reales;
- saltar trusted-device;
- publicar el preview abiertamente;
- habilitar customer traffic;
- cambiar CRM/rutas/precios/pagos/legal/credenciales desde esta fase.

## 6. Controles de seguridad

La Edge Function valida bearer token, exige perfil LLF activo y dispositivo `TRUSTED` para acciones protegidas. List, claim y resolve permanecen sintéticos. Un ID no sintético no puede operarse por esta ruta. `send_message` devuelve `messaging_capability_blocked`.

Realtime usa el canal privado `llf-agent-console-synthetic`. La señal contiene únicamente motivo/entidad de refresh; los datos se vuelven a consultar por el backend protegido.

## 7. Gate automático

Workflow: `.github/workflows/agent-console-security.yml`.

El gate actual verifica 18 invariantes fail-closed más typecheck y build. Cualquier cambio posterior al checkpoint run #18 requiere un PASS nuevo en el head vigente.

## 8. Preparación del QA físico PR #148

Antes de iniciar:

1. Confirmar Deploy Preview #148 protegido y accesible por ambos dispositivos autorizados.
2. Autorizar, si corresponde, el callback exacto del preview en Supabase Auth mediante el proceso de cambio controlado.
3. Autorizar, si corresponde, el origen exacto #148 en el runtime de `llf-agent-ops`; preparar source no equivale a desplegar.
4. No copiar JWT, fragmentos, access tokens ni `sessionStorage` entre dominios.
5. Generar autenticaciones separadas para PC e iPhone.
6. Aprobar únicamente los dispositivos temporales correctos.
7. Mantener mensajería, push, real conversations y customer traffic bloqueados.

## 9. Casos físicos obligatorios

### A — Sincronización inicial
Ambos dispositivos deben mostrar exactamente las conversaciones `[QA]`, Realtime privado y cero datos reales.

### B — Claim simultáneo
Ambos intentan reclamar la misma conversación. Exactamente uno gana y ambos convergen en un solo propietario.

### C — Resolve sincronizado
Solo el propietario resuelve y ambos dispositivos reflejan `Resolved`.

### D — Capacidades bloqueadas
Reply/Send y Return to AI permanecen deshabilitados; no se genera email, SMS, WhatsApp, push ni webhook externo.

### E — Dispositivo no confiable
Un navegador/dispositivo no aprobado recibe `trusted_device_required` y no accede a datos protegidos.

## 10. Evidencia mínima

Guardar fecha/hora, agente, dispositivo/navegador, conversación QA, esperado, actual, PASS/FAIL, captura sin credenciales y cualquier incidente/fix/retest. Una confirmación verbal no sustituye evidencia.

## 11. Limpieza posterior

Después del QA, retirar callbacks/orígenes temporales que ya no sean necesarios y revocar dispositivos temporales sin afectar producción. Conservar auditoría útil. Mensajería, push y conversaciones reales permanecen bloqueados hasta un gate posterior separado.

## 12. Criterio de revisión/merge

PR #148 solo puede salir de HOLD cuando:

- todos los checks del head final estén verdes;
- el preview/runtime autorizado corresponda al código evaluado;
- Casos A–D tengan evidencia física PASS;
- claim simultáneo tenga un solo ganador;
- resolve sincronice en ambos dispositivos;
- no exista salida externa ni datos reales;
- cualquier fallo haya sido corregido y revalidado.

Caso E debe ejecutarse durante la misma sesión si resulta práctico y, en cualquier caso, antes de ampliar acceso a más agentes.

## 13. Decisión actual

**HOLD.** La integración stale ya fue sustituida por PR #148 y el port automatizado inicial pasó. El siguiente límite real es el QA físico en el preview #148, que requiere autorización separada para cualquier cambio temporal de Auth/CORS/runtime. Este documento no autoriza producción, merge, mensajes reales ni activación de capacidades.
