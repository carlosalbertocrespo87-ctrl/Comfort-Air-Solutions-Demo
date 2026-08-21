export type ReactivationDecision = { eligible: boolean; communicationAuthorized: false; reasons: string[] };
export function evaluateReactivation(input:{leadClosed:boolean; consentKnown:boolean; doNotContact:boolean; daysSinceActivity:number; unresolvedComplaint?:boolean}):ReactivationDecision{
 const reasons:string[]=[];
 if(!input.leadClosed) reasons.push('Lead is still active.');
 if(!input.consentKnown) reasons.push('Consent/communication basis is not established.');
 if(input.doNotContact) reasons.push('Do-not-contact flag is set.');
 if(input.daysSinceActivity < 30) reasons.push('Lead is not old enough for reactivation review.');
 if(input.unresolvedComplaint) reasons.push('Unresolved complaint requires human review.');
 return {eligible:reasons.length===0,communicationAuthorized:false,reasons};
}
