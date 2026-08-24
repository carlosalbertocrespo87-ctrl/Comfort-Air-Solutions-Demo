> **ARCHIVED / SUPERSEDED — 24 Aug 2026.** This file is historical evidence for the old PR #94 / PR #148 QA-carrier decision. It is **not** the current operating runbook. Physical Agent Console QA later passed under PR #188, and the latest device-security physical basis is recorded in PR #199. See `docs/AGENT-CONSOLE-CURRENT-OPERATING-CONTROLLER.md`. Do not rerun this old carrier procedure unless a new regression controller explicitly requires it.

# PR #148 — Physical QA Equivalence Evidence

Date: 2026-08-21
Status: VERIFIED FOR QA CARRIER SELECTION
Merge candidate: PR #148 / `feature/synthetic-realtime-console-v2`
QA carrier: PR #94 / `feature/synthetic-realtime-console`
QA carrier head: `72b028287b45ee19eb4d1188405bcee7b5741dd8`
Base `main`: `1605497ede639f97e85430604ae1659504ef27ac`

## Purpose

Use the already-protected and already-CORS-allowlisted PR #94 Deploy Preview for physical PC ↔ iPhone QA while keeping PR #148 as the clean current-main merge candidate. PR #94 is not the merge target.

Marker: `QA_CARRIER_PR_94`.

## Fresh integration evidence

After PR #147 synchronized current `main` into the legacy feature branch:

- PR #94 is **0 commits behind** main;
- Agent Console Security Gate run #20: success;
- LLF Main Protection Gate: success;
- LLF Onboarding CI: success;
- LLF Pixel Match QA: success;
- all HVAC COMP security gates triggered on that head also completed successfully.

## Byte-equivalent executable surfaces verified

The following blob SHA values are identical between synchronized PR #94 and PR #148:

| Surface | SHA |
|---|---|
| `artifacts/local-lead-forge/src/pages/agent-mobile-demo.tsx` | `2985a29a6c189b9ba1e7921684a0149886e7c5ca` |
| `artifacts/local-lead-forge/src/lib/synthetic-realtime.ts` | `fd406d2ff3f555447e70e4309de1bec5ff9ec02f` |
| `artifacts/local-lead-forge/package.json` | `48a4ce250e30e6d56f847698b41dafe415195105` |
| `pnpm-lock.yaml` | `94f70247f8ec1bd390eddc1854acfa762b29a3a3` |
| `artifacts/local-lead-forge/backend/012_synthetic_realtime_console.sql` | `6ef4cd3ebc29b662792bb6edf147f48bf00b3b50` |

PR #148 is also returned to the exact hardened `llf-agent-ops` v11 source blob used by synchronized PR #94: `339e4a35aac08c666b14e22f40ee6c3c063762bb`.

The remaining differences between the branches are documentation/security-gate reconciliation and commit history, not the browser Agent Console behavior under physical test.

## Why this is safer

The deployed v11 runtime already allowlists the protected PR #94 preview origin. Reusing that synchronized preview avoids an unnecessary production Edge Function/CORS deployment merely to test PR #148.

This equivalence does **not** authorize a Supabase deployment, customer traffic, real conversations, outbound messaging, push, CRM writes, payments, pricing commitments, legal/credential actions or production AI/voice activation.

## Physical QA rule

Physical evidence collected on the synchronized PR #94 preview may be attached to PR #148 only while:

1. PR #94 remains 0 behind the same main base used by PR #148;
2. the executable hashes above remain unchanged;
3. the tested PR #94 head has green required checks;
4. the production runtime remains the same hardened v11 behavior;
5. the evidence records the exact tested head and device/browser pair.

If any executable hash changes in either branch, this equivalence expires and physical QA must be repeated against a newly reconciled surface.
