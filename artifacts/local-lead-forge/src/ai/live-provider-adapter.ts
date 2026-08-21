import type { AIProviderAdapter, AIProviderId, AIRequest, AIResult, AITaskType, ProviderCapability } from "./contracts";
import { evaluateProviderActivation, type ActivationConfig, type TrafficClass } from "./production-activation";

export type LiveProviderExecutor = <T>(request: AIRequest) => Promise<AIResult<T>>;

export class GatedLiveProviderAdapter implements AIProviderAdapter {
  constructor(
    public readonly id: AIProviderId,
    public readonly model: string,
    public readonly capabilities: ProviderCapability[],
    private readonly executor: LiveProviderExecutor,
    private readonly config: ActivationConfig,
    private readonly trafficClass: TrafficClass = "synthetic",
  ) {}

  supports(task: AITaskType): boolean {
    return this.capabilities.some((capability) => capability.task === task && capability.enabled);
  }

  async execute<T = unknown>(request: AIRequest): Promise<AIResult<T>> {
    const decision = evaluateProviderActivation(this.id, request, this.trafficClass, this.config);
    if (!decision.allowed) {
      return {
        ok: false,
        provider: this.id,
        model: this.model,
        task: request.task,
        correlationId: request.correlationId,
        tenantId: request.tenantId,
        latencyMs: 0,
        error: { code: "POLICY_BLOCK", message: decision.reason, retryable: false },
        policy: { selectedBy: "explicit", fallbackUsed: false },
      };
    }
    return this.executor<T>(request);
  }
}
