export type HandoffReason =
  | 'EMERGENCY'
  | 'LOW_CONFIDENCE'
  | 'HUMAN_REQUESTED'
  | 'PRICING_NOT_AUTHORIZED'
  | 'SAFETY_CRITICAL'
  | 'UNKNOWN';

export type HandoffDecision = {
  required: boolean;
  reason: HandoffReason;
  externalActionAllowed: false;
  note: string;
};

export function evaluateHumanHandoff(input: {
  emergency?: boolean;
  confidence?: number;
  humanRequested?: boolean;
  pricingAuthorized?: boolean;
  safetyCritical?: boolean;
}): HandoffDecision {
  if (input.safetyCritical) return blocked('SAFETY_CRITICAL', 'Safety-critical cases require human control.');
  if (input.emergency) return blocked('EMERGENCY', 'Emergency routing requires an approved human workflow.');
  if (input.humanRequested) return blocked('HUMAN_REQUESTED', 'Respect explicit requests for a human.');
  if (input.pricingAuthorized === false) return blocked('PRICING_NOT_AUTHORIZED', 'AI cannot invent or approve pricing.');
  if (typeof input.confidence === 'number' && input.confidence < 0.75) return blocked('LOW_CONFIDENCE', 'Low-confidence cases escalate instead of guessing.');
  return { required: false, reason: 'UNKNOWN', externalActionAllowed: false, note: 'No external action is authorized by this policy.' };
}

function blocked(reason: HandoffReason, note: string): HandoffDecision {
  return { required: true, reason, externalActionAllowed: false, note };
}
