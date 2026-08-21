export type RevenueExceptionSeverity='P1'|'P2'|'P3';
export interface RevenueException{payment:boolean;legal:boolean;deliveryMismatch:boolean;replyUnowned:boolean;proposalStalled:boolean;overdueNextAction:boolean;}
export function classifyRevenueException(x:RevenueException):RevenueExceptionSeverity{
 if(x.payment||x.legal||x.deliveryMismatch)return'P1';
 if(x.replyUnowned||x.proposalStalled||x.overdueNextAction)return'P2';
 return'P3';
}
export function exceptionNeedsAttention(x:RevenueException):boolean{return Object.values(x).some(Boolean);}
