export type EvidenceItem={gate:string;required:boolean;evidenceUrl?:string;note?:string};
export function evaluateEvidenceCompleteness(items:EvidenceItem[]){
 const missing=items.filter(i=>i.required&&!i.evidenceUrl?.trim()).map(i=>i.gate);
 return {complete:missing.length===0,missing,requiresHumanReview:missing.length>0};
}
