export type RecoveryValueEstimate={estimatedOpportunityValue?:number;confidence:'HIGH'|'MEDIUM'|'LOW'|'UNKNOWN';guaranteedRevenue:false};
export function estimateRecoveryValue(input:{knownEstimate?:number;historicalTicketAverage?:number;qualified:boolean}):RecoveryValueEstimate{
 if(input.knownEstimate&&input.knownEstimate>0) return {estimatedOpportunityValue:input.knownEstimate,confidence:'HIGH',guaranteedRevenue:false};
 if(input.qualified&&input.historicalTicketAverage&&input.historicalTicketAverage>0) return {estimatedOpportunityValue:input.historicalTicketAverage,confidence:'MEDIUM',guaranteedRevenue:false};
 if(input.historicalTicketAverage&&input.historicalTicketAverage>0) return {estimatedOpportunityValue:input.historicalTicketAverage,confidence:'LOW',guaranteedRevenue:false};
 return {confidence:'UNKNOWN',guaranteedRevenue:false};
}
