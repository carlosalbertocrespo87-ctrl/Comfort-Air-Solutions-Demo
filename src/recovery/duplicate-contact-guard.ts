export type DuplicateContactDecision={blocked:boolean;reason:string};
export function evaluateDuplicateContact(input:{lastAttemptMinutes?:number;lastOutcome?:'CONNECTED'|'NO_ANSWER'|'VOICEMAIL'|'BOUNCED'|'UNKNOWN';minimumGapMinutes:number}):DuplicateContactDecision{
 if(input.lastAttemptMinutes===undefined) return {blocked:false,reason:'No prior contact attempt recorded.'};
 if(input.lastOutcome==='CONNECTED') return {blocked:true,reason:'Lead was already reached; avoid duplicate recovery contact.'};
 if(input.lastAttemptMinutes<input.minimumGapMinutes) return {blocked:true,reason:'Minimum gap between recovery attempts has not elapsed.'};
 return {blocked:false,reason:'No duplicate-contact block detected.'};
}
