export interface SalesAuditEvent{actorId:string;at:string;prospectId:string;action:string;stageBefore:string;stageAfter:string;evidenceRef:string;reason:string;}
export function validSalesAudit(e:SalesAuditEvent):boolean{return [e.actorId,e.at,e.prospectId,e.action,e.stageBefore,e.stageAfter,e.evidenceRef,e.reason].every(v=>Boolean(v?.trim()));}
