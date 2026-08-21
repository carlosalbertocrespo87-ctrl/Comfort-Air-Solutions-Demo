export type ProfileCompleteness={score:number;missing:string[];guaranteesRanking:false};
export function scoreProfileCompleteness(input:{name:boolean;phone:boolean;website:boolean;hours:boolean;services:boolean;serviceAreas:boolean;description:boolean}):ProfileCompleteness{
 const checks=Object.entries(input); const missing=checks.filter(([,ok])=>!ok).map(([k])=>k);
 const score=Math.round(((checks.length-missing.length)/checks.length)*100);
 return {score,missing,guaranteesRanking:false};
}
