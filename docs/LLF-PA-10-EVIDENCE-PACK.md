# LLF PA-10 — Controlled Production Activation Evidence Pack

Date: 21 Aug 2026
Status: SOURCE FOUNDATION REBASED TO CURRENT MAIN — INTERNAL REAL-PROVIDER ADVANCE STILL BLOCKED

## Controlling source path
The useful PA-01 through PA-09 foundation from stale/diverged Draft PR #103 was ported without old branch history to Draft PR #146, branch `feature/ai-controlled-production-activation-v2`, from current protected `main`.

At creation, the replacement branch was exactly 1 commit ahead / 0 behind `main` and contained the same 25 intended activation-foundation files only. PR #103 remains historical until replacement CI is reconciled; do not merge the stale branch.

## Evidence present in source
- PA-01 live-provider boundary defaults OFF and customer traffic is hard blocked.
- PA-02 spend guard caps synthetic execution at $0.01/request and $0.05/session.
- PA-03 OpenAI Responses transport exists behind activation/spend gates; source presence is not evidence that a paid/live provider request occurred.
- PA-05 output safety covers PII redaction, secret leakage, prompt-injection/tenant-boundary signals, fabricated external actions and structured-output validation.
- PA-06 kill switch supports global/provider/tenant shutdown and safe rollback to disabled state.
- PA-07 adversarial EN/ES provider-like corpus exists.
- PA-08 content-free operational alerts cover cost, latency, error rate and fallback rate.
- PA-09 executable internal-readiness gate requires privacy/security/tenant isolation/human-boundary evidence plus CI and successful separately authorized live-synthetic provider evidence.
- IP-01 internal-pilot code is synthetic-only, allows zero customer records and zero external actions, and stops on budget/alert violations.

## Current blocking evidence
PA-04 live-synthetic provider execution is **not proven by this replacement PR**. No provider secret value is stored in source, and no real provider request was executed as part of this port. Therefore `liveProviderSyntheticTestPassed` must remain false unless a separately authorized synthetic-only provider run actually succeeds and produces non-content telemetry evidence.

## Required CI evidence for PR #146
Before treating the replacement as equivalent to the old source foundation, require current-head success for:
- AI Production Activation Security Gate;
- LLF Main Protection Gate;
- LLF Onboarding CI;
- LLF Pixel Match QA.

Do not reuse green results from PR #103 as current-head evidence.

## Decision
- Source review/merge readiness: CONDITIONAL on current-main CI and normal protected-branch review policy.
- Execute a real-provider synthetic request: NOT AUTHORIZED by this document or generic continuation.
- Advance from synthetic/shadow to internal real-provider traffic: NOT AUTHORIZED.
- Advance to customer traffic: NOT AUTHORIZED and hard blocked.
- Autonomy above L0/shadow: NOT AUTHORIZED.

## Future PA-04 gate
A later separately approved PA-04 run may install/use a provider secret only through an authorized secret-management path outside chat/source/Drive and may use synthetic HVAC data only under the existing spend caps. Evidence should capture provider/model, token usage, estimated cost, latency, budget status and correlation/trace identifiers without persisting prompt/response content or secret values.

Re-run PA-09 with `liveProviderSyntheticTestPassed=true` only if that real synthetic provider test is actually completed successfully.

## Permanent human-approval boundaries
Human approval remains required for outbound customer/prospect communication, pricing/discount commitments, booking/calendar writes, CRM writes, payments/refunds, legal/financial/security-sensitive actions and any autonomy increase above L0 until a later separately approved phase.
