export type GuaranteeGate={eligibleForLegalReview:boolean;offerAuthorized:false;missing:string[]};
export function evaluateGuaranteeGate(input:{sufficientHistoricalData:boolean;unitEconomicsKnown:boolean;refundExposureModeled:boolean;attributionReliable:boolean;legalReviewed:boolean}):GuaranteeGate{
 const missing:string[]=[];
 if(!input.sufficientHistoricalData) missing.push('historicalData');
 if(!input.unitEconomicsKnown) missing.push('unitEconomics');
 if(!input.refundExposureModeled) missing.push('refundExposure');
 if(!input.attributionReliable) missing.push('attributionReliability');
 if(!input.legalReviewed) missing.push('legalReview');
 return {eligibleForLegalReview:missing.length===1&&missing[0]==='legalReview',offerAuthorized:false,missing};
}
