import { ModelRouter } from "./model-router";
import { MockAIProvider } from "./mock-provider";
import { DEFAULT_MODEL_ROUTES } from "./policy";

const router = new ModelRouter([new MockAIProvider()], DEFAULT_MODEL_ROUTES);

export async function runAIResultEnvelopeContract(): Promise<void> {
  const result = await router.route({
    task: "lead_classification",
    input: "AC not cooling, 30044, today",
    tenantId: "tenant-test",
    correlationId: "trace-ai-03",
    maxLatencyMs: 5000,
    maxCostUsd: 0.05,
  });

  if (!result.policy.routeTier) throw new Error("missing routeTier");
  if (result.policy.attempt !== 1) throw new Error("unexpected attempt");
  if (!result.budget) throw new Error("missing budget metadata");
  if (result.budget.maxLatencyMs !== 5000) throw new Error("request latency override lost");
  if (result.budget.maxCostUsd !== 0.05) throw new Error("request cost override lost");
  if (!result.observability?.startedAt || !result.observability.completedAt) {
    throw new Error("missing timestamps");
  }
  if (result.observability.traceId !== "trace-ai-03") throw new Error("trace mismatch");
  if (!result.observability.routeId?.startsWith("lead_classification:mock:")) {
    throw new Error("missing route id");
  }
}
