export type BenchmarkObservation={candidateId:string;taskId:string;success:boolean;policyPass:boolean;latencyMs:number;estimatedCostUsd:number;contentStored:false};
export function recordBenchmarkObservation(input:Omit<BenchmarkObservation,'contentStored'>):BenchmarkObservation{
 return {...input,latencyMs:Math.max(0,input.latencyMs),estimatedCostUsd:Math.max(0,input.estimatedCostUsd),contentStored:false};
}
