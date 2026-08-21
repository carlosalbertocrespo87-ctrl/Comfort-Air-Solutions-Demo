export type ReplyIntent='INTERESTED'|'QUESTION'|'NOT_NOW'|'OPT_OUT'|'WRONG_PARTY'|'UNKNOWN';
export function classifyReplyIntent(text:string):{intent:ReplyIntent;requiresHumanReview:true}{
 const value=text.trim().toLowerCase(); let intent:ReplyIntent='UNKNOWN';
 if(/unsubscribe|stop|remove me|no me contacte|baja/.test(value)) intent='OPT_OUT';
 else if(/wrong person|not the owner|persona equivocada/.test(value)) intent='WRONG_PARTY';
 else if(/later|not now|más adelante|ahora no/.test(value)) intent='NOT_NOW';
 else if(/interested|tell me more|demo|me interesa|más información/.test(value)) intent='INTERESTED';
 else if(value.includes('?')) intent='QUESTION';
 return {intent,requiresHumanReview:true};
}
