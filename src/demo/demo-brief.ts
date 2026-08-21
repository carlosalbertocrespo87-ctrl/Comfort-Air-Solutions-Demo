export type DemoBrief={businessName:string;services:string[];serviceAreas:string[];publicPhone?:string;brandNotes:string[];claimsAllowed:string[];claimsBlocked:string[];sourceUrls:string[];publishAuthorized:false};
export function buildDemoBrief(input:Omit<DemoBrief,'publishAuthorized'>):DemoBrief{
 if(!input.businessName.trim()) throw new Error('businessName is required');
 if(!input.sourceUrls.length) throw new Error('At least one evidence source is required');
 return {...input,businessName:input.businessName.trim(),services:unique(input.services),serviceAreas:unique(input.serviceAreas),claimsAllowed:unique(input.claimsAllowed),claimsBlocked:unique(input.claimsBlocked),sourceUrls:unique(input.sourceUrls),publishAuthorized:false};
}
function unique(values:string[]){return [...new Set(values.map(v=>v.trim()).filter(Boolean))];}
