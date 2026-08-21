import {
  canTransitionRevenueStage,
  preserveFirstTouch,
  validateRevenueOpportunity,
  type RevenueOpportunity,
} from "./revenue-lifecycle";
import { evaluateLeadResponseSla } from "./speed-to-lead";
import { detectPipelineLeakage } from "./pipeline-leakage";
import { createRecoveryOpportunity } from "./recovery-opportunity";
import { buildWeeklyOwnerWinReport } from "./weekly-owner-report";

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

function assertThrows(fn: () => unknown, expected: string) {
  try {
    fn();
  } catch (error) {
    if (error instanceof Error && error.message === expected) return;
    throw error;
  }
  throw new Error(`Expected ${expected}`);
}

export function runRevenueLifecycleContractTests() {
  assert(canTransitionRevenueStage("source", "lead"), "source should transition to lead");
  assert(!canTransitionRevenueStage("lead", "revenue"), "lead must not jump directly to revenue");
  assert(!canTransitionRevenueStage("lost", "won"), "lost should be terminal");

  const preserved = preserveFirstTouch(
    { firstTouchSource: "google", utmCampaign: "summer" },
    { firstTouchSource: "facebook", utmCampaign: "retargeting", utmMedium: "paid-social" },
  );
  assert(preserved.firstTouchSource === "google", "first-touch source must remain immutable once captured");
  assert(preserved.utmCampaign === "summer", "first-touch campaign must remain immutable once captured");
  assert(preserved.utmMedium === "paid-social", "missing first-touch fields may be enriched");

  const unsupportedRevenue: RevenueOpportunity = {
    tenantId: "tenant-a",
    opportunityId: "opp-1",
    stage: "revenue",
    source: { firstTouchSource: "organic" },
    confirmedRevenueUsd: 1200,
    evidence: [],
  };
  assert(
    validateRevenueOpportunity(unsupportedRevenue).reason === "CONFIRMED_REVENUE_EVIDENCE_REQUIRED",
    "confirmed revenue must fail closed without evidence",
  );

  const fabricatedRecovery: RevenueOpportunity = {
    tenantId: "tenant-a",
    opportunityId: "opp-2",
    stage: "revenue",
    source: { firstTouchSource: "missed-call" },
    recoveredRevenueUsd: 800,
    evidence: [],
  };
  assert(
    validateRevenueOpportunity(fabricatedRecovery).reason === "RECOVERED_REVENUE_EVIDENCE_REQUIRED",
    "recovered revenue must not be fabricated without evidence",
  );

  const crossTenantEvidence: RevenueOpportunity = {
    tenantId: "tenant-a",
    opportunityId: "opp-3",
    stage: "revenue",
    source: { firstTouchSource: "google" },
    confirmedRevenueUsd: 950,
    evidence: [
      {
        evidenceId: "e-cross",
        tenantId: "tenant-b",
        opportunityId: "opp-3",
        kind: "confirmed_revenue",
        recordedAt: "2026-08-21T18:00:00Z",
        source: "client_confirmed",
        amountUsd: 950,
      },
    ],
  };
  assert(
    validateRevenueOpportunity(crossTenantEvidence).reason === "CONFIRMED_REVENUE_EVIDENCE_REQUIRED",
    "cross-tenant revenue evidence must fail closed",
  );

  const mismatchedAmount: RevenueOpportunity = {
    tenantId: "tenant-a",
    opportunityId: "opp-4",
    stage: "revenue",
    source: { firstTouchSource: "google" },
    confirmedRevenueUsd: 950,
    evidence: [
      {
        evidenceId: "e-wrong-amount",
        tenantId: "tenant-a",
        opportunityId: "opp-4",
        kind: "confirmed_revenue",
        recordedAt: "2026-08-21T18:00:00Z",
        source: "client_confirmed",
        amountUsd: 500,
      },
    ],
  };
  assert(
    validateRevenueOpportunity(mismatchedAmount).reason === "CONFIRMED_REVENUE_EVIDENCE_REQUIRED",
    "revenue evidence amount must match the claimed amount",
  );

  const valid: RevenueOpportunity = {
    tenantId: "tenant-a",
    opportunityId: "opp-5",
    stage: "revenue",
    source: { firstTouchSource: "google", utmSource: "google", utmMedium: "organic" },
    confirmedRevenueUsd: 950,
    recoveredRevenueUsd: 950,
    evidence: [
      {
        evidenceId: "e-1",
        tenantId: "tenant-a",
        opportunityId: "opp-5",
        kind: "confirmed_revenue",
        recordedAt: "2026-08-21T18:00:00Z",
        source: "client_confirmed",
        amountUsd: 950,
      },
      {
        evidenceId: "e-2",
        tenantId: "tenant-a",
        opportunityId: "opp-5",
        kind: "recovered_revenue",
        recordedAt: "2026-08-21T18:01:00Z",
        source: "system_verified",
        amountUsd: 950,
      },
    ],
  };
  assert(validateRevenueOpportunity(valid).valid, "evidence-backed revenue should validate");

  const onTarget = evaluateLeadResponseSla(
    { leadId: "lead-1", tenantId: "tenant-a", createdAt: "2026-08-21T18:00:00Z", firstContactAt: "2026-08-21T18:01:00Z" },
    { targetSeconds: 120, breachSeconds: 600 },
    "2026-08-21T18:01:00Z",
  );
  assert(onTarget.status === "ON_TARGET" && onTarget.responseSeconds === 60, "speed-to-lead SLA should classify an on-target response");

  const pendingBreach = evaluateLeadResponseSla(
    { leadId: "lead-2", tenantId: "tenant-a", createdAt: "2026-08-21T18:00:00Z" },
    { targetSeconds: 120, breachSeconds: 600 },
    "2026-08-21T18:11:00Z",
  );
  assert(pendingBreach.status === "BREACHED" && pendingBreach.responseSeconds === null, "uncontacted leads should breach after the policy window");
  assertThrows(
    () => evaluateLeadResponseSla(
      { leadId: "lead-3", tenantId: "tenant-a", createdAt: "2026-08-21T18:00:00Z" },
      { targetSeconds: 0, breachSeconds: 600 },
      "2026-08-21T18:01:00Z",
    ),
    "INVALID_SLA_POLICY",
  );

  const leakage = detectPipelineLeakage(
    {
      leadId: "lead-4",
      tenantId: "tenant-a",
      stage: "CONTACTED",
      updatedAt: "2026-08-20T12:00:00Z",
      nextActionDueAt: "2026-08-21T10:00:00Z",
      estimateSentAt: "2026-08-20T12:00:00Z",
      estimateStatus: "OPEN",
    },
    "2026-08-21T18:00:00Z",
    24,
  );
  assert(leakage.some((item) => item.code === "STALE_STAGE"), "stale active pipeline stages should surface");
  assert(leakage.some((item) => item.code === "OVERDUE_NEXT_ACTION"), "overdue next actions should surface");
  assert(leakage.some((item) => item.code === "OPEN_ESTIMATE_STALLED"), "stalled open estimates should surface");

  assertThrows(
    () => createRecoveryOpportunity({
      leadId: "lead-5",
      tenantId: "tenant-a",
      reason: "NO_RESPONSE",
      createdAt: "2026-08-21T18:00:00Z",
      evidence: [],
    }),
    "RECOVERY_EVIDENCE_REQUIRED",
  );
  const recovery = createRecoveryOpportunity({
    leadId: "lead-5",
    tenantId: "tenant-a",
    reason: "NO_RESPONSE",
    createdAt: "2026-08-21T18:00:00Z",
    evidence: ["missed-call-ledger:123"],
  });
  assert(recovery.communicationAuthorized === false, "recovery opportunities must remain advisory/internal by default");

  const report = buildWeeklyOwnerWinReport({
    tenantId: "tenant-a",
    periodStart: "2026-08-14T00:00:00Z",
    periodEnd: "2026-08-21T00:00:00Z",
    leads: 10,
    appointments: 4,
    won: 2,
    lost: 2,
    attributedRevenueUsd: 1900,
    recoveredRevenueUsd: 950,
    averageResponseSeconds: 72,
    leakageSignals: leakage,
    revenueEvidenceVerified: true,
  });
  assert(report.appointmentRate === 0.4, "weekly report appointment rate should be deterministic");
  assert(report.winRate === 0.5, "weekly report win rate should be deterministic");
  assert(report.leakageCount === leakage.length, "weekly report leakage count should match evidence inputs");
  assertThrows(
    () => buildWeeklyOwnerWinReport({
      tenantId: "tenant-a",
      periodStart: "2026-08-14T00:00:00Z",
      periodEnd: "2026-08-21T00:00:00Z",
      leads: 1,
      appointments: 1,
      won: 1,
      lost: 0,
      attributedRevenueUsd: 500,
      recoveredRevenueUsd: 0,
      averageResponseSeconds: 60,
      leakageSignals: [],
      revenueEvidenceVerified: false,
    }),
    "REVENUE_EVIDENCE_NOT_VERIFIED",
  );
}

runRevenueLifecycleContractTests();
