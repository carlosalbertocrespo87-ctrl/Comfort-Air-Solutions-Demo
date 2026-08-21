export type RenewalDecision={eligible:boolean;communicationAuthorized:false;reason:string};
export function evaluateRenewal(input:{activePlan:boolean;renewalDue:boolean;doNotContact:boolean}):RenewalDecision{
 if(!input.activePlan) return {eligible:false,communicationAuthorized:false,reason:'No active maintenance plan.'};
 if(!input.renewalDue) return {eligible:false,communicationAuthorized:false,reason:'Renewal is not due.'};
 if(input.doNotContact) return {eligible:false,communicationAuthorized:false,reason:'Do-not-contact flag is set.'};
 return {eligible:true,communicationAuthorized:false,reason:'Eligible for human-reviewed renewal workflow.'};
}
