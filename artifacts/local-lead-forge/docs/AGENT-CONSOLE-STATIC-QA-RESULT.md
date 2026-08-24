> **ARCHIVED STATIC CHECKPOINT — superseded 24 Aug 2026.** This file records the pre-physical PR #94 / PR #148 state and must not be read as the current action list. Physical Agent Console QA later passed under PR #188; subsequent iOS/desktop device-security work through PR #199 also has physical PASS evidence. Current controller: `docs/AGENT-CONSOLE-CURRENT-OPERATING-CONTROLLER.md`.

# Local Lead Forge — Agent Console Static QA Result

Date: 2026-08-21
Merge candidate: PR #148 / `feature/synthetic-realtime-console-v2`
Physical QA carrier: PR #94 synchronized / head `72b028287b45ee19eb4d1188405bcee7b5741dd8`
Release posture: **HOLD / SYNTHETIC ONLY**

## Hosted evidence

Clean-port checkpoint on PR #148:

- Agent Console Security Gate run #18: success;
- static fail-closed validation: success;
- TypeScript typecheck: success;
- application build: success.

Synchronized PR #94 QA carrier head:

- 0 commits behind current `main`;
- Agent Console Security Gate run #20: success;
- LLF Main Protection Gate: success;
- LLF Onboarding CI: success;
- LLF Pixel Match QA: success;
- triggered HVAC COMP security gates: success.

Every later PR #148 head still requires its own fresh hosted PASS.

## Executable equivalence checkpoint

Byte-identical blobs between synchronized #94 and #148 were verified for:

- Agent Console page: `2985a29a6c189b9ba1e7921684a0149886e7c5ca`;
- private synthetic Realtime client: `fd406d2ff3f555447e70e4309de1bec5ff9ec02f`;
- Local Lead Forge package manifest: `48a4ce250e30e6d56f847698b41dafe415195105`;
- lockfile: `94f70247f8ec1bd390eddc1854acfa762b29a3a3`;
- synthetic Realtime SQL foundation: `6ef4cd3ebc29b662792bb6edf147f48bf00b3b50`.

PR #148 also uses the same hardened Edge Function source blob as synchronized #94 / observed v11 source: `339e4a35aac08c666b14e22f40ee6c3c063762bb`.

See `docs/PR148-PHYSICAL-QA-EQUIVALENCE.md`.

## Current static assertions

The gate verifies explicit origins/no wildcard, active-agent and trusted-device requirements, synthetic-only reads/mutations, blocked outbound messaging, private refresh-only Realtime, blocked Reply/Return-to-AI/live notification transport, `PENDING_PHYSICAL` evidence posture, HOLD merge gate and the selected PR #94 QA-carrier equivalence record.

## Runtime checkpoint

Observed Supabase `llf-agent-ops` v11 is ACTIVE and already allowlists the protected PR #94 preview origin. Therefore physical QA can use the synchronized #94 preview without deploying a new PR #148 CORS variant.

If the existing Supabase Auth redirect configuration does not accept the PR #94 preview during the actual session, stop and obtain separate authorization before changing Auth configuration.

## Physical evidence still required

Automated PASS cannot replace PC ↔ iPhone evidence. Verify authenticated/trusted devices, only `[QA]` conversations, one-winner simultaneous claim, synchronized resolve, blocked Reply/Send/Return-to-AI, zero external delivery, untrusted-device rejection and expected audit/security/interaction records.

Until that evidence exists, PR #148 remains `DRAFT / HOLD`; PR #94 remains QA evidence carrier only, not the merge target.
