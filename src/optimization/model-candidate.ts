export type ModelCandidate={provider:string;model:string;qualityScore:number;estimatedCostUsd:number;latencyMs:number;syntheticOnly:true};
export function normalizeModelCandidate(input:Omit<ModelCandidate,'syntheticOnly'>):ModelCandidate{
 const qualityScore=Math.max(0,Math.min(100,input.qualityScore));
 return {provider:input.provider.trim(),model:input.model.trim(),qualityScore,estimatedCostUsd:Math.max(0,input.estimatedCostUsd),latencyMs:Math.max(0,input.latencyMs),syntheticOnly:true};
}
