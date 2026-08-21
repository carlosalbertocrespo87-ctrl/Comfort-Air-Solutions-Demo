export type MissedCallRecovery={eligible:boolean;reason:string;communicationAuthorized:false};
export function evaluateMissedCallRecovery(input:{missed:boolean;knownCaller:boolean;consentKnown:boolean;doNotContact:boolean;resolved:boolean}):MissedCallRecovery{
 if(!input.missed) return {eligible:false,reason:'No missed call event.',communicationAuthorized:false};
 if(input.doNotContact) return {eligible:false,reason:'Do-not-contact constraint.',communicationAuthorized:false};
 if(input.resolved) return {eligible:false,reason:'Inquiry already resolved.',communicationAuthorized:false};
 if(!input.knownCaller||!input.consentKnown) return {eligible:false,reason:'Caller identity/consent evidence incomplete.',communicationAuthorized:false};
 return {eligible:true,reason:'Candidate for human-approved recovery workflow.',communicationAuthorized:false};
}
