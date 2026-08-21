export type BenchmarkScoreInput={quality:number;policyPassRate:number;latencyScore:number;costScore:number};
export function benchmarkScore(input:BenchmarkScoreInput):number{
 const clamp=(v:number)=>Math.max(0,Math.min(100,v));
 return Math.round(clamp(input.quality)*0.4+clamp(input.policyPassRate)*0.3+clamp(input.latencyScore)*0.15+clamp(input.costScore)*0.15);
}
