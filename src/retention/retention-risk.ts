export type RetentionRisk='HIGH'|'MEDIUM'|'LOW';
export function detectRetentionRisk(input:{unresolvedComplaint:boolean;declinedRenewal:boolean;daysSinceLastService:number;missedFollowUps:number}):RetentionRisk{
 if(input.unresolvedComplaint||input.declinedRenewal) return 'HIGH';
 if(input.daysSinceLastService>365||input.missedFollowUps>=2) return 'MEDIUM';
 return 'LOW';
}
