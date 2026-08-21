export type CrossSellRecommendation={service:string;reason:string;pricingProvided:false};
export function recommendCrossSell(input:{completedService?:string;approvedServices:string[];candidateServices:string[]}):CrossSellRecommendation[]{
 const approved=new Set(input.approvedServices.map(x=>x.trim().toLowerCase()));
 return input.candidateServices
  .filter(s=>approved.has(s.trim().toLowerCase()))
  .filter(s=>!input.completedService || s.trim().toLowerCase()!==input.completedService.trim().toLowerCase())
  .map(service=>({service,reason:'Service is client-approved and may be reviewed as a complementary opportunity.',pricingProvided:false}));
}
