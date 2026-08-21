export type ReleaseDecision='GO'|'HOLD'|'NO_GO';
export interface FirstCustomerRelease{ciGreen:boolean;offerCurrent:boolean;pricingCurrent:boolean;demoPassed:boolean;replyHandlingReady:boolean;handoffReady:boolean;postPaymentPass:boolean;legalGate:boolean;paymentGate:boolean;rollbackReady:boolean;auditReady:boolean;openP1:number;physicalQa94:boolean;outreachExplicitlyAuthorized:boolean;}
export function firstCustomerDecision(x:FirstCustomerRelease):ReleaseDecision{
 if(x.openP1>0||!x.legalGate||!x.paymentGate)return'NO_GO';
 const technical=x.ciGreen&&x.offerCurrent&&x.pricingCurrent&&x.demoPassed&&x.replyHandlingReady&&x.handoffReady&&x.postPaymentPass&&x.rollbackReady&&x.auditReady&&x.physicalQa94;
 if(!technical||!x.outreachExplicitlyAuthorized)return'HOLD';
 return'GO';
}
