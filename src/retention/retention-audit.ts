export type RetentionAuditEvent='OPPORTUNITY_CREATED'|'REVIEWED'|'DEFERRED'|'APPROVED'|'OUTCOME_RECORDED';
export type RetentionAuditRecord={tenantId:string;customerId:string;opportunityType:string;event:RetentionAuditEvent;occurredAt:string;actor:'SYSTEM'|'HUMAN';externalActionAuthorized:false;note?:string};

export function createRetentionAuditRecord(input:Omit<RetentionAuditRecord,'externalActionAuthorized'>):RetentionAuditRecord{
 if(!input.tenantId.trim()||!input.customerId.trim()) throw new Error('tenantId and customerId are required');
 return {...input,externalActionAuthorized:false};
}
