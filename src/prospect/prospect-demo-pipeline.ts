export type PipelineStage='RESEARCH'|'VERIFY'|'SCORE'|'PREPARE_DEMO'|'QA'|'SALES_PREP'|'HUMAN_REVIEW';
export type PipelineState={stage:PipelineStage;externalActionAuthorized:false;reason:string};
export function nextPipelineStage(input:{evidenceReady:boolean;scored:boolean;demoPrepared:boolean;qaPass?:boolean;salesPrepReady:boolean}):PipelineState{
 if(!input.evidenceReady) return {stage:'VERIFY',externalActionAuthorized:false,reason:'Evidence must be verified before scoring or personalization.'};
 if(!input.scored) return {stage:'SCORE',externalActionAuthorized:false,reason:'Prospect has verified evidence but has not been scored.'};
 if(!input.demoPrepared) return {stage:'PREPARE_DEMO',externalActionAuthorized:false,reason:'Prospect is ready for internal demo preparation.'};
 if(input.qaPass!==true) return {stage:'QA',externalActionAuthorized:false,reason:'Demo must pass QA before sales preparation.'};
 if(!input.salesPrepReady) return {stage:'SALES_PREP',externalActionAuthorized:false,reason:'Prepare evidence-backed sales material.'};
 return {stage:'HUMAN_REVIEW',externalActionAuthorized:false,reason:'Internal preparation is complete; external action remains gated.'};
}
