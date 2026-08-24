export type LearningWriteCommand =
  | { action: 'queue_learning_signal'; conversationId: string; sourceMessageId?: string; language: 'EN' | 'ES'; normalizedQuestion: string; fingerprint: string }
  | { action: 'save_learning_draft'; gapId: string; draftAnswer: string }
  | { action: 'submit_learning_for_review'; gapId: string; reviewNotes?: string };

export type LearningWriteParseResult =
  | { ok: true; command: LearningWriteCommand }
  | { ok: false; error: 'unsupported_learning_action' | 'invalid_identifier' | 'invalid_language' | 'invalid_question' | 'invalid_draft' | 'invalid_review_notes' };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SENSITIVE = [
  /\b(?:sk|rk)_(?:live|test)_[a-z0-9_]+\b/i,
  /\bbearer\s+[a-z0-9._~+/=-]+\b/i,
  /\b(?:password|passwd|secret|token|api[_ -]?key)\s*[:=]\s*\S+/i,
  /\b(?:\d[ -]*?){13,19}\b/,
];

function safeText(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.replace(/[<>]/g, ' ').replace(/\r\n/g, '\n').trim();
  if (trimmed.length < 4 || trimmed.length > max || SENSITIVE.some((pattern) => pattern.test(trimmed))) return null;
  return trimmed;
}

function normalizeQuestion(value: string): string {
  return value.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s/_-]/g, ' ').replace(/\s+/g, ' ').trim();
}

function validUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID.test(value);
}

export function parseLearningWriteCommand(body: Record<string, unknown>): LearningWriteParseResult {
  const action = String(body.action ?? '');

  if (action === 'queue_learning_signal') {
    if (!validUuid(body.conversation_id) || (body.source_message_id !== undefined && !validUuid(body.source_message_id))) return { ok: false, error: 'invalid_identifier' };
    if (body.language !== 'EN' && body.language !== 'ES') return { ok: false, error: 'invalid_language' };
    const question = safeText(body.question, 500);
    if (!question) return { ok: false, error: 'invalid_question' };
    const normalizedQuestion = normalizeQuestion(question);
    if (normalizedQuestion.length < 4) return { ok: false, error: 'invalid_question' };
    return { ok: true, command: {
      action,
      conversationId: body.conversation_id,
      sourceMessageId: body.source_message_id as string | undefined,
      language: body.language,
      normalizedQuestion,
      fingerprint: `${body.language}:${normalizedQuestion}`,
    } };
  }

  if (action === 'save_learning_draft') {
    if (!validUuid(body.gap_id)) return { ok: false, error: 'invalid_identifier' };
    const draftAnswer = safeText(body.draft_answer, 2000);
    return draftAnswer
      ? { ok: true, command: { action, gapId: body.gap_id, draftAnswer } }
      : { ok: false, error: 'invalid_draft' };
  }

  if (action === 'submit_learning_for_review') {
    if (!validUuid(body.gap_id)) return { ok: false, error: 'invalid_identifier' };
    if (body.review_notes === undefined || body.review_notes === '') return { ok: true, command: { action, gapId: body.gap_id } };
    const reviewNotes = safeText(body.review_notes, 1000);
    return reviewNotes
      ? { ok: true, command: { action, gapId: body.gap_id, reviewNotes } }
      : { ok: false, error: 'invalid_review_notes' };
  }

  return { ok: false, error: 'unsupported_learning_action' };
}
