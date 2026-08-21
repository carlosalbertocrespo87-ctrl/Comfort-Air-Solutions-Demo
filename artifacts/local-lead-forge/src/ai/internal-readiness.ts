export type InternalReadinessEvidence = {
  syntheticTrafficOnly: boolean;
  customerTrafficHardBlocked: boolean;
  tenantIsolationTested: boolean;
  piiRedactionTested: boolean;
  secretLeakageBlocked: boolean;
  telemetryStoresNoPromptOrResponse: boolean;
  killSwitchTested: boolean;
  spendCapsTested: boolean;
  structuredOutputGateTested: boolean;
  humanApprovalBoundariesDocumented: boolean;
  ciGreen: boolean;
  liveProviderSyntheticTestPassed: boolean;
};

export type InternalReadinessDecision = {
  ready: boolean;
  blockers: string[];
  canAdvanceToInternal: boolean;
  canAdvanceToCustomer: false;
};

export const HUMAN_APPROVAL_REQUIRED = [
  "outbound_customer_or_prospect_communication",
  "pricing_or_discount_commitment",
  "booking_or_calendar_write",
  "crm_write",
  "payment_or_refund",
  "legal_or_financial_action",
  "security_sensitive_change",
  "autonomy_above_L0",
] as const;

export function evaluateInternalReadiness(evidence: InternalReadinessEvidence): InternalReadinessDecision {
  const blockers = Object.entries(evidence)
    .filter(([, passed]) => passed !== true)
    .map(([name]) => name);

  const ready = blockers.length === 0;
  return {
    ready,
    blockers,
    canAdvanceToInternal: ready,
    canAdvanceToCustomer: false,
  };
}

// PA-10 evidence review (21 Aug 2026): repository CI is green, but PA-04 has not run.
// Until a real synthetic provider test succeeds, liveProviderSyntheticTestPassed MUST remain false.
export const PA10_CURRENT_EVIDENCE: InternalReadinessEvidence = {
  syntheticTrafficOnly: true,
  customerTrafficHardBlocked: true,
  tenantIsolationTested: true,
  piiRedactionTested: true,
  secretLeakageBlocked: true,
  telemetryStoresNoPromptOrResponse: true,
  killSwitchTested: true,
  spendCapsTested: true,
  structuredOutputGateTested: true,
  humanApprovalBoundariesDocumented: true,
  ciGreen: true,
  liveProviderSyntheticTestPassed: false,
};

export const PA10_CURRENT_DECISION = evaluateInternalReadiness(PA10_CURRENT_EVIDENCE);
