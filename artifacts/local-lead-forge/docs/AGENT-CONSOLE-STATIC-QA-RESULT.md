# Local Lead Forge — Agent Console Static QA Result

Date: 2026-08-21
Branch: `feature/synthetic-realtime-console`
Result: **12/12 PASS**

Validated automatically:

1. Production origins are explicitly allowlisted.
2. Active agent profile is required.
3. Trusted device is required for protected actions.
4. Synthetic conversation list is filtered by `is_synthetic = true`.
5. Protected mutations retain the synthetic-only filter.
6. Outbound agent messages fail closed.
7. Realtime topic is private and broadcast-only.
8. Realtime payload is a fixed refresh signal, not conversation content.
9. Realtime capability remains gated pending two-device QA.
10. Reply UI remains disabled.
11. Return-to-AI UI remains disabled.
12. Live notification transport remains disabled.

Command:

`node artifacts/local-lead-forge/scripts/validate-agent-console-qa.mjs`

## Interpretation

This result validates static code invariants only. It does not approve the PR for merge and does not activate production. Supabase deployment, negative authorization, two-device, session, Realtime propagation and hosted CI evidence remain required.

## Continuous gate added

Workflow: `.github/workflows/agent-console-security.yml`

The workflow runs on pull requests and `main` changes that touch the Agent Console security surface. It performs:

1. 12 fail-closed static security assertions.
2. TypeScript typecheck.
3. Production application build.

The workflow uses read-only repository permissions and does not deploy, modify Supabase, send messages or enable capabilities. A hosted GitHub run is still required before its CI evidence can be marked PASS.
