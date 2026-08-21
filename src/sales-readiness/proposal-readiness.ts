export type ProposalReadiness={ready:boolean;blocking:string[];proposalAuthorized:false};
export function evaluateProposalReadiness(input:{scopeKnown:boolean;priceApproved:boolean;businessFactsVerified:boolean;termsReleased:boolean;paymentPathReady:boolean}):ProposalReadiness{
 const blocking:string[]=[];
 if(!input.scopeKnown) blocking.push('Scope is not confirmed.');
 if(!input.priceApproved) blocking.push('Pricing is not approved.');
 if(!input.businessFactsVerified) blocking.push('Prospect facts are not verified.');
 if(!input.termsReleased) blocking.push('Commercial/legal terms are not released.');
 if(!input.paymentPathReady) blocking.push('Payment path is not ready.');
 return {ready:blocking.length===0,blocking,proposalAuthorized:false};
}
