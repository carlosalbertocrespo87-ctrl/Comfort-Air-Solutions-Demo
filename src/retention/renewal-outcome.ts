export type RenewalOutcome='NOT_DUE'|'DUE'|'REVIEW_REQUIRED'|'RENEWED'|'DECLINED'|'EXPIRED';
export function evaluateRenewalOutcome(input:{due:boolean;renewed:boolean;declined:boolean;expired:boolean}):RenewalOutcome{
 if(input.renewed) return 'RENEWED';
 if(input.declined) return 'DECLINED';
 if(input.expired) return 'EXPIRED';
 if(input.due) return 'REVIEW_REQUIRED';
 return 'NOT_DUE';
}
