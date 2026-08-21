import { calculateMarginRoi } from "../analytics/margin-roi";
import { buildRecoveredRevenueDashboard } from "../analytics/recovered-revenue-dashboard";
import { scoreCrossSell } from "./cross-sell-score";
import { evaluateRetentionRegression, RETENTION_REGRESSION_CASES } from "./retention-regression";
import { createRetentionAuditRecord } from "./retention-audit";
import { buildRetentionQueue } from "./retention-queue";
import { detectRetentionRisk } from "./retention-risk";
import { SYNTHETIC_RETENTION_CASES } from "./synthetic-retention-cases";

function assert(condition:boolean,message:string){if(!condition)throw new Error(message);}
function assertThrows(fn:()=>unknown,messagePart:string){try{fn();}catch(error){if(error instanceof Error&&error.message.includes(messagePart))return;throw error;}throw new Error(`Expected error containing: ${messagePart}`);}

assertThrows(()=>calculateMarginRoi({tenantId:'tenant-a',confirmedRevenueUsd:1000,confirmedVariableCostUsd:200,confirmedEvidenceVerified:false}),'CONFIRMED_FINANCIAL_EVIDENCE_REQUIRED');
const roi=calculateMarginRoi({tenantId:'tenant-a',confirmedRevenueUsd:1000,confirmedVariableCostUsd:200,confirmedEvidenceVerified:true});
assert(roi.grossMarginUsd===800&&roi.roiPct===400,'verified margin/ROI calculation should be deterministic');
assert(roi.usesConfirmedEvidence===true,'margin/ROI output must explicitly identify confirmed-evidence basis');
assertThrows(()=>calculateMarginRoi({tenantId:'tenant-a',confirmedRevenueUsd:-1,confirmedVariableCostUsd:0,confirmedEvidenceVerified:true}),'NEGATIVE_CONFIRMED_FINANCIAL_INPUT');

assertThrows(()=>buildRecoveredRevenueDashboard('tenant-a',[{tenantId:'tenant-a',opportunityId:'opp-1',amount:500,evidence:'CONFIRMED',source:'client'}]),'CONFIRMED_REVENUE_EVIDENCE_REQUIRED');
const dashboard=buildRecoveredRevenueDashboard('tenant-a',[
 {tenantId:'tenant-a',opportunityId:'opp-1',amount:500,evidence:'CONFIRMED',source:'client',evidenceRef:'evidence-1'},
 {tenantId:'tenant-a',opportunityId:'opp-2',amount:300,evidence:'ESTIMATED',source:'internal-model'},
 {tenantId:'tenant-b',opportunityId:'opp-x',amount:9999,evidence:'CONFIRMED',source:'client',evidenceRef:'evidence-x'},
]);
assert(dashboard.confirmedRevenue===500&&dashboard.estimatedRevenue===300,'dashboard must separate confirmed and estimated revenue');
assert(dashboard.confirmedCount===1&&dashboard.estimatedCount===1,'dashboard must ignore cross-tenant records');

const dncCrossSell=scoreCrossSell({approvedService:true,completedJob:true,relatedNeedEvidence:true,doNotContact:true});
assert(!dncCrossSell.eligible&&dncCrossSell.pricingAuthorized===false,'DNC must suppress cross-sell and pricing must remain unauthorized');
const evidenceCrossSell=scoreCrossSell({approvedService:true,completedJob:true,relatedNeedEvidence:true,doNotContact:false});
assert(evidenceCrossSell.eligible&&evidenceCrossSell.pricingAuthorized===false,'evidence may support internal cross-sell review without pricing authority');

for(const regression of RETENTION_REGRESSION_CASES){
 const result=evaluateRetentionRegression(regression);
 assert(result.externalActionAllowed===false,'Batch 05 regression cases must never release external action');
 if(regression.requestTenantId!==regression.recordTenantId) assert(result.tenantAccessAllowed===false,'cross-tenant retention access must fail closed');
}

const audit=createRetentionAuditRecord({tenantId:'tenant-a',customerId:'customer-1',opportunityType:'RENEWAL',event:'REVIEWED',occurredAt:'2026-08-21T18:00:00Z',actor:'HUMAN',note:'synthetic review'});
assert(audit.externalActionAuthorized===false,'retention audit records must not authorize external actions');
assertThrows(()=>createRetentionAuditRecord({tenantId:'',customerId:'customer-1',opportunityType:'RENEWAL',event:'REVIEWED',occurredAt:'2026-08-21T18:00:00Z',actor:'HUMAN'}),'required');

const queue=buildRetentionQueue([
 {customerId:'c-low',priority:'LOW',reason:'low',externalActionAuthorized:false},
 {customerId:'c-high',priority:'HIGH',reason:'high',externalActionAuthorized:false},
 {customerId:'c-med',priority:'MEDIUM',reason:'medium',externalActionAuthorized:false},
]);
assert(queue.map(item=>item.priority).join(',')==='HIGH,MEDIUM,LOW','retention queue must sort by priority');
assert(queue.every(item=>item.externalActionAuthorized===false),'retention queue must remain advisory');

assert(detectRetentionRisk({unresolvedComplaint:true,declinedRenewal:false,daysSinceLastService:10,missedFollowUps:0})==='HIGH','unresolved complaint must be high retention risk');
assert(detectRetentionRisk({unresolvedComplaint:false,declinedRenewal:false,daysSinceLastService:400,missedFollowUps:0})==='MEDIUM','long inactivity must surface retention risk');

assert(SYNTHETIC_RETENTION_CASES.some(item=>item.locale==='EN'),'synthetic retention pack must cover English');
assert(SYNTHETIC_RETENTION_CASES.some(item=>item.locale==='ES'),'synthetic retention pack must cover Spanish');
assert(SYNTHETIC_RETENTION_CASES.some(item=>item.scenario==='DNC_BLOCK'),'synthetic retention pack must cover DNC');
assert(SYNTHETIC_RETENTION_CASES.every(item=>item.expectedExternalActionAuthorized===false),'synthetic retention cases must keep external actions disabled');
