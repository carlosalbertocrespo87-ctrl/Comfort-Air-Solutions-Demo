export type CitationEvidence={field:string;sourceUrl:string;observedAt:string;officialSource:boolean;notes?:string};
export function normalizeCitationEvidence(items:CitationEvidence[]):CitationEvidence[]{
 const seen=new Set<string>(); const out:CitationEvidence[]=[];
 for(const item of items){const field=item.field.trim(),sourceUrl=item.sourceUrl.trim(),observedAt=item.observedAt.trim(); if(!field||!sourceUrl||!observedAt) continue; const key=`${field.toLowerCase()}|${sourceUrl}`; if(seen.has(key)) continue; seen.add(key); out.push({...item,field,sourceUrl,observedAt});}
 return out;
}
