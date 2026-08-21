# LLF AI-06 — Evaluation Harness

Status: COMPLETE (synthetic/offline foundation)

## Purpose
Measure agent behavior before any increase in autonomy or production activation.

## Delivered
- deterministic evaluation harness
- bilingual HVAC scenario catalog (EN/ES)
- 10 initial scenarios covering emergency, routine, outside-area, incomplete data, prompt injection, unauthorized pricing, tool failure and tenant isolation
- hard checks for L0 shadow mode, no external actions and recommendation-only behavior
- human-review and urgency assertions where applicable
- forbidden-content assertions for security/isolation cases
- aggregate score and strict release gate

## Release rule
The harness is intentionally strict: releaseGatePassed is true only when every supplied scenario passes and average score is 100.

This gate does NOT authorize production by itself. Human review, CI/build checks and the later AI-10 evidence review remain required.

## Safety
All current scenarios are synthetic. No customer data, outbound communications, CRM writes, voice calls, payments or destructive actions are used.

## Next expansion
Grow the corpus before live-provider or voice activation, including malformed structured output, provider timeout, multilingual ambiguity, hallucinated availability, legal/financial requests and cross-tenant attacks.
