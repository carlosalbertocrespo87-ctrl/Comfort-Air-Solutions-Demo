export type SimulationStep={name:string;passed:boolean;synthetic:true;note?:string};
export function evaluateCustomerZeroSimulation(steps:SimulationStep[]){
 const failed=steps.filter(s=>!s.passed).map(s=>s.name);
 return {pass:steps.length>0&&failed.length===0,failed,syntheticOnly:true as const,productionTrafficAuthorized:false as const};
}
