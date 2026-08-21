import { strict as assert } from "node:assert";
import { ModelRouter } from "./model-router";
import { MockAIProvider } from "./mock-provider";
import type { AIProviderAdapter, AIRequest, AIResult, AITaskType } from "./contracts";

const baseRequest: AIRequest = {
  task: "lead_classification",
  input: "AC not cooling in 30044",
  tenantId: "synthetic-tenant",
  correlationId: "ai01-test-1",
  locale: "en",
};

class RetryableFailureProvider implements AIProviderAdapter {
  readonly id = "openai" as const;
  readonly model = "synthetic-failure";
  readonly capabilities = [{ task: "lead_classification" as AITaskType, enabled: true }];
  supports(task: AITaskType) { return task === "lead_classification"; }
  async execute<T>(request: AIRequest): Promise<AIResult<T>> {
    return {
      ok: false,
      provider: this.id,
      model: this.model,
      task: request.task,
      correlationId: request.correlationId,
      tenantId: request.tenantId,
      latencyMs: 1,
      error: { code: "PROVIDER_ERROR", message: "synthetic retryable failure", retryable: true },
      policy: { selectedBy: "policy", fallbackUsed: false },
    };
  }
}

export async function runModelRouterSpec() {
  const successRouter = new ModelRouter(
    [new MockAIProvider()],
    [{ task: "lead_classification", primary: "mock" }],
  );
  const success = await successRouter.route(baseRequest);
  assert.equal(success.ok, true);
  assert.equal(success.provider, "mock");
  assert.equal(success.tenantId, baseRequest.tenantId);
  assert.equal(success.correlationId, baseRequest.correlationId);

  const fallbackRouter = new ModelRouter(
    [new RetryableFailureProvider(), new MockAIProvider()],
    [{ task: "lead_classification", primary: "openai", fallbacks: ["mock"] }],
  );
  const fallback = await fallbackRouter.route(baseRequest);
  assert.equal(fallback.ok, true);
  assert.equal(fallback.provider, "mock");
  assert.equal(fallback.policy.fallbackUsed, true);
  assert.equal(fallback.policy.selectedBy, "fallback");

  const closedRouter = new ModelRouter([], []);
  const closed = await closedRouter.route(baseRequest);
  assert.equal(closed.ok, false);
  assert.equal(closed.error?.code, "NO_PROVIDER");
}
