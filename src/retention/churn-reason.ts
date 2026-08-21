export type ChurnReason='PRICE'|'NO_NEED'|'MOVED'|'COMPETITOR'|'SERVICE_ISSUE'|'NON_RESPONSE'|'UNKNOWN';
export function normalizeChurnReason(value:string):ChurnReason{
 const v=value.trim().toLowerCase();
 if(v.includes('price')||v.includes('cost')) return 'PRICE';
 if(v.includes('move')) return 'MOVED';
 if(v.includes('compet')) return 'COMPETITOR';
 if(v.includes('service')||v.includes('complaint')) return 'SERVICE_ISSUE';
 if(v.includes('no need')||v.includes('not needed')) return 'NO_NEED';
 if(v.includes('no response')||v.includes('unresponsive')) return 'NON_RESPONSE';
 return 'UNKNOWN';
}
