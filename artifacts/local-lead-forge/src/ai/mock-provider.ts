import type { AIProviderAdapter, AIRequest, AIResult, AITaskType, ProviderCapability } from "./contracts";

export class MockAIProvider implements AIProviderAdapter {
  readonly id = "mock" as const;
  readonly model = "llf-mock-v1";
  readonly capabilities: ProviderCapability[] = [
    "lead_classification",
    "lead_summary",
    "qa_review",
    "follow_up_draft",
    "general_reasoning",
  ].map((task) => ({ task: task as AITaskType, enabled: true }));

  supports(task: AITaskType): boolean {
    return this.capabilities.some((capability) => capability.task === task && capability.enabled);
  }

  async execute<T = unknown>(request: AIRequest): Promise<AIResult<T>> {
    const started = Date.now();
    const output = {
      synthetic: true,
      task: request.task,
      locale: request.locale ?? "en",
      summary: `Synthetic ${request.task} result`,
    } as T;

    return {
      ok: true,
      provider: this.id,
      model: this.model,
      task: request.task,
      correlationId: request.correlationId,
      tenantId: request.tenantId,
      latencyMs: Date.now() - started,
      usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0, estimatedCostUsd: 0 },
      output,
      policy: { selectedBy: "policy", fallbackUsed: false },
    };
  }
}
