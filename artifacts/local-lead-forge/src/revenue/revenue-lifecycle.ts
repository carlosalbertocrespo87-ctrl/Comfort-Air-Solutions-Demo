export type RevenueLifecycleStage =
  | "source"
  | "lead"
  | "contacted"
  | "appointment"
  | "won"
  | "lost"
  | "revenue";

export type RevenueSource = {
  firstTouchSource?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  referrer?: string;
};

export type RevenueEvidence = {
  evidenceId: string;
  kind: "appointment" | "won" | "lost" | "estimated_revenue" | "confirmed_revenue" | "recovered_revenue";
  recordedAt: string;
  source: "internal" | "client_confirmed" | "system_verified";
};

export type RevenueOpportunity = {
  tenantId: string;
  opportunityId: string;
  stage: RevenueLifecycleStage;
  source: RevenueSource;
  estimatedRevenueUsd?: number;
  confirmedRevenueUsd?: number;
  recoveredRevenueUsd?: number;
  lostReason?: string;
  evidence: RevenueEvidence[];
};

const ALLOWED_TRANSITIONS: Record<RevenueLifecycleStage, RevenueLifecycleStage[]> = {
  source: ["lead"],
  lead: ["contacted", "lost"],
  contacted: ["appointment", "lost"],
  appointment: ["won", "lost"],
  won: ["revenue"],
  lost: [],
  revenue: [],
};

export function canTransitionRevenueStage(from: RevenueLifecycleStage, to: RevenueLifecycleStage): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

export function preserveFirstTouch(current: RevenueSource, incoming: RevenueSource): RevenueSource {
  return {
    firstTouchSource: current.firstTouchSource ?? incoming.firstTouchSource,
    utmSource: current.utmSource ?? incoming.utmSource,
    utmMedium: current.utmMedium ?? incoming.utmMedium,
    utmCampaign: current.utmCampaign ?? incoming.utmCampaign,
    referrer: current.referrer ?? incoming.referrer,
  };
}

function hasEvidence(opportunity: RevenueOpportunity, kind: RevenueEvidence["kind"]): boolean {
  return opportunity.evidence.some((item) => item.kind === kind);
}

export function validateRevenueOpportunity(opportunity: RevenueOpportunity): { valid: boolean; reason: string } {
  if (!opportunity.tenantId || !opportunity.opportunityId) {
    return { valid: false, reason: "TENANT_AND_OPPORTUNITY_REQUIRED" };
  }
  if (opportunity.estimatedRevenueUsd != null && opportunity.estimatedRevenueUsd < 0) {
    return { valid: false, reason: "ESTIMATED_REVENUE_INVALID" };
  }
  if (opportunity.confirmedRevenueUsd != null && opportunity.confirmedRevenueUsd < 0) {
    return { valid: false, reason: "CONFIRMED_REVENUE_INVALID" };
  }
  if (opportunity.recoveredRevenueUsd != null && opportunity.recoveredRevenueUsd < 0) {
    return { valid: false, reason: "RECOVERED_REVENUE_INVALID" };
  }
  if (opportunity.confirmedRevenueUsd != null && !hasEvidence(opportunity, "confirmed_revenue")) {
    return { valid: false, reason: "CONFIRMED_REVENUE_EVIDENCE_REQUIRED" };
  }
  if (opportunity.recoveredRevenueUsd != null && !hasEvidence(opportunity, "recovered_revenue")) {
    return { valid: false, reason: "RECOVERED_REVENUE_EVIDENCE_REQUIRED" };
  }
  if (opportunity.stage === "lost" && !opportunity.lostReason) {
    return { valid: false, reason: "LOST_REASON_REQUIRED" };
  }
  return { valid: true, reason: "VALID" };
}
