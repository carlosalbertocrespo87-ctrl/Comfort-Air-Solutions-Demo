export type RecoveryOpportunity = {
  leadId: string;
  tenantId: string;
  reason: "NO_RESPONSE" | "STALE_PIPELINE" | "OPEN_ESTIMATE";
  createdAt: string;
  evidence: string[];
  communicationAuthorized: false;
};

export function createRecoveryOpportunity(input: Omit<RecoveryOpportunity, "communicationAuthorized">): RecoveryOpportunity {
  if (!input.leadId || !input.tenantId) throw new Error("RECOVERY_SCOPE_REQUIRED");
  if (!input.evidence.length) throw new Error("RECOVERY_EVIDENCE_REQUIRED");
  return { ...input, communicationAuthorized: false };
}
