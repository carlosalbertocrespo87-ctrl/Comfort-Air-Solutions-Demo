export function evaluateAddressLegalReadiness(input:{businessAddressApproved:boolean;allowedUseVerified:boolean;entityDecisionRecorded:boolean;requiredDocsReady:boolean}){
 const blockers:string[]=[];
 if(!input.businessAddressApproved) blockers.push('Business address approval evidence is missing.');
 if(!input.allowedUseVerified) blockers.push('Permitted address usage is not verified.');
 if(!input.entityDecisionRecorded) blockers.push('Business entity decision is not recorded.');
 if(!input.requiredDocsReady) blockers.push('Required business documents are incomplete.');
 return {ready:blockers.length===0,blockers,legalActionAuthorized:false as const,addressChangeAuthorized:false as const};
}
