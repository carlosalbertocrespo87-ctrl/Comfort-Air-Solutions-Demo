export type RecoveryReason='MISSED_CALL'|'NO_RESPONSE'|'STALE_LEAD'|'ESTIMATE_STALLED'|'APPOINTMENT_RISK'|'UNKNOWN';
export type RecoveryReasonScore={reason:RecoveryReason;score:number;priority:'HIGH'|'MEDIUM'|'LOW';externalActionAuthorized:false};
export function scoreRecoveryReason(input:{missedCall?:boolean;noResponse?:boolean;staleDays?:number;estimateOpenDays?:number;appointmentRisk?:boolean}):RecoveryReasonScore{
 let reason:RecoveryReason='UNKNOWN'; let score=0;
 if(input.missedCall){reason='MISSED_CALL';score=90;}
 if(input.noResponse && score<80){reason='NO_RESPONSE';score=80;}
 if((input.staleDays??0)>=7 && score<70){reason='STALE_LEAD';score=70;}
 if((input.estimateOpenDays??0)>=3 && score<85){reason='ESTIMATE_STALLED';score=85;}
 if(input.appointmentRisk && score<88){reason='APPOINTMENT_RISK';score=88;}
 const priority=score>=85?'HIGH':score>=60?'MEDIUM':'LOW';
 return {reason,score,priority,externalActionAuthorized:false};
}
