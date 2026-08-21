# LLF AI-01 — Model Router Foundation

Status: COMPLETE on feature branch; synthetic-only; not production-released.

## Purpose
Create a provider/model abstraction so LLF business logic does not depend directly on one AI vendor or one model.

## Delivered
- Canonical AIProviderId, AITaskType, AIRequest, AIUsage, AIResult and ModelRouteRule contracts.
- AIProviderAdapter interface with declared capabilities and task support.
- ModelRouter with task-based primary/fallback ordering.
- Fail-closed behavior when no eligible provider exists.
- Retry-aware fallback behavior; non-retryable failures stop immediately.
- Tenant and correlation identifiers carried through every request/result for isolation and auditability.
- Structured provider/model/latency/usage/policy metadata in every AIResult.
- Synthetic MockAIProvider with zero estimated cost for internal development.
- DEFAULT_MODEL_ROUTES and an explicit synthetic-only release policy.

## Security / Release Boundary
This block does NOT authorize:
- real prospect/customer communications,
- production voice,
- financial actions,
- legal actions,
- credential/security changes,
- destructive actions,
- safety-critical autonomous decisions.

All default routes intentionally point to the synthetic mock adapter until later AI blocks configure and evaluate real providers.

## Architectural Rule
New LLF AI workflows should depend on the router/contracts, not call a provider SDK directly from business logic. Provider-specific SDK adapters belong behind AIProviderAdapter.

## Next Blocks
AI-02: task/model policy matrix and cost/latency budgets.
AI-03: strengthen structured result/schema validation and provider metadata.
AI-04+: tool permission registry, shadow agents, eval harness, voice abstraction, observability and failure QA.

## Evidence
Branch: feature/ai-model-router-foundation
Controlling issue: #99
