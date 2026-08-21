# LLF AI-03 — Structured AIResult Envelope

Status: COMPLETE in feature branch; merge pending normal CI.

Purpose: every AI execution must return enough metadata for auditability, routing analysis, cost control and future observability.

Added metadata:
- provider + model + optional modelVersion
- task, tenantId and correlationId
- latency and usage/cost estimate
- routing policy: selectedBy, fallbackUsed, routeTier, allowedProviders, attempt/maxAttempts
- budget envelope: latency/cost ceilings and whether the result stayed within them
- observability: startedAt, completedAt, routeId and traceId

Runtime behavior:
- request-level cost/latency overrides supersede task defaults
- provider eligibility is re-checked against the canonical task policy
- maxAttempts is enforced by the router
- voice_realtime keeps its one-attempt/no-fallback policy from AI-02
- no-provider failures still return a complete fail-closed metadata envelope

Safety:
- no live provider activation
- no customer/prospect communication
- no production voice
- no permission expansion
- no financial/legal/security/destructive actions

Next: AI-04 — agent permission/tool registry integrated with Autopilot autonomy levels.
