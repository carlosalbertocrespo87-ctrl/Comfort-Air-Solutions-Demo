export type AdapterReadiness={ready:boolean;missing:string[];liveWritesEnabled:false};
export function evaluateAdapterReadiness(input:{tenantScoped:boolean;authSeparated:boolean;idempotencyDefined:boolean;readCapabilitiesDefined:boolean;writeCapabilitiesDefined:boolean;errorMappingDefined:boolean;auditDefined:boolean}):AdapterReadiness{
 const missing:string[]=[];
 Object.entries(input).forEach(([k,v])=>{if(!v) missing.push(k)});
 return {ready:missing.length===0,missing,liveWritesEnabled:false};
}
