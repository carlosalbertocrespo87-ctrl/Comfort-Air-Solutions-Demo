export type FollowUpEligibility={eligible:boolean;reason:string;communicationAuthorized:false};
export function evaluateFollowUp(input:{stage:'NEW'|'CONTACTED'|'QUALIFIED'|'APPOINTMENT'|'WON'|'LOST';lastContactHours?:number;consentKnown:boolean;doNotContact:boolean;openComplaint:boolean}):FollowUpEligibility{
 if(input.doNotContact) return {eligible:false,reason:'Do-not-contact constraint.',communicationAuthorized:false};
 if(input.openComplaint) return {eligible:false,reason:'Open complaint requires human resolution before follow-up.',communicationAuthorized:false};
 if(!input.consentKnown) return {eligible:false,reason:'Consent status is unknown.',communicationAuthorized:false};
 if(input.stage==='WON'||input.stage==='LOST') return {eligible:false,reason:'Closed stage is not eligible for this follow-up workflow.',communicationAuthorized:false};
 if((input.lastContactHours??999)<4) return {eligible:false,reason:'Recent contact; avoid duplicate follow-up.',communicationAuthorized:false};
 return {eligible:true,reason:'Candidate for human-approved follow-up.',communicationAuthorized:false};
}
