export type PersonalizationReadiness={ready:boolean;missing:string[];outreachAuthorized:false};
export function evaluatePersonalizationReadiness(input:{businessName:boolean;verifiedObservation:boolean;verifiedService:boolean;verifiedLocation:boolean;evidenceSource:boolean}):PersonalizationReadiness{
 const missing:string[]=[];
 if(!input.businessName) missing.push('businessName');
 if(!input.verifiedObservation) missing.push('verifiedObservation');
 if(!input.verifiedService) missing.push('verifiedService');
 if(!input.verifiedLocation) missing.push('verifiedLocation');
 if(!input.evidenceSource) missing.push('evidenceSource');
 return {ready:missing.length===0,missing,outreachAuthorized:false};
}
