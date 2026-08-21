export type QualityInteractionType =
  | 'USER_MESSAGE'
  | 'AI_MESSAGE'
  | 'AGENT_MESSAGE'
  | 'HUMAN_REQUEST'
  | 'HANDOFF'
  | 'CLAIM'
  | 'TRANSFER'
  | 'STATUS_CHANGE'
  | 'FEEDBACK'
  | 'RESOLUTION'
  | 'KNOWLEDGE_GAP'
  | 'SYSTEM_EVENT';

export type QualityActor = 'PROSPECT' | 'CLIENT' | 'AI' | 'AGENT' | 'SYSTEM';

export type QualityInteractionRecord = {
  conversationId?: string;
  audience: 'PROSPECT' | 'CLIENT';
  channel: 'PUBLIC_WEB' | 'CLIENT_PORTAL';
  interactionType: QualityInteractionType;
  actorType: QualityActor;
  actorLabel?: string;
  messageId?: string;
  contentExcerpt?: string;
  outcome?: string;
  satisfaction?: 'UNKNOWN' | 'SATISFIED' | 'NOT_SATISFIED';
  intentLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'READY_TO_BUY';
  occurredAt: string;
};

/**
 * Quality policy:
 * Preserve the operational history needed to reconstruct what happened,
 * who/what responded, whether the user was satisfied, and where LLF should improve.
 * Never intentionally log credentials, payment data, secrets or authentication tokens.
 */
export function shouldPersistForQuality(record: QualityInteractionRecord) {
  return Boolean(record.occurredAt && record.interactionType && record.actorType);
}

export const NEVER_LOG_PATTERNS = [
  'password',
  'passcode',
  'credit card',
  'card number',
  'cvv',
  'security code',
  'auth token',
  'access token',
  'api key',
  'private key',
] as const;

export function containsNeverLogMarker(value: string) {
  const normalized = value.toLowerCase();
  return NEVER_LOG_PATTERNS.some((marker) => normalized.includes(marker));
}

export type QualityReviewOutcome =
  | 'NO_ACTION'
  | 'IMPROVE_KNOWLEDGE'
  | 'IMPROVE_AI_BEHAVIOR'
  | 'IMPROVE_AGENT_PLAYBOOK'
  | 'IMPROVE_PRODUCT_UX'
  | 'REVIEW_POLICY';

export type QualityReviewItem = {
  conversationId: string;
  summary: string;
  evidence: string[];
  outcome: QualityReviewOutcome;
  requiresHumanApproval: true;
};

// Quality findings are advisory. Human approval is required before they alter
// pricing, legal terms, payment behavior, security rules or public claims.
