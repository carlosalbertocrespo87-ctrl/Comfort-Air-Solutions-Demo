# PR #148 — Security and Merge Gate

Date: 2026-08-21
Branch: `feature/synthetic-realtime-console-v2`
Scope: authenticated, trusted-device, synthetic-only Agent Console QA.
Release posture: **HOLD**.

## Why PR #148 exists

PR #94 contained the intended Agent Console safety work but became 101 commits behind protected `main`. PR #147 was opened as a temporary main→feature synchronization path. The cleaner resolution was to port the intended PR #94 surface directly onto current `main` as PR #148.

Port evidence:

- base commit: `1605497ede639f97e85430604ae1659504ef27ac`;
- initial port commit: `e998a97211561f39fa90917ad432854c30e91ee5`;
- initial comparison: 1 commit ahead / 0 behind;
- intended diff: 15 files;
- existing modified files were confirmed unchanged in main since the original merge base before porting.

PR #147 is therefore superseded as an integration strategy. PR #94 is historical/source evidence only and must not be merged in place of #148.

## Automated evidence

On the clean port checkpoint, Agent Console Security Gate run #18 completed successfully, including:

- fail-closed static validation;
- TypeScript typecheck;
- application build.

A new hosted PASS is required after every later code/evidence change before this PR can advance.

## Security controls preserved

- Supabase bearer token validated server-side.
- Active LLF agent profile required.
- Protected actions require a `TRUSTED` device.
- List, claim and resolve require `is_synthetic = true`.
- Claim uses status/owner conditions to prevent double ownership.
- `send_message` fails closed with `messaging_capability_blocked`.
- Reply/Send and Return to AI remain disabled in the UI.
- Private Realtime publishes refresh signals only; conversation data is re-fetched through protected backend logic.
- Capability registry remains gated pending two-device QA.

## Runtime checkpoint

Observed production/runtime evidence during reconciliation:

- Supabase project healthy;
- `llf-agent-ops` v11 ACTIVE;
- 2 synthetic conversations, 0 real conversations, 4 synthetic messages at the checkpoint;
- RLS active on conversation/message tables;
- `REALTIME_CONVERSATIONS = BLOCKED`;
- `SECURE_IPHONE_PUSH = BLOCKED`.

The active v11 runtime already reflects the hardened synthetic-only behavior, but its CORS allowlist was observed with the legacy PR #94 preview origin.

## Current source-only preview preparation

PR #148 source adds its expected Deploy Preview origin to the Edge Function allowlist while retaining the legacy preview temporarily:

`https://deploy-preview-148--symphonious-travesseiro-c9bae1.netlify.app`

That source edit is **not deployed by this PR**. No Supabase deployment, Auth callback change, CORS runtime change or capability activation has been authorized.

## Remaining gate — QA físico PC ↔ iPhone

Before the physical session:

1. Confirm the protected PR #148 Deploy Preview exists and both authorized devices can open it.
2. If required, separately authorize the exact preview callback in Supabase Auth.
3. If required, separately authorize/deploy the exact PR #148 CORS origin in `llf-agent-ops` without changing synthetic-only/messaging blocks.
4. Approve only the temporary QA device registrations corresponding to the intended PC and iPhone.

Then verify:

1. both devices show only `[QA]` conversations;
2. private Realtime connects;
3. simultaneous claim produces exactly one owner;
4. both devices converge on the same owner;
5. owner resolve converges on both devices;
6. Reply/Send/Return to AI remain blocked;
7. no email/SMS/WhatsApp/push/webhook is emitted;
8. untrusted device access fails closed;
9. expected audit/device/interaction records exist;
10. final GitHub checks on the exact tested head are green.

## Merge decision

**HOLD — not ready to merge.** Current-main reconciliation and initial automated validation are complete, but physical two-device evidence is still missing. In addition, any temporary production-side Auth/CORS preparation required for the PR #148 preview remains a separately authorized action.

## Production activation decision

Even after a future merge, live messaging, push, real conversations and customer traffic remain blocked until a separate production-readiness gate explicitly authorizes them. PR #148 never authorizes payments/refunds, legal/credential changes, outreach, CRM writes, pricing commitments or production AI/voice activation.
