export type ServiceAreaReadiness={ready:boolean;verifiedAreas:string[];unverifiedAreas:string[];publishAuthorized:false};
export function evaluateServiceAreas(input:{areas:string[];evidenceByArea:Record<string,string|undefined>}):ServiceAreaReadiness{
 const verifiedAreas:string[]=[],unverifiedAreas:string[]=[];
 for(const area of [...new Set(input.areas.map(v=>v.trim()).filter(Boolean))]){if(input.evidenceByArea[area]?.trim()) verifiedAreas.push(area); else unverifiedAreas.push(area);}
 return {ready:verifiedAreas.length>0&&unverifiedAreas.length===0,verifiedAreas,unverifiedAreas,publishAuthorized:false};
}
