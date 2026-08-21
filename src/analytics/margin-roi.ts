export type MarginRoiInput={tenantId:string;confirmedRevenueUsd:number;confirmedVariableCostUsd:number;monthlyPriceUsd?:number;setupPriceUsd?:number};
export type MarginRoiSummary={tenantId:string;grossMarginUsd:number;grossMarginPct:number|null;revenueToCostRatio:number|null;roiPct:number|null;usesConfirmedEvidence:true};

export function calculateMarginRoi(input:MarginRoiInput):MarginRoiSummary{
 const revenue=Math.max(0,input.confirmedRevenueUsd);
 const cost=Math.max(0,input.confirmedVariableCostUsd);
 const grossMarginUsd=revenue-cost;
 const grossMarginPct=revenue>0?(grossMarginUsd/revenue)*100:null;
 const revenueToCostRatio=cost>0?revenue/cost:null;
 const roiPct=cost>0?((revenue-cost)/cost)*100:null;
 return {tenantId:input.tenantId,grossMarginUsd,grossMarginPct,revenueToCostRatio,roiPct,usesConfirmedEvidence:true};
}
