export type ReviewResponseDraft={draft:string;requiresHumanDelivery:true;externalActionAuthorized:false};
export function prepareReviewResponse(input:{customerName?:string;reviewSummary:string;issueUnresolved:boolean}):ReviewResponseDraft{
 const name=input.customerName?.trim()?` ${input.customerName.trim()}`:'';
 const base=input.issueUnresolved?'Thank you for the feedback. We would like to understand the concern and follow up directly.':'Thank you for sharing your feedback. We appreciate you taking the time to tell us about your experience.';
 return {draft:`Hello${name}. ${base}`,requiresHumanDelivery:true,externalActionAuthorized:false};
}
