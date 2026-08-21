const normalize=(value?:string)=>value?.trim().toLowerCase().replace(/[^a-z0-9]/g,'')||'';
export function prospectDedupeKey(input:{businessName:string;phone?:string;website?:string}):string{
 const phone=normalize(input.phone);
 const website=normalize(input.website?.replace(/^https?:\/\//,'').replace(/^www\./,''));
 const name=normalize(input.businessName);
 if(phone) return `phone:${phone}`;
 if(website) return `web:${website}`;
 return `name:${name}`;
}
