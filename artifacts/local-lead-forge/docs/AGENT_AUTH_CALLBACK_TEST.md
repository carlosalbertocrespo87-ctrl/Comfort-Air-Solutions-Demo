# LLF Agent Auth Callback Test

Reconciled: 24 Aug 2026
Status: **PR #211 OPTION A REGRESSION CONTRACT / NOT LIVE-CUSTOMER AUTHORIZATION**
Controller: GitHub Issue #210

## Expected Option A flow

1. Generate a fresh Supabase magic link for an approved LLF agent.
2. Open it only on an approved LLF protected origin / supported installed-PWA handoff.
3. The app strips auth material from the visible URL before using the access token.
4. The access token is validated through `llf-agent-ops` action `session_info`.
5. Only an active row in `llf_agent_profiles` is accepted.
6. The current device is registered/reconciled and protected operations require `TRUSTED`.
7. The validated Agent access-token session is kept only in `sessionStorage` for the current browser/PWA session.
8. The refresh token is not captured, persisted or used for automatic refresh.
9. Legacy durable Agent-session `localStorage` state and the legacy auth-bridge cookie are purged.
10. `/agent-demo` fails closed when no valid current-session access token is present.
11. The local Face ID/device-passkey gate must succeed before the protected Agent Console is shown on a configured trusted device.
12. When the access token expires or the browser/PWA session ends, a new approved magic-link sign-in is required.

## Automated negative checks

- No `localStorage.setItem(SESSION_KEY, ...)` for Agent credentials.
- No `refresh_token` capture or browser refresh-token exchange.
- No credential-bearing auth-bridge cookie writer/reader.
- Legacy Agent-session `localStorage` state is removed.
- Legacy auth-bridge cookie is expiration-only.
- Durable `localStorage` write is limited to the non-secret device-install identifier.
- Missing token -> no new session created.
- Invalid/expired access token -> session cleared; no console access.
- Valid Supabase user without active agent profile -> HTTP 403; no console access.
- `PENDING` or `REVOKED` device -> protected agent operation fails closed.
- Missing/failed local platform verification on a configured device -> protected console stays locked.
- No service-role or database credential is stored in browser code.
- No real customer/prospect messaging or real push is enabled by this flow.

## Focused physical regression required on exact PR #211 head

### iPhone / installed PWA — Carlos

1. Open LLF Agent signed out.
2. Request a fresh magic link.
3. Copy the newest approved link from Gmail and paste it into LLF Agent.
4. Confirm Agent Console opens only after trusted-device + Face ID requirements are satisfied.
5. Reload the current PWA session and confirm the session remains usable while the access token is valid.
6. Use **Bloquear** and confirm Face ID is required again before protected console access.
7. Use **Cerrar sesión** and confirm `/agent-demo` no longer opens authenticated.
8. Sign in again, then fully end/close the Agent browser/PWA session and reopen it. Confirm there is no silent refresh-token restoration; a fresh approved sign-in must be required once the page session is gone.

### iPhone / installed PWA — María

Repeat the same protected copied-link, trusted-device, Face ID, lock/sign-out and session-end re-authentication checks using María's approved agent identity. Do not reuse Carlos's authenticated session.

### Desktop — Carlos

1. Sign in through the approved desktop flow.
2. Confirm the Agent Console identifies Carlos and requires the configured device passkey/local platform verification.
3. Reload during the same browser session and confirm the access-token session remains valid while unexpired.
4. Lock and unlock with the device passkey.
5. Sign out and confirm no protected session survives.
6. End the browser session and confirm a new magic-link sign-in is required rather than automatic refresh-token continuity.

## Historical evidence retained

- PR #188: Carlos and María authenticated on separate trusted iPhones and completed synthetic claim/resolve with zero external delivery.
- PR #199: Carlos iPhone Face ID PASS; María iPhone Face ID PASS; Carlos desktop device-passkey PASS and console opened as Carlos.

Those results remain evidence for unchanged trusted-device/biometric/console controls, but PR #211 changes executable persistence behavior, so the focused regression above is required before Issue #210 can close.

## Release boundary

A PASS here can satisfy the Agent session-security gate only. It does not enable real customer data, real Send, real push, payments, outreach, legal release or production AI/voice.
