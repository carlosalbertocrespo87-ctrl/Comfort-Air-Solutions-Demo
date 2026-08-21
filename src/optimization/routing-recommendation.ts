export type RoutingRecommendation={candidateId:string;reason:string;advisoryOnly:true;requiresHumanReview:true};
export function recommendRoute(candidates:{id:string;score:number;policyPass:boolean}[]):RoutingRecommendation|null{
 const eligible=candidates.filter(c=>c.policyPass).sort((a,b)=>b.score-a.score);
 if(!eligible.length) return null;
 return {candidateId:eligible[0].id,reason:'Highest benchmark score among policy-passing candidates.',advisoryOnly:true,requiresHumanReview:true};
}
