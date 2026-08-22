import { evaluateInternalReadiness, HUMAN_APPROVAL_REQUIRED, type ReadinessEvidence } from "./readiness-gate";

const complete: ReadinessEvidence = {
  syntheticOnly: true,
  customerTrafficBlocked: true,
  tenantIsolationTested: true,
  piiRedactionTested: true,
  secretLeakageBlocked: true,
  telemetryContentFree: true,
  killSwitchTested: true,
  spendCapsEnforced: true,
  outputSchemaValidated: true,
  humanApprovalBoundariesDocumented: true,
  ciGreen: true,
  liveProviderSyntheticTestPassed: true,
};

const ready = evaluateInternalReadiness(complete);
if (!ready.canAdvanceToInternal) throw new Error("complete evidence should allow internal readiness");
if (ready.canAdvanceToCustomer !== false) throw new Error("PA-09 must never authorize customer traffic");

const blocked = evaluateInternalReadiness({ ...complete, liveProviderSyntheticTestPassed: false, ciGreen: false });
if (blocked.canAdvanceToInternal) throw new Error("missing evidence must block internal readiness");
if (!blocked.blockers.includes("liveProviderSyntheticTestPassed") || !blocked.blockers.includes("ciGreen")) throw new Error("missing evidence must be named explicitly");

if (!HUMAN_APPROVAL_REQUIRED.includes("payment_charge_refund_or_credit")) throw new Error("financial actions must require human approval");
if (!HUMAN_APPROVAL_REQUIRED.includes("autonomy_above_L0_shadow")) throw new Error("autonomy increase must require human approval");
