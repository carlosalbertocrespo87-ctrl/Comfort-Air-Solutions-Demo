# LLF — Agent session hardening options before live customer traffic

Date: 24 Aug 2026
Controller: GitHub Issue #210
Status: **OPTION A IMPLEMENTATION CANDIDATE IN DRAFT PR #211 / PRE-LIVE SECURITY HOLD**

## Current protected-main architecture

Protected `main` at the time PR #211 was opened is `d5e6df0ec913ab98efb43191a1e7932e7577cae4` and still contains the installed-PWA persistence model documented by PR #209. That model stores the validated Agent session in browser `localStorage` and uses a JavaScript-readable `__Host-llf_agent_auth_bridge_v1` cookie for access/refresh continuity.

That design solved the observed iOS installed-PWA continuity defect and passed internal physical device QA, but the durable token material remains JavaScript-readable. It therefore stays internal/synthetic only under Issue #210.

## Option A — ephemeral Agent session for first live release

**Selected implementation candidate: DRAFT PR #211.**

PR #211 changes the Agent Console so that:

- the validated Agent access-token session is kept only in `sessionStorage` for the current browser/PWA session;
- the refresh token is not captured, retained or used for automatic refresh;
- the legacy durable `localStorage` Agent-session record is actively removed;
- the legacy JavaScript-readable auth-bridge cookie is actively expired and is no longer written with credentials;
- the non-secret device-install identifier may remain in `localStorage` so trusted-device identity can continue to work;
- a fresh approved magic-link handoff is required after the browser/PWA session ends or when the access token expires;
- active-agent, trusted-device, Face ID/device-passkey, lock/sign-out, synthetic/live-data gates and backend authorization remain unchanged.

### Benefits

- removes long-lived refresh credentials from durable JavaScript-readable browser storage;
- materially reduces the credential-persistence exposure tracked by Issue #210;
- avoids introducing a new production backend/session service before Client #1;
- keeps the first-customer architecture simple enough to audit and revoke by ending the session.

### Trade-offs

- operators must sign in again after the session ends or the short-lived access token expires;
- the active bearer access token remains JavaScript-readable while the SPA session is running, so CSP/XSS/dependency/output-safety defenses remain required;
- physical iPhone/desktop regression QA is required because persistence behavior changed after PR #199.

### Required acceptance before Issue #210 can close

1. Exact-head Agent Console security workflow passes on PR #211.
2. Typecheck and production build pass on the exact PR head.
3. Confirm no durable Agent access/refresh token is written to `localStorage`, IndexedDB or a credential-bearing JavaScript cookie.
4. Confirm the copied approved magic-link flow still authenticates on iPhone/PWA and desktop.
5. Confirm trusted-device behavior remains fail closed for `PENDING`/`REVOKED` devices.
6. Confirm Face ID/device-passkey lock, explicit lock and sign-out still work.
7. Confirm closing/ending the Agent browser/PWA session requires a new magic-link sign-in rather than silently restoring from a refresh credential.
8. Keep real customer data, real Send and real push blocked until their independent release gates are satisfied.

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

- requires server-capable hosting/session state and more operational surface than current static deployment;
- requires fresh threat-model, deployment, auth, device and regression QA;
- should not be rushed solely to avoid an extra login during the first-customer phase.

## Options that do not solve the core problem by themselves

The following can be defense-in-depth but should not be treated as equivalent to a server-managed HttpOnly session:

- moving the same refresh credentials from `localStorage` to IndexedDB;
- Base64/obfuscation;
- encrypting a token with a key that same-origin JavaScript can automatically use;
- relying only on `__Host-`, Secure or SameSite attributes while JavaScript still reads the credential.

A successful same-origin script compromise can generally invoke the same browser APIs as the application.

## Recommended sequence

1. Keep protected `main` synthetic/internal only while PR #211 is DRAFT.
2. Let PR #211 complete exact-head automated security/typecheck/build checks.
3. Perform focused iPhone/PWA and desktop regression QA on the exact PR #211 implementation.
4. If all acceptance criteria pass, separately authorize merge of PR #211 and close Issue #210 only after documenting the final evidence.
5. Real customer conversation data, real Send, real push, payment, legal, outreach and production AI/voice remain independent gates.

## Non-goals

This design and PR #211 do not authorize customer traffic, messaging, push, Auth/CORS changes, payment actions, legal release, outreach, credential rotation or production AI/voice activation.
