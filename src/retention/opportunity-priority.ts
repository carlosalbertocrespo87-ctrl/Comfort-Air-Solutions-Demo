export type RetentionPriority='HIGH'|'MEDIUM'|'LOW';
export function retentionPriority(input:{renewalDue?:boolean;seasonalRecallDue?:boolean;reviewEligible?:boolean;crossSellCount?:number;daysSinceLastService?:number}):RetentionPriority{
 if(input.renewalDue || input.seasonalRecallDue) return 'HIGH';
 if(input.reviewEligible || (input.crossSellCount||0)>0) return 'MEDIUM';
 if((input.daysSinceLastService||0)>180) return 'MEDIUM';
 return 'LOW';
}
