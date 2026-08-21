export type BaselineComparison={delta:number;improved:boolean;regressed:boolean};
export function compareBaseline(baseline:number,current:number):BaselineComparison{
 const delta=current-baseline;
 return {delta,improved:delta>0,regressed:delta<0};
}
