export type MarginRoiInput={tenantId:string;confirmedRevenueUsd:number;confirmedVariableCostUsd:number;confirmedEvidenceVerified:boolean;monthlyPriceUsd?:number;setupPriceUsd?:number};
export type MarginRoiSummary={tenantId:string;grossMarginUsd:number;grossMarginPct:number|null;revenueToCostRatio:number|null;roiPct:number|null;usesConfirmedEvidence:true};

export function calculateMarginRoi(input:MarginRoiInput):MarginRoiSummary{
 if(!input.tenantId.trim()) throw new Error('TENANT_REQUIRED');
 if(!Number.isFinite(input.confirmedRevenueUsd)||!Number.isFinite(input.confirmedVariableCostUsd)) throw new Error('INVALID_CONFIRMED_FINANCIAL_INPUT');
 if(input.confirmedRevenueUsd<0||input.confirmedVariableCostUsd<0) throw new Error('NEGATIVE_CONFIRMED_FINANCIAL_INPUT');
 if((input.confirmedRevenueUsd>0||input.confirmedVariableCostUsd>0)&&!input.confirmedEvidenceVerified) throw new Error('CONFIRMED_FINANCIAL_EVIDENCE_REQUIRED');
 const revenue=input.confirmedRevenueUsd;
 const cost=input.confirmedVariableCostUsd;
 const grossMarginUsd=revenue-cost;
 const grossMarginPct=revenue>0?(grossMarginUsd/revenue)*100:null;
 const revenueToCostRatio=cost>0?revenue/cost:null;
 const roiPct=cost>0?((revenue-cost)/cost)*100:null;
 return {tenantId:input.tenantId,grossMarginUsd,grossMarginPct,revenueToCostRatio,roiPct,usesConfirmedEvidence:true};
}
