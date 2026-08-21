import { evidenceConfidence } from "./evidence-confidence";
import { enforceTenantScope } from "./tenant-scope";
import { assessProspect } from "./prospect-intelligence";
import { nextPipelineStage } from "./prospect-demo-pipeline";
import { evaluateClaim } from "../demo/claim-guard";
import { evaluateDemoReadiness } from "../demo/demo-readiness";
import { evaluateDemoQa } from "../quality/demo-qa";
import { SYNTHETIC_DEMO_CASES } from "../quality/synthetic-demo-cases";
import { chooseNextBestAction } from "../sales/next-best-action";

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

assert(evidenceConfidence({ sourceCount: 0, officialSource: false, freshnessKnown: false, conflicts: 0 }) === "UNVERIFIED", "missing evidence must remain unverified");
assert(evidenceConfidence({ sourceCount: 2, officialSource: true, freshnessKnown: true, conflicts: 0 }) === "HIGH", "multiple fresh official sources should be high-confidence");
assert(evidenceConfidence({ sourceCount: 3, officialSource: true, freshnessKnown: true, conflicts: 1 }) === "LOW", "conflicting evidence must reduce confidence");

const crossTenant = enforceTenantScope({ recordTenantId: "tenant-b", activeTenantId: "tenant-a" });
assert(!crossTenant.allowed, "cross-tenant prospect access must fail closed");
const sameTenant = enforceTenantScope({ recordTenantId: "tenant-a", activeTenantId: "tenant-a" });
assert(sameTenant.allowed, "same-tenant prospect access should be allowed");

const noEvidenceAssessment = assessProspect({
  servicesFound: ["AC repair"],
  serviceAreasFound: ["Atlanta"],
  phoneFound: true,
  websiteUsable: true,
  leadCapturePresent: true,
  chatPresent: true,
  mobileUsable: true,
  sourceUrls: [],
});
assert(noEvidenceAssessment.score <= 39, "prospect score must be capped without source evidence");
assert(noEvidenceAssessment.requiresHumanReview === true, "prospect assessment must always require human review");

const unsupportedClaim = evaluateClaim({ claim: "24/7 emergency service" });
assert(!unsupportedClaim.allowed, "unsupported demo claims must fail closed");
const supportedClaim = evaluateClaim({ claim: "AC repair", evidenceUrl: "https://example.com/services" });
assert(supportedClaim.allowed, "claims with recorded public evidence may be used internally");

const demoBlocked = evaluateDemoReadiness({
  briefBuilt: true,
  factsVerified: false,
  qaPass: true,
  brandingReady: true,
  leadDestinationSafe: true,
});
assert(!demoBlocked.readyForInternalPreview, "unverified business facts must block internal preview readiness");
assert(demoBlocked.readyForPublish === false, "Batch 03 must never authorize publishing");
const demoReady = evaluateDemoReadiness({
  briefBuilt: true,
  factsVerified: true,
  qaPass: true,
  brandingReady: true,
  leadDestinationSafe: true,
});
assert(demoReady.readyForInternalPreview && demoReady.readyForPublish === false, "internal preview readiness must remain separate from publishing authorization");

const qa = evaluateDemoQa({
  englishFlowPass: true,
  spanishFlowPass: false,
  mobilePass: true,
  leadFormPass: true,
  criticalLinksPass: true,
  businessFactsVerified: true,
  pricingVerified: false,
});
assert(!qa.pass && qa.blockingFailures.some((item) => item.includes("Spanish")), "Spanish QA failure must block the demo");
assert(qa.publishAuthorized === false, "QA must not authorize publication");
assert(qa.warnings.some((item) => item.includes("pricing")), "unverified pricing must produce a warning");

assert(SYNTHETIC_DEMO_CASES.some((item) => item.language === "EN" && !item.expectedBlocking), "synthetic pack must include a passing English scenario");
assert(SYNTHETIC_DEMO_CASES.some((item) => item.language === "ES" && !item.expectedBlocking), "synthetic pack must include a passing Spanish scenario");
assert(SYNTHETIC_DEMO_CASES.some((item) => item.expectedBlocking), "synthetic pack must include blocking negative scenarios");

const verifyStage = nextPipelineStage({ evidenceReady: false, scored: false, demoPrepared: false, salesPrepReady: false });
assert(verifyStage.stage === "VERIFY" && verifyStage.externalActionAuthorized === false, "pipeline must verify evidence before scoring or personalization");
const finalInternalStage = nextPipelineStage({ evidenceReady: true, scored: true, demoPrepared: true, qaPass: true, salesPrepReady: true });
assert(finalInternalStage.stage === "HUMAN_REVIEW" && finalInternalStage.externalActionAuthorized === false, "completed internal prep must still stop at human review");

const dncAction = chooseNextBestAction({ evidenceConfidence: "HIGH", blockingResearchGaps: 0, demoQaPass: true, doNotContact: true });
assert(dncAction.action === "DEFER" && dncAction.externalActionAuthorized === false, "DNC must suppress the external workflow");
const lowEvidenceAction = chooseNextBestAction({ evidenceConfidence: "LOW", blockingResearchGaps: 0 });
assert(lowEvidenceAction.action === "RESEARCH_MORE", "low evidence confidence must route to more research rather than outreach");
const internalDemoAction = chooseNextBestAction({ evidenceConfidence: "HIGH", blockingResearchGaps: 0, demoQaPass: true });
assert(internalDemoAction.action === "PREPARE_DEMO" && internalDemoAction.externalActionAuthorized === false, "next-best action may prepare an internal demo but never authorize external action");
