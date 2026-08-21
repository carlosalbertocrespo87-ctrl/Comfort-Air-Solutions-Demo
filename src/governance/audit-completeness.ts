export type AuditCompleteness={complete:boolean;missing:string[]};
export function evaluateAuditCompleteness(input:{eventId?:string;tenantId?:string;decision?:string;policy?:string;proposedAction?:string;result?:string;actor?:string;timestamp?:string}):AuditCompleteness{
 const missing:string[]=[];
 (['eventId','tenantId','decision','policy','proposedAction','result','actor','timestamp'] as const).forEach(k=>{if(!input[k]) missing.push(k)});
 return {complete:missing.length===0,missing};
}
