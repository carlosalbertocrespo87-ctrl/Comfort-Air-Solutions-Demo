export type QaGrade = 'EXCELLENT' | 'GOOD' | 'NEEDS_REVIEW' | 'CRITICAL_REVIEW';

export type ConversationQaInput = {
  confidenceSupported: boolean;
  explicitSatisfaction: 'SATISFIED' | 'NOT_SATISFIED' | 'UNKNOWN';
  resolved: boolean;
  correctEscalation: boolean;
  aiCorrectionRequired: boolean;
  humanCorrectionRequired: boolean;
  handoffComplete: boolean;
  humanResponseMinutes?: number | null;
  sensitiveDataHandlingOk: boolean;
};

export type ConversationQaScore = {
  score: number;
  grade: QaGrade;
  reasons: string[];
  requiresReview: boolean;
};

function clampScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * LLF QA Score principles:
 * - Correct escalation is a quality success, not a failure.
 * - Explicit dissatisfaction matters more than speed.
 * - Unsupported confident answers and sensitive-data failures carry strong penalties.
 * - Response time is secondary and only applies when a human response was actually required.
 */
export function scoreConversationQa(input: ConversationQaInput): ConversationQaScore {
  let score = 100;
  const reasons: string[] = [];

  if (!input.confidenceSupported) {
    score -= 30;
    reasons.push('AI confidence was not sufficiently supported by approved knowledge.');
  }

  if (input.explicitSatisfaction === 'NOT_SATISFIED') {
    score -= 25;
    reasons.push('User explicitly reported that the answer did not resolve the need.');
  } else if (input.explicitSatisfaction === 'SATISFIED') {
    reasons.push('User explicitly confirmed satisfaction.');
  }

  if (!input.resolved) {
    score -= 10;
    reasons.push('Conversation was not resolved.');
  }

  if (!input.correctEscalation) {
    score -= 20;
    reasons.push('Escalation decision was incorrect or missing.');
  } else {
    reasons.push('Escalation behavior was appropriate.');
  }

  if (input.aiCorrectionRequired) {
    score -= 20;
    reasons.push('An AI answer required correction.');
  }

  if (input.humanCorrectionRequired) {
    score -= 15;
    reasons.push('A human response required correction.');
  }

  if (!input.handoffComplete) {
    score -= 10;
    reasons.push('Handoff context was incomplete.');
  }

  if (input.humanResponseMinutes != null) {
    if (input.humanResponseMinutes > 30) {
      score -= 10;
      reasons.push('Human response exceeded 30 minutes.');
    } else if (input.humanResponseMinutes > 10) {
      score -= 5;
      reasons.push('Human response exceeded 10 minutes.');
    }
  }

  if (!input.sensitiveDataHandlingOk) {
    score -= 40;
    reasons.push('Sensitive-data handling failed policy and requires immediate review.');
  }

  const finalScore = clampScore(score);
  const grade: QaGrade =
    finalScore >= 90
      ? 'EXCELLENT'
      : finalScore >= 75
        ? 'GOOD'
        : finalScore >= 50
          ? 'NEEDS_REVIEW'
          : 'CRITICAL_REVIEW';

  return {
    score: finalScore,
    grade,
    reasons,
    requiresReview: finalScore < 75 || !input.sensitiveDataHandlingOk || input.aiCorrectionRequired,
  };
}
