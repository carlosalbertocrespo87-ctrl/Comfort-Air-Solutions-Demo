export type NapRecord={source:string;name?:string;address?:string;phone?:string};
export type NapConsistency={consistent:boolean;conflicts:string[];requiresHumanReview:boolean};
const norm=(v?:string)=>(v??'').trim().toLowerCase().replace(/[^a-z0-9]/g,'');
export function checkNapConsistency(records:NapRecord[]):NapConsistency{
 const conflicts:string[]=[]; const fields:(keyof Pick<NapRecord,'name'|'address'|'phone'>)[]=['name','address','phone'];
 for(const field of fields){const values=[...new Set(records.map(r=>norm(r[field])).filter(Boolean))]; if(values.length>1) conflicts.push(`${field} differs across public sources.`);}
 return {consistent:conflicts.length===0,conflicts,requiresHumanReview:conflicts.length>0};
}
