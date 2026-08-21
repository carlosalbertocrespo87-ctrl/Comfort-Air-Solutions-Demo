import type {
  AIProviderAdapter,
  AIProviderId,
  AIRequest,
  AIResult,
  AITaskType,
  ModelRouteRule,
} from "./contracts";
import { getTaskModelPolicy } from "./task-policy";

export class ModelRouter {
  private readonly providers = new Map<AIProviderId, AIProviderAdapter>();
  private readonly routes = new Map<AITaskType, ModelRouteRule>();

  constructor(providers: AIProviderAdapter[], rules: ModelRouteRule[]) {
    for (const provider of providers) this.providers.set(provider.id, provider);
    for (const rule of rules) this.routes.set(rule.task, rule);
  }

  async route<T = unknown>(request: AIRequest, explicitProvider?: AIProviderId): Promise<AIResult<T>> {
    const route = this.routes.get(request.task);
    const taskPolicy = getTaskModelPolicy(request.task);
    const orderedIds = explicitProvider
      ? [explicitProvider]
      : route
        ? [route.primary, ...(route.fallbacks ?? [])]
        : [];

    if (orderedIds.length === 0) {
      return this.noProvider<T>(request, explicitProvider ?? "mock");
    }

    let fallbackUsed = false;
    let lastFailure: AIResult<T> | undefined;
    const startedAt = new Date().toISOString();
    let attempt = 0;

    for (const id of orderedIds) {
      attempt += 1;
      if (attempt > taskPolicy.maxAttempts) break;

      const provider = this.providers.get(id);
      if (!provider || !provider.supports(request.task) || !taskPolicy.allowedProviders.includes(id)) {
        fallbackUsed = true;
        continue;
      }

      const result = await provider.execute<T>(request);
      const maxLatencyMs = request.maxLatencyMs ?? taskPolicy.maxLatencyMs;
      const maxCostUsd = request.maxCostUsd ?? taskPolicy.maxCostUsd;
      const estimatedCostUsd = result.usage?.estimatedCostUsd;

      result.policy = {
        selectedBy: explicitProvider ? "explicit" : fallbackUsed ? "fallback" : "policy",
        fallbackUsed,
        routeTier: taskPolicy.tier,
        allowedProviders: taskPolicy.allowedProviders,
        attempt,
        maxAttempts: taskPolicy.maxAttempts,
      };
      result.budget = {
        maxLatencyMs,
        maxCostUsd,
        withinLatencyBudget: result.latencyMs <= maxLatencyMs,
        withinCostBudget: estimatedCostUsd == null ? undefined : estimatedCostUsd <= maxCostUsd,
      };
      result.observability = {
        ...result.observability,
        startedAt,
        completedAt: new Date().toISOString(),
        routeId: `${request.task}:${id}:${attempt}`,
        traceId: request.correlationId,
      };

      if (result.ok) return result;
      lastFailure = result;
      if (!result.error?.retryable || !taskPolicy.allowFallback) return result;
      fallbackUsed = true;
    }

    return lastFailure ?? this.noProvider<T>(request, explicitProvider ?? route?.primary ?? "mock");
  }

  private noProvider<T>(request: AIRequest, provider: AIProviderId): AIResult<T> {
    const taskPolicy = getTaskModelPolicy(request.task);
    return {
      ok: false,
      provider,
      model: "unavailable",
      task: request.task,
      correlationId: request.correlationId,
      tenantId: request.tenantId,
      latencyMs: 0,
      error: {
        code: "NO_PROVIDER",
        message: `No eligible AI provider is configured for task ${request.task}`,
        retryable: false,
      },
      policy: {
        selectedBy: "policy",
        fallbackUsed: false,
        routeTier: taskPolicy.tier,
        allowedProviders: taskPolicy.allowedProviders,
        attempt: 0,
        maxAttempts: taskPolicy.maxAttempts,
      },
      budget: {
        maxLatencyMs: request.maxLatencyMs ?? taskPolicy.maxLatencyMs,
        maxCostUsd: request.maxCostUsd ?? taskPolicy.maxCostUsd,
        withinLatencyBudget: true,
      },
      observability: {
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        routeId: `${request.task}:none:0`,
        traceId: request.correlationId,
      },
    };
  }
}
