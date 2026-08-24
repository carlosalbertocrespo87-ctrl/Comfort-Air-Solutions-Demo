# Agent Auth Callback Release Gate

Reconciled: 24 Aug 2026
Controller: GitHub Issue #210
Current candidate: **DRAFT PR #211 — Option A ephemeral session**

Do not enable real customer messaging, real push or customer conversation traffic solely because Agent authentication and historical physical device QA pass.

## Already evidenced internally

- magic-link authentication and backend active-agent validation;
- URL credential stripping;
- fail-closed unauthenticated Agent Console;
- trusted-device registration/reconciliation;
- synthetic-only claim/resolve on separate trusted iPhones for Carlos and María (PR #188);
- installed-PWA iOS authentication corrections through PR #198;
- Face ID on Carlos and María iPhones plus desktop device-passkey/open-console evidence for Carlos (PR #199).

These checks do not need to be repeated as a generic PC blocker. PR #211 changes only the session-persistence layer, so regression should be focused on auth continuity, trusted-device behavior, Face ID/device-passkey, lock/sign-out and session-end re-authentication.

## Option A acceptance before merge / Issue #210 closure

1. Exact PR #211 head passes the Agent Console security workflow, including the dedicated session-hardening static checks.
2. Typecheck and production build pass on that same head.
3. Confirm no durable Agent access/refresh credential remains in `localStorage`, IndexedDB or a credential-bearing JavaScript cookie.
4. Confirm the refresh token is not captured or used for browser-side automatic refresh.
5. Confirm legacy durable Agent-session state and the legacy auth-bridge cookie are purged.
6. Confirm copied approved magic-link authentication still works on the installed iPhone PWA and desktop.
7. Confirm `PENDING`/`REVOKED` trusted-device states still fail closed.
8. Confirm Face ID/device-passkey, **Bloquear** and **Cerrar sesión** still behave correctly.
9. Confirm ending the browser/PWA session requires a new approved magic-link sign-in instead of silent refresh-token restoration.
10. Record the exact physical QA evidence on PR #211 / Issue #210 before considering the security hold satisfied.

## Independent gates that remain blocked after an Agent-session PASS

- real customer/prospect conversation traffic until the customer-data release controller explicitly permits it;
- real outbound Send until separately authorized and tested;
- real push transport until separately authorized and tested;
- customer-data isolation / RLS / service-role / auditability regressions;
- legal/address release;
- Stripe live-payment/payout release;
- prospect outreach/publication;
- production AI/voice activation.

A successful PR #211 security regression may clear Issue #210, but it does not automatically clear any independent launch gate.

See `AGENT_AUTH_CALLBACK_SECURITY.md`, `AGENT_AUTH_CALLBACK_TEST.md`, `docs/AGENT-SESSION-HARDENING-OPTIONS.md`, and `docs/AGENT-CONSOLE-CURRENT-OPERATING-CONTROLLER.md`.
