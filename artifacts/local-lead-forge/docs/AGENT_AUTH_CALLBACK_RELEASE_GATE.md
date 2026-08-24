# Agent Auth Callback Release Gate

Reconciled: 24 Aug 2026

Do not enable real customer messaging, real push or customer conversation traffic solely because Agent authentication and physical device QA pass.

## Already evidenced internally

- magic-link authentication and backend active-agent validation;
- URL credential stripping;
- fail-closed unauthenticated Agent Console;
- trusted-device registration/reconciliation;
- synthetic-only claim/resolve on separate trusted iPhones for Carlos and María (PR #188);
- installed-PWA iOS authentication corrections through PR #198;
- Face ID on Carlos and María iPhones plus desktop device-passkey/open-console evidence for Carlos (PR #199).

These checks do not need to be repeated as a generic PC blocker unless a later executable/auth/device-security change invalidates them.

## Required before real customer data / live agent traffic

1. Resolve the persistent-session security hold: current access/refresh persistence is JavaScript-readable browser state and is not an HttpOnly server-managed session. Complete a dedicated security review/hardening decision.
2. Re-run focused auth/device regression QA against the final hardened session architecture.
3. Keep active-agent and trusted-device enforcement fail-closed.
4. Keep real outbound Send disabled until separately authorized and tested.
5. Keep real push transport disabled until separately authorized and tested; local/synthetic notification rehearsal is not real push approval.
6. Confirm no regression in customer-data isolation, RLS/service-role boundaries and auditability.
7. Respect the independent legal/address/payment/outreach/production-AI gates.

See `AGENT_AUTH_CALLBACK_SECURITY.md` and `docs/AGENT-CONSOLE-CURRENT-OPERATING-CONTROLLER.md`.
