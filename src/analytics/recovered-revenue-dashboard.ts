export type RevenueEvidence='CONFIRMED'|'ESTIMATED';
export type RecoveredRevenueRecord={tenantId:string;opportunityId:string;amount:number;evidence:RevenueEvidence;source:string;evidenceRef?:string};
export type RecoveredRevenueDashboard={tenantId:string;confirmedRevenue:number;estimatedRevenue:number;confirmedCount:number;estimatedCount:number;currency:'USD'};

export function buildRecoveredRevenueDashboard(tenantId:string,records:RecoveredRevenueRecord[]):RecoveredRevenueDashboard{
 if(!tenantId.trim()) throw new Error('TENANT_REQUIRED');
 const scoped=records.filter(r=>r.tenantId===tenantId && Number.isFinite(r.amount) && r.amount>=0);
 return scoped.reduce<RecoveredRevenueDashboard>((out,r)=>{
  if(!r.opportunityId.trim()||!r.source.trim()) throw new Error('RECOVERED_REVENUE_SCOPE_AND_SOURCE_REQUIRED');
  if(r.evidence==='CONFIRMED'){
   if(!r.evidenceRef?.trim()) throw new Error('CONFIRMED_REVENUE_EVIDENCE_REQUIRED');
   out.confirmedRevenue+=r.amount;out.confirmedCount+=1;
  } else {
   out.estimatedRevenue+=r.amount;out.estimatedCount+=1;
  }
  return out;
 },{tenantId,confirmedRevenue:0,estimatedRevenue:0,confirmedCount:0,estimatedCount:0,currency:'USD'});
}
