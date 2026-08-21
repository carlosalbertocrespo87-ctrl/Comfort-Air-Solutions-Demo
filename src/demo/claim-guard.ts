export type ClaimDecision={allowed:boolean;reason:string;evidenceUrl?:string};
export function evaluateClaim(input:{claim:string;evidenceUrl?:string;blocked?:boolean}):ClaimDecision{
 const claim=input.claim.trim();
 if(!claim) return {allowed:false,reason:'Empty claim.'};
 if(input.blocked) return {allowed:false,reason:'Claim is explicitly blocked.'};
 if(!input.evidenceUrl?.trim()) return {allowed:false,reason:'No public evidence source supports this claim.'};
 return {allowed:true,reason:'Claim has a recorded evidence source.',evidenceUrl:input.evidenceUrl.trim()};
}
