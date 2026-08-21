export type LocalProfileFact={field:string;value:string;evidenceUrl:string;verified:boolean};
export type LocalProfile={businessName:string;facts:LocalProfileFact[];externalMutationAuthorized:false};
export function buildLocalProfile(input:{businessName:string;facts:LocalProfileFact[]}):LocalProfile{
 const businessName=input.businessName.trim();
 if(!businessName) throw new Error('businessName is required');
 const facts=input.facts.filter(f=>f.field.trim()&&f.value.trim()&&f.evidenceUrl.trim()).map(f=>({...f,field:f.field.trim(),value:f.value.trim(),evidenceUrl:f.evidenceUrl.trim()}));
 return {businessName,facts,externalMutationAuthorized:false};
}
