export type OwnerSalesReport={headline:string;priorities:string[];risks:string[];externalActionsAuthorized:false};
export function buildOwnerSalesReport(input:{readyProspects:number;priorityProspects:string[];blockingRisks:string[]}):OwnerSalesReport{
 return {headline:`${input.readyProspects} prospect(s) prepared for human-reviewed sales action.`,priorities:input.priorityProspects.map(v=>v.trim()).filter(Boolean),risks:input.blockingRisks.map(v=>v.trim()).filter(Boolean),externalActionsAuthorized:false};
}
