export type LeakageSummary={total:number;uncontacted:number;stale:number;missedCalls:number;stalledEstimates:number;atRiskAppointments:number;externalActionAuthorized:false};
export function summarizeLeakage(items:Array<{contacted:boolean;stale:boolean;missedCall:boolean;stalledEstimate:boolean;appointmentRisk:boolean}>):LeakageSummary{
 return {
  total:items.length,
  uncontacted:items.filter(x=>!x.contacted).length,
  stale:items.filter(x=>x.stale).length,
  missedCalls:items.filter(x=>x.missedCall).length,
  stalledEstimates:items.filter(x=>x.stalledEstimate).length,
  atRiskAppointments:items.filter(x=>x.appointmentRisk).length,
  externalActionAuthorized:false
 };
}
