# Agent Auth Callback Security Notes

Reconciled: 24 Aug 2026
Posture: **INTERNAL / SYNTHETIC ONLY — LIVE CUSTOMER DATA HOLD**

## Current controls

- Auth fragments are removed from the visible URL before application render.
- The browser never receives the Supabase service-role key or database password.
- `llf-agent-ops` accepts a user Bearer token, validates it server-side with Supabase Auth, requires an active `llf_agent_profiles` record and enforces trusted-device checks for protected actions.
- The Edge Function performs its own user-token validation before privileged database actions.
- The installed Agent PWA can restore an authenticated session after the iOS standalone-session transfer defect discovered during physical QA.
- The current browser session record is persisted in `localStorage`; a JS-set `__Host-llf_agent_auth_bridge_v1` cookie carries access/refresh material for up to 30 days and enables access-token refresh.
- Invalid/expired refresh or authentication state fails closed and clears stored session material.
- Face ID/device-passkey verification is an additional local gate after Supabase authentication and trusted-device approval; LLF does not receive the user's biometric or device PIN.

## Persistent-token security boundary

The current `__Host-` cookie is Secure and SameSite=Strict, but because it is written/read by JavaScript it is **not HttpOnly**. The access token is also present in JavaScript-readable browser storage. Those choices support the installed-PWA QA flow but remain exposed to a successful same-origin script/XSS compromise.

Accordingly:

1. do not enable real customer conversation data solely because authentication and physical device QA pass;
2. do not describe the current browser token persistence as equivalent to an HttpOnly server-managed session;
3. before live customer traffic, complete a dedicated security review and either harden the persistence architecture or explicitly approve a documented equivalent control set;
4. keep CSP/XSS prevention, dependency integrity and strict output handling as defense-in-depth even after any session redesign.

Real messaging, real push, customer traffic, payments, outreach, legal release and production AI/voice remain separately blocked.
