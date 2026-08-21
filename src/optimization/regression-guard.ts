export type RegressionResult={pass:boolean;reasons:string[]};
export function checkRegression(input:{baselineTaskSuccess:number;candidateTaskSuccess:number;baselinePolicyPass:number;candidatePolicyPass:number;maxAllowedDrop?:number}):RegressionResult{
 const maxDrop=input.maxAllowedDrop??0;
 const reasons:string[]=[];
 if(input.candidateTaskSuccess<input.baselineTaskSuccess-maxDrop) reasons.push('Task success regressed beyond allowed threshold.');
 if(input.candidatePolicyPass<input.baselinePolicyPass) reasons.push('Policy pass rate regressed.');
 return {pass:reasons.length===0,reasons};
}
