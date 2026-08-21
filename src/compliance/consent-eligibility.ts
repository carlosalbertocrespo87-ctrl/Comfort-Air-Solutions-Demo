export type Channel='EMAIL'|'SMS'|'CALL';
export type ConsentDecision={eligible:boolean;reason:string;communicationAuthorized:false};
export function evaluateConsent(input:{channel:Channel;consentKnown:boolean;consentGranted:boolean;doNotContact:boolean;clientAuthorized:boolean}):ConsentDecision{
 if(input.doNotContact) return {eligible:false,reason:'Do-not-contact flag is set.',communicationAuthorized:false};
 if(!input.consentKnown) return {eligible:false,reason:'Consent status is unknown.',communicationAuthorized:false};
 if(!input.consentGranted) return {eligible:false,reason:'Consent is not granted.',communicationAuthorized:false};
 if(!input.clientAuthorized) return {eligible:false,reason:'Client has not authorized this communication workflow.',communicationAuthorized:false};
 return {eligible:true,reason:'Eligible for later release-gated communication.',communicationAuthorized:false};
}
