export type SalesClaimDecision={allowed:boolean;reason:string;requiresHumanReview:boolean};
const prohibited=[/guaranteed\s+(leads|revenue|sales|rankings|appointments)/i,/number\s*1/i,/best\s+hvac/i,/we\s+will\s+get\s+you/i];
export function evaluateSalesClaim(input:{claim:string;evidenceUrl?:string}):SalesClaimDecision{
 const claim=input.claim.trim(); if(!claim) return {allowed:false,reason:'Empty claim.',requiresHumanReview:false};
 if(prohibited.some(p=>p.test(claim))) return {allowed:false,reason:'Claim uses prohibited guarantee/superlative language.',requiresHumanReview:true};
 if(!input.evidenceUrl?.trim()) return {allowed:false,reason:'No evidence source supports this factual claim.',requiresHumanReview:true};
 return {allowed:true,reason:'Evidence source recorded; human review still required before external use.',requiresHumanReview:true};
}
