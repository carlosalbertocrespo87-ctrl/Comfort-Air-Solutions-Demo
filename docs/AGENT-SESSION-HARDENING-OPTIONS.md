# LLF — Agent session hardening options before live customer traffic

Date: 24 Aug 2026
Controller: GitHub Issue #210
Status: **DESIGN / PRE-LIVE SECURITY HOLD**

## Current architecture

The Agent Console is currently a static SPA published through GitHub Pages at the protected `/agent-demo/` and `/agent-sign-in/` routes. Supabase authentication and `llf-agent-ops` provide the authoritative user/profile/device checks.

After the iOS installed-PWA session-transfer defect, the current client persists:

- the validated Agent session in browser `localStorage`;
- access/refresh continuity in a JavaScript-set `__Host-llf_agent_auth_bridge_v1` Secure/SameSite=Strict cookie for up to 30 days;
- refresh-token rotation through the Supabase publishable-key refresh endpoint.

This solved the installed-PWA continuity problem and passed internal physical device QA, but the persistent token material remains JavaScript-readable. That is acceptable only under the current synthetic/internal posture, not as the final live-customer session architecture without further review.

## Option A — ephemeral Agent session for first live release

**Recommended MVP path if LLF wants the lowest implementation risk before Client #1.**

- Do not persist refresh tokens across app restarts.
- Avoid long-lived access-token persistence in `localStorage` or other durable JavaScript-readable storage.
- Keep the active access token only for the current browser/PWA session (prefer memory; `sessionStorage` only if reload continuity is required).
- Require a fresh approved magic-link handoff at the start of a new operator session/shift.
- Reuse the protected copied-link flow already built for installed iOS PWA handoff.
- Preserve active-agent, trusted-device, Face ID/device-passkey, lock/sign-out, synthetic/live-data gates and backend authorization.

### Benefits

- removes long-lived refresh credentials from durable browser storage;
- avoids introducing a new production backend/session service before first customer;
- easy to reason about and revoke by ending the session;
- appropriate for the initial two-operator model where occasional re-authentication is tolerable.

### Trade-offs

- operators must sign in again after closing/restarting the app or at a defined short interval;
- active bearer tokens remain JavaScript-readable while the SPA is running, so CSP/XSS defenses are still required;
- physical regression QA is required after changing persistence behavior.

## Option B — same-origin/BFF server-managed session

**Preferred longer-term architecture if Agent Console becomes a daily multi-client production system.**

Move the protected Agent application behind a server-capable origin (for example a dedicated `agent.localleadforge.com` deployment with a backend-for-frontend) and use an opaque, Secure, HttpOnly, SameSite session cookie. Keep refresh/provider credentials server-side and rotate/revoke them centrally.

The BFF should:

- exchange/validate the user authentication result server-side;
- store only an opaque session identifier in the browser;
- keep refresh/provider credentials out of JavaScript-readable storage;
- bind sessions to active LLF agent identity and device-trust policy;
- enforce short idle/absolute lifetimes, rotation and explicit revocation;
- apply CSRF/origin defenses appropriate to cookie authentication;
- preserve auditable server-side authorization for every protected action;
- avoid turning the BFF into a broad service-role bypass.

### Benefits

- materially reduces theft of long-lived credentials through browser script/XSS;
- centralizes revocation and session policy;
- scales better to daily production operation.

### Trade-offs

- requires server-capable hosting/session state and more operational surface than current static GitHub Pages;
- requires fresh threat-model, deployment, auth, device and regression QA;
- should not be rushed solely to avoid an extra login during the first-customer phase.

## Options that do not solve the core problem by themselves

The following can be defense-in-depth but should not be treated as equivalent to a server-managed HttpOnly session:

- moving the same tokens from `localStorage` to IndexedDB;
- Base64/obfuscation;
- encrypting a token with a key that same-origin JavaScript can automatically use;
- relying only on `__Host-`, Secure or SameSite attributes while JavaScript still reads the credential.

A successful same-origin script compromise can generally invoke the same browser APIs as the application.

## Recommended sequence

1. Keep current implementation synthetic/internal only.
2. Before enabling real customer conversation data, choose Option A or B under Issue #210.
3. For the fastest safe Client #1 path, implement Option A first and keep B as the scale-up target.
4. Run focused physical PC/iPhone authentication, trusted-device, lock/unlock and restart/re-auth tests against the exact final session implementation.
5. Only after that security gate passes may a separate release controller consider live customer data. Real Send, real push, payment, legal, outreach and production AI/voice remain independent gates.

## Non-goals

This design does not authorize customer traffic, messaging, push, Auth/CORS changes, payment actions, legal release, outreach, credential rotation or production AI/voice activation.
