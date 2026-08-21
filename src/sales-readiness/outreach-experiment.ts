export type OutreachExperiment={name:string;hypothesis:string;channels:string[];sampleSize:number;successMetric:string;spendAuthorized:false;executionAuthorized:false};
export function buildOutreachExperiment(input:{name:string;hypothesis:string;channels:string[];sampleSize:number;successMetric:string}):OutreachExperiment{
 return {name:input.name.trim(),hypothesis:input.hypothesis.trim(),channels:[...new Set(input.channels.map(v=>v.trim()).filter(Boolean))],sampleSize:Math.max(1,Math.min(input.sampleSize,100)),successMetric:input.successMetric.trim(),spendAuthorized:false,executionAuthorized:false};
}
