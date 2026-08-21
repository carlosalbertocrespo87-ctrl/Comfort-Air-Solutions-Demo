export type ReactivationHandoff={eligible:boolean;reason:string;requiresHumanApproval:true;externalActionAuthorized:false};
export function prepareReactivationHandoff(input:{closed:boolean;daysSinceLastActivity:number;consentKnown:boolean;doNotContact:boolean;unresolvedComplaint:boolean}):ReactivationHandoff{
 if(!input.closed) return {eligible:false,reason:'Lead is not in a closed state.',requiresHumanApproval:true,externalActionAuthorized:false};
 if(input.daysSinceLastActivity<30) return {eligible:false,reason:'Lead is not old enough for reactivation review.',requiresHumanApproval:true,externalActionAuthorized:false};
 if(!input.consentKnown) return {eligible:false,reason:'Consent status is unknown.',requiresHumanApproval:true,externalActionAuthorized:false};
 if(input.doNotContact) return {eligible:false,reason:'Do-not-contact is set.',requiresHumanApproval:true,externalActionAuthorized:false};
 if(input.unresolvedComplaint) return {eligible:false,reason:'Unresolved complaint blocks reactivation.',requiresHumanApproval:true,externalActionAuthorized:false};
 return {eligible:true,reason:'Candidate may be reviewed for reactivation.',requiresHumanApproval:true,externalActionAuthorized:false};
}
