# LLF — Agent Console current operating controller

Last reconciled: 24 Aug 2026
Current protected `main`: `9eb570f456a48607f94af856f852efa94071bb46`
Status: **PHYSICAL INTERNAL QA PASSED / NO CUSTOMER TRAFFIC / NO REAL SEND / NO REAL PUSH**

## Authoritative current evidence

The historical PR #94 / PR #148 physical-QA procedure is superseded.

PR #188 completed authenticated synthetic-only physical QA with Carlos and María on separate trusted iPhones. The evidence includes Magic Link authentication, trusted-device fail-closed behavior, protected synthetic conversation loading, claim and resolve persistence, and zero customer traffic or external messaging.

Subsequent protected Agent Console work through PRs #195–#199 corrected the iOS installed-PWA authentication flow, added local device verification/Face ID and explicit lock/sign-out controls, and reconciled security wording across iPhone and desktop. PR #199 records the latest physical security basis:

- Carlos iPhone: Face ID PASS;
- María iPhone: Face ID PASS;
- Carlos desktop: device passkey PASS and Agent Console opened as Carlos.

PR #199 merged as `72cb651e421963a7f3e6923fba74f0ec546acba9`. A compare from that merge commit to current `main` shows only prospect-config additions; no Agent Console executable surface changed afterward. Therefore the latest physical Agent Console evidence remains current for the present source tree.

## What is NOT a current owner action

Do **not** rerun the old PR #94 / PR #148 physical-QA carrier procedure merely because an archived document says `PENDING_PHYSICAL` or `HOLD`.

Do **not** change Supabase Auth, CORS, credentials, trusted-device policy, payment configuration, or notification transport to reproduce historical QA.

A new physical regression session is required only if a later Agent Console executable/auth/device-security change invalidates the current evidence or a separate current launch controller explicitly requires it.

## Still intentionally blocked

The following remain outside the physical-QA PASS and require separate release authorization/gates:

- customer/prospect traffic;
- real outbound messaging / Send;
- real push transport or PushManager subscription;
- Return-to-AI or other live customer routing where still disabled;
- outreach/publication;
- production checkout, live charges/refunds/payouts;
- legal/address release;
- production AI/voice activation;
- knowledge-base approval/publication or any automatic promotion of draft-only learning.

Synthetic/local QA capability does not authorize any of the above.

## Related historical evidence

- PR #188 — hardened Agent Console + two-iPhone synthetic physical QA PASS.
- PR #195 — corrected installed iPhone PWA session persistence.
- PR #196 — local platform-authenticator / Face ID gate.
- PR #197 — explicit lock and sign-out controls.
- PR #198 — protected copied-magic-link handoff for installed iOS PWA.
- PR #199 — device-specific security wording and current physical security basis.

## Controller rule

For any future question of “what still needs the PC?”, consult this file plus the newest release/payment/legal controllers before scheduling work. Archived PR #94/#148 documents are evidence history, not current instructions.
