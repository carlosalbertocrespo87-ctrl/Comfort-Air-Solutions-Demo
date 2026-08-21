export type SpendBudget = {
  maxPerRequestUsd: number;
  maxSessionUsd: number;
};

export const PA02_DEFAULT_BUDGET: SpendBudget = {
  maxPerRequestUsd: 0.01,
  maxSessionUsd: 0.05,
};

export class SpendGuard {
  private spentUsd = 0;

  constructor(private readonly budget: SpendBudget = PA02_DEFAULT_BUDGET) {}

  canStart(requestCapUsd: number): { allowed: boolean; reason: string } {
    if (requestCapUsd <= 0) return { allowed: false, reason: "REQUEST_BUDGET_MISSING" };
    if (requestCapUsd > this.budget.maxPerRequestUsd) return { allowed: false, reason: "REQUEST_BUDGET_EXCEEDS_CAP" };
    if (this.spentUsd + requestCapUsd > this.budget.maxSessionUsd) return { allowed: false, reason: "SESSION_BUDGET_EXCEEDED" };
    return { allowed: true, reason: "BUDGET_OK" };
  }

  record(actualUsd: number): void {
    if (actualUsd > 0) this.spentUsd += actualUsd;
  }

  getSpentUsd(): number {
    return this.spentUsd;
  }
}
