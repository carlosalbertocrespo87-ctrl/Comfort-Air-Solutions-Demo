import { describe, expect, it } from "vitest";
import type { AIProviderAdapter, AIRequest, AIResult } from "./contracts";
import { ModelRouter } from "./model-router";
import { runLeadAgentShadow } from "./lead-agent-shadow";

class LeadProvider implements AIProviderAdapter {
  readonly id = "mock" as const;
  supports(task: AIRequest["task"]) { return task === "lead_classification"; }
  async execute<T>(request: AIRequest): Promise<AIResult<T>> {
    return {
      ok: true,
      provider: "mock",
      model: "lead-shadow-test",
      task: request.task,
      correlationId: request.correlationId,
      tenantId: request.tenantId,
      latencyMs: 5,
      output: {
        decision: "escalate",
        confidence: 0.92,
        leadScore: 88,
        intent: "hvac_repair",
        urgency: "high",
        locale: "en",
        reasoningSummary: "No cooling and same-day service requested.",
        recommendedAction: "Prioritize for human review.",
      } as T,
    };
  }
}

const rules = [{ task: "lead_classification" as const, primary: "mock" as const, fallbacks: [] }];

describe("Lead Agent shadow", () => {
  it("fails closed when tenant scope is missing", async () => {
    const router = new ModelRouter([new LeadProvider()], rules);
    const result = await runLeadAgentShadow(router, {
      tenantId: "",
      correlationId: "corr-no-tenant",
      leadText: "AC stopped cooling",
    });
    expect(result.ok).toBe(false);
    expect(result.error?.code).toBe("POLICY_BLOCK");
  });

  it("returns a validated shadow-only recommendation and blocks external actions", async () => {
    const router = new ModelRouter([new LeadProvider()], rules);
    const result = await runLeadAgentShadow(router, {
      tenantId: "tenant-test",
      correlationId: "corr-valid",
      leadText: "My AC is not cooling and I need help today",
    });
    expect(result.ok).toBe(true);
    expect(result.output?.shadowOnly).toBe(true);
    expect(result.output?.leadScore).toBe(88);
    expect(result.output?.blockedActions).toContain("send_sms");
    expect(result.output?.blockedActions).toContain("place_call");
    expect(result.output?.blockedActions).toContain("charge_customer");
  });

  it("rejects malformed model output instead of promoting it", async () => {
    class InvalidProvider extends LeadProvider {
      async execute<T>(request: AIRequest): Promise<AIResult<T>> {
        const base = await super.execute<T>(request);
        return { ...base, output: { decision: "contact_now", confidence: 4 } as T };
      }
    }
    const router = new ModelRouter([new InvalidProvider()], rules);
    const result = await runLeadAgentShadow(router, {
      tenantId: "tenant-test",
      correlationId: "corr-invalid",
      leadText: "Please call me",
    });
    expect(result.ok).toBe(false);
    expect(result.error?.code).toBe("INVALID_OUTPUT");
  });
});
