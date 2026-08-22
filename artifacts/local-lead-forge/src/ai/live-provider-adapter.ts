import type { AIProviderAdapter, AIProviderId, AIRequest, AIResult, AITaskType, ProviderCapability } from "./contracts";
import { evaluateProviderActivation, type ActivationConfig, type TrafficClass } from "./production-activation";
import { DEFAULT_KILL_SWITCH_STATE, evaluateKillSwitch, type KillSwitchState } from "./kill-switch";

export type LiveProviderExecutor = <T>(request: AIRequest) => Promise<AIResult<T>>;

export class GatedLiveProviderAdapter implements AIProviderAdapter {
  constructor(
    public readonly id: AIProviderId,
    public readonly model: string,
    public readonly capabilities: ProviderCapability[],
    private readonly executor: LiveProviderExecutor,
    private readonly config: ActivationConfig,
    private readonly trafficClass: TrafficClass = "synthetic",
    private readonly killSwitch: KillSwitchState = DEFAULT_KILL_SWITCH_STATE,
  ) {}

  supports(task: AITaskType): boolean {
    return this.capabilities.some((capability) => capability.task === task && capability.enabled);
  }

  async execute<T = unknown>(request: AIRequest): Promise<AIResult<T>> {
    const killDecision = evaluateKillSwitch(this.id, request.tenantId, this.killSwitch);
    if (!killDecision.allowed) return this.blocked<T>(request, killDecision.reason);

    const decision = evaluateProviderActivation(this.id, request, this.trafficClass, this.config);
    if (!decision.allowed) return this.blocked<T>(request, decision.reason);

    return this.executor<T>(request);
  }

  private blocked<T>(request: AIRequest, reason: string): AIResult<T> {
    return {
      ok: false,
      provider: this.id,
      model: this.model,
      task: request.task,
      correlationId: request.correlationId,
      tenantId: request.tenantId,
      latencyMs: 0,
      error: { code: "POLICY_BLOCK", message: reason, retryable: false },
      policy: { selectedBy: "explicit", fallbackUsed: false },
    };
  }
}
