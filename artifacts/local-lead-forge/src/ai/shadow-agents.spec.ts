import { strict as assert } from "node:assert";
import { LeadShadowAgent, QAShadowAgent } from "./shadow-agents";
import type { AIResult } from "./contracts";

const fakeRouter = {
  route: async <T>(request: { task: string; tenantId: string; correlationId: string; metadata?: Record<string, unknown> }): Promise<AIResult<T>> => ({
    ok: true,
    provider: "mock",
    model: "synthetic",
    task: request.task as AIResult<T>["task"],
    correlationId: request.correlationId,
    tenantId: request.tenantId,
    latencyMs: 0,
    output: {} as T,
    policy: { selectedBy: "policy", fallbackUsed: false },
  }),
} as any;

(async () => {
  const lead = await new LeadShadowAgent(fakeRouter).observe({
    tenantId: "tenant-a",
    correlationId: "lead-1",
    leadText: "AC stopped cooling today",
    locale: "en",
  });
  assert.equal(lead.observation.mode, "L0_SHADOW");
  assert.equal(lead.observation.externalActionsAllowed, false);
  assert.equal(lead.observation.recommendationOnly, true);

  const qa = await new QAShadowAgent(fakeRouter).observe({
    tenantId: "tenant-a",
    correlationId: "qa-1",
    artifactText: "Synthetic artifact",
    locale: "es",
  });
  assert.equal(qa.observation.mode, "L0_SHADOW");
  assert.equal(qa.observation.externalActionsAllowed, false);
  assert.equal(qa.observation.recommendationOnly, true);
})();
