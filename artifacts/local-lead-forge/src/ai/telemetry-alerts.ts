import type { AITelemetryEvent, AITelemetrySummary } from "./telemetry";

export type TelemetryAlertSeverity = "warning" | "critical";

export type TelemetryAlert = {
  code: "HIGH_LATENCY" | "REQUEST_COST" | "ERROR_RATE" | "FALLBACK_RATE" | "COST_BUDGET_BREACH" | "LATENCY_BUDGET_BREACH";
  severity: TelemetryAlertSeverity;
  message: string;
};

export type TelemetryThresholds = {
  requestLatencyWarningMs: number;
  requestLatencyCriticalMs: number;
  requestCostWarningUsd: number;
  requestCostCriticalUsd: number;
  summaryErrorRateWarning: number;
  summaryErrorRateCritical: number;
  summaryFallbackRateWarning: number;
  summaryFallbackRateCritical: number;
};

export const PA08_DEFAULT_THRESHOLDS: TelemetryThresholds = {
  requestLatencyWarningMs: 2500,
  requestLatencyCriticalMs: 5000,
  requestCostWarningUsd: 0.005,
  requestCostCriticalUsd: 0.01,
  summaryErrorRateWarning: 0.1,
  summaryErrorRateCritical: 0.25,
  summaryFallbackRateWarning: 0.2,
  summaryFallbackRateCritical: 0.5,
};

export function evaluateTelemetryEvent(event: AITelemetryEvent, thresholds = PA08_DEFAULT_THRESHOLDS): TelemetryAlert[] {
  const alerts: TelemetryAlert[] = [];

  if (event.latencyMs >= thresholds.requestLatencyCriticalMs) {
    alerts.push({ code: "HIGH_LATENCY", severity: "critical", message: `latency=${event.latencyMs}ms` });
  } else if (event.latencyMs >= thresholds.requestLatencyWarningMs) {
    alerts.push({ code: "HIGH_LATENCY", severity: "warning", message: `latency=${event.latencyMs}ms` });
  }

  if (event.estimatedCostUsd >= thresholds.requestCostCriticalUsd) {
    alerts.push({ code: "REQUEST_COST", severity: "critical", message: `cost=${event.estimatedCostUsd}` });
  } else if (event.estimatedCostUsd >= thresholds.requestCostWarningUsd) {
    alerts.push({ code: "REQUEST_COST", severity: "warning", message: `cost=${event.estimatedCostUsd}` });
  }

  if (event.withinCostBudget === false) alerts.push({ code: "COST_BUDGET_BREACH", severity: "critical", message: "request exceeded configured cost budget" });
  if (event.withinLatencyBudget === false) alerts.push({ code: "LATENCY_BUDGET_BREACH", severity: "critical", message: "request exceeded configured latency budget" });

  return alerts;
}

export function evaluateTelemetrySummary(summary: AITelemetrySummary, thresholds = PA08_DEFAULT_THRESHOLDS): TelemetryAlert[] {
  const alerts: TelemetryAlert[] = [];
  if (summary.requests === 0) return alerts;

  const errorRate = summary.failures / summary.requests;
  const fallbackRate = summary.fallbackCount / summary.requests;

  if (errorRate >= thresholds.summaryErrorRateCritical) {
    alerts.push({ code: "ERROR_RATE", severity: "critical", message: `errorRate=${errorRate.toFixed(3)}` });
  } else if (errorRate >= thresholds.summaryErrorRateWarning) {
    alerts.push({ code: "ERROR_RATE", severity: "warning", message: `errorRate=${errorRate.toFixed(3)}` });
  }

  if (fallbackRate >= thresholds.summaryFallbackRateCritical) {
    alerts.push({ code: "FALLBACK_RATE", severity: "critical", message: `fallbackRate=${fallbackRate.toFixed(3)}` });
  } else if (fallbackRate >= thresholds.summaryFallbackRateWarning) {
    alerts.push({ code: "FALLBACK_RATE", severity: "warning", message: `fallbackRate=${fallbackRate.toFixed(3)}` });
  }

  if (summary.costBudgetBreaches > 0) alerts.push({ code: "COST_BUDGET_BREACH", severity: "critical", message: `count=${summary.costBudgetBreaches}` });
  if (summary.latencyBudgetBreaches > 0) alerts.push({ code: "LATENCY_BUDGET_BREACH", severity: "critical", message: `count=${summary.latencyBudgetBreaches}` });

  return alerts;
}
