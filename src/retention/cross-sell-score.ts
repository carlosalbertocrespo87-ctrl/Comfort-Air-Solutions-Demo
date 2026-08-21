export type CrossSellScore={score:number;eligible:boolean;reason:string;pricingAuthorized:false};
export function scoreCrossSell(input:{approvedService:boolean;completedJob:boolean;relatedNeedEvidence:boolean;doNotContact:boolean}):CrossSellScore{
 if(input.doNotContact) return {score:0,eligible:false,reason:'Do-not-contact suppresses communication workflow.',pricingAuthorized:false};
 let score=0;
 if(input.approvedService) score+=40;
 if(input.completedJob) score+=25;
 if(input.relatedNeedEvidence) score+=35;
 return {score,eligible:score>=65,reason:score>=65?'Evidence supports internal cross-sell review.':'Insufficient evidence for recommendation.',pricingAuthorized:false};
}
