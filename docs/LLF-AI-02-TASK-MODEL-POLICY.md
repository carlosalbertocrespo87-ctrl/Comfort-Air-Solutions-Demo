# LLF AI-02 — Task / Model Policy

Status: COMPLETE on feature branch; production activation remains blocked.

## Objective
Route each LLF AI task by business need instead of always selecting the most capable or expensive model.

## Policy dimensions
- task type
- model tier: fast / balanced / reasoning / realtime
- allowed providers
- latency ceiling
- cost ceiling
- maximum attempts
- structured-output requirement
- fallback permission

## Current task tiers
- lead_classification: fast, low cost, structured output, fallback allowed
- lead_summary: fast, low cost, fallback allowed
- qa_review: reasoning, higher budget, structured output, fallback allowed
- follow_up_draft: balanced, moderate budget, fallback allowed
- voice_realtime: realtime, strict latency, one attempt, silent fallback disabled
- general_reasoning: reasoning, bounded higher budget

## Guardrails
1. Caller-provided budgets may tighten policy but may not exceed the policy ceiling.
2. Invalid latency/cost budgets fail closed.
3. Voice does not silently jump providers in MVP because cross-provider latency/behavior changes can create unsafe conversational inconsistency.
4. Provider IDs in policy are eligibility only; no live provider is activated by this block.
5. Real provider/model pricing is deliberately not hard-coded until vendor adapters and current pricing are validated.
6. Payments, legal, security, credentials, destructive actions and safety-critical decisions remain outside autonomous AI authority.

## Acceptance evidence
- canonical TaskModelPolicy implemented
- budget resolver implemented
- task policy contract tests added
- exports wired through AI module
- no production provider activation
- no modification to existing PR #94/#98 release gates

Next: AI-03 — enrich AIResult/selection metadata and runtime observability contract.
