export interface ProposalReadiness{offerCurrent:boolean;priceCurrent:boolean;scopeDefined:boolean;exclusionsDefined:boolean;demoPassed:boolean;claimsEvidenceBacked:boolean;deliveryCapacityConfirmed:boolean;}
export function proposalReady(x:ProposalReadiness):boolean{return Object.values(x).every(Boolean);}
