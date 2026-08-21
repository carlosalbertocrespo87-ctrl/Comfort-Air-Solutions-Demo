export type ReviewReadiness={ready:boolean;blockers:string[];reviewGatingAllowed:false;communicationAuthorized:false};
export function evaluateReviewReadiness(input:{jobComplete:boolean;customerEligible:boolean;doNotContact:boolean;incentiveOffered:boolean;sentimentFiltered:boolean}):ReviewReadiness{
 const blockers:string[]=[];
 if(!input.jobComplete) blockers.push('Job completion is not confirmed.');
 if(!input.customerEligible) blockers.push('Customer review eligibility is not confirmed.');
 if(input.doNotContact) blockers.push('Do-not-contact constraint is active.');
 if(input.incentiveOffered) blockers.push('Incentivized review flow is not allowed by this policy.');
 if(input.sentimentFiltered) blockers.push('Sentiment-based review gating is not allowed.');
 return {ready:blockers.length===0,blockers,reviewGatingAllowed:false,communicationAuthorized:false};
}
