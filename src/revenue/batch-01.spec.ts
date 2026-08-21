import { preserveFirstTouch } from "./source-attribution";
import { evaluateHumanHandoff } from "./handoff-policy";

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const first = preserveFirstTouch(
  undefined,
  { source: "  google  ", medium: " organic ", campaign: " summer " },
  "2026-08-21T18:00:00Z",
);
assert(first.source === "google", "source attribution should normalize initial source");
assert(first.medium === "organic", "source attribution should normalize initial medium");
assert(first.campaign === "summer", "source attribution should normalize initial campaign");
assert(first.firstTouchAt === "2026-08-21T18:00:00Z", "first-touch timestamp should be set deterministically");

const preserved = preserveFirstTouch(
  first,
  { source: "facebook", medium: "paid-social", campaign: "retargeting" },
  "2026-08-21T19:00:00Z",
);
assert(preserved.source === "google", "first-touch source must not be overwritten by later touches");
assert(preserved.campaign === "summer", "first-touch campaign must not be overwritten by later touches");

const safety = evaluateHumanHandoff({ safetyCritical: true, confidence: 0.99 });
assert(safety.required && safety.reason === "SAFETY_CRITICAL", "safety-critical cases must escalate");
assert(safety.externalActionAllowed === false, "handoff policy must never authorize external action");

const emergency = evaluateHumanHandoff({ emergency: true, confidence: 0.99 });
assert(emergency.required && emergency.reason === "EMERGENCY", "emergencies must escalate");

const pricing = evaluateHumanHandoff({ pricingAuthorized: false, confidence: 0.99 });
assert(pricing.required && pricing.reason === "PRICING_NOT_AUTHORIZED", "unauthorized pricing must escalate");

const lowConfidence = evaluateHumanHandoff({ confidence: 0.5 });
assert(lowConfidence.required && lowConfidence.reason === "LOW_CONFIDENCE", "low-confidence decisions must escalate");

const advisoryOnly = evaluateHumanHandoff({ confidence: 0.95, pricingAuthorized: true });
assert(!advisoryOnly.required, "high-confidence internal evaluation may remain non-escalated");
assert(advisoryOnly.externalActionAllowed === false, "non-escalated evaluation still must not authorize external actions");
