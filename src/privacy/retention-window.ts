export type RetentionClass='LEAD'|'CUSTOMER'|'AUDIT'|'SYNTHETIC';
export type RetentionDecision={retain:boolean;reason:string;maxDays:number};
const defaults:Record<RetentionClass,number>={LEAD:365,CUSTOMER:730,AUDIT:2555,SYNTHETIC:30};
export function evaluateRetention(input:{kind:RetentionClass;ageDays:number;legalHold?:boolean}):RetentionDecision{
 if(input.legalHold) return {retain:true,reason:'Legal hold requires retention.',maxDays:defaults[input.kind]};
 const maxDays=defaults[input.kind];
 return {retain:input.ageDays<=maxDays,reason:input.ageDays<=maxDays?'Within retention window.':'Retention window expired.',maxDays};
}
