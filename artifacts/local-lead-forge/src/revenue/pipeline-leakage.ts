export type PipelineOpportunity = {
  leadId: string;
  tenantId: string;
  stage: "LEAD" | "CONTACTED" | "APPOINTMENT" | "WON" | "LOST";
  updatedAt: string;
  nextActionDueAt?: string | null;
  estimateSentAt?: string | null;
  estimateStatus?: "OPEN" | "ACCEPTED" | "DECLINED" | "EXPIRED" | null;
};

export type LeakageSignal = {
  leadId: string;
  tenantId: string;
  code: "STALE_STAGE" | "OVERDUE_NEXT_ACTION" | "OPEN_ESTIMATE_STALLED";
  severity: "INFO" | "WARN" | "HIGH";
};

export function detectPipelineLeakage(
  opportunity: PipelineOpportunity,
  nowIso: string,
  staleAfterHours = 24,
): LeakageSignal[] {
  const now = Date.parse(nowIso);
  const updated = Date.parse(opportunity.updatedAt);
  if (!Number.isFinite(now) || !Number.isFinite(updated) || now < updated) {
    throw new Error("INVALID_PIPELINE_TIMING");
  }

  const signals: LeakageSignal[] = [];
  const staleMs = staleAfterHours * 60 * 60 * 1000;

  if (opportunity.stage !== "WON" && opportunity.stage !== "LOST" && now - updated >= staleMs) {
    signals.push({ leadId: opportunity.leadId, tenantId: opportunity.tenantId, code: "STALE_STAGE", severity: "WARN" });
  }

  if (opportunity.nextActionDueAt) {
    const due = Date.parse(opportunity.nextActionDueAt);
    if (!Number.isFinite(due)) throw new Error("INVALID_NEXT_ACTION_TIMING");
    if (now > due && opportunity.stage !== "WON" && opportunity.stage !== "LOST") {
      signals.push({ leadId: opportunity.leadId, tenantId: opportunity.tenantId, code: "OVERDUE_NEXT_ACTION", severity: "HIGH" });
    }
  }

  if (opportunity.estimateStatus === "OPEN" && opportunity.estimateSentAt) {
    const sent = Date.parse(opportunity.estimateSentAt);
    if (!Number.isFinite(sent)) throw new Error("INVALID_ESTIMATE_TIMING");
    if (now - sent >= staleMs) {
      signals.push({ leadId: opportunity.leadId, tenantId: opportunity.tenantId, code: "OPEN_ESTIMATE_STALLED", severity: "HIGH" });
    }
  }

  return signals;
}
