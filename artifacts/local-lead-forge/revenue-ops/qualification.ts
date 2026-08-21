export type FitTier='A'|'B'|'C'|'HOLD';
export interface Qualification{hvac:boolean;serviceAreaMatch:boolean;validBusinessEvidence:boolean;reachableChannelEvidence:boolean;demoOpportunity:boolean;}
export function qualify(x:Qualification):FitTier{
 if(!x.hvac||!x.validBusinessEvidence)return'HOLD';
 const score=[x.serviceAreaMatch,x.reachableChannelEvidence,x.demoOpportunity].filter(Boolean).length;
 return score===3?'A':score===2?'B':'C';
}
