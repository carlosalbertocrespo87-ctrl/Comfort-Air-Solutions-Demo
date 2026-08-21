export type ReturningCustomerMatch={returning:boolean;matchBasis:'CUSTOMER_ID'|'NORMALIZED_PHONE'|'NORMALIZED_EMAIL'|'NONE';confidence:'HIGH'|'MEDIUM'|'NONE'};
export function recognizeReturningCustomer(input:{customerIdMatch?:boolean;phoneMatch?:boolean;emailMatch?:boolean}):ReturningCustomerMatch{
 if(input.customerIdMatch) return {returning:true,matchBasis:'CUSTOMER_ID',confidence:'HIGH'};
 if(input.phoneMatch) return {returning:true,matchBasis:'NORMALIZED_PHONE',confidence:'MEDIUM'};
 if(input.emailMatch) return {returning:true,matchBasis:'NORMALIZED_EMAIL',confidence:'MEDIUM'};
 return {returning:false,matchBasis:'NONE',confidence:'NONE'};
}
