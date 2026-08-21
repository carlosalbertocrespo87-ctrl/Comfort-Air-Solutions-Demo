export type OwnerRecoveryReport={generatedAt:string;openRecoveryCount:number;highPriorityCount:number;estimatedOpportunityValue:number;topReasons:string[];requiresHumanReview:true};
export function buildOwnerRecoveryReport(input:{generatedAt:string;items:Array<{priority:'HIGH'|'MEDIUM'|'LOW';estimatedValue:number;reason:string}>}):OwnerRecoveryReport{
 const counts=new Map<string,number>();
 input.items.forEach(x=>counts.set(x.reason,(counts.get(x.reason)??0)+1));
 const topReasons=[...counts.entries()].sort((a,b)=>b[1]-a[1]).slice(0,3).map(([reason])=>reason);
 return {
  generatedAt:input.generatedAt,
  openRecoveryCount:input.items.length,
  highPriorityCount:input.items.filter(x=>x.priority==='HIGH').length,
  estimatedOpportunityValue:input.items.reduce((sum,x)=>sum+Math.max(0,x.estimatedValue),0),
  topReasons,
  requiresHumanReview:true
 };
}
