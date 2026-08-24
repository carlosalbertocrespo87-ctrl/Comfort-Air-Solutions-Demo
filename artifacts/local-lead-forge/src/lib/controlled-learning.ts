export type LearningLanguage = 'EN' | 'ES';

export type LearningQueueStatus = 'OBSERVING' | 'REVIEW_READY' | 'RESOLVED' | 'DISMISSED' | 'MERGED' | 'ARCHIVED';
export type LearningAnswerStatus = 'DRAFT_ONLY' | 'ARCHIVED';

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

export const MIN_DISTINCT_CONVERSATIONS_FOR_REVIEW = 3;

const QUEUE_STATUSES = new Set<LearningQueueStatus>(['OBSERVING','REVIEW_READY','RESOLVED','DISMISSED','MERGED','ARCHIVED']);
const ANSWER_STATUSES = new Set<LearningAnswerStatus>(['DRAFT_ONLY','ARCHIVED']);
const UNSAFE_CONTROL_CHARACTERS = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\u200b-\u200f\u202a-\u202e\u2060-\u206f]/;

export function isLearningQueueItem(value: unknown): value is LearningQueueItem {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<LearningQueueItem>;
  if (typeof item.id !== 'string' || item.id.length < 1 || item.id.length > 520) return false;
  if (item.language !== 'EN' && item.language !== 'ES') return false;
  if (typeof item.normalizedQuestion !== 'string' || item.normalizedQuestion.length < 4 || item.normalizedQuestion.length > 500) return false;
  if (typeof item.fingerprint !== 'string' || buildLearningFingerprint(item.normalizedQuestion, item.language) !== item.fingerprint) return false;
  if (!QUEUE_STATUSES.has(item.status as LearningQueueStatus) || !ANSWER_STATUSES.has(item.answerStatus as LearningAnswerStatus)) return false;
  if (!Number.isInteger(item.occurrenceCount) || Number(item.occurrenceCount) < 1) return false;
  if (!isUniqueEvidenceList(item.conversationIds) || item.conversationIds.length < 1) return false;
  if (!isUniqueEvidenceList(item.sourceMessageIds)) return false;
  if (Number(item.occurrenceCount) < item.conversationIds.length) return false;
  if (item.draftAnswer !== undefined && sanitizeLearningDraft(item.draftAnswer) !== item.draftAnswer) return false;
  if (item.reviewNotes !== undefined && sanitizeLearningReviewNotes(item.reviewNotes) !== item.reviewNotes) return false;

  const terminal = item.status === 'MERGED' || item.status === 'ARCHIVED';
  if ((terminal ? 'ARCHIVED' : 'DRAFT_ONLY') !== item.answerStatus) return false;
  if (item.status === 'MERGED') {
    if (typeof item.mergedIntoId !== 'string' || item.mergedIntoId.length < 1 || item.mergedIntoId === item.id) return false;
  } else if (item.mergedIntoId !== undefined) {
    return false;
  }
  if (item.status === 'REVIEW_READY' && (!item.draftAnswer || !hasLearningEvidenceForReview(item as LearningQueueItem))) return false;

  return true;
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
  if (UNSAFE_CONTROL_CHARACTERS.test(value)) return null;
  const trimmed = value.replace(/[<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 500);
  if (trimmed.length < 4 || containsSensitiveMaterial(trimmed)) return null;
  return trimmed.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s/_-]/g, ' ').replace(/\s+/g, ' ').trim();
}

export function sanitizeLearningDraft(value: string): string | null {
  if (UNSAFE_CONTROL_CHARACTERS.test(value)) return null;
  const trimmed = value.replace(/[<>]/g, ' ').replace(/\r\n/g, '\n').trim().slice(0, 2000);
  if (trimmed.length < 4 || containsSensitiveMaterial(trimmed)) return null;
  return trimmed;
}

export function sanitizeLearningReviewNotes(value: string): string | null {
  if (UNSAFE_CONTROL_CHARACTERS.test(value)) return null;
  const trimmed = value.replace(/[<>]/g, ' ').replace(/\r\n/g, '\n').trim();
  if (trimmed.length < 4 || trimmed.length > 1000 || containsSensitiveMaterial(trimmed)) return null;
  return trimmed;
}

export function buildLearningFingerprint(question: string, language: LearningLanguage): string | null {
  const normalized = normalizeLearningQuestion(question);
  return normalized ? `${language}:${normalized}` : null;
}

export function queueLearningCandidate(items: LearningQueueItem[], candidate: LearningCandidate): LearningQueueItem[] {
  if (!isEvidenceId(candidate.conversationId) || (candidate.sourceMessageId !== undefined && !isEvidenceId(candidate.sourceMessageId))) return items;
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
  return items.map((item) => item.id === itemId && item.answerStatus === 'DRAFT_ONLY' && ['OBSERVING', 'REVIEW_READY'].includes(item.status)
    ? { ...item, draftAnswer, status: 'OBSERVING', reviewNotes: undefined }
    : item);
}

export function hasLearningEvidenceForReview(item: LearningQueueItem): boolean {
  return new Set(item.conversationIds).size >= MIN_DISTINCT_CONVERSATIONS_FOR_REVIEW;
}

export function submitLearningForReview(items: LearningQueueItem[], itemId: string, notes = ''): LearningQueueItem[] {
  const sanitizedNotes = notes.trim() ? sanitizeLearningReviewNotes(notes) : null;
  if (notes.trim() && !sanitizedNotes) return items;
  const reviewNotes = sanitizedNotes ?? undefined;
  return items.map((item) => item.id === itemId && item.answerStatus === 'DRAFT_ONLY' && item.status === 'OBSERVING' && Boolean(item.draftAnswer) && hasLearningEvidenceForReview(item)
    ? { ...item, status: 'REVIEW_READY', reviewNotes }
    : item);
}

export function mergeLearningItems(items: LearningQueueItem[], sourceId: string, targetId: string): LearningQueueItem[] {
  if (sourceId === targetId) return items;
  const source = items.find((item) => item.id === sourceId);
  const target = items.find((item) => item.id === targetId);
  if (!source || !target
    || source.language !== target.language
    || source.status !== 'OBSERVING' || target.status !== 'OBSERVING'
    || source.answerStatus !== 'DRAFT_ONLY' || target.answerStatus !== 'DRAFT_ONLY'
    || source.draftAnswer || target.draftAnswer || source.reviewNotes || target.reviewNotes) return items;

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

function isEvidenceId(value: string): boolean {
  return value.trim().length > 0 && value.length <= 200 && !UNSAFE_CONTROL_CHARACTERS.test(value);
}

function isUniqueEvidenceList(value: unknown): value is string[] {
  return Array.isArray(value)
    && value.every((id) => typeof id === 'string' && isEvidenceId(id))
    && new Set(value).size === value.length;
}
