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

// PA-10 evidence review: PA-04 has not run. Keep this blocker explicit.
export const PA10_LIVE_SYNTHETIC_TEST_PASSED = false as const;
