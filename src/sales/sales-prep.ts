export type SalesPrepBrief={businessName:string;observations:string[];opportunities:string[];questions:string[];prohibitedClaims:string[];outreachAuthorized:false};
export function buildSalesPrep(input:{businessName:string;observations:string[];opportunities:string[]}):SalesPrepBrief{
 const observations=clean(input.observations); const opportunities=clean(input.opportunities);
 return {businessName:input.businessName.trim(),observations,opportunities,questions:['Which lead sources matter most today?','How quickly are new inquiries normally contacted?','What happens to missed calls or unclosed estimates?'],prohibitedClaims:['Guaranteed leads','Guaranteed revenue','Guaranteed rankings','Unverified competitor comparisons'],outreachAuthorized:false};
}
function clean(v:string[]){return [...new Set(v.map(x=>x.trim()).filter(Boolean))];}
