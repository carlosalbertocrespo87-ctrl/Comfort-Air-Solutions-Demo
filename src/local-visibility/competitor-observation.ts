export type CompetitorObservation={businessName:string;sourceUrl:string;observedPatterns:string[];copiedContent:false;requiresHumanInterpretation:true};
export function buildCompetitorObservation(input:{businessName:string;sourceUrl:string;observedPatterns:string[]}):CompetitorObservation{
 const businessName=input.businessName.trim(),sourceUrl=input.sourceUrl.trim(); if(!businessName||!sourceUrl) throw new Error('businessName and sourceUrl are required');
 return {businessName,sourceUrl,observedPatterns:[...new Set(input.observedPatterns.map(v=>v.trim()).filter(Boolean))],copiedContent:false,requiresHumanInterpretation:true};
}
