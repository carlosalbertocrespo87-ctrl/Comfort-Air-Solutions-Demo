export type LearningLanguage = 'EN' | 'ES';

export type LearningQueueStatus = 'OBSERVING' | 'REVIEW_READY' | 'RESOLVED' | 'DISMISSED' | 'MERGED' | 'ARCHIVED';
export type LearningAnswerStatus = 'DRAFT_ONLY' | 'APPROVED' | 'ARCHIVED';

export type LearningCandidate = {
  question: string;
  language: LearningLanguage;
  conversationId: string;
  sourceMessageId?: string;
};

export type LearningQueueItem = {
  id: string;
  fingerprint: string;
  normalizedQuestion: string;
  language: LearningLanguage;
  status: LearningQueueStatus;
  answerStatus: LearningAnswerStatus;
  occurrenceCount: number;
  conversationIds: string[];
  sourceMessageIds: string[];
  draftAnswer?: string;
  reviewNotes?: string;
  mergedIntoId?: string;
};

const QUEUE_STATUSES = new Set<LearningQueueStatus>(['OBSERVING','REVIEW_READY','RESOLVED','DISMISSED','MERGED','ARCHIVED']);
const ANSWER_STATUSES = new Set<LearningAnswerStatus>(['DRAFT_ONLY','APPROVED','ARCHIVED']);

export function isLearningQueueItem(value: unknown): value is LearningQueueItem {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<LearningQueueItem>;
  return typeof item.id === 'string'
    && typeof item.fingerprint === 'string'
    && typeof item.normalizedQuestion === 'string'
    && (item.language === 'EN' || item.language === 'ES')
    && QUEUE_STATUSES.has(item.status as LearningQueueStatus)
    && ANSWER_STATUSES.has(item.answerStatus as LearningAnswerStatus)
    && Number.isInteger(item.occurrenceCount)
    && Number(item.occurrenceCount) > 0
    && Array.isArray(item.conversationIds)
    && item.conversationIds.every((id) => typeof id === 'string')
    && Array.isArray(item.sourceMessageIds)
    && item.sourceMessageIds.every((id) => typeof id === 'string')
    && (item.draftAnswer === undefined || typeof item.draftAnswer === 'string')
    && (item.reviewNotes === undefined || typeof item.reviewNotes === 'string');
}

const SENSITIVE_PATTERNS = [
  /\b(?:sk|rk)_(?:live|test)_[a-z0-9_]+\b/i,
  /\bbearer\s+[a-z0-9._~+/=-]+\b/i,
  /\b(?:password|passwd|secret|token|api[_ -]?key)\s*[:=]\s*\S+/i,
  /\b(?:\d[ -]*?){13,19}\b/,
];

function containsSensitiveMaterial(value: string): boolean {
  return SENSITIVE_PATTERNS.some((pattern) => pattern.test(value));
}

export function normalizeLearningQuestion(value: string): string | null {
  const trimmed = value.replace(/[<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 500);
  if (trimmed.length < 4 || containsSensitiveMaterial(trimmed)) return null;
  return trimmed.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s/_-]/g, ' ').replace(/\s+/g, ' ').trim();
}

export function sanitizeLearningDraft(value: string): string | null {
  const trimmed = value.replace(/[<>]/g, ' ').replace(/\r\n/g, '\n').trim().slice(0, 2000);
  if (trimmed.length < 4 || containsSensitiveMaterial(trimmed)) return null;
  return trimmed;
}

export function buildLearningFingerprint(question: string, language: LearningLanguage): string | null {
  const normalized = normalizeLearningQuestion(question);
  return normalized ? `${language}:${normalized}` : null;
}

export function queueLearningCandidate(items: LearningQueueItem[], candidate: LearningCandidate): LearningQueueItem[] {
  const fingerprint = buildLearningFingerprint(candidate.question, candidate.language);
  const normalizedQuestion = normalizeLearningQuestion(candidate.question);
  if (!fingerprint || !normalizedQuestion) return items;

  const match = items.find((item) => item.fingerprint === fingerprint && !['MERGED', 'ARCHIVED'].includes(item.status));
  if (!match) {
    return [...items, {
      id: `gap:${fingerprint}`,
      fingerprint,
      normalizedQuestion,
      language: candidate.language,
      status: 'OBSERVING',
      answerStatus: 'DRAFT_ONLY',
      occurrenceCount: 1,
      conversationIds: [candidate.conversationId],
      sourceMessageIds: candidate.sourceMessageId ? [candidate.sourceMessageId] : [],
    }];
  }

  return items.map((item) => item.id === match.id ? {
    ...item,
    occurrenceCount: item.occurrenceCount + 1,
    conversationIds: unique([...item.conversationIds, candidate.conversationId]),
    sourceMessageIds: unique([...item.sourceMessageIds, ...(candidate.sourceMessageId ? [candidate.sourceMessageId] : [])]),
  } : item);
}

export function updateLearningDraft(items: LearningQueueItem[], itemId: string, value: string): LearningQueueItem[] {
  const draftAnswer = sanitizeLearningDraft(value);
  if (!draftAnswer) return items;
  return items.map((item) => item.id === itemId && item.answerStatus === 'DRAFT_ONLY' && !['MERGED', 'ARCHIVED'].includes(item.status)
    ? { ...item, draftAnswer, status: 'OBSERVING' }
    : item);
}

export function submitLearningForReview(items: LearningQueueItem[], itemId: string, notes = ''): LearningQueueItem[] {
  const reviewNotes = notes.trim() ? sanitizeLearningDraft(notes) : undefined;
  if (notes.trim() && !reviewNotes) return items;
  return items.map((item) => item.id === itemId && item.answerStatus === 'DRAFT_ONLY' && item.status === 'OBSERVING' && Boolean(item.draftAnswer)
    ? { ...item, status: 'REVIEW_READY', reviewNotes }
    : item);
}

export function mergeLearningItems(items: LearningQueueItem[], sourceId: string, targetId: string): LearningQueueItem[] {
  if (sourceId === targetId) return items;
  const source = items.find((item) => item.id === sourceId);
  const target = items.find((item) => item.id === targetId);
  if (!source || !target || source.draftAnswer || target.draftAnswer || ['MERGED', 'ARCHIVED'].includes(source.status) || ['MERGED', 'ARCHIVED'].includes(target.status)) return items;

  return items.map((item) => {
    if (item.id === targetId) return {
      ...item,
      occurrenceCount: item.occurrenceCount + source.occurrenceCount,
      conversationIds: unique([...item.conversationIds, ...source.conversationIds]),
      sourceMessageIds: unique([...item.sourceMessageIds, ...source.sourceMessageIds]),
    };
    if (item.id === sourceId) return { ...item, status: 'MERGED', answerStatus: 'ARCHIVED', mergedIntoId: targetId };
    return item;
  });
}

export function archiveLearningItem(items: LearningQueueItem[], itemId: string): LearningQueueItem[] {
  return items.map((item) => item.id === itemId && item.status !== 'MERGED'
    ? { ...item, status: 'ARCHIVED', answerStatus: 'ARCHIVED' }
    : item);
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}
