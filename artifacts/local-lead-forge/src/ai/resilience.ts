import type { AIResult } from "./contracts";

export type ResilienceDecision = {
  safe: boolean;
  status: "ok" | "retry" | "human_review" | "blocked";
  reason: string;
};

export function evaluateResilience(result: AIResult<unknown>): ResilienceDecision {
  if (result.ok) {
    if (result.budget?.withinLatencyBudget === false || result.budget?.withinCostBudget === false) {
      return { safe: false, status: "human_review", reason: "AI result exceeded configured runtime budget." };
    }
    return { safe: true, status: "ok", reason: "AI result completed within configured safety boundaries." };
  }

  switch (result.error?.code) {
    case "TIMEOUT":
    case "PROVIDER_ERROR":
      return result.error.retryable
        ? { safe: true, status: "retry", reason: "Retryable provider failure; do not report success yet." }
        : { safe: false, status: "human_review", reason: "Provider failure requires human review." };
    case "INVALID_OUTPUT":
      return { safe: false, status: "blocked", reason: "Invalid model output must not be treated as success." };
    case "POLICY_BLOCK":
      return { safe: false, status: "blocked", reason: "Policy blocked the requested AI operation." };
    case "NO_PROVIDER":
    default:
      return { safe: false, status: "human_review", reason: "No safe AI completion is available." };
  }
}
