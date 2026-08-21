import type { AIProviderId, AIResult, AITaskType } from "./contracts";

export type AITelemetryEvent = {
  timestamp: string;
  tenantId: string;
  correlationId: string;
  traceId?: string;
  routeId?: string;
  task: AITaskType;
  provider: AIProviderId;
  model: string;
  ok: boolean;
  latencyMs: number;
  estimatedCostUsd: number;
  fallbackUsed: boolean;
  attempt?: number;
  withinLatencyBudget?: boolean;
  withinCostBudget?: boolean;
  errorCode?: string;
};

export interface AITelemetrySink {
  record(event: AITelemetryEvent): void | Promise<void>;
}

export function toTelemetryEvent(result: AIResult): AITelemetryEvent {
  return {
    timestamp: result.observability?.completedAt ?? new Date().toISOString(),
    tenantId: result.tenantId,
    correlationId: result.correlationId,
    traceId: result.observability?.traceId,
    routeId: result.observability?.routeId,
    task: result.task,
    provider: result.provider,
    model: result.model,
    ok: result.ok,
    latencyMs: result.latencyMs,
    estimatedCostUsd: result.usage?.estimatedCostUsd ?? 0,
    fallbackUsed: result.policy.fallbackUsed,
    attempt: result.policy.attempt,
    withinLatencyBudget: result.budget?.withinLatencyBudget,
    withinCostBudget: result.budget?.withinCostBudget,
    errorCode: result.error?.code,
  };
}

export type AITelemetrySummary = {
  requests: number;
  successes: number;
  failures: number;
  fallbackCount: number;
  latencyBudgetBreaches: number;
  costBudgetBreaches: number;
  totalEstimatedCostUsd: number;
  averageLatencyMs: number;
  byTask: Partial<Record<AITaskType, { requests: number; costUsd: number; averageLatencyMs: number }>>;
  byProvider: Partial<Record<AIProviderId, { requests: number; failures: number; costUsd: number }>>;
};

export class InMemoryAITelemetry implements AITelemetrySink {
  private readonly events: AITelemetryEvent[] = [];

  record(event: AITelemetryEvent): void {
    this.events.push({ ...event });
  }

  list(tenantId?: string): AITelemetryEvent[] {
    return this.events.filter((event) => !tenantId || event.tenantId === tenantId).map((event) => ({ ...event }));
  }

  summarize(tenantId?: string): AITelemetrySummary {
    const events = this.list(tenantId);
    const byTask: AITelemetrySummary["byTask"] = {};
    const byProvider: AITelemetrySummary["byProvider"] = {};

    for (const event of events) {
      const taskStats = byTask[event.task] ?? { requests: 0, costUsd: 0, averageLatencyMs: 0 };
      const taskLatencyTotal = taskStats.averageLatencyMs * taskStats.requests;
      taskStats.requests += 1;
      taskStats.costUsd += event.estimatedCostUsd;
      taskStats.averageLatencyMs = Math.round((taskLatencyTotal + event.latencyMs) / taskStats.requests);
      byTask[event.task] = taskStats;

      const providerStats = byProvider[event.provider] ?? { requests: 0, failures: 0, costUsd: 0 };
      providerStats.requests += 1;
      providerStats.failures += event.ok ? 0 : 1;
      providerStats.costUsd += event.estimatedCostUsd;
      byProvider[event.provider] = providerStats;
    }

    const totalLatency = events.reduce((sum, event) => sum + event.latencyMs, 0);
    return {
      requests: events.length,
      successes: events.filter((event) => event.ok).length,
      failures: events.filter((event) => !event.ok).length,
      fallbackCount: events.filter((event) => event.fallbackUsed).length,
      latencyBudgetBreaches: events.filter((event) => event.withinLatencyBudget === false).length,
      costBudgetBreaches: events.filter((event) => event.withinCostBudget === false).length,
      totalEstimatedCostUsd: Number(events.reduce((sum, event) => sum + event.estimatedCostUsd, 0).toFixed(6)),
      averageLatencyMs: events.length === 0 ? 0 : Math.round(totalLatency / events.length),
      byTask,
      byProvider,
    };
  }
}
