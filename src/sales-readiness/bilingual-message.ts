export type BilingualDraft={locale:'en-US'|'es-US';text:string;sendAuthorized:false};
export function prepareBilingualDraft(input:{locale:'en-US'|'es-US';businessName:string;verifiedObservation:string;valueHypothesis:string}):BilingualDraft{
 const name=input.businessName.trim(); const observation=input.verifiedObservation.trim(); const value=input.valueHypothesis.trim();
 const text=input.locale==='es-US'?`Hola ${name}. Notamos ${observation}. Preparamos un ejemplo breve de cómo Local Lead Forge podría ayudar a ${value}. Borrador sujeto a revisión humana.`:`Hi ${name}. We noticed ${observation}. We prepared a short example of how Local Lead Forge could help ${value}. Draft for human review.`;
 return {locale:input.locale,text,sendAuthorized:false};
}
