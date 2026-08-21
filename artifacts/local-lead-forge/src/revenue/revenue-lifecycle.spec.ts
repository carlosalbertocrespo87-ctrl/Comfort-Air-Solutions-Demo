import {
  canTransitionRevenueStage,
  preserveFirstTouch,
  validateRevenueOpportunity,
  type RevenueOpportunity,
} from "./revenue-lifecycle";

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
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

  const valid: RevenueOpportunity = {
    tenantId: "tenant-a",
    opportunityId: "opp-3",
    stage: "revenue",
    source: { firstTouchSource: "google", utmSource: "google", utmMedium: "organic" },
    confirmedRevenueUsd: 950,
    recoveredRevenueUsd: 950,
    evidence: [
      { evidenceId: "e-1", kind: "confirmed_revenue", recordedAt: "2026-08-21T18:00:00Z", source: "client_confirmed" },
      { evidenceId: "e-2", kind: "recovered_revenue", recordedAt: "2026-08-21T18:01:00Z", source: "system_verified" },
    ],
  };
  assert(validateRevenueOpportunity(valid).valid, "evidence-backed revenue should validate");
}
