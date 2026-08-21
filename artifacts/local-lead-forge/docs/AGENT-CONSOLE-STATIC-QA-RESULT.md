# Local Lead Forge — Agent Console Static QA Result

Date: 2026-08-21
Branch: `feature/synthetic-realtime-console`
Result: **17/17 PASS** on hosted `Agent Console Security Gate` for head `938f0a58a9e9b2e3736c4887bda2d8aca6b87ee7`.
Release interpretation: automated PASS is required but cannot replace physical PC ↔ iPhone evidence.

## Automated assertions

The Agent Console security script verifies:

1. Production origins are explicitly allowlisted.
2. The exact PR #94 Deploy Preview origin is allowlisted.
3. CORS wildcard remains absent.
4. Active agent profile is required.
5. Trusted device is required for protected actions.
6. Synthetic conversation list is filtered by `is_synthetic = true`.
7. Protected mutations retain the synthetic-only filter.
8. Outbound agent messages fail closed.
9. Realtime topic is private and broadcast-only.
10. Realtime payload is a fixed refresh signal, not conversation content.
11. Realtime capability remains gated pending two-device QA.
12. Reply UI remains disabled.
13. Return-to-AI UI remains disabled.
14. Live notification transport remains disabled.
15. María's protocol references PR #94 and not stale PR #93.
16. Physical QA remains explicitly `PENDING_PHYSICAL` rather than being falsely marked PASS.
17. The merge gate remains `HOLD` pending QA físico.

Command:

`node artifacts/local-lead-forge/scripts/validate-agent-console-qa.mjs`

## Hosted evidence

GitHub run `Agent Console Security Gate` run #14 completed successfully. Its job showed PASS for:

- 17 invariant/evidence assertions;
- TypeScript typecheck;
- production application build.

## Current production QA checkpoint

Fresh platform reads during this reconciliation showed:

- Supabase project `Local-Lead-Forge` ACTIVE_HEALTHY;
- `llf-agent-ops` v11 ACTIVE;
- 2 synthetic conversations;
- 0 real conversations;
- 4 synthetic messages;
- 2 trusted devices and 0 pending devices;
- RLS enabled on conversations and messages;
- `REALTIME_CONVERSATIONS = BLOCKED`;
- `SECURE_IPHONE_PUSH = BLOCKED`.

## Continuous gate

Workflow: `.github/workflows/agent-console-security.yml`.

The workflow triggers on the Agent Console security surface plus the QA evidence documents that determine release posture. It performs:

1. fail-closed static and documentation assertions;
2. TypeScript typecheck;
3. production application build.

The workflow uses read-only repository permissions and does not deploy, modify Supabase, send messages or enable capabilities.

## Evidence rule

A future commit that changes the guarded code or evidence must obtain a fresh hosted PASS. Even with 17/17 automated PASS, PR #94 remains `HOLD` until the physical two-device scenarios are observed and documented.
