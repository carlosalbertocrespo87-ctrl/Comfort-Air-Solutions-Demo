export type LocalVisibilityPipelineResult={status:'READY_FOR_INTERNAL_PLAN'|'NEEDS_EVIDENCE'|'HUMAN_REVIEW';blockers:string[];warnings:string[];externalWriteAuthorized:false;guaranteesRanking:false};
export function evaluateLocalVisibilityPipeline(input:{evidenceSources:number;napConsistent:boolean;profileReady:boolean;serviceAreaReady:boolean;criticalDuplicateRisk:boolean;reviewPolicyReady:boolean;schemaReady:boolean}):LocalVisibilityPipelineResult{
 const blockers:string[]=[],warnings:string[]=[];
 if(input.evidenceSources<=0) blockers.push('No public evidence sources recorded.');
 if(!input.napConsistent) blockers.push('NAP consistency requires human reconciliation.');
 if(input.criticalDuplicateRisk) blockers.push('High duplicate-listing risk requires human review.');
 if(!input.profileReady) warnings.push('Local profile completeness has gaps.');
 if(!input.serviceAreaReady) warnings.push('Service-area evidence is incomplete.');
 if(!input.reviewPolicyReady) warnings.push('Review workflow is not policy-ready.');
 if(!input.schemaReady) warnings.push('Entity/schema readiness is incomplete.');
 const status:LocalVisibilityPipelineResult['status']=blockers.length?(input.evidenceSources<=0?'NEEDS_EVIDENCE':'HUMAN_REVIEW'):'READY_FOR_INTERNAL_PLAN';
 return {status,blockers,warnings,externalWriteAuthorized:false,guaranteesRanking:false};
}
