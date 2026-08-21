export type ProspectProfile={businessName:string;website?:string;phone?:string;services:string[];serviceAreas:string[];evidenceUrls:string[];externalActionsAuthorized:false};
export function normalizeProspect(input:{businessName:string;website?:string;phone?:string;services?:string[];serviceAreas?:string[];evidenceUrls?:string[]}):ProspectProfile{
 const clean=(v?:string)=>v?.trim()||undefined;
 const uniq=(v:string[]=[])=>[...new Set(v.map(x=>x.trim()).filter(Boolean))];
 const businessName=input.businessName.trim(); if(!businessName) throw new Error('businessName is required');
 return {businessName,website:clean(input.website),phone:clean(input.phone),services:uniq(input.services),serviceAreas:uniq(input.serviceAreas),evidenceUrls:uniq(input.evidenceUrls),externalActionsAuthorized:false};
}
