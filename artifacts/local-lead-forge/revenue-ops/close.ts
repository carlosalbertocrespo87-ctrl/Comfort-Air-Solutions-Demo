export interface CloseReadiness{proposalPassed:boolean;scopeUnderstood:boolean;priceUnderstood:boolean;termsUnderstood:boolean;decisionMakerConfirmed:boolean;noPressureClaim:boolean;}
export function verbalYesReady(x:CloseReadiness):boolean{return Object.values(x).every(Boolean);}
export function canMarkWonWithoutPayment():boolean{return false;}
