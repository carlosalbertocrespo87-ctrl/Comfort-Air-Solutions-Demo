import type { AIProviderAdapter, AIRequest, AIResult, AITaskType, ProviderCapability } from "./contracts";

export type FailureMode = "timeout" | "provider_error" | "invalid_output" | "over_budget";

export class SyntheticFailureProvider implements AIProviderAdapter {
  readonly id = "mock" as const;
  readonly model = "llf-failure-sim-v1";
  readonly capabilities: ProviderCapability[];

  constructor(private readonly mode: FailureMode, tasks: AITaskType[] = ["lead_classification", "qa_review", "general_reasoning"]) {
    this.capabilities = tasks.map((task) => ({ task, enabled: true }));
  }

  supports(task: AITaskType): boolean {
    return this.capabilities.some((capability) => capability.task === task && capability.enabled);
  }

  async execute<T = unknown>(request: AIRequest): Promise<AIResult<T>> {
    if (this.mode === "over_budget") {
      return {
        ok: true,
        provider: this.id,
        model: this.model,
        task: request.task,
        correlationId: request.correlationId,
        tenantId: request.tenantId,
        latencyMs: 99999,
        usage: { estimatedCostUsd: 99 },
        output: { synthetic: true } as T,
        policy: { selectedBy: "policy", fallbackUsed: false },
      };
    }

    const code = this.mode === "timeout" ? "TIMEOUT" : this.mode === "invalid_output" ? "INVALID_OUTPUT" : "PROVIDER_ERROR";
    return {
      ok: false,
      provider: this.id,
      model: this.model,
      task: request.task,
      correlationId: request.correlationId,
      tenantId: request.tenantId,
      latencyMs: this.mode === "timeout" ? 30000 : 10,
      error: {
        code,
        message: `Synthetic ${this.mode}`,
        retryable: this.mode !== "invalid_output",
      },
      policy: { selectedBy: "policy", fallbackUsed: false },
    };
  }
}
