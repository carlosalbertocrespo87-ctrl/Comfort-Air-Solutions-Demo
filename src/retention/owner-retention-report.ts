export type OwnerRetentionReport={dueRenewals:number;seasonalRecalls:number;reviewOpportunities:number;crossSellOpportunities:number;highRiskCustomers:number;recommendedActions:string[]};
export function buildOwnerRetentionReport(input:Omit<OwnerRetentionReport,'recommendedActions'>):OwnerRetentionReport{
 const recommendedActions:string[]=[];
 if(input.dueRenewals) recommendedActions.push('Review due maintenance-plan renewals.');
 if(input.seasonalRecalls) recommendedActions.push('Review seasonal recall opportunities.');
 if(input.reviewOpportunities) recommendedActions.push('Review eligible post-service review opportunities.');
 if(input.crossSellOpportunities) recommendedActions.push('Review evidence-backed cross-sell opportunities.');
 if(input.highRiskCustomers) recommendedActions.push('Prioritize customers with high retention risk.');
 return {...input,recommendedActions};
}
