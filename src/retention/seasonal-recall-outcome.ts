export type RecallOutcome='NOT_DUE'|'DUE'|'HUMAN_REVIEW'|'COMPLETED'|'DECLINED'|'SUPPRESSED';
export function evaluateRecallOutcome(input:{due:boolean;completed:boolean;declined:boolean;suppressed:boolean}):RecallOutcome{
 if(input.suppressed) return 'SUPPRESSED';
 if(input.completed) return 'COMPLETED';
 if(input.declined) return 'DECLINED';
 if(input.due) return 'HUMAN_REVIEW';
 return 'NOT_DUE';
}
