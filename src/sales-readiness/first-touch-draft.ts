export type FirstTouchDraft={channel:'EMAIL'|'POSTAL'|'CALL_OPENER';subject?:string;body:string;sendAuthorized:false};
export function prepareFirstTouchDraft(input:{channel:'EMAIL'|'POSTAL'|'CALL_OPENER';businessName:string;verifiedObservation:string;valueHypothesis:string}):FirstTouchDraft{
 const name=input.businessName.trim(); const observation=input.verifiedObservation.trim(); const value=input.valueHypothesis.trim();
 const body=`Hi ${name} — I noticed ${observation}. We prepared a short example of how Local Lead Forge could help ${value}. This is a draft for human review only.`;
 return {channel:input.channel,subject:input.channel==='EMAIL'?`Idea prepared for ${name}`:undefined,body,sendAuthorized:false};
}
