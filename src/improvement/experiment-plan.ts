export type ExperimentPlan={hypothesis:string;metric:string;baselineRequired:true;externalActionsAuthorized:false;spendAuthorized:false};
export function buildExperimentPlan(input:{hypothesis:string;metric:string}):ExperimentPlan{
 return {hypothesis:input.hypothesis.trim(),metric:input.metric.trim(),baselineRequired:true,externalActionsAuthorized:false,spendAuthorized:false};
}
