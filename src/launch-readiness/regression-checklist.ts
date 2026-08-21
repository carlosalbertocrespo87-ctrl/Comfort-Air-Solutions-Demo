export type RegressionCheck={name:string;passed:boolean;area:'SECURITY'|'TENANT'|'COST'|'EXTERNAL_ACTION'|'QA'};
export function evaluateLaunchRegression(checks:RegressionCheck[]){
 const failed=checks.filter(c=>!c.passed);
 return {pass:checks.length>0&&failed.length===0,failed:failed.map(c=>`${c.area}:${c.name}`),releaseAuthorized:false as const};
}
