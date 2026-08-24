# LLF — Agent Console current operating controller

Last reconciled: 24 Aug 2026
Current protected `main` before PR #211: `d5e6df0ec913ab98efb43191a1e7932e7577cae4`
Current security candidate: **DRAFT PR #211 — Option A ephemeral Agent session**
Status: **PHYSICAL INTERNAL QA PASSED FOR EXISTING CONTROLS / SESSION-PERSISTENCE REGRESSION REQUIRED / NO CUSTOMER TRAFFIC / NO REAL SEND / NO REAL PUSH**
Controller: GitHub Issue #210

## Authoritative current evidence

The historical PR #94 / PR #148 physical-QA procedure is superseded.

PR #188 completed authenticated synthetic-only physical QA with Carlos and María on separate trusted iPhones. The evidence includes Magic Link authentication, trusted-device fail-closed behavior, protected synthetic conversation loading, claim and resolve persistence, and zero customer traffic or external messaging.

Subsequent protected Agent Console work through PRs #195–#199 corrected the iOS installed-PWA authentication flow, added local device verification/Face ID and explicit lock/sign-out controls, and reconciled security wording across iPhone and desktop. PR #199 records the latest physical security basis:

- Carlos iPhone: Face ID PASS;
- María iPhone: Face ID PASS;
- Carlos desktop: device passkey PASS and Agent Console opened as Carlos.

PR #199 merged as `72cb651e421963a7f3e6923fba74f0ec546acba9`. Later work through PR #209 did not change Agent Console runtime behavior; PR #209 reconciled the documentation and made Issue #210 the controlling pre-live session-security hold.

## New executable candidate: PR #211

PR #211 intentionally changes one security-sensitive runtime area: Agent session persistence.

Candidate behavior:

- Agent access-token session lives only in `sessionStorage` for the current browser/PWA session;
- refresh token is not captured, retained or browser-refreshed;
- legacy durable Agent-session `localStorage` state is purged;
- legacy JavaScript-readable credential bridge cookie is expired and no longer written with credentials;
- the non-secret device-install identifier remains durable for trusted-device identity;
- active-agent validation, trusted-device enforcement, Face ID/device-passkey, lock/sign-out and copied approved magic-link controls remain.

Because this is executable auth behavior after PR #199, the old physical PASS cannot by itself clear PR #211. Focused iPhone/PWA and desktop auth/device regression QA is required on the exact final PR #211 head before Issue #210 can close.

## What is NOT a current owner action

Do **not** rerun the old PR #94 / PR #148 generic physical-QA carrier procedure.

Do **not** change Supabase Auth, CORS, credentials, trusted-device policy, payment configuration or notification transport to validate PR #211.

The only current Agent Console physical work created by PR #211 is the focused auth/session regression defined in `artifacts/local-lead-forge/docs/AGENT_AUTH_CALLBACK_TEST.md`:

- copied approved magic-link sign-in;
- trusted-device fail-closed behavior;
- Face ID/device-passkey;
- current-session reload continuity;
- explicit lock/sign-out;
- session-end/new-sign-in behavior with no silent refresh-token restoration.

## Still intentionally blocked

The following remain outside the Agent-session work and require separate release authorization/gates:

- customer/prospect traffic;
- real outbound messaging / Send;
- real push transport or PushManager subscription;
- Return-to-AI or other live customer routing where still disabled;
- outreach/publication;
- production checkout, live charges/refunds/payouts;
- legal/address release;
- production AI/voice activation;
- knowledge-base approval/publication or any automatic promotion of draft-only learning.

Synthetic/local QA capability and an eventual Issue #210 PASS do not authorize any of the above.

## Controller rule

For any future question of “what still needs the PC?”, consult this file plus the newest release/payment/legal controllers. While PR #211 is DRAFT, protected `main` remains internal/synthetic only. Archived PR #94/#148 documents are evidence history, not current instructions.
