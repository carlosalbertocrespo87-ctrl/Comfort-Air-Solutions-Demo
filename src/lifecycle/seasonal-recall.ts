export type SeasonalRecallDecision={eligible:boolean;communicationAuthorized:false;reason:string};
export function evaluateSeasonalRecall(input:{serviceEligible:boolean;seasonWindowOpen:boolean;doNotContact:boolean;recentServiceDays?:number}):SeasonalRecallDecision{
 if(!input.serviceEligible) return {eligible:false,communicationAuthorized:false,reason:'Customer/service is not eligible.'};
 if(!input.seasonWindowOpen) return {eligible:false,communicationAuthorized:false,reason:'Seasonal window is not open.'};
 if(input.doNotContact) return {eligible:false,communicationAuthorized:false,reason:'Do-not-contact flag is set.'};
 if(typeof input.recentServiceDays==='number' && input.recentServiceDays < 30) return {eligible:false,communicationAuthorized:false,reason:'Recent service suppresses recall.'};
 return {eligible:true,communicationAuthorized:false,reason:'Eligible for a human-reviewed seasonal recall workflow.'};
}
