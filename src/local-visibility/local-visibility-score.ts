export type LocalVisibilityScore={score:number;grade:'A'|'B'|'C';evidenceOnly:true;guaranteesRanking:false};
export function scoreLocalVisibility(input:{profile:number;nap:number;services:number;localPages:number;schema:number;reviews:number}):LocalVisibilityScore{
 const clamp=(v:number)=>Math.max(0,Math.min(100,v));
 const score=Math.round(clamp(input.profile)*0.2+clamp(input.nap)*0.2+clamp(input.services)*0.2+clamp(input.localPages)*0.15+clamp(input.schema)*0.15+clamp(input.reviews)*0.1);
 const grade:LocalVisibilityScore['grade']=score>=80?'A':score>=60?'B':'C';
 return {score,grade,evidenceOnly:true,guaranteesRanking:false};
}
