export type LeadResponseSlaPolicy = {
  targetSeconds: number;
  breachSeconds: number;
};

export type LeadResponseTiming = {
  leadId: string;
  tenantId: string;
  createdAt: string;
  firstContactAt?: string | null;
};

export type LeadResponseSlaResult = {
  leadId: string;
  tenantId: string;
  responseSeconds: number | null;
  status: "PENDING" | "ON_TARGET" | "LATE" | "BREACHED";
};

export function evaluateLeadResponseSla(
  timing: LeadResponseTiming,
  policy: LeadResponseSlaPolicy,
  nowIso: string,
): LeadResponseSlaResult {
  const createdMs = Date.parse(timing.createdAt);
  const endMs = timing.firstContactAt ? Date.parse(timing.firstContactAt) : Date.parse(nowIso);

  if (!Number.isFinite(createdMs) || !Number.isFinite(endMs) || endMs < createdMs) {
    throw new Error("INVALID_RESPONSE_TIMING");
  }
  if (policy.targetSeconds <= 0 || policy.breachSeconds < policy.targetSeconds) {
    throw new Error("INVALID_SLA_POLICY");
  }

  const responseSeconds = Math.floor((endMs - createdMs) / 1000);
  if (!timing.firstContactAt) {
    return {
      leadId: timing.leadId,
      tenantId: timing.tenantId,
      responseSeconds: null,
      status: responseSeconds >= policy.breachSeconds ? "BREACHED" : "PENDING",
    };
  }

  return {
    leadId: timing.leadId,
    tenantId: timing.tenantId,
    responseSeconds,
    status:
      responseSeconds <= policy.targetSeconds
        ? "ON_TARGET"
        : responseSeconds < policy.breachSeconds
          ? "LATE"
          : "BREACHED",
  };
}
