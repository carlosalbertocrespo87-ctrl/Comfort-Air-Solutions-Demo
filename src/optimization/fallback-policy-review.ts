export type FallbackReview={safe:boolean;reason:string};
export function reviewFallback(input:{fallbackAllowed:boolean;sameTenant:boolean;policyCompatible:boolean;withinBudget:boolean}):FallbackReview{
 if(!input.fallbackAllowed) return {safe:false,reason:'Fallback is disabled by policy.'};
 if(!input.sameTenant) return {safe:false,reason:'Fallback cannot cross tenant boundaries.'};
 if(!input.policyCompatible) return {safe:false,reason:'Fallback candidate does not satisfy policy requirements.'};
 if(!input.withinBudget) return {safe:false,reason:'Fallback candidate exceeds approved budget.'};
 return {safe:true,reason:'Fallback remains within tenant, policy and budget boundaries.'};
}
