export interface FunnelEvidence{qualified:boolean;demoReady:boolean;contactAuthorized:boolean;replyHandled:boolean;discoveryReady:boolean;proposalReady:boolean;verbalYesReady:boolean;paymentVerified:boolean;legalVerified:boolean;postPaymentPass:boolean;handoffReady:boolean;}
export function syntheticFunnelPass(x:FunnelEvidence):boolean{return Object.values(x).every(Boolean);}
export function realOutreachAllowed():boolean{return false;}
export function realChargeAllowed():boolean{return false;}
