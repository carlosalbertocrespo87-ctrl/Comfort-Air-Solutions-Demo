export type ReviewOutcome='NOT_REQUESTED'|'REQUESTED'|'RESPONDED'|'PUBLISHED'|'DECLINED'|'UNKNOWN';
export type ReviewOutcomeRecord={outcome:ReviewOutcome;publishedUrl?:string;verified:boolean};
export function recordReviewOutcome(input:{outcome:ReviewOutcome;publishedUrl?:string}):ReviewOutcomeRecord{
 const verified=input.outcome!=='PUBLISHED' || Boolean(input.publishedUrl?.trim());
 return {outcome:input.outcome,publishedUrl:input.publishedUrl?.trim()||undefined,verified};
}
