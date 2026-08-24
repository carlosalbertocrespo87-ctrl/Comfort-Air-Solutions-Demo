# Agent Auth Callback Status

Reconciled: 24 Aug 2026
Status: **INTERNAL / SYNTHETIC QA PASS — LIVE CUSTOMER TRAFFIC STILL BLOCKED**

Current implementation on protected `main`:
- magic-link fragment consumption and immediate URL credential stripping;
- server-side `session_info` validation and active-agent requirement;
- trusted-device registration/reconciliation and fail-closed device checks;
- installed-PWA session persistence added after the iOS standalone-session defect;
- current session record is persisted in browser `localStorage` and a 30-day `__Host-llf_agent_auth_bridge_v1` cookie carries the access/refresh bridge;
- expired access tokens can be refreshed through the Supabase publishable-key refresh endpoint;
- local Face ID/device-passkey gate is layered after Supabase authentication and trusted-device approval;
- physical evidence: Carlos + María iPhone Face ID PASS; Carlos desktop device passkey PASS and Agent Console opened as Carlos;
- current Agent Console executable surface has not changed since PR #199; later `main` commits only added staged prospect configs.

Still intentionally blocked:
- real customer/prospect conversation traffic;
- real outbound messaging / Send;
- real push transport;
- production payment/legal/outreach/AI/voice release.

## Security hold before live customer data

The current persistent access/refresh material is JavaScript-readable browser state (`localStorage` plus a JS-set Secure/SameSite=Strict `__Host-` cookie). The `__Host-` prefix and SameSite/Secure attributes reduce some classes of abuse, but they do **not** make the tokens HttpOnly or protect them from an XSS compromise.

Therefore this implementation remains suitable only for the current internal/synthetic QA posture. Before enabling real customer data or live agent traffic, complete a separate security review/hardening decision for persistent token storage and session architecture. Do not treat the physical QA PASS as authorization to remove that release hold.
