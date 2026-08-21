export type FollowUpAction='PREPARE_RESPONSE'|'SCHEDULE_HUMAN_REVIEW'|'SUPPRESS'|'DEFER'|'RESEARCH_MORE';
export function recommendFollowUp(input:{intent:'INTERESTED'|'QUESTION'|'NOT_NOW'|'OPT_OUT'|'WRONG_PARTY'|'UNKNOWN';evidenceComplete:boolean}):{action:FollowUpAction;reason:string;externalActionAuthorized:false}{
 if(input.intent==='OPT_OUT'||input.intent==='WRONG_PARTY') return {action:'SUPPRESS',reason:'Do not continue outreach to this contact.',externalActionAuthorized:false};
 if(input.intent==='NOT_NOW') return {action:'DEFER',reason:'Respect timing and defer for human-reviewed follow-up.',externalActionAuthorized:false};
 if(input.intent==='INTERESTED'||input.intent==='QUESTION') return {action:'SCHEDULE_HUMAN_REVIEW',reason:'Positive/question reply should be reviewed before response.',externalActionAuthorized:false};
 if(!input.evidenceComplete) return {action:'RESEARCH_MORE',reason:'Insufficient evidence for a personalized response.',externalActionAuthorized:false};
 return {action:'PREPARE_RESPONSE',reason:'Prepare a draft without sending it.',externalActionAuthorized:false};
}
