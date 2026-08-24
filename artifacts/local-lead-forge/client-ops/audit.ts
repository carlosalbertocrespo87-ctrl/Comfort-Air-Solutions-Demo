export interface AuditEvent {
  actorId: string;
  at: string;
  clientId: string;
  action: string;
  previousState?: string;
  newState?: string;
  evidenceRef: string;
  reason: string;
}

export function isValidAuditEvent(e: AuditEvent): boolean {
  const requiredPresent = [e.actorId, e.at, e.clientId, e.action, e.evidenceRef, e.reason]
    .every((v) => Boolean(v?.trim()));
  if (!requiredPresent) return false;
  return !Number.isNaN(Date.parse(e.at));
}
