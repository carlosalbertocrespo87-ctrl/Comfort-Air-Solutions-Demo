export type NextBestAction='RESEARCH_MORE'|'PREPARE_DEMO'|'HUMAN_REVIEW'|'DEFER';
export function chooseNextBestAction(input:{evidenceConfidence:'HIGH'|'MEDIUM'|'LOW'|'UNVERIFIED';blockingResearchGaps:number;demoQaPass?:boolean;doNotContact?:boolean}):{action:NextBestAction;reason:string;externalActionAuthorized:false}{
 if(input.doNotContact) return {action:'DEFER',reason:'Do-not-contact constraint prevents outreach workflow.',externalActionAuthorized:false};
 if(input.evidenceConfidence==='UNVERIFIED'||input.evidenceConfidence==='LOW'||input.blockingResearchGaps>0) return {action:'RESEARCH_MORE',reason:'Evidence is not strong enough for reliable personalization.',externalActionAuthorized:false};
 if(input.demoQaPass===false) return {action:'HUMAN_REVIEW',reason:'Demo has QA failures requiring review.',externalActionAuthorized:false};
 return {action:'PREPARE_DEMO',reason:'Evidence is sufficient for internal demo preparation.',externalActionAuthorized:false};
}
