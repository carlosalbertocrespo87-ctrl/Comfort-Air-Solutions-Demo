export type RecoveryReason='MISSED_CALL'|'STALE_NEW_LEAD'|'NO_RESPONSE'|'QUALIFIED_STALLED'|'ESTIMATE_STALLED';
export type RecoveryQueueItem={leadId:string;reason:RecoveryReason;priority:'P1'|'P2'|'P3';recommendedAction:string;externalActionAuthorized:false};
export function buildRecoveryQueueItem(input:{leadId:string;reason:RecoveryReason;priority:'P1'|'P2'|'P3';recommendedAction:string}):RecoveryQueueItem{
 return {...input,externalActionAuthorized:false};
}
