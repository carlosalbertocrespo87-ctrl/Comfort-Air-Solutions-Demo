export type SchemaEntityReadiness={ready:boolean;missing:string[];warnings:string[];publishAuthorized:false};
export function evaluateSchemaEntity(input:{name:boolean;url:boolean;phone:boolean;addressOrServiceArea:boolean;services:boolean;evidenceMapped:boolean}):SchemaEntityReadiness{
 const missing:string[]=[],warnings:string[]=[];
 if(!input.name) missing.push('name');
 if(!input.url) missing.push('url');
 if(!input.phone) missing.push('phone');
 if(!input.addressOrServiceArea) missing.push('address/serviceArea');
 if(!input.services) warnings.push('Service/entity relationships are incomplete.');
 if(!input.evidenceMapped) missing.push('evidence mapping');
 return {ready:missing.length===0,missing,warnings,publishAuthorized:false};
}
