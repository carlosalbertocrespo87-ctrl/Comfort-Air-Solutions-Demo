import type {
  AIProviderAdapter,
  AIProviderId,
  AIRequest,
  AIResult,
  AITaskType,
  ModelRouteRule,
} from "./contracts";

export class ModelRouter {
  private readonly providers = new Map<AIProviderId, AIProviderAdapter>();
  private readonly routes = new Map<AITaskType, ModelRouteRule>();

  constructor(providers: AIProviderAdapter[], rules: ModelRouteRule[]) {
    for (const provider of providers) this.providers.set(provider.id, provider);
    for (const rule of rules) this.routes.set(rule.task, rule);
  }

  async route<T = unknown>(request: AIRequest, explicitProvider?: AIProviderId): Promise<AIResult<T>> {
    const route = this.routes.get(request.task);
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

    for (const id of orderedIds) {
      const provider = this.providers.get(id);
      if (!provider || !provider.supports(request.task)) {
        fallbackUsed = true;
        continue;
      }

      const result = await provider.execute<T>(request);
      result.policy = {
        selectedBy: explicitProvider ? "explicit" : fallbackUsed ? "fallback" : "policy",
        fallbackUsed,
      };

      if (result.ok) return result;
      lastFailure = result;
      if (!result.error?.retryable) return result;
      fallbackUsed = true;
    }

    return (
      lastFailure ?? this.noProvider<T>(request, explicitProvider ?? route?.primary ?? "mock")
    );
  }

  private noProvider<T>(request: AIRequest, provider: AIProviderId): AIResult<T> {
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
      policy: { selectedBy: "policy", fallbackUsed: false },
    };
  }
}
