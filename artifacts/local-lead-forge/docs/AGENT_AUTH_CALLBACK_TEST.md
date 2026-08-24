# LLF Agent Auth Callback Test

Reconciled: 24 Aug 2026
Status: current internal regression contract; **not** a live-customer release authorization.

## Expected current flow

1. Generate a fresh Supabase magic link for an approved LLF agent.
2. Open it only on an approved LLF protected origin / supported installed-PWA handoff.
3. The app strips auth material from the visible URL before rendering.
4. The access token is validated through `llf-agent-ops` action `session_info`.
5. Only an active row in `llf_agent_profiles` is accepted.
6. The current device is registered/reconciled and protected operations require `TRUSTED`.
7. The validated session is persisted for installed-PWA continuity; current source uses browser `localStorage` plus `__Host-llf_agent_auth_bridge_v1` for access/refresh continuity.
8. If the access token expires and a valid refresh token exists, the app refreshes through Supabase and re-establishes the validated agent session.
9. `/agent-demo` fails closed when no valid session is present.
10. The local Face ID/device-passkey gate must succeed before the protected Agent Console is shown on a configured trusted device.

## Negative checks

- Missing token -> no new session created.
- Invalid/expired token without valid refresh -> session cleared; no console access.
- Invalid refresh response -> bridge/session cleared; no console access.
- Valid Supabase user without active agent profile -> HTTP 403; no console access.
- `PENDING` or `REVOKED` device -> protected agent operation fails closed.
- Missing/failed local platform verification on a configured device -> protected console stays locked.
- No service-role or database credential is stored in browser code.
- No real customer/prospect messaging or real push is enabled by this flow.

## Physical evidence already collected

- PR #188: Carlos and María authenticated on separate trusted iPhones and completed synthetic claim/resolve with zero external delivery.
- PR #199: Carlos iPhone Face ID PASS; María iPhone Face ID PASS; Carlos desktop device passkey PASS and console opened as Carlos.
- No Agent Console executable changes occurred after PR #199 through current `main`; only staged prospect configs were added.

## Remaining security release test

Before real customer data is allowed, validate the chosen hardened persistent-session architecture. Current JS-readable persistent token storage is an internal/synthetic QA implementation and is not by itself approved for live customer traffic. See `AGENT_AUTH_CALLBACK_SECURITY.md` and `docs/AGENT-CONSOLE-CURRENT-OPERATING-CONTROLLER.md`.
