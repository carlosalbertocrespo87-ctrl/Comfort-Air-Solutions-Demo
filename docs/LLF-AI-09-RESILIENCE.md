# LLF AI-09 — Failure & Fallback Resilience

Status: COMPLETE (synthetic/offline foundation)

## Purpose
Prove that LLF fails safely and never reports success when the AI/provider/tooling path is unhealthy.

## Covered failure modes
- provider timeout
- provider error
- invalid model output
- no eligible provider
- cost budget breach
- latency budget breach
- downstream tool failure policy (must not pretend success)

## Rules
- retryable provider failures may produce RETRY only, never success
- invalid output is BLOCKED
- no provider escalates to HUMAN_REVIEW
- over-budget successful completions are not allowed to auto-pass
- telemetry records failure metadata without storing prompt/output content
- voice sandbox remains disconnected from PSTN/SMS/CRM/calendar/payments

## Safety invariant
A provider/tool failure must never be converted into a fabricated successful action or customer-facing confirmation.

## Remaining gate
AI-10 must reconcile CI/build status, evidence, documentation and the final production/no-production decision. None of AI-09's synthetic tests independently authorize live operation.
