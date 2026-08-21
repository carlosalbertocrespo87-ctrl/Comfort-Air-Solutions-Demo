export type ChannelReadiness={email:boolean;phone:boolean;postal:boolean;readyChannels:string[];outreachAuthorized:false};
export function evaluateChannelReadiness(input:{publicEmail?:string;publicPhone?:string;publicPostalAddress?:string}):ChannelReadiness{
 const email=Boolean(input.publicEmail?.trim()); const phone=Boolean(input.publicPhone?.trim()); const postal=Boolean(input.publicPostalAddress?.trim());
 const readyChannels=[email?'EMAIL':'',phone?'PHONE':'',postal?'POSTAL':''].filter(Boolean);
 return {email,phone,postal,readyChannels,outreachAuthorized:false};
}
