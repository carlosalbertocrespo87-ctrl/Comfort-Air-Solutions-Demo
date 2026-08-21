export type LostReason='PRICE'|'NO_RESPONSE'|'COMPETITOR'|'OUT_OF_AREA'|'NOT_QUALIFIED'|'TIMING'|'DUPLICATE'|'OTHER';
export function normalizeLostReason(value:string):LostReason{
 const v=value.trim().toLowerCase();
 if(v.includes('price')||v.includes('cost')) return 'PRICE';
 if(v.includes('no response')||v.includes('ghost')) return 'NO_RESPONSE';
 if(v.includes('competitor')||v.includes('another company')) return 'COMPETITOR';
 if(v.includes('area')||v.includes('zip')) return 'OUT_OF_AREA';
 if(v.includes('not qualified')||v.includes('unqualified')) return 'NOT_QUALIFIED';
 if(v.includes('timing')||v.includes('later')) return 'TIMING';
 if(v.includes('duplicate')) return 'DUPLICATE';
 return 'OTHER';
}
