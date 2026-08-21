export type HoursReadiness={ready:boolean;warnings:string[];externalChangeAuthorized:false};
export function evaluateHoursReadiness(input:{hoursKnown:boolean;evidenceUrl?:string;freshnessKnown:boolean}):HoursReadiness{
 const warnings:string[]=[];
 if(!input.hoursKnown) warnings.push('Business hours are not verified.');
 if(!input.evidenceUrl?.trim()) warnings.push('Business-hours evidence source is missing.');
 if(!input.freshnessKnown) warnings.push('Business-hours freshness is unknown.');
 return {ready:warnings.length===0,warnings,externalChangeAuthorized:false};
}
