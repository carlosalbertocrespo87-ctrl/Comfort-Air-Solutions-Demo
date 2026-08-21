export type LaunchGateStatus='PASS'|'BLOCKED'|'UNKNOWN';
export type LaunchGate={name:string;status:LaunchGateStatus;evidence?:string;critical:boolean};
export type LaunchGateResult={ready:boolean;blocking:string[];unknown:string[];releaseAuthorized:false};
export function evaluateLaunchGates(gates:LaunchGate[]):LaunchGateResult{
 const blocking=gates.filter(g=>g.critical&&g.status==='BLOCKED').map(g=>g.name);
 const unknown=gates.filter(g=>g.critical&&g.status==='UNKNOWN').map(g=>g.name);
 return {ready:blocking.length===0&&unknown.length===0,blocking,unknown,releaseAuthorized:false};
}
