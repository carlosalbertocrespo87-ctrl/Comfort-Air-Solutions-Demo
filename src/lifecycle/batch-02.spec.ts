import { deriveLifecycleOpportunities } from "./customer-lifecycle";
import { evaluateReviewRequest } from "./review-policy";
import { evaluateSeasonalRecall } from "./seasonal-recall";
import { evaluateRenewal } from "./renewal";
import { recommendCrossSell } from "./cross-sell";
import { recognizeReturningCustomer } from "./returning-customer";
import { evaluateReactivation } from "./reactivation";
import { evaluateTechnicalReadiness } from "../quality/technical-readiness";
import { auditAiGeoReadiness } from "../quality/ai-geo-readiness";
import { adapterContract } from "../integrations/field-service-adapter";

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const none = deriveLifecycleOpportunities({ jobCompleted: false });
assert(none.length === 0, "incomplete jobs must not create lifecycle opportunities");

const opportunities = deriveLifecycleOpportunities({
  jobCompleted: true,
  feedbackRecorded: true,
  reviewRequested: false,
  maintenanceEligible: true,
  seasonalRecallDue: true,
  renewalDue: true,
  approvedCrossSellServices: ["duct cleaning"],
});
assert(opportunities.length === 5, "completed jobs should produce only evidence-backed internal opportunities");
assert(opportunities.every((item) => item.communicationAuthorized === false), "lifecycle opportunities must remain internal/advisory");

const reviewDnc = evaluateReviewRequest({ jobCompleted: true, reviewAlreadyRequested: false, doNotContact: true });
assert(!reviewDnc.requestEligible && reviewDnc.communicationAuthorized === false, "DNC must block review eligibility");
const reviewEligible = evaluateReviewRequest({ jobCompleted: true, reviewAlreadyRequested: false, doNotContact: false });
assert(reviewEligible.requestEligible && reviewEligible.communicationAuthorized === false, "review eligibility must not authorize communication");

const recallRecent = evaluateSeasonalRecall({ serviceEligible: true, seasonWindowOpen: true, doNotContact: false, recentServiceDays: 10 });
assert(!recallRecent.eligible, "recent service must suppress seasonal recall");
const recallDnc = evaluateSeasonalRecall({ serviceEligible: true, seasonWindowOpen: true, doNotContact: true, recentServiceDays: 90 });
assert(!recallDnc.eligible && recallDnc.communicationAuthorized === false, "DNC must block seasonal recall");
const recallEligible = evaluateSeasonalRecall({ serviceEligible: true, seasonWindowOpen: true, doNotContact: false, recentServiceDays: 90 });
assert(recallEligible.eligible && recallEligible.communicationAuthorized === false, "eligible recall still requires a separate communication gate");

const renewalDnc = evaluateRenewal({ activePlan: true, renewalDue: true, doNotContact: true });
assert(!renewalDnc.eligible, "DNC must block renewal eligibility");
const renewalEligible = evaluateRenewal({ activePlan: true, renewalDue: true, doNotContact: false });
assert(renewalEligible.eligible && renewalEligible.communicationAuthorized === false, "renewal eligibility must remain advisory");

const crossSell = recommendCrossSell({
  completedService: "AC repair",
  approvedServices: ["AC repair", "Duct Cleaning"],
  candidateServices: ["AC repair", "Duct Cleaning", "Unapproved Plumbing"],
});
assert(crossSell.length === 1 && crossSell[0]?.service === "Duct Cleaning", "cross-sell must be allowlist-only and exclude completed service");
assert(crossSell.every((item) => item.pricingProvided === false), "cross-sell must not invent pricing");

const returningById = recognizeReturningCustomer({ customerIdMatch: true, phoneMatch: true, emailMatch: true });
assert(returningById.returning && returningById.matchBasis === "CUSTOMER_ID" && returningById.confidence === "HIGH", "customer ID should be the strongest returning-customer match");
const noReturningMatch = recognizeReturningCustomer({});
assert(!noReturningMatch.returning && noReturningMatch.matchBasis === "NONE", "missing identity evidence must not fabricate a returning customer");

const blockedReactivation = evaluateReactivation({
  leadClosed: true,
  consentKnown: false,
  doNotContact: true,
  daysSinceActivity: 90,
  unresolvedComplaint: true,
});
assert(!blockedReactivation.eligible && blockedReactivation.reasons.length >= 3, "reactivation must fail closed on consent, DNC, or complaint problems");
const eligibleReactivation = evaluateReactivation({
  leadClosed: true,
  consentKnown: true,
  doNotContact: false,
  daysSinceActivity: 90,
});
assert(eligibleReactivation.eligible && eligibleReactivation.communicationAuthorized === false, "reactivation eligibility must not authorize outreach");

const technicalBlocked = evaluateTechnicalReadiness({
  mobileUsable: false,
  crawlable: true,
  metadataPresent: true,
  localBusinessSchemaValid: true,
  formsWorking: true,
  criticalLinksWorking: true,
  performanceBudgetPass: true,
});
assert(!technicalBlocked.ready && technicalBlocked.blockingFailures.includes("mobile"), "mobile usability must remain a blocking technical gate");
const technicalReady = evaluateTechnicalReadiness({
  mobileUsable: true,
  crawlable: true,
  metadataPresent: false,
  localBusinessSchemaValid: true,
  formsWorking: true,
  criticalLinksWorking: true,
  performanceBudgetPass: false,
});
assert(technicalReady.ready, "non-blocking metadata/performance findings must not masquerade as blocking failures");

const geo = auditAiGeoReadiness({
  servicesClear: true,
  locationsClear: false,
  faqPresent: true,
  structuredDataPresent: true,
  businessFactsConsistent: true,
});
assert(geo.score === 80 && geo.findings.length === 1, "AI/GEO readiness score should be deterministic");
assert(geo.guaranteesRanking === false, "AI/GEO readiness must never guarantee ranking");

const adapter = adapterContract("JOBBER", ["READ_LEAD", "READ_LEAD", "WRITE_LEAD"]);
assert(adapter.capabilities.length === 2, "adapter contract should de-duplicate capabilities");
assert(adapter.liveWritesEnabled === false, "provider adapter contract must keep live writes disabled");
