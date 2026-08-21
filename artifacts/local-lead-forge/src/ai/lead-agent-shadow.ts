import type { AIRequest, AIResult } from "./contracts";
import { canAgentUseTool } from "./agent-permissions";
import { ModelRouter } from "./model-router";

export type LeadShadowDecision = "classify" | "escalate" | "ignore";

export type LeadShadowOutput = {
  shadowOnly: true;
  decision: LeadShadowDecision;
  confidence: number;
  leadScore: number;
  intent: string;
  urgency: "low" | "medium" | "high" | "unknown";
  locale: "en" | "es" | "unknown";
  reasoningSummary: string;
  recommendedAction: string;
  blockedActions: string[];
};

export type LeadShadowInput = {
  tenantId: string;
  correlationId: string;
  leadText: string;
  locale?: "en" | "es";
  maxLatencyMs?: number;
  maxCostUsd?: number;
};

const BLOCKED_EXTERNAL_ACTIONS = [
  "send_message",
  "send_email",
  "send_sms",
  "place_call",
  "book_appointment",
  "change_crm",
  "change_lead_routing",
  "charge_customer",
  "refund_customer",
];

function parseShadowOutput(output: unknown): LeadShadowOutput | null {
  if (!output || typeof output !== "object") return null;
  const value = output as Record<string, unknown>;
  const decision = value.decision;
  const urgency = value.urgency;
  const locale = value.locale;

  if (!(["classify", "escalate", "ignore"] as const).includes(decision as LeadShadowDecision)) return null;
  if (!(["low", "medium", "high", "unknown"] as const).includes(urgency as LeadShadowOutput["urgency"])) return null;
  if (!(["en", "es", "unknown"] as const).includes(locale as LeadShadowOutput["locale"])) return null;
  if (typeof value.confidence !== "number" || value.confidence < 0 || value.confidence > 1) return null;
  if (typeof value.leadScore !== "number" || value.leadScore < 0 || value.leadScore > 100) return null;
  if (typeof value.intent !== "string" || typeof value.reasoningSummary !== "string" || typeof value.recommendedAction !== "string") return null;

  return {
    shadowOnly: true,
    decision: decision as LeadShadowDecision,
    confidence: value.confidence,
    leadScore: value.leadScore,
    intent: value.intent,
    urgency: urgency as LeadShadowOutput["urgency"],
    locale: locale as LeadShadowOutput["locale"],
    reasoningSummary: value.reasoningSummary,
    recommendedAction: value.recommendedAction,
    blockedActions: BLOCKED_EXTERNAL_ACTIONS,
  };
}

export async function runLeadAgentShadow(
  router: ModelRouter,
  input: LeadShadowInput,
): Promise<AIResult<LeadShadowOutput>> {
  if (!input.tenantId) {
    return {
      ok: false,
      provider: "mock",
      model: "unavailable",
      task: "lead_classification",
      correlationId: input.correlationId,
      tenantId: input.tenantId,
      latencyMs: 0,
      error: { code: "POLICY_BLOCK", message: "Tenant scope is required for Lead Agent shadow mode.", retryable: false },
      policy: { selectedBy: "policy", fallbackUsed: false },
    };
  }

  for (const toolId of ["read_lead", "score_lead"]) {
    const permission = canAgentUseTool({ role: "lead_agent", toolId, tenantId: input.tenantId });
    if (!permission.allowed) {
      return {
        ok: false,
        provider: "mock",
        model: "unavailable",
        task: "lead_classification",
        correlationId: input.correlationId,
        tenantId: input.tenantId,
        latencyMs: 0,
        error: { code: "POLICY_BLOCK", message: `Lead Agent permission denied: ${permission.reason}`, retryable: false },
        policy: { selectedBy: "policy", fallbackUsed: false },
      };
    }
  }

  const request: AIRequest = {
    task: "lead_classification",
    input: [
      "You are the Local Lead Forge Lead Agent operating in SHADOW MODE only.",
      "Analyze the lead and return structured JSON with decision, confidence, leadScore, intent, urgency, locale, reasoningSummary, recommendedAction.",
      "Never claim to have contacted anyone, changed a CRM, booked an appointment, placed a call, sent email/SMS, changed routing, charged, or refunded.",
      `Lead: ${input.leadText}`,
    ].join("\n"),
    tenantId: input.tenantId,
    correlationId: input.correlationId,
    locale: input.locale,
    maxLatencyMs: input.maxLatencyMs,
    maxCostUsd: input.maxCostUsd,
    metadata: { shadowMode: true, agentRole: "lead_agent" },
  };

  const result = await router.route<unknown>(request);
  if (!result.ok) return result as AIResult<LeadShadowOutput>;

  const parsed = parseShadowOutput(result.output);
  if (!parsed) {
    return {
      ...result,
      ok: false,
      output: undefined,
      error: { code: "INVALID_OUTPUT", message: "Lead Agent shadow output failed schema validation.", retryable: false },
    };
  }

  return { ...result, output: parsed };
}
