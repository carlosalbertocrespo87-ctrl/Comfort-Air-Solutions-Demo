export type ModelImprovementReport={candidate:string;benchmarkScore:number;costClass:string;regressionPass:boolean;recommendedAction:string;customerActivationAuthorized:false};
export function buildModelImprovementReport(input:Omit<ModelImprovementReport,'customerActivationAuthorized'>):ModelImprovementReport{
 return {...input,customerActivationAuthorized:false};
}
