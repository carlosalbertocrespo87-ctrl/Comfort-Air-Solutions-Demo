export type RetentionRegressionInput={requestTenantId:string;recordTenantId:string;autonomyLevel:'L0'|'L1'|'L2'|'L3'|'HUMAN_ONLY';externalCommunicationRequested:boolean;humanApprovalRecorded:boolean};
export type RetentionRegressionResult={tenantAccessAllowed:boolean;externalActionAllowed:boolean;reason:string};

export function evaluateRetentionRegression(input:RetentionRegressionInput):RetentionRegressionResult{
 if(input.requestTenantId!==input.recordTenantId) return {tenantAccessAllowed:false,externalActionAllowed:false,reason:'Cross-tenant access denied.'};
 if(!input.externalCommunicationRequested) return {tenantAccessAllowed:true,externalActionAllowed:false,reason:'Internal analysis only; no external action requested.'};
 if(input.autonomyLevel==='L0'||input.autonomyLevel==='L1') return {tenantAccessAllowed:true,externalActionAllowed:false,reason:'Autonomy level does not permit external communication.'};
 if(!input.humanApprovalRecorded) return {tenantAccessAllowed:true,externalActionAllowed:false,reason:'Human approval evidence is required.'};
 return {tenantAccessAllowed:true,externalActionAllowed:false,reason:'Batch 05 does not release external retention communications even with approval evidence.'};
}

export const RETENTION_REGRESSION_CASES:RetentionRegressionInput[]=[
 {requestTenantId:'tenant-a',recordTenantId:'tenant-b',autonomyLevel:'L3',externalCommunicationRequested:true,humanApprovalRecorded:true},
 {requestTenantId:'tenant-a',recordTenantId:'tenant-a',autonomyLevel:'L0',externalCommunicationRequested:true,humanApprovalRecorded:true},
 {requestTenantId:'tenant-a',recordTenantId:'tenant-a',autonomyLevel:'L2',externalCommunicationRequested:true,humanApprovalRecorded:false},
 {requestTenantId:'tenant-a',recordTenantId:'tenant-a',autonomyLevel:'L3',externalCommunicationRequested:true,humanApprovalRecorded:true}
];
