export type ContactSuppression={blocked:boolean;reasons:string[];externalActionAuthorized:false};
export function evaluateContactSuppression(input:{doNotContact:boolean;optedOut:boolean;unresolvedComplaint:boolean;wrongParty:boolean;contactEvidence:boolean}):ContactSuppression{
 const reasons:string[]=[];
 if(input.doNotContact) reasons.push('Do-not-contact flag is set.');
 if(input.optedOut) reasons.push('Opt-out is recorded.');
 if(input.unresolvedComplaint) reasons.push('Unresolved complaint requires human review.');
 if(input.wrongParty) reasons.push('Contact appears to be the wrong party.');
 if(!input.contactEvidence) reasons.push('Contact channel lacks public/authorized evidence.');
 return {blocked:reasons.length>0,reasons,externalActionAuthorized:false};
}
