export function evaluateCommercialHandoff(input:{scopeConfirmed:boolean;priceEvidenceRecorded:boolean;contactVerified:boolean;deliveryOwnerKnown:boolean;exceptionsOpen:number}){
 const blockers:string[]=[];
 if(!input.scopeConfirmed) blockers.push('Scope is not confirmed.');
 if(!input.priceEvidenceRecorded) blockers.push('Price evidence is missing.');
 if(!input.contactVerified) blockers.push('Primary contact is unverified.');
 if(!input.deliveryOwnerKnown) blockers.push('Delivery owner is not assigned.');
 if(input.exceptionsOpen>0) blockers.push('Open handoff exceptions remain.');
 return {ready:blockers.length===0,blockers,customerActivationAuthorized:false as const};
}
