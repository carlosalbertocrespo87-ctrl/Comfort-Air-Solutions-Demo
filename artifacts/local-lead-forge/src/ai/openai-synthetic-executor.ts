import type { AIRequest, AIResult } from "./contracts";
import { SpendGuard } from "./provider-budget";

export type OpenAISyntheticExecutorConfig = {
  apiKey?: string;
  model: string;
  enabled: boolean;
  spendGuard: SpendGuard;
};

export function createOpenAISyntheticExecutor(config: OpenAISyntheticExecutorConfig) {
  return async function execute<T = unknown>(request: AIRequest): Promise<AIResult<T>> {
    const started = Date.now();
    if (!config.enabled) return blocked(request, config.model, "LIVE_EXECUTOR_DISABLED", started);
    if (!config.apiKey) return blocked(request, config.model, "API_KEY_MISSING", started);
    if (request.metadata?.synthetic !== true) return blocked(request, config.model, "SYNTHETIC_MARKER_REQUIRED", started);

    const requestCap = request.maxCostUsd ?? 0;
    const budget = config.spendGuard.canStart(requestCap);
    if (!budget.allowed) return blocked(request, config.model, budget.reason, started);

    return blocked(request, config.model, "HTTP_TRANSPORT_NOT_WIRED_IN_PA02", started);
  };
}

function blocked<T>(request: AIRequest, model: string, reason: string, started: number): AIResult<T> {
  return {
    ok: false,
    provider: "openai",
    model,
    task: request.task,
    correlationId: request.correlationId,
    tenantId: request.tenantId,
    latencyMs: Date.now() - started,
    error: { code: "POLICY_BLOCK", message: reason, retryable: false },
    policy: { selectedBy: "explicit", fallbackUsed: false },
  };
}
