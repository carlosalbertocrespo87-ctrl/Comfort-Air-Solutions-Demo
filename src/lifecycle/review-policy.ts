export type ReviewPolicyDecision={requestEligible:boolean;communicationAuthorized:false;reason:string};
/** Review eligibility must not depend on sentiment/rating. */
export function evaluateReviewRequest(input:{jobCompleted:boolean;reviewAlreadyRequested:boolean;doNotContact:boolean}):ReviewPolicyDecision{
 if(!input.jobCompleted) return {requestEligible:false,communicationAuthorized:false,reason:'Job is not completed.'};
 if(input.reviewAlreadyRequested) return {requestEligible:false,communicationAuthorized:false,reason:'Review was already requested.'};
 if(input.doNotContact) return {requestEligible:false,communicationAuthorized:false,reason:'Do-not-contact flag is set.'};
 return {requestEligible:true,communicationAuthorized:false,reason:'Eligible for a neutral review request after approved communication gate.'};
}
