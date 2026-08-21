export type RecoveryAuditRecord={eventId:string;leadId:string;timestamp:string;actor:'SYSTEM'|'AI'|'HUMAN';action:string;reason:string;externalAction:boolean;approvedBy?:string};
export function createRecoveryAuditRecord(input:RecoveryAuditRecord):RecoveryAuditRecord{
 if(!input.eventId.trim()||!input.leadId.trim()||!input.timestamp.trim()||!input.action.trim()||!input.reason.trim()) throw new Error('Incomplete recovery audit record.');
 if(input.externalAction && !input.approvedBy?.trim()) throw new Error('External recovery action requires recorded approval.');
 return Object.freeze({...input});
}
