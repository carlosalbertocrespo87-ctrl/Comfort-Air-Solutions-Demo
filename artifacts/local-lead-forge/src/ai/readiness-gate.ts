export type ReadinessEvidence = {
  syntheticOnly: boolean;
  customerTrafficBlocked: boolean;
  tenantIsolationTested: boolean;
  piiRedactionTested: boolean;
  secretLeakageBlocked: boolean;
  telemetryContentFree: boolean;
  killSwitchTested: boolean;
  spendCapsEnforced: boolean;
  outputSchemaValidated: boolean;
  humanApprovalBoundariesDocumented: boolean;
  ciGreen: boolean;
  liveProviderSyntheticTestPassed: boolean;
};

export type ReadinessDecision = {
  canAdvanceToInternal: boolean;
  canAdvanceToCustomer: false;
  blockers: string[];
};

export function evaluateInternalReadiness(evidence: ReadinessEvidence): ReadinessDecision {
  const blockers: string[] = [];
  for (const [key, value] of Object.entries(evidence)) {
    if (!value) blockers.push(key);
  }
  return {
    canAdvanceToInternal: blockers.length === 0,
    canAdvanceToCustomer: false,
    blockers,
  };
}

export const HUMAN_APPROVAL_REQUIRED = [
  "customer_or_prospect_outreach",
  "pricing_or_discount_commitment",
  "calendar_booking_or_reschedule",
  "crm_write_or_status_change",
  "payment_charge_refund_or_credit",
  "legal_financial_or_security_action",
  "autonomy_above_L0_shadow",
] as const;
