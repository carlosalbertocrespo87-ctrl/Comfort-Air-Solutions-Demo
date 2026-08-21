export type PersonalizationPlan={headlineInputs:string[];serviceInputs:string[];locationInputs:string[];blockedAssumptions:string[];requiresHumanReview:true};
export function buildPersonalizationPlan(input:{verifiedServices:string[];verifiedLocations:string[];verifiedDifferentiators:string[];unverifiedIdeas:string[]}):PersonalizationPlan{
 const clean=(v:string[])=>[...new Set(v.map(x=>x.trim()).filter(Boolean))];
 return {headlineInputs:clean(input.verifiedDifferentiators),serviceInputs:clean(input.verifiedServices),locationInputs:clean(input.verifiedLocations),blockedAssumptions:clean(input.unverifiedIdeas),requiresHumanReview:true};
}
