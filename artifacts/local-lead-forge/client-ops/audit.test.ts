import { isValidAuditEvent } from './audit.ts';
const base = { actorId:'ops-1', at:'2026-08-21T17:00:00Z', clientId:'synthetic-001', action:'LIFECYCLE_CHANGE', evidenceRef:'qa://synthetic/pass', reason:'Synthetic QA transition' };
Deno.test('audit event requires evidence and reason', () => {
  if (!isValidAuditEvent(base)) throw new Error('valid audit rejected');
  if (isValidAuditEvent({ ...base, evidenceRef:'' })) throw new Error('missing evidence accepted');
  if (isValidAuditEvent({ ...base, reason:'' })) throw new Error('missing reason accepted');
});
Deno.test('audit event rejects invalid timestamp', () => {
  if (isValidAuditEvent({ ...base, at:'not-a-date' })) throw new Error('invalid timestamp accepted');
});
