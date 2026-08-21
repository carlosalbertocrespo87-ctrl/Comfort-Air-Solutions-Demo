export type ReplyIntent='INTERESTED'|'QUESTION'|'OBJECTION'|'NOT_NOW'|'NOT_INTERESTED'|'UNKNOWN';
export interface ReplyRecord{intent:ReplyIntent;ownerId?:string|null;nextAction?:string|null;dueAt?:string|null;}
export function replyNeedsAttention(x:ReplyRecord):boolean{return !x.ownerId?.trim()||!x.nextAction?.trim()||!x.dueAt?.trim()||x.intent==='UNKNOWN';}
export function canAutoSendReply():boolean{return false;}
