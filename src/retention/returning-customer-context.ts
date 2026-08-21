export type ReturningCustomerContext={returning:boolean;matchMethod:'CUSTOMER_ID'|'PHONE'|'EMAIL'|'NONE';priorCompletedJobs:number;lastServiceDaysAgo?:number;communicationAuthorized:false};
export function buildReturningCustomerContext(input:{matchMethod:ReturningCustomerContext['matchMethod'];priorCompletedJobs:number;lastServiceDaysAgo?:number}):ReturningCustomerContext{
 return {returning:input.matchMethod!=='NONE'&&input.priorCompletedJobs>0,matchMethod:input.matchMethod,priorCompletedJobs:Math.max(0,input.priorCompletedJobs),lastServiceDaysAgo:input.lastServiceDaysAgo,communicationAuthorized:false};
}
