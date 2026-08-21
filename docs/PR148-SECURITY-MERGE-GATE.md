# PR #148 — Security and Merge Gate

Date: 2026-08-21
Merge candidate: `feature/synthetic-realtime-console-v2`
Physical QA carrier: synchronized PR #94 / `feature/synthetic-realtime-console`
Release posture: **HOLD**.

## Integration decision

PR #148 is the clean current-main merge candidate. PR #94 is retained only as the physical-QA carrier because its protected Deploy Preview is already present in the active v11 CORS allowlist.

PR #147 synchronized current `main` into the legacy PR #94 branch and was merged only into that feature branch. It did not modify protected `main`.

Current QA carrier evidence:

- PR #94 head: `72b028287b45ee19eb4d1188405bcee7b5741dd8`;
- base `main`: `1605497ede639f97e85430604ae1659504ef27ac`;
- comparison to main: 0 commits behind;
- Agent Console Security Gate run #20: success;
- LLF Main Protection Gate: success;
- LLF Onboarding CI: success;
- LLF Pixel Match QA: success;
- triggered HVAC COMP security gates: success.

## Executable equivalence

`docs/PR148-PHYSICAL-QA-EQUIVALENCE.md` records byte-identical hashes for the critical browser/runtime-adjacent surfaces between synchronized #94 and #148, including the Agent Console page, private Realtime client, package manifest, lockfile and synthetic Realtime SQL foundation.

PR #148 also uses the exact hardened `llf-agent-ops` source blob represented by synchronized #94 and the observed v11 source:

`339e4a35aac08c666b14e22f40ee6c3c063762bb`

This allows physical evidence from the synchronized #94 preview to be attached to PR #148 while the documented hashes remain unchanged. Any executable change invalidates the equivalence and requires fresh reconciliation/QA.

## Runtime state and CORS

Observed Supabase runtime `llf-agent-ops` v11 is ACTIVE and already allowlists:

- `https://localleadforge.com`;
- `https://www.localleadforge.com`;
- `https://deploy-preview-94--symphonious-travesseiro-c9bae1.netlify.app`.

Therefore PR #148 does **not** require a new Edge Function/CORS deployment merely to perform physical QA. No production deployment is authorized by this gate.

Supabase Auth Redirect URL behavior must still be confirmed when the physical session begins. If the PR #94 preview callback already works, no configuration should be changed. If it does not work, stop and obtain separate authorization before modifying Auth configuration.

## Security controls preserved

- bearer token validated server-side;
- active LLF agent required;
- `TRUSTED` device required for protected actions;
- list/claim/resolve restricted to `is_synthetic = true`;
- claim uses owner/status guards;
- `send_message` fails closed with `messaging_capability_blocked`;
- Reply/Send and Return to AI remain disabled;
- Realtime is private and refresh-only;
- real conversations, push and customer traffic remain blocked.

## Physical QA still required

Before review/merge, collect evidence for:

1. authenticated Carlos PC and María iPhone on the same protected synchronized PR #94 preview;
2. trusted-device enforcement;
3. only `[QA]` conversations visible;
4. simultaneous claim with exactly one winner and convergence on both devices;
5. owner-only resolve reflected on both devices;
6. Reply/Send/Return to AI blocked;
7. zero email/SMS/WhatsApp/push/webhook delivery;
8. untrusted-device rejection;
9. expected audit/device/interaction records;
10. green CI on the exact PR #148 head proposed for review.

## Merge decision

**HOLD — not ready to merge.** Integration freshness, QA-carrier selection and automated equivalence are prepared, but physical two-device evidence is still missing.

PR #94 is **QA CARRIER ONLY — DO NOT MERGE**. PR #148 remains the merge candidate and must remain DRAFT/HOLD until the physical evidence is complete and final CI is green.

## Production activation decision

Nothing in PR #148 or the QA-carrier arrangement authorizes production messaging, push, real conversations, customer traffic, outreach, CRM writes, pricing commitments, payments/refunds, legal/credential changes, production AI traffic or production voice activation.
