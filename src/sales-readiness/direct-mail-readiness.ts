export type DirectMailReadiness={readyForHumanReview:boolean;blocking:string[];mailAuthorized:false};
export function evaluateDirectMailReadiness(input:{postalAddressVerified:boolean;businessNameVerified:boolean;letterFactsVerified:boolean;returnAddressApproved:boolean;budgetApproved:boolean}):DirectMailReadiness{
 const blocking:string[]=[];
 if(!input.postalAddressVerified) blocking.push('Postal address is not verified.');
 if(!input.businessNameVerified) blocking.push('Business name is not verified.');
 if(!input.letterFactsVerified) blocking.push('Letter contains unverified facts.');
 if(!input.returnAddressApproved) blocking.push('Return address is not approved for customer-facing use.');
 if(!input.budgetApproved) blocking.push('Printing/postage budget is not approved.');
 return {readyForHumanReview:blocking.length===0,blocking,mailAuthorized:false};
}
