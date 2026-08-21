import { evaluateTelemetryEvent, evaluateTelemetrySummary } from "./telemetry-alerts";

const eventAlerts = evaluateTelemetryEvent({
  timestamp: new Date(0).toISOString(), tenantId: "tenant-a", correlationId: "pa08-1", task: "lead_classification", provider: "openai", model: "synthetic", ok: false,
  latencyMs: 6000, estimatedCostUsd: 0.011, fallbackUsed: true, withinLatencyBudget: false, withinCostBudget: false, errorCode: "TIMEOUT"
});
if (!eventAlerts.some(a => a.code === "HIGH_LATENCY" && a.severity === "critical")) throw new Error("critical latency alert missing");
if (!eventAlerts.some(a => a.code === "REQUEST_COST" && a.severity === "critical")) throw new Error("critical cost alert missing");
if (!eventAlerts.some(a => a.code === "COST_BUDGET_BREACH")) throw new Error("cost breach alert missing");
if (!eventAlerts.some(a => a.code === "LATENCY_BUDGET_BREACH")) throw new Error("latency breach alert missing");

const summaryAlerts = evaluateTelemetrySummary({
  requests: 10, successes: 6, failures: 4, fallbackCount: 6, latencyBudgetBreaches: 1, costBudgetBreaches: 1,
  totalEstimatedCostUsd: 0.02, averageLatencyMs: 1200, byTask: {}, byProvider: {}
});
if (!summaryAlerts.some(a => a.code === "ERROR_RATE" && a.severity === "critical")) throw new Error("critical error-rate alert missing");
if (!summaryAlerts.some(a => a.code === "FALLBACK_RATE" && a.severity === "critical")) throw new Error("critical fallback-rate alert missing");
