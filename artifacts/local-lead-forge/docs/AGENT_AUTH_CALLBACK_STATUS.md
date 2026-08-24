# Agent Auth Callback Status

Reconciled: 24 Aug 2026
Status: **DRAFT PR #211 / OPTION A CANDIDATE / LIVE CUSTOMER TRAFFIC STILL BLOCKED**
Controller: GitHub Issue #210

## Protected `main` before PR #211

Protected `main` at PR open is `d5e6df0ec913ab98efb43191a1e7932e7577cae4`. It still uses the installed-PWA persistence model documented by PR #209: a durable Agent session in browser `localStorage` plus a JavaScript-readable `__Host-llf_agent_auth_bridge_v1` cookie carrying access/refresh continuity.

That implementation remains internal/synthetic only while Issue #210 is open.

## Option A candidate in PR #211

PR #211 changes only Agent session persistence and its security checks:

- magic-link fragment consumption and immediate URL credential stripping remain;
- server-side `session_info` validation and active-agent requirement remain;
- trusted-device registration/reconciliation and fail-closed protected operations remain;
- the validated Agent access-token session is stored only in `sessionStorage`;
- the refresh token is not captured, persisted or used for automatic refresh;
- legacy durable Agent-session `localStorage` state is actively removed;
- the legacy JavaScript-readable auth-bridge cookie is actively expired and no longer carries credentials;
- the non-secret device-install identifier remains durable so trusted-device identity can continue to function;
- Face ID/device-passkey remains layered after Supabase authentication and trusted-device approval;
- explicit lock/sign-out controls remain.

## Expected operator behavior under Option A

A valid Agent session can survive a page reload inside the same browser/PWA session through `sessionStorage`. When that browser/PWA session ends, or when the access token expires, the operator must complete a new approved magic-link sign-in. There is no refresh-token continuity in the browser.

## Evidence status

Historical physical evidence remains valid for the unchanged controls:

- PR #188: Carlos + María separate trusted-iPhone synthetic claim/resolve PASS with zero external delivery;
- PR #199: Carlos iPhone Face ID PASS; María iPhone Face ID PASS; Carlos desktop device-passkey PASS and Agent Console opened as Carlos.

Because PR #211 changes executable authentication persistence behavior after PR #199, a focused iPhone/PWA + desktop auth/device regression is required on the exact final PR #211 head before Issue #210 may be closed or this architecture may be considered for live customer data.

## Still intentionally blocked

- real customer/prospect conversation traffic;
- real outbound messaging / Send;
- real push transport;
- outreach/publication;
- production payment/legal release;
- production AI/voice activation.

PR #211 is a security-hardening candidate only. It does not authorize any of those releases.
