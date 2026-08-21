# LLF — Consola Realtime sintética: despliegue y QA

**Fecha:** 21 de agosto de 2026  
**PR:** #94  
**Estado:** DESPLEGADO PARA QA / NO APROBADO PARA PRODUCCIÓN REAL

## 1. Objetivo

Validar la consola móvil de agentes con persistencia y sincronización Realtime entre Carlos (PC) y María (iPhone), sin utilizar clientes reales, sin enviar mensajes y sin activar notificaciones push.

## 2. Alcance implementado

- Dos conversaciones QA persistidas en Supabase con `is_synthetic = true`.
- Cuatro mensajes QA sintéticos.
- Lectura de conversaciones mediante la Edge Function `llf-agent-ops`.
- Canal privado Realtime: `llf-agent-console-synthetic`.
- Acciones permitidas durante esta fase:
  - cambiar disponibilidad;
  - consultar escenarios sintéticos;
  - reclamar una conversación sintética;
  - resolver una conversación sintética.
- Edge Function desplegada: `llf-agent-ops` versión 7.

## 3. Controles de seguridad

### Autenticación y dispositivo

La Edge Function:

1. valida el token con Supabase Auth;
2. confirma que el usuario tenga un perfil LLF activo;
3. calcula/recibe el identificador de instalación;
4. exige que el dispositivo figure como `TRUSTED`;
5. actualiza `last_seen_at`;
6. registra acciones relevantes en la auditoría.

Carlos tiene registrado Windows/Chrome. María tiene registrado iPhone/Safari.

### Separación de datos

- Las consultas del navegador no leen directamente las tablas de conversaciones.
- `anon` no tiene permiso `SELECT` en:
  - `public.llf_conversations`;
  - `public.llf_conversation_messages`.
- La función devuelve exclusivamente conversaciones con `is_synthetic = true`.
- Claim y resolve también exigen `is_synthetic = true`.
- El canal Realtime transmite únicamente una señal `refresh` con el tipo de entidad y operación. No transmite nombres, correos, teléfonos ni contenido del mensaje.
- La política del canal privado permite recepción solamente a usuarios autenticados con perfil LLF activo.

### Funciones bloqueadas

- Mensajería real: BLOQUEADA.
- Notificaciones push: BLOQUEADAS.
- Retorno de conversación a IA: BLOQUEADO durante QA.
- Conversaciones reales: no existen en esta base al momento de la validación.
- La capacidad `REALTIME_CONVERSATIONS` permanece `BLOCKED` hasta completar QA en dos dispositivos.
- La capacidad `SECURE_IPHONE_PUSH` permanece `BLOCKED`.

## 4. Evidencia automática

Ejecutado correctamente antes de publicar el PR:

```bash
pnpm --dir artifacts/local-lead-forge typecheck
pnpm --dir artifacts/local-lead-forge build
```

Resultado de base de datos:

- conversaciones sintéticas: 2;
- conversaciones no sintéticas: 0;
- mensajes sintéticos: 4;
- lectura anónima de conversaciones: denegada;
- lectura anónima de mensajes: denegada.

Estado observado del PR:

- Netlify Deploy Preview: correcto;
- LLF Main Protection Gate: correcto;
- LLF Onboarding CI: correcto;
- LLF Pixel Match QA: pendiente al redactar este registro;
- hilos de revisión: ninguno;
- revisiones solicitando cambios: ninguna.

## 5. Avisos conocidos

Supabase Security Advisor mantiene un aviso: **Leaked Password Protection Disabled**. Esta protección no está disponible en el plan Free actual. No se considera resuelto y debe revisarse antes de ampliar el acceso o cambiar de plan.

Los avisos de índices sin uso son informativos en esta etapa y no justifican eliminar índices antes de obtener tráfico y métricas reales.

## 6. Prueba manual PC–iPhone

### Preparación

1. Carlos abre el preview del PR #94 en su PC usando Chrome.
2. María abre el mismo preview en su iPhone usando Safari.
3. Cada uno inicia sesión con su propia identidad.
4. Ambos verifican que la consola diga `trusted device`.
5. Ambos mantienen abierta la lista de conversaciones QA.

### Caso A — Sincronización inicial

1. Confirmar que ambos ven exactamente dos conversaciones identificadas con `[QA]`.
2. Confirmar que la consola muestra `Private Realtime connected · synthetic data only`.
3. Confirmar que no aparece información de clientes reales.

**Aprobación:** ambos dispositivos muestran el mismo estado sin recargar manualmente.

### Caso B — Bloqueo de reclamación simultánea

1. Carlos y María seleccionan la misma conversación `[QA]`.
2. Ambos presionan **Take** casi al mismo tiempo.
3. Solo una solicitud debe ganar.
4. El segundo agente debe ver la asignación actualizada y no debe poder reclamar ni responder.

**Aprobación:** existe un solo agente asignado en la base de datos y en ambas pantallas.

### Caso C — Resolución sincronizada

1. El agente propietario presiona **Resolve**.
2. El estado debe cambiar a `Resolved` en ambos dispositivos.
3. El agente que no es propietario no debe poder ejecutar la resolución.

**Aprobación:** ambas pantallas reflejan la resolución y la auditoría registra al agente correcto.

### Caso D — Capacidades bloqueadas

1. Verificar que el cuadro de respuesta esté deshabilitado.
2. Verificar que **Send** permanezca deshabilitado.
3. Verificar que **Return to AI** permanezca deshabilitado.
4. Confirmar que no se genera correo, SMS, WhatsApp ni push.

**Aprobación:** no existe salida hacia sistemas externos.

### Caso E — Dispositivo no confiable

1. Abrir la consola desde un navegador/dispositivo nuevo.
2. Completar el inicio de sesión.
3. Intentar cargar o modificar una conversación antes de aprobar el dispositivo.

**Aprobación:** el backend responde `trusted_device_required` y registra `UNTRUSTED_DEVICE_BLOCKED`.

## 7. Criterio de fusión

El PR #94 solo debe marcarse listo para revisión y fusionarse cuando:

- todos los controles automáticos estén en verde;
- Casos A–D hayan sido completados por Carlos y María;
- el bloqueo de reclamación simultánea esté confirmado;
- no haya datos reales ni entregas externas;
- mensajes y push continúen bloqueados;
- cualquier fallo encontrado esté corregido y nuevamente validado.

El Caso E es una comprobación de seguridad adicional recomendada antes de habilitar acceso a más agentes.

## 8. Rollback

Si el QA falla:

1. mantener `REALTIME_CONVERSATIONS = BLOCKED`;
2. no fusionar el PR;
3. conservar mensajes y push bloqueados;
4. deshabilitar la suscripción Realtime del frontend;
5. revertir la Edge Function a su versión anterior si el fallo está en el backend;
6. retirar solamente los registros con `is_synthetic = true` si es necesario reiniciar el escenario;
7. conservar los registros de auditoría para investigación.

## 9. Decisión actual

El sistema está listo para **QA autenticado con datos sintéticos**, pero todavía no está autorizado para mensajería real, notificaciones push ni tráfico de clientes.
