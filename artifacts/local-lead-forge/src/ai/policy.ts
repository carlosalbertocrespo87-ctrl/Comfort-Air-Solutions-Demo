import type { ModelRouteRule } from "./contracts";

export const DEFAULT_MODEL_ROUTES: ModelRouteRule[] = [
  { task: "lead_classification", primary: "mock" },
  { task: "lead_summary", primary: "mock" },
  { task: "qa_review", primary: "mock" },
  { task: "follow_up_draft", primary: "mock" },
  { task: "general_reasoning", primary: "mock" },
  { task: "voice_realtime", primary: "mock" },
];

export const AI_RELEASE_POLICY = {
  mode: "synthetic-only" as const,
  allowRealCustomerCommunication: false,
  allowRealProspectCommunication: false,
  allowVoiceProduction: false,
  allowFinancialActions: false,
  allowLegalActions: false,
  allowCredentialChanges: false,
  allowDestructiveActions: false,
  requireTenantId: true,
  requireCorrelationId: true,
};
