export type SalesAngle={headline:string;supportingPoints:string[];blockedClaims:string[];requiresHumanReview:true};
export function buildSalesAngle(input:{businessName:string;verifiedOpportunities:string[];verifiedStrengths:string[];unverifiedClaims:string[]}):SalesAngle{
 const opportunities=input.verifiedOpportunities.map(v=>v.trim()).filter(Boolean);
 const strengths=input.verifiedStrengths.map(v=>v.trim()).filter(Boolean);
 return {headline:`Prepared opportunity brief for ${input.businessName.trim()}`,supportingPoints:[...strengths,...opportunities],blockedClaims:input.unverifiedClaims.map(v=>v.trim()).filter(Boolean),requiresHumanReview:true};
}
