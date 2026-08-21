export interface DiscoveryReadiness{businessNeedCaptured:boolean;decisionMakerIdentified:boolean;timelineCaptured:boolean;budgetContextCaptured:boolean;successCriteriaCaptured:boolean;noUnsupportedPromises:boolean;}
export function discoveryReady(x:DiscoveryReadiness):boolean{return Object.values(x).every(Boolean);}
