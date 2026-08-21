export type VendorCostRecord={tenantId:string;vendor:string;category:'AI'|'SMS'|'VOICE'|'EMAIL'|'OTHER';amountUsd:number;estimated:boolean};
export type ClientCostSummary={tenantId:string;confirmedUsd:number;estimatedUsd:number;byVendor:Record<string,number>;byCategory:Record<string,number>};

export function summarizeClientCosts(tenantId:string,records:VendorCostRecord[]):ClientCostSummary{
 const scoped=records.filter(r=>r.tenantId===tenantId && Number.isFinite(r.amountUsd) && r.amountUsd>=0);
 const out:ClientCostSummary={tenantId,confirmedUsd:0,estimatedUsd:0,byVendor:{},byCategory:{}};
 for(const r of scoped){
  if(r.estimated) out.estimatedUsd+=r.amountUsd; else out.confirmedUsd+=r.amountUsd;
  out.byVendor[r.vendor]=(out.byVendor[r.vendor]||0)+r.amountUsd;
  out.byCategory[r.category]=(out.byCategory[r.category]||0)+r.amountUsd;
 }
 return out;
}
