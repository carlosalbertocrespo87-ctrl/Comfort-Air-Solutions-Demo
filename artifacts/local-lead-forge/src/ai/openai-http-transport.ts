import type { AIRequest, AIResult } from "./contracts";

export type OpenAITransportConfig = {
  apiKey: string;
  model: string;
  maxOutputTokens: number;
  endpoint?: string;
};

export async function executeOpenAIResponses<T = unknown>(request: AIRequest, config: OpenAITransportConfig): Promise<AIResult<T>> {
  const started = Date.now();
  if (!config.apiKey) {
    return {
      ok: false,
      provider: "openai",
      model: config.model,
      task: request.task,
      correlationId: request.correlationId,
      tenantId: request.tenantId,
      latencyMs: 0,
      error: { code: "POLICY_BLOCK", message: "OPENAI_API_KEY_MISSING", retryable: false },
      policy: { selectedBy: "explicit", fallbackUsed: false },
    };
  }

  const endpoint = config.endpoint ?? "https://api.openai.com/v1/responses";
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      input: request.input,
      max_output_tokens: config.maxOutputTokens,
      metadata: {
        tenant_id: request.tenantId,
        correlation_id: request.correlationId,
        llf_task: request.task,
        synthetic: String(request.metadata?.synthetic === true),
      },
    }),
  });

  const latencyMs = Date.now() - started;
  if (!response.ok) {
    return {
      ok: false,
      provider: "openai",
      model: config.model,
      task: request.task,
      correlationId: request.correlationId,
      tenantId: request.tenantId,
      latencyMs,
      error: { code: "PROVIDER_ERROR", message: `OPENAI_HTTP_${response.status}`, retryable: response.status >= 500 },
      policy: { selectedBy: "explicit", fallbackUsed: false },
    };
  }

  const data = await response.json() as any;
  const inputTokens = data?.usage?.input_tokens ?? 0;
  const outputTokens = data?.usage?.output_tokens ?? 0;
  const estimatedCostUsd = (inputTokens * 0.20 + outputTokens * 1.20) / 1_000_000;

  return {
    ok: true,
    provider: "openai",
    model: config.model,
    task: request.task,
    correlationId: request.correlationId,
    tenantId: request.tenantId,
    latencyMs,
    usage: {
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      estimatedCostUsd,
    },
    output: data as T,
    policy: { selectedBy: "explicit", fallbackUsed: false },
  };
}
