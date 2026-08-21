export type RevenueEvidence='CONFIRMED'|'ESTIMATED';
export type RecoveredRevenueRecord={tenantId:string;opportunityId:string;amount:number;evidence:RevenueEvidence;source:string};
export type RecoveredRevenueDashboard={tenantId:string;confirmedRevenue:number;estimatedRevenue:number;confirmedCount:number;estimatedCount:number;currency:'USD'};

export function buildRecoveredRevenueDashboard(tenantId:string,records:RecoveredRevenueRecord[]):RecoveredRevenueDashboard{
 const scoped=records.filter(r=>r.tenantId===tenantId && Number.isFinite(r.amount) && r.amount>=0);
 return scoped.reduce<RecoveredRevenueDashboard>((out,r)=>{
  if(r.evidence==='CONFIRMED'){out.confirmedRevenue+=r.amount;out.confirmedCount+=1;}
  else {out.estimatedRevenue+=r.amount;out.estimatedCount+=1;}
  return out;
 },{tenantId,confirmedRevenue:0,estimatedRevenue:0,confirmedCount:0,estimatedCount:0,currency:'USD'});
}
