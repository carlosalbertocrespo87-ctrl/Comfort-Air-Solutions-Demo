import { evaluateTenantAccess } from './tenant-isolation-contract';
import { permissionRegressionCases } from './permission-regression';
import { evaluateAuditCompleteness } from './audit-completeness';
import { authorizeTool } from './unknown-tool-guard';
import { evaluateKillSwitchDrill } from './kill-switch-drill';
import { evaluateGuaranteeGate } from './performance-guarantee-gate';
import { evaluateBrowserResearch } from './supervised-browser-policy';
import { evaluateMultiAgentReadiness } from './multi-agent-readiness';
import { batch06ReleasePosture } from './release-posture';
import { evaluateDataMinimization } from '../privacy/data-minimization';
import { evaluateRetention } from '../privacy/retention-window';
import { evaluateConsent } from '../compliance/consent-eligibility';
import { evaluateCommunicationWindow } from '../compliance/communication-window';
import { evaluateAdapterReadiness } from '../integrations/adapter-contract-readiness';
import { serviceTitanAdapterSpec } from '../integrations/specs/servicetitan';
import { jobberAdapterSpec } from '../integrations/specs/jobber';
import { housecallProAdapterSpec } from '../integrations/specs/housecall-pro';
import { hubSpotAdapterSpec } from '../integrations/specs/hubspot';
import { goHighLevelAdapterSpec } from '../integrations/specs/gohighlevel';
import { evaluateTerritoryExperiment } from '../experiments/territory-exclusivity';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const crossTenant = evaluateTenantAccess({ actorTenantId: 'tenant-a', resourceTenantId: 'tenant-b' });
assert(!crossTenant.allowed, 'cross-tenant access must fail closed');
assert(!evaluateTenantAccess({ actorTenantId: '', resourceTenantId: 'tenant-a' }).allowed, 'missing tenant identity must fail closed');
assert(!evaluateTenantAccess({ actorTenantId: 'tenant-a', resourceTenantId: 'tenant-a', systemScope: true }).allowed, 'system scope must require a separate privileged path');
assert(evaluateTenantAccess({ actorTenantId: 'tenant-a', resourceTenantId: 'tenant-a' }).allowed, 'matching tenant scope should be eligible');

const l0External = permissionRegressionCases.find(item => item.level === 'L0' && item.action === 'external_message');
const l1External = permissionRegressionCases.find(item => item.level === 'L1' && item.action === 'external_message');
const l2Payment = permissionRegressionCases.find(item => item.level === 'L2' && item.action === 'payment');
const humanPayment = permissionRegressionCases.find(item => item.level === 'HUMAN_ONLY' && item.action === 'payment');
assert(l0External?.expectedAllowed === false && l1External?.expectedAllowed === false, 'L0/L1 external communication must stay denied');
assert(l2Payment?.expectedAllowed === false, 'L2 payment must stay denied');
assert(humanPayment?.expectedAllowed === true, 'payment authority belongs to HUMAN_ONLY policy layer');

const incompleteAudit = evaluateAuditCompleteness({ eventId: 'evt-1', tenantId: 'tenant-a' });
assert(!incompleteAudit.complete && incompleteAudit.missing.includes('decision'), 'incomplete audit evidence must be rejected');
const completeAudit = evaluateAuditCompleteness({ eventId: 'evt-1', tenantId: 'tenant-a', decision: 'DENY', policy: 'batch06', proposedAction: 'external_message', result: 'BLOCKED', actor: 'SYSTEM', timestamp: '2026-08-21T21:00:00Z' });
assert(completeAudit.complete, 'complete audit evidence should pass');

assert(!authorizeTool({ toolName: 'unknown_tool', allowlist: ['read_lead'] }).allowed, 'unknown tools must be denied');
assert(!authorizeTool({ toolName: '', allowlist: ['read_lead'] }).allowed, 'empty tool names must be denied');
assert(authorizeTool({ toolName: 'read_lead', allowlist: ['read_lead'] }).allowed, 'explicitly allowlisted internal tools may pass this guard');

const killSwitchFail = evaluateKillSwitchDrill({ globalStops: true, tenantStops: true, providerStops: true, rollbackSafe: true, executorBypassed: false });
assert(!killSwitchFail.pass && killSwitchFail.failures.length === 1, 'kill switch drill must fail if disabled execution is reached');
assert(evaluateKillSwitchDrill({ globalStops: true, tenantStops: true, providerStops: true, rollbackSafe: true, executorBypassed: true }).pass, 'kill switch drill should pass only when every stop path is safe');

assert(!evaluateDataMinimization([{ name: 'phone', required: true, purpose: '' }]).allowed, 'purpose-less data collection must fail minimization');
assert(evaluateDataMinimization([{ name: 'phone', required: true, purpose: 'lead callback' }]).allowed, 'required purpose-bound field should pass minimization');
assert(!evaluateRetention({ kind: 'SYNTHETIC', ageDays: 31 }).retain, 'expired synthetic data should not be retained');
assert(evaluateRetention({ kind: 'SYNTHETIC', ageDays: 31, legalHold: true }).retain, 'legal hold may retain data through separate authority');

const dncConsent = evaluateConsent({ channel: 'SMS', consentKnown: true, consentGranted: true, doNotContact: true, clientAuthorized: true });
assert(!dncConsent.eligible && dncConsent.communicationAuthorized === false, 'DNC must suppress communication eligibility');
const eligibleConsent = evaluateConsent({ channel: 'EMAIL', consentKnown: true, consentGranted: true, doNotContact: false, clientAuthorized: true });
assert(eligibleConsent.eligible && eligibleConsent.communicationAuthorized === false, 'eligibility must never equal release authorization');
const emergencyWindow = evaluateCommunicationWindow({ localHour: 2, startHour: 8, endHour: 20, emergencyTransactional: true });
assert(emergencyWindow.withinWindow && emergencyWindow.communicationAuthorized === false, 'emergency handling still requires separate release authorization');
assert(!evaluateCommunicationWindow({ localHour: 2, startHour: 8, endHour: 20 }).withinWindow, 'outside-window communication should be ineligible');

const adapterReady = evaluateAdapterReadiness({ tenantScoped: true, authSeparated: true, idempotencyDefined: true, readCapabilitiesDefined: true, writeCapabilitiesDefined: true, errorMappingDefined: true, auditDefined: true });
assert(adapterReady.ready && adapterReady.liveWritesEnabled === false, 'adapter contract readiness must not enable live writes');
const providerSpecs = [serviceTitanAdapterSpec, jobberAdapterSpec, housecallProAdapterSpec, hubSpotAdapterSpec, goHighLevelAdapterSpec];
for (const spec of providerSpecs) {
  assert(spec.status === 'SPEC_ONLY', `${spec.provider} must remain spec-only`);
  assert(spec.liveWritesEnabled === false, `${spec.provider} live writes must remain disabled`);
  assert(spec.costApproved === false, `${spec.provider} vendor cost must remain unapproved`);
}

const territory = evaluateTerritoryExperiment({ zip: '30043', activeClientConflicts: 0, capacityKnown: true, pricingDefined: true, termsReviewed: true });
assert(territory.eligibleForStudy && territory.promiseAuthorized === false, 'territory study eligibility must not authorize an exclusivity promise');
const guarantee = evaluateGuaranteeGate({ sufficientHistoricalData: true, unitEconomicsKnown: true, refundExposureModeled: true, attributionReliable: true, legalReviewed: true });
assert(guarantee.offerAuthorized === false, 'performance guarantee must remain unauthorized even when evidence inputs exist');

const browserSafe = evaluateBrowserResearch({ publicResearch: true, credentialsRequired: false, formSubmission: false, purchase: false, destructiveAction: false });
assert(browserSafe.allowed && browserSafe.mode === 'SUPERVISED_INTERNAL' && browserSafe.externalActionAuthorized === false, 'browser use must remain supervised internal only');
assert(!evaluateBrowserResearch({ publicResearch: true, credentialsRequired: false, formSubmission: true, purchase: false, destructiveAction: false }).allowed, 'form submission must stay blocked');

const agents = evaluateMultiAgentReadiness({ individualAgentsPassedEvals: true, tenantIsolationPassed: true, toolAllowlistsPassed: true, handoffSchemaDefined: true, loopLimitDefined: true, costBudgetDefined: true, humanEscalationDefined: true });
assert(agents.readyForShadow && agents.readyForExternal === false, 'multi-agent readiness may reach shadow mode only');

assert(batch06ReleasePosture.externalCommunicationAuthorized === false, 'Batch 06 must not authorize external communication');
assert(batch06ReleasePosture.liveProviderWritesAuthorized === false, 'Batch 06 must not authorize live provider writes');
assert(batch06ReleasePosture.customerTrafficAuthorized === false, 'Batch 06 must not authorize customer traffic');
assert(batch06ReleasePosture.autonomyAboveL1Authorized === false, 'Batch 06 must not authorize autonomy above L1');
