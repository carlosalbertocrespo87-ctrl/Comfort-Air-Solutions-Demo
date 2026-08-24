# Agent Auth Callback Security Notes

Reconciled: 24 Aug 2026
Posture: **DRAFT PR #211 / OPTION A CANDIDATE / LIVE CUSTOMER DATA HOLD**
Controller: GitHub Issue #210

## Controls preserved by PR #211

- Auth fragments are removed from the visible URL before the access token is used.
- The browser never receives the Supabase service-role key or database password.
- `llf-agent-ops` accepts a user Bearer token, validates it server-side with Supabase Auth, requires an active `llf_agent_profiles` record and enforces trusted-device checks for protected actions.
- The Edge Function performs its own user-token validation before privileged database actions.
- The installed Agent PWA keeps the protected copied-magic-link handoff that was proven during prior physical QA.
- Face ID/device-passkey verification remains an additional local gate after Supabase authentication and trusted-device approval; LLF does not receive the user's biometric or device PIN.
- Explicit lock and sign-out remain available.

## Option A persistence model in PR #211

- The validated Agent access-token session is stored only in `sessionStorage` for the current browser/PWA session.
- The refresh token is not captured, retained or used for automatic refresh.
- The old durable Agent-session record in `localStorage` is actively deleted.
- The old JavaScript-readable `__Host-llf_agent_auth_bridge_v1` credential bridge is actively expired and no longer written with tokens.
- The non-secret device-install identifier remains in `localStorage` so trusted-device identity can continue to function.
- When the access token expires, or the browser/PWA session ends, the operator must authenticate again with a fresh approved magic link.

## Security improvement

PR #211 removes the long-lived refresh credential from durable JavaScript-readable browser storage and therefore materially reduces the persistence exposure identified in Issue #210. It also removes the 30-day credential-bearing JavaScript cookie used by the previous installed-PWA continuity model.

## Residual browser risk

Option A is not equivalent to a server-managed HttpOnly session. The active bearer access token is still JavaScript-readable while the SPA session is running. A successful same-origin script/XSS compromise during an active session could still attempt to act with that token.

The durable device-install identifier is intentionally non-secret and should be treated as an operational device-continuity signal, not as an anti-XSS security boundary. A same-origin script compromise could read it. Backend authorization must therefore continue to depend on a valid active-agent access token plus trusted-device policy, while CSP/XSS controls remain the primary defense against same-origin script compromise.

Therefore:

1. keep CSP/XSS prevention, dependency integrity and strict output handling as defense-in-depth;
2. keep access-token lifetime short and do not reintroduce browser refresh-token persistence;
3. preserve active-agent and trusted-device fail-closed enforcement on every protected backend action;
4. require focused physical iPhone/PWA and desktop regression QA on the exact PR #211 head before accepting the new session behavior;
5. consider the same-origin/BFF + HttpOnly server-managed Option B when Agent Console usage scales beyond the initial two-operator / first-customer model.

## Release boundary

Real customer conversation data, real messaging, real push, payments, outreach, legal release and production AI/voice remain separately blocked. PR #211 does not authorize any of them.
