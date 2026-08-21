export function evaluateOperationalReadiness(input:{onboardingReady:boolean;leadRoutingReady:boolean;qaReady:boolean;rollbackReady:boolean;monitoringReady:boolean}){
 const blockers=Object.entries(input).filter(([,ready])=>!ready).map(([name])=>name);
 return {ready:blockers.length===0,blockers,productionActivationAuthorized:false as const};
}
