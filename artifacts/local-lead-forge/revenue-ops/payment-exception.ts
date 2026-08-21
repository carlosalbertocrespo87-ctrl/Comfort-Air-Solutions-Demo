export type PaymentState='UNKNOWN'|'PENDING'|'VERIFIED'|'FAILED'|'REFUNDED'|'DISPUTED';
export function paymentBlocksHandoff(state:PaymentState):boolean{return state!=='VERIFIED';}
export function paymentNeedsAttention(state:PaymentState):boolean{return ['FAILED','REFUNDED','DISPUTED','UNKNOWN'].includes(state);}
