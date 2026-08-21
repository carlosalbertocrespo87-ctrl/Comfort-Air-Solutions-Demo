import { evaluateResilience } from "./resilience";
import type { AIResult } from "./contracts";

function base(overrides: Partial<AIResult<unknown>>): AIResult<unknown> {
  return {
    ok: false,
    provider: "mock",
    model: "test",
    task: "qa_review",
    correlationId: "corr",
    tenantId: "tenant-a",
    latencyMs: 1,
    policy: { selectedBy: "policy", fallbackUsed: false },
    ...overrides,
  };
}

const timeout = evaluateResilience(base({ error: { code: "TIMEOUT", message: "timeout", retryable: true } }));
if (timeout.status !== "retry" || !timeout.safe) throw new Error("retryable timeout must be retry-only, not success");

const invalid = evaluateResilience(base({ error: { code: "INVALID_OUTPUT", message: "bad output", retryable: false } }));
if (invalid.status !== "blocked" || invalid.safe) throw new Error("invalid output must be blocked");

const noProvider = evaluateResilience(base({ error: { code: "NO_PROVIDER", message: "none", retryable: false } }));
if (noProvider.status !== "human_review") throw new Error("no provider must escalate");

const overBudget = evaluateResilience(base({
  ok: true,
  output: { synthetic: true },
  budget: { maxLatencyMs: 1000, maxCostUsd: 0.01, withinLatencyBudget: false, withinCostBudget: false },
}));
if (overBudget.status !== "human_review" || overBudget.safe) throw new Error("over-budget result must not auto-pass");
