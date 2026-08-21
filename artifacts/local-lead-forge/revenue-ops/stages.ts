export type RevenueStage='TARGET'|'QUALIFIED'|'DEMO_READY'|'CONTACT_AUTHORIZED'|'CONTACTED'|'REPLIED'|'DISCOVERY'|'PROPOSAL'|'VERBAL_YES'|'PAYMENT_PENDING'|'PAID_VERIFIED'|'HANDOFF_READY'|'DELIVERY';
export interface GateEvidence{contactAuthorized?:boolean;paymentVerified?:boolean;legalVerified?:boolean;deliveryReady?:boolean;postPaymentPass?:boolean;}
export function canEnterStage(stage:RevenueStage,e:GateEvidence):boolean{
 if(stage==='CONTACTED')return e.contactAuthorized===true;
 if(stage==='PAID_VERIFIED')return e.paymentVerified===true;
 if(stage==='HANDOFF_READY')return e.paymentVerified===true&&e.legalVerified===true&&e.deliveryReady===true&&e.postPaymentPass===true;
 if(stage==='DELIVERY')return e.paymentVerified===true&&e.legalVerified===true&&e.deliveryReady===true&&e.postPaymentPass===true;
 return true;
}
