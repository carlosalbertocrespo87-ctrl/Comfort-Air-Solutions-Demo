export type AIProviderId = "openai" | "anthropic" | "google" | "mock";

export type AITaskType =
  | "lead_classification"
  | "lead_summary"
  | "qa_review"
  | "follow_up_draft"
  | "voice_realtime"
  | "general_reasoning";

export type AIRequest = {
  task: AITaskType;
  input: string;
  tenantId: string;
  correlationId: string;
  locale?: "en" | "es";
  maxLatencyMs?: number;
  maxCostUsd?: number;
  metadata?: Record<string, string | number | boolean | null>;
};

export type AIUsage = {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  estimatedCostUsd?: number;
};

export type AIResult<T = unknown> = {
  ok: boolean;
  provider: AIProviderId;
  model: string;
  task: AITaskType;
  correlationId: string;
  tenantId: string;
  latencyMs: number;
  usage?: AIUsage;
  output?: T;
  error?: {
    code: "PROVIDER_ERROR" | "TIMEOUT" | "POLICY_BLOCK" | "INVALID_OUTPUT" | "NO_PROVIDER";
    message: string;
    retryable: boolean;
  };
  policy: {
    selectedBy: "explicit" | "policy" | "fallback";
    fallbackUsed: boolean;
  };
};

export type ProviderCapability = {
  task: AITaskType;
  enabled: boolean;
};

export interface AIProviderAdapter {
  readonly id: AIProviderId;
  readonly model: string;
  readonly capabilities: ProviderCapability[];
  supports(task: AITaskType): boolean;
  execute<T = unknown>(request: AIRequest): Promise<AIResult<T>>;
}

export type ModelRouteRule = {
  task: AITaskType;
  primary: AIProviderId;
  fallbacks?: AIProviderId[];
};
