export type BenchmarkObservationLike={success:boolean;policyPass:boolean;latencyMs:number;estimatedCostUsd:number};
export function summarizeBenchmark(items:BenchmarkObservationLike[]){
 const total=items.length;
 const successes=items.filter(i=>i.success).length;
 const policyPasses=items.filter(i=>i.policyPass).length;
 const latency=items.reduce((s,i)=>s+i.latencyMs,0);
 const cost=items.reduce((s,i)=>s+i.estimatedCostUsd,0);
 return {total,taskSuccessRate:total?successes/total:0,policyPassRate:total?policyPasses/total:0,averageLatencyMs:total?latency/total:0,totalEstimatedCostUsd:cost};
}
