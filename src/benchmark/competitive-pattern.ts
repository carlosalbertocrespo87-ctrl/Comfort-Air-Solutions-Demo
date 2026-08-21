export type CompetitivePattern={pattern:string;sourceUrl:string;observedBenefit:string;copyProtectedIp:false;implementationCandidate:boolean};
export function recordCompetitivePattern(input:{pattern:string;sourceUrl:string;observedBenefit:string;implementationCandidate:boolean}):CompetitivePattern{
 return {pattern:input.pattern.trim(),sourceUrl:input.sourceUrl.trim(),observedBenefit:input.observedBenefit.trim(),copyProtectedIp:false,implementationCandidate:input.implementationCandidate};
}
