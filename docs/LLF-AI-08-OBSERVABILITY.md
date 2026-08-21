# LLF AI-08 — Observability & Cost Telemetry

Status: COMPLETE (zero-cost internal foundation)

## Purpose
Make every AI route measurable before LLF activates live providers or voice. The telemetry layer is designed to support future dashboards, alerts and model/provider comparisons without creating a new paid dependency.

## Delivered
- privacy-safe AITelemetryEvent
- optional AITelemetrySink integration in ModelRouter
- in-memory collector for sandbox/test use
- per-tenant filtering
- cost, latency, success/failure, fallback and budget-breach signals
- aggregation by task and provider
- traceId/routeId propagation
- telemetry failures are non-blocking and cannot convert a valid AI result into an application failure
- contract tests for event creation, tenant isolation, trace propagation and zero-cost mock behavior

## Privacy rule
Telemetry does NOT store prompt/input text, model output, customer conversation content, passwords, API keys or other secret payloads. It stores operational metadata only.

## Dashboard-ready signals
- request/attempt count
- successes/failures
- fallback count
- latency budget breaches
- cost budget breaches
- total estimated model cost
- average latency
- per-task request/cost/latency
- per-provider request/failure/cost

## Current cost
$0 additional infrastructure cost. InMemoryAITelemetry is for tests/sandbox only; production persistence/visualization can be selected later after usage volume is known.

## Release boundary
No live provider, customer communication, voice traffic or production data activation is authorized by AI-08.
