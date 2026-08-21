export type ContactChannel='PHONE'|'SMS'|'EMAIL'|'OTHER';
export type ContactAttempt={leadId:string;channel:ContactChannel;attemptedAt:string;outcome:'NO_ANSWER'|'CONNECTED'|'VOICEMAIL'|'BOUNCED'|'UNKNOWN';externalWriteAuthorized:false};
export function recordInternalContactAttempt(input:Omit<ContactAttempt,'externalWriteAuthorized'>):ContactAttempt{
 return {...input,externalWriteAuthorized:false};
}
