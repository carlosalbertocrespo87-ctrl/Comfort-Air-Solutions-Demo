> **ARCHIVED / SUPERSEDED — 24 Aug 2026.** The PR #94 / PR #148 procedure below is historical. Physical synthetic Agent Console QA later passed under PR #188, followed by iPhone/desktop authentication and device-security corrections through PR #199. Current Agent Console source has not changed since PR #199; later commits only added staged prospect configs. Use `docs/AGENT-CONSOLE-CURRENT-OPERATING-CONTROLLER.md` for current action status. Do not rerun this old procedure merely because this historical section says `HOLD` or `PENDING_PHYSICAL`.

# LLF — Consola Realtime sintética: despliegue y QA

**Fecha de reconciliación:** 21 de agosto de 2026  
**Merge candidate:** PR #148  
**QA carrier físico:** PR #94 sincronizado  
**Estado:** DRAFT / HOLD / QA SINTÉTICO SOLAMENTE

## 1. Objetivo

Validar la Consola del Agente entre PC e iPhone usando solo datos sintéticos. Este gate no autoriza producción, mensajes reales, push, conversaciones reales, customer traffic ni acciones comerciales/financieras.

## 2. Estado de integración

PR #94 estuvo 101 commits detrás de `main`. PR #147 sincronizó `main` hacia esa rama de QA y quedó fusionado únicamente en `feature/synthetic-realtime-console`. Después de esa sincronización:

- PR #94 está 0 behind de `main`;
- head QA: `72b028287b45ee19eb4d1188405bcee7b5741dd8`;
- Agent Console Security Gate run #20: PASS;
- Main Protection, Onboarding, Pixel Match y los security gates HVAC COMP disparados: PASS.

PR #148 sigue siendo el merge candidate limpio, construido directamente desde el mismo `main`.

## 3. Equivalencia para QA físico

Se verificó equivalencia byte-a-byte de los blobs ejecutables críticos entre #94 sincronizado y #148. La evidencia detallada está en `docs/PR148-PHYSICAL-QA-EQUIVALENCE.md`.

Por ello, el preview protegido de PR #94 puede funcionar como carrier de QA físico para PR #148 mientras esos hashes no cambien. PR #94 no se convierte por eso en merge target.

## 4. Estado autoritativo de plataforma observado

- Supabase `Local-Lead-Forge`: `ACTIVE_HEALTHY`;
- `llf-agent-ops`: v11 ACTIVE;
- 2 conversaciones sintéticas y 0 reales en el checkpoint;
- 4 mensajes sintéticos;
- 2 dispositivos `TRUSTED`, 0 `PENDING` en el checkpoint;
- RLS activo en conversaciones/mensajes;
- `REALTIME_CONVERSATIONS = BLOCKED`;
- `SECURE_IPHONE_PUSH = BLOCKED`.

La v11 exige agente activo, dispositivo confiable, `is_synthetic = true` y bloquea `send_message`.

## 5. CORS / preview

El runtime v11 ya allowlista:

- `https://localleadforge.com`;
- `https://www.localleadforge.com`;
- `https://deploy-preview-94--symphonious-travesseiro-c9bae1.netlify.app`.

PR #148 conserva ese mismo source endurecido. **No requiere desplegar** una variante nueva de CORS solo para hacer el QA físico.

La configuración de Supabase Auth Redirect URLs debe verificarse durante la sesión. Si el callback de PR #94 ya está permitido, no cambiar nada. Si no está permitido, detenerse y pedir autorización separada antes de modificar Auth.

## 6. Superficie permitida

Solo iniciar sesión como agente LLF activo, registrar/consultar dispositivo, cambiar disponibilidad desde trusted device, listar/claim/resolve conversaciones sintéticas y recibir refresh Realtime privado.

No se permite enviar mensajes, Return to AI, push, conversaciones reales, saltar trusted-device, publicar el preview, habilitar customer traffic ni cambiar CRM/rutas/precios/pagos/legal/credenciales.

## 7. Gate automático

`.github/workflows/agent-console-security.yml` verifica invariantes fail-closed, typecheck y build. Cualquier cambio posterior exige nuevo PASS en el head vigente.

## 8. Preparación física

1. Usar el preview protegido de PR #94 sincronizado.
2. Confirmar head `72b028287b45ee19eb4d1188405bcee7b5741dd8` o revalidar equivalencia si cambió.
3. Confirmar checks verdes.
4. Carlos abre el preview en PC; María en iPhone.
5. Verificar el callback de Auth sin cambiar configuración si ya funciona.
6. Autenticaciones separadas; nunca copiar JWT/tokens entre dispositivos.
7. Aprobar solo los registros de dispositivo correctos.
8. Mantener todo tráfico real y salida externa bloqueados.

## 9. Casos obligatorios

### A — Sincronización inicial
Ambos ven solo `[QA]`, Realtime privado conectado y cero datos reales.

### B — Claim simultáneo
Ambos reclaman la misma conversación; exactamente uno gana y ambos convergen en un propietario.

### C — Resolve sincronizado
Solo el propietario resuelve y ambos dispositivos reflejan `Resolved`.

### D — Capacidades bloqueadas
Reply/Send/Return to AI siguen deshabilitados; cero email/SMS/WhatsApp/push/webhook externo.

### E — Dispositivo no confiable
Acceso protegido falla con `trusted_device_required`.

## 10. Evidencia mínima

Registrar fecha/hora, agente, dispositivo/navegador, head exacto, conversación QA, esperado, actual, PASS/FAIL, captura sin secretos y cualquier incidente/retest.

## 11. Regla de equivalencia

Si cambia cualquiera de los hashes ejecutables documentados, la equivalencia expira y el QA físico debe repetirse contra una superficie reconciliada.

## 12. Limpieza

Retirar solo callbacks/dispositivos temporales que realmente hayan sido creados para la sesión. No hacer limpieza destructiva innecesaria. Conservar auditoría útil.

## 13. Decisión actual

**HOLD.** Ya no existe un blocker de CORS que obligue a desplegar una variante nueva para #148. El siguiente trabajo real es el QA físico usando PR #94 sincronizado como carrier equivalente. Este documento **no autoriza producción**, merge, mensajes reales ni activación de capacidades.
