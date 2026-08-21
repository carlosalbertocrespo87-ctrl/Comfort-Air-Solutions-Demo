import type { AIRequest, AIResult } from "./contracts";
import { getTaskModelPolicy } from "./task-policy";

export type BudgetDecision =
  | { allowed: true; maxLatencyMs: number; maxCostUsd: number; maxAttempts: number }
  | { allowed: false; code: "LATENCY_BUDGET_INVALID" | "COST_BUDGET_INVALID"; message: string };

export function resolveBudget(request: AIRequest): BudgetDecision {
  const policy = getTaskModelPolicy(request.task);
  const maxLatencyMs = Math.min(request.maxLatencyMs ?? policy.maxLatencyMs, policy.maxLatencyMs);
  const maxCostUsd = Math.min(request.maxCostUsd ?? policy.maxCostUsd, policy.maxCostUsd);

  if (!Number.isFinite(maxLatencyMs) || maxLatencyMs <= 0) {
    return { allowed: false, code: "LATENCY_BUDGET_INVALID", message: "Latency budget must be positive." };
  }

  if (!Number.isFinite(maxCostUsd) || maxCostUsd < 0) {
    return { allowed: false, code: "COST_BUDGET_INVALID", message: "Cost budget cannot be negative." };
  }

  return { allowed: true, maxLatencyMs, maxCostUsd, maxAttempts: policy.maxAttempts };
}

export function resultWithinBudget<T>(result: AIResult<T>, maxLatencyMs: number, maxCostUsd: number): boolean {
  if (result.latencyMs > maxLatencyMs) return false;
  const cost = result.usage?.estimatedCostUsd;
  return cost === undefined || cost <= maxCostUsd;
}
