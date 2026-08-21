export type ConsistencyResult={pass:boolean;mismatches:string[];publishAuthorized:false};
export function checkProspectDemoConsistency(input:{verifiedBusinessName:string;demoBusinessName:string;verifiedServices:string[];demoServices:string[];verifiedLocations:string[];demoLocations:string[]}):ConsistencyResult{
 const mismatches:string[]=[];
 const norm=(v:string)=>v.trim().toLowerCase();
 if(norm(input.verifiedBusinessName)!==norm(input.demoBusinessName)) mismatches.push('Business name does not match verified prospect data.');
 const allowedServices=new Set(input.verifiedServices.map(norm));
 input.demoServices.filter(s=>!allowedServices.has(norm(s))).forEach(s=>mismatches.push(`Unverified demo service: ${s}`));
 const allowedLocations=new Set(input.verifiedLocations.map(norm));
 input.demoLocations.filter(s=>!allowedLocations.has(norm(s))).forEach(s=>mismatches.push(`Unverified demo location: ${s}`));
 return {pass:mismatches.length===0,mismatches,publishAuthorized:false};
}
