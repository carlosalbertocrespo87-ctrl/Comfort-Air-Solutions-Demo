export type CostClass='FREE'|'VERY_LOW'|'LOW'|'HIGHER';
export function classifyCandidateCost(estimatedCostUsdPerRequest:number):CostClass{
 const cost=Math.max(0,estimatedCostUsdPerRequest);
 if(cost===0) return 'FREE';
 if(cost<=0.001) return 'VERY_LOW';
 if(cost<=0.01) return 'LOW';
 return 'HIGHER';
}
