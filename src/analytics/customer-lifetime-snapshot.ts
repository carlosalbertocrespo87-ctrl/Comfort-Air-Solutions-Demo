export type CustomerLifetimeSnapshot={completedJobs:number;confirmedRevenue:number;reviewCount:number;renewalCount:number;estimated:boolean};
export function buildCustomerLifetimeSnapshot(input:{completedJobs:number;confirmedRevenue:number;reviewCount:number;renewalCount:number}):CustomerLifetimeSnapshot{
 return {completedJobs:Math.max(0,input.completedJobs),confirmedRevenue:Math.max(0,input.confirmedRevenue),reviewCount:Math.max(0,input.reviewCount),renewalCount:Math.max(0,input.renewalCount),estimated:false};
}
