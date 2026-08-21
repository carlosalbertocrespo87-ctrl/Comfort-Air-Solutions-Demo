# PR #94 — Security and Merge Gate

Date: 2026-08-21
Branch: `feature/synthetic-realtime-console`
Scope: authenticated, trusted-device, synthetic-only Agent Console QA.
Release posture: **HOLD**.

## Current verified platform state

Fresh production reads on 2026-08-21 confirm:

- Supabase project `Local-Lead-Forge` is `ACTIVE_HEALTHY`.
- Deployed Edge Function `llf-agent-ops` is version **11**, `ACTIVE`.
- The deployed function allowlists exactly:
  - `https://localleadforge.com`
  - `https://www.localleadforge.com`
  - `https://deploy-preview-94--symphonious-travesseiro-c9bae1.netlify.app`
- Wildcard CORS is not used.
- Current database checkpoint contains:
  - 2 synthetic conversations;
  - 0 real conversations;
  - 4 synthetic messages;
  - 2 trusted devices;
  - 0 pending devices.
- RLS is enabled on `llf_conversations` and `llf_conversation_messages`.
- `REALTIME_CONVERSATIONS = BLOCKED`.
- `SECURE_IPHONE_PUSH = BLOCKED`.

The earlier v7/v8 notes were historical deployment checkpoints. Version 11 is the current deployed runtime at this gate snapshot.

## Verified code / automated controls

- Agent operations validate the Supabase bearer token server-side.
- An active `llf_agent_profiles` record is required.
- Protected actions require a `TRUSTED` device hash.
- Conversation reads and mutations require `is_synthetic = true`.
- Claim uses an atomic status/owner guard.
- `send_message` fails closed with `messaging_capability_blocked`.
- The UI keeps reply and return-to-AI controls disabled.
- Private Realtime publishes only a fixed refresh signal; conversation content is fetched again through the protected Edge Function.
- Audit metadata includes the trusted device for protected actions.
- The capability registry remains gated pending two-device QA.
- Agent Console Security Gate 17/17, typecheck and build have hosted PASS evidence on the reconciled QA code/evidence state.

## Integration freshness gate — must happen before physical QA

A fresh comparison against protected `main` found that `feature/synthetic-realtime-console` is **101 commits behind** current `main` after Batch 10 and other safety/payment foundations landed.

This means physical PC ↔ iPhone evidence collected now would be evidence against a stale integration base and could become invalid after synchronization.

Draft synchronization PR **#147** was therefore opened:

- head: `main`;
- base: `feature/synthetic-realtime-console`;
- 101 commits / 93 changed files from current main;
- GitHub reports it mergeable;
- no overlap was observed in the listed PR #147 changed paths with the 15 Agent Console PR #94 changed paths;
- it remains DRAFT and unmerged.

**Rule:** do not begin the physical QA until #147 has been reviewed and synchronized into the feature branch, then wait for fresh PR #94 checks on the resulting branch head. Creating #147 does not authorize merging it or production release.

## Completed prerequisites

The following are no longer blockers by themselves:

1. Synthetic Realtime database foundation is present in the intended Supabase project.
2. `llf-agent-ops` is deployed and active.
3. CORS includes only the two production origins plus the exact PR #94 preview origin.
4. Synthetic-only data and RLS state have been rechecked.
5. Real messaging, push and real-conversation capabilities remain blocked.
6. Documentation no longer falsely labels the unperformed physical checks as PASS.

## Required before merge

### A. Refresh branch integration

1. Review synchronization PR #147.
2. Synchronize current protected `main` into the Agent Console feature branch through the approved process.
3. Re-run PR #94 Agent Console Security Gate, Main Protection, Onboarding and relevant hosted checks on the synchronized head.
4. If synchronization changes any Agent Console surface, re-review those changes before physical QA.

### B. QA físico PC ↔ iPhone

Only after A is complete:

1. Authorize access to the same protected Netlify Deploy Preview on Carlos's PC and María's iPhone without making the preview public.
2. Add the exact preview callback temporarily to the Supabase Auth redirect allowlist if still required for the session.
3. Generate separate preview-scoped authentication links for Carlos and María; never copy JWTs, fragments or session tokens between origins.
4. Approve only the temporary preview device registrations corresponding to Carlos's PC and María's iPhone.
5. Verify both devices load only the two `[QA]` conversations and show private Realtime connected.
6. Verify simultaneous claim: exactly one agent wins and both devices converge on one owner.
7. Verify resolve: the owning agent resolves and both devices reflect `Resolved`.
8. Verify reply, Send and Return to AI remain blocked and no email/SMS/WhatsApp/push is emitted.
9. Verify an untrusted browser/device receives `trusted_device_required` before protected data/actions.
10. Inspect `llf_agent_audit_log`, `llf_device_security_events`, and `llf_interaction_ledger` for the expected physical-session evidence.
11. Confirm all GitHub checks on the final PR head are successful.
12. After QA, remove temporary preview callback/CORS access when no longer needed and revoke temporary QA devices if they are no longer required.

## Merge decision

**HOLD — not ready to merge yet.** Two gates remain in sequence: first synchronize the stale integration base through PR #147, then collect the simultaneous authenticated two-device evidence on the refreshed branch. No documentation or CI result substitutes for that physical evidence.

## Production activation decision

Even after a future merge, live messaging, push, real conversations and `REALTIME_CONVERSATIONS` remain blocked until a separate production-readiness gate explicitly authorizes customer traffic and outbound communications.
