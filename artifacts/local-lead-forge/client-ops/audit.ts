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
  return [e.actorId, e.at, e.clientId, e.action, e.evidenceRef, e.reason].every((v) => Boolean(v?.trim()));
}
