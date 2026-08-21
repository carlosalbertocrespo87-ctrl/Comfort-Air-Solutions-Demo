import type { AIRequest, AIResult } from "./contracts";
import type { ModelRouter } from "./model-router";

export type ShadowAgentRole = "lead_agent" | "qa_agent";

export type ShadowObservation = {
  role: ShadowAgentRole;
  tenantId: string;
  correlationId: string;
  mode: "L0_SHADOW";
  externalActionsAllowed: false;
  recommendationOnly: true;
};

export type LeadShadowOutput = {
  classification?: "hot" | "follow_up" | "low_intent" | "unknown";
  urgency?: "emergency" | "today" | "soon" | "routine" | "unknown";
  serviceability?: "likely" | "unknown" | "outside_area";
  summary?: string;
  recommendedNextStep?: string;
  needsHumanReview?: boolean;
};

export type QAShadowOutput = {
  passed?: boolean;
  severity?: "info" | "warning" | "critical";
  findings?: string[];
  recommendedFixes?: string[];
  needsHumanReview?: boolean;
};

export class LeadShadowAgent {
  readonly role: ShadowAgentRole = "lead_agent";

  constructor(private readonly router: ModelRouter) {}

  async observe(input: {
    tenantId: string;
    correlationId: string;
    leadText: string;
    locale?: "en" | "es";
  }): Promise<{ observation: ShadowObservation; result: AIResult<LeadShadowOutput> }> {
    const request: AIRequest = {
      task: "lead_classification",
      input: input.leadText,
      tenantId: input.tenantId,
      correlationId: input.correlationId,
      locale: input.locale,
      metadata: {
        agentRole: this.role,
        autonomyLevel: "L0",
        shadowMode: true,
        externalActionsAllowed: false,
      },
    };

    return {
      observation: this.observation(input.tenantId, input.correlationId),
      result: await this.router.route<LeadShadowOutput>(request),
    };
  }

  private observation(tenantId: string, correlationId: string): ShadowObservation {
    return {
      role: this.role,
      tenantId,
      correlationId,
      mode: "L0_SHADOW",
      externalActionsAllowed: false,
      recommendationOnly: true,
    };
  }
}

export class QAShadowAgent {
  readonly role: ShadowAgentRole = "qa_agent";

  constructor(private readonly router: ModelRouter) {}

  async observe(input: {
    tenantId: string;
    correlationId: string;
    artifactText: string;
    locale?: "en" | "es";
  }): Promise<{ observation: ShadowObservation; result: AIResult<QAShadowOutput> }> {
    const request: AIRequest = {
      task: "qa_review",
      input: input.artifactText,
      tenantId: input.tenantId,
      correlationId: input.correlationId,
      locale: input.locale,
      metadata: {
        agentRole: this.role,
        autonomyLevel: "L0",
        shadowMode: true,
        externalActionsAllowed: false,
      },
    };

    return {
      observation: this.observation(input.tenantId, input.correlationId),
      result: await this.router.route<QAShadowOutput>(request),
    };
  }

  private observation(tenantId: string, correlationId: string): ShadowObservation {
    return {
      role: this.role,
      tenantId,
      correlationId,
      mode: "L0_SHADOW",
      externalActionsAllowed: false,
      recommendationOnly: true,
    };
  }
}
