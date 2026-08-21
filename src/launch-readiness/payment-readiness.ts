export function evaluatePaymentReadiness(input:{paymentProviderReady:boolean;payoutDestinationVerified:boolean;testModeEvidence:boolean;refundProcessDocumented:boolean}){
 const blockers:string[]=[];
 if(!input.paymentProviderReady) blockers.push('Payment provider is not ready.');
 if(!input.payoutDestinationVerified) blockers.push('Payout destination is not verified.');
 if(!input.testModeEvidence) blockers.push('Payment test evidence is missing.');
 if(!input.refundProcessDocumented) blockers.push('Refund/exception process is not documented.');
 return {ready:blockers.length===0,blockers,chargeAuthorized:false as const,refundAuthorized:false as const};
}
