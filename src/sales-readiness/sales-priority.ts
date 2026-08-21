export type SalesPriority={priority:1|2|3;reason:string;externalActionAuthorized:false};
export function prioritizeSalesProspect(input:{icpScore:number;evidenceConfidence:'HIGH'|'MEDIUM'|'LOW'|'UNVERIFIED';demoReady:boolean;doNotContact:boolean}):SalesPriority{
 if(input.doNotContact) return {priority:3,reason:'Do-not-contact constraint blocks outreach preparation.',externalActionAuthorized:false};
 if(input.evidenceConfidence==='LOW'||input.evidenceConfidence==='UNVERIFIED') return {priority:3,reason:'Research evidence is insufficient.',externalActionAuthorized:false};
 if(input.icpScore>=75&&input.demoReady) return {priority:1,reason:'Strong ICP fit with internal demo readiness.',externalActionAuthorized:false};
 if(input.icpScore>=50) return {priority:2,reason:'Moderate ICP fit; prepare additional evidence before outreach.',externalActionAuthorized:false};
 return {priority:3,reason:'Low current ICP fit.',externalActionAuthorized:false};
}
