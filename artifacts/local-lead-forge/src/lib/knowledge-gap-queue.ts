export type KnowledgeGapSeverity = 'LOW' | 'MEDIUM' | 'HIGH';
export type KnowledgeGapQueueStatus = 'OBSERVING' | 'REVIEW_READY' | 'RESOLVED' | 'DISMISSED';

export type KnowledgeGapSignal = {
  fingerprint: string;
  normalizedQuestion: string;
  topic: string;
  audience: 'PROSPECT' | 'CLIENT';
  occurrenceCount: number;
  distinctConversationCount: number;
  highIntentCount: number;
  notSatisfiedCount: number;
  humanRequestCount: number;
  firstSeenAt: string;
  lastSeenAt: string;
};

export type KnowledgeGapQueueDecision = {
  status: KnowledgeGapQueueStatus;
  severity: KnowledgeGapSeverity;
  reason: string;
  shouldCreateReviewItem: boolean;
};

/**
 * Conservative queueing rule:
 * - Normal gaps need at least 3 distinct conversations before becoming review-ready.
 * - High-impact gaps can become review-ready earlier when tied to repeated dissatisfaction,
 *   repeated human handoff, or clear buying intent.
 * - A single isolated question never auto-creates a review item.
 */
export function evaluateKnowledgeGap(signal: KnowledgeGapSignal): KnowledgeGapQueueDecision {
  const repeated = signal.distinctConversationCount >= 3;
  const highImpact =
    signal.notSatisfiedCount >= 2 ||
    signal.humanRequestCount >= 2 ||
    signal.highIntentCount >= 2;

  const enoughEvidence = repeated || (signal.distinctConversationCount >= 2 && highImpact);

  if (!enoughEvidence) {
    return {
      status: 'OBSERVING',
      severity: 'LOW',
      reason: 'Not enough independent evidence yet; keep observing without creating task noise.',
      shouldCreateReviewItem: false,
    };
  }

  const severity: KnowledgeGapSeverity =
    signal.notSatisfiedCount >= 3 || signal.humanRequestCount >= 3 || signal.highIntentCount >= 3
      ? 'HIGH'
      : highImpact
        ? 'MEDIUM'
        : 'LOW';

  return {
    status: 'REVIEW_READY',
    severity,
    reason:
      severity === 'HIGH'
        ? 'Repeated knowledge failure is affecting important conversations and needs prompt review.'
        : 'Question is recurring across independent conversations and should be added or improved in the Knowledge Center.',
    shouldCreateReviewItem: true,
  };
}

export type KnowledgeGapReviewItem = {
  fingerprint: string;
  title: string;
  normalizedQuestion: string;
  topic: string;
  audience: 'PROSPECT' | 'CLIENT';
  severity: KnowledgeGapSeverity;
  evidenceCount: number;
  recommendedAction: 'ADD_KNOWLEDGE_ENTRY' | 'IMPROVE_EXISTING_ENTRY' | 'REVIEW_POLICY';
  status: KnowledgeGapQueueStatus;
};

export function buildKnowledgeGapReviewItem(
  signal: KnowledgeGapSignal,
  existingKnowledgeMatch: 'NONE' | 'WEAK' | 'STRONG',
): KnowledgeGapReviewItem | null {
  const decision = evaluateKnowledgeGap(signal);
  if (!decision.shouldCreateReviewItem) return null;

  const recommendedAction =
    existingKnowledgeMatch === 'NONE'
      ? 'ADD_KNOWLEDGE_ENTRY'
      : existingKnowledgeMatch === 'WEAK'
        ? 'IMPROVE_EXISTING_ENTRY'
        : 'REVIEW_POLICY';

  return {
    fingerprint: signal.fingerprint,
    title: `Knowledge gap: ${signal.normalizedQuestion}`,
    normalizedQuestion: signal.normalizedQuestion,
    topic: signal.topic,
    audience: signal.audience,
    severity: decision.severity,
    evidenceCount: signal.distinctConversationCount,
    recommendedAction,
    status: decision.status,
  };
}
