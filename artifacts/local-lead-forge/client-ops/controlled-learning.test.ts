import { archiveLearningItem, buildLearningFingerprint, hasLearningEvidenceForReview, isLearningQueueItem, mergeLearningItems, queueLearningCandidate, submitLearningForReview, updateLearningDraft, type LearningQueueItem } from '../src/lib/controlled-learning.ts';

Deno.test('controlled learning deduplicates equivalent questions without publishing an answer', () => {
  let queue: LearningQueueItem[] = [];
  queue = queueLearningCandidate(queue, { question: '¿Cómo funciona la configuración?', language: 'ES', conversationId: 'conversation-a', sourceMessageId: 'message-a' });
  queue = queueLearningCandidate(queue, { question: '  COMO funciona la configuracion? ', language: 'ES', conversationId: 'conversation-b', sourceMessageId: 'message-b' });
  if (queue.length !== 1 || queue[0].occurrenceCount !== 2) throw new Error('equivalent questions were not deduplicated');
  if (queue[0].conversationIds.length !== 2 || queue[0].answerStatus !== 'DRAFT_ONLY') throw new Error('review evidence or draft-only guard missing');
});

Deno.test('same text in different languages remains separately reviewable', () => {
  const es = buildLearningFingerprint('Support policy?', 'ES');
  const en = buildLearningFingerprint('Support policy?', 'EN');
  if (!es || !en || es === en) throw new Error('language dimension collapsed');
});

Deno.test('potential secrets and payment data are refused before queueing', () => {
  const values = [
    'My password: unsafe-value',
    'Bearer abc.def.ghi',
    'sk_live_examplevalue',
    '4111 1111 1111 1111',
  ];
  for (const question of values) {
    if (buildLearningFingerprint(question, 'EN') !== null) throw new Error(`sensitive value was accepted: ${question}`);
  }
});

Deno.test('control and bidirectional characters are refused before local persistence', () => {
  const unsafeQuestions = ['Safe\u0000question', 'Safe\u202etoken: hidden-value'];
  for (const question of unsafeQuestions) {
    if (buildLearningFingerprint(question, 'EN') !== null) throw new Error('unsafe control character entered fingerprinting');
  }
  let queue: LearningQueueItem[] = [];
  queue = queueLearningCandidate(queue, { question: 'How should setup work?', language: 'EN', conversationId: 'conversation-a' });
  const before = JSON.stringify(queue);
  queue = updateLearningDraft(queue, queue[0].id, 'Safe\u200blooking internal draft.');
  if (JSON.stringify(queue) !== before) throw new Error('unsafe control character entered a draft');
});

Deno.test('empty or unsafe evidence identifiers are refused', () => {
  const empty = queueLearningCandidate([], { question: 'How should setup work?', language: 'EN', conversationId: '   ' });
  const unsafe = queueLearningCandidate([], { question: 'How should setup work?', language: 'EN', conversationId: 'conversation-a', sourceMessageId: 'message\u202e-a' });
  if (empty.length || unsafe.length) throw new Error('invalid evidence identifier entered local state');
});

Deno.test('isolated learning signal cannot enter human review', () => {
  let queue: LearningQueueItem[] = [];
  queue = queueLearningCandidate(queue, { question: 'What is the exception policy?', language: 'EN', conversationId: 'conversation-a' });
  queue = updateLearningDraft(queue, queue[0].id, 'Draft response requiring a human decision.');
  if (hasLearningEvidenceForReview(queue[0])) throw new Error('isolated signal met evidence threshold');
  const before = JSON.stringify(queue);
  queue = submitLearningForReview(queue, queue[0].id);
  if (JSON.stringify(queue) !== before || queue[0].status !== 'OBSERVING') throw new Error('isolated signal entered review');
});

Deno.test('human draft can enter review but can never auto-approve', () => {
  let queue: LearningQueueItem[] = [];
  queue = queueLearningCandidate(queue, { question: 'What is the exception policy?', language: 'EN', conversationId: 'conversation-a' });
  queue = queueLearningCandidate(queue, { question: 'What is the exception policy?', language: 'EN', conversationId: 'conversation-b' });
  queue = queueLearningCandidate(queue, { question: 'What is the exception policy?', language: 'EN', conversationId: 'conversation-c' });
  queue = updateLearningDraft(queue, queue[0].id, 'Draft response requiring a human decision.');
  if (queue[0].status !== 'OBSERVING' || queue[0].answerStatus !== 'DRAFT_ONLY') throw new Error('draft escaped controlled state');
  queue = submitLearningForReview(queue, queue[0].id);
  if (queue[0].status !== 'REVIEW_READY' || queue[0].answerStatus !== 'DRAFT_ONLY') throw new Error('review submission approved content');
});

Deno.test('editing a review draft reopens observation and terminal items remain immutable', () => {
  let queue: LearningQueueItem[] = [];
  for (const conversationId of ['conversation-a', 'conversation-b', 'conversation-c']) {
    queue = queueLearningCandidate(queue, { question: 'What is the support policy?', language: 'EN', conversationId });
  }
  queue = updateLearningDraft(queue, queue[0].id, 'First internal draft.');
  queue = submitLearningForReview(queue, queue[0].id, 'Three distinct conversations confirmed.');
  queue = updateLearningDraft(queue, queue[0].id, 'Revised internal draft.');
  if (queue[0].status !== 'OBSERVING' || queue[0].reviewNotes !== undefined) throw new Error('edited review did not return to observation');
  queue = archiveLearningItem(queue, queue[0].id);
  const before = JSON.stringify(queue);
  queue = updateLearningDraft(queue, queue[0].id, 'Attempted terminal-state edit.');
  if (JSON.stringify(queue) !== before) throw new Error('terminal item was edited');
});

Deno.test('review notes remain bounded to the backend contract', () => {
  let queue: LearningQueueItem[] = [];
  for (const conversationId of ['conversation-a', 'conversation-b', 'conversation-c']) {
    queue = queueLearningCandidate(queue, { question: 'What is the support policy?', language: 'EN', conversationId });
  }
  queue = updateLearningDraft(queue, queue[0].id, 'Internal draft for bounded-note QA.');
  const before = JSON.stringify(queue);
  queue = submitLearningForReview(queue, queue[0].id, 'n'.repeat(1001));
  if (JSON.stringify(queue) !== before) throw new Error('oversized review notes entered local state');
});

Deno.test('sensitive draft is rejected without changing the queue', () => {
  let queue: LearningQueueItem[] = [];
  queue = queueLearningCandidate(queue, { question: 'How should setup work?', language: 'EN', conversationId: 'conversation-a' });
  const before = JSON.stringify(queue);
  queue = updateLearningDraft(queue, queue[0].id, 'Bearer abc.def.ghi');
  if (JSON.stringify(queue) !== before) throw new Error('sensitive draft entered the queue');
});

Deno.test('merge preserves evidence and archives only the source answer', () => {
  let queue: LearningQueueItem[] = [];
  queue = queueLearningCandidate(queue, { question: 'Does this integrate with our CRM?', language: 'EN', conversationId: 'conversation-a' });
  queue = queueLearningCandidate(queue, { question: 'Can this integrate with our CRM?', language: 'EN', conversationId: 'conversation-b' });
  const [target, source] = queue;
  queue = mergeLearningItems(queue, source.id, target.id);
  const mergedTarget = queue.find((item) => item.id === target.id)!;
  const mergedSource = queue.find((item) => item.id === source.id)!;
  if (mergedTarget.occurrenceCount !== 2 || mergedTarget.conversationIds.length !== 2) throw new Error('merged evidence was lost');
  if (mergedSource.status !== 'MERGED' || mergedSource.answerStatus !== 'ARCHIVED' || mergedSource.mergedIntoId !== target.id) throw new Error('source merge state invalid');
});

Deno.test('authored items cannot be merged implicitly', () => {
  let queue: LearningQueueItem[] = [];
  queue = queueLearningCandidate(queue, { question: 'Does this integrate with CRM A?', language: 'EN', conversationId: 'conversation-a' });
  queue = queueLearningCandidate(queue, { question: 'Does this integrate with CRM B?', language: 'EN', conversationId: 'conversation-b' });
  queue = updateLearningDraft(queue, queue[0].id, 'Draft answer for CRM A.');
  const before = JSON.stringify(queue);
  queue = mergeLearningItems(queue, queue[1].id, queue[0].id);
  if (JSON.stringify(queue) !== before) throw new Error('authored item merged without human reconciliation');
});

Deno.test('merge cannot cross language or workflow-state boundaries', () => {
  let queue: LearningQueueItem[] = [];
  queue = queueLearningCandidate(queue, { question: 'Support policy A?', language: 'EN', conversationId: 'conversation-a' });
  queue = queueLearningCandidate(queue, { question: 'Support policy B?', language: 'ES', conversationId: 'conversation-b' });
  const beforeLanguage = JSON.stringify(queue);
  queue = mergeLearningItems(queue, queue[1].id, queue[0].id);
  if (JSON.stringify(queue) !== beforeLanguage) throw new Error('cross-language items merged');

  queue = queueLearningCandidate(queue, { question: 'Support policy C?', language: 'EN', conversationId: 'conversation-c' });
  queue = archiveLearningItem(queue, queue[2].id);
  const beforeState = JSON.stringify(queue);
  queue = mergeLearningItems(queue, queue[2].id, queue[0].id);
  if (JSON.stringify(queue) !== beforeState) throw new Error('terminal item crossed merge boundary');
});

Deno.test('archive cannot turn a draft into an approved answer', () => {
  let queue: LearningQueueItem[] = [];
  queue = queueLearningCandidate(queue, { question: 'What is the exception policy?', language: 'EN', conversationId: 'conversation-a' });
  queue = archiveLearningItem(queue, queue[0].id);
  if (queue[0].status !== 'ARCHIVED' || queue[0].answerStatus !== 'ARCHIVED') throw new Error('archive transition invalid');
});

Deno.test('malformed persisted queue state is rejected', () => {
  if (isLearningQueueItem({ id: 'unsafe', status: 'APPROVED', occurrenceCount: 0 })) throw new Error('malformed local state was trusted');

  const valid = queueLearningCandidate([], { question: 'What is the support policy?', language: 'EN', conversationId: 'conversation-a' })[0];
  if (!isLearningQueueItem(valid)) throw new Error('valid local state was rejected');
  if (isLearningQueueItem({ ...valid, answerStatus: 'APPROVED' })) throw new Error('approved learning answer was trusted');
  if (isLearningQueueItem({ ...valid, fingerprint: 'EN:forged' })) throw new Error('forged fingerprint was trusted');
  if (isLearningQueueItem({ ...valid, status: 'REVIEW_READY', draftAnswer: 'Plausible draft.' })) throw new Error('review-ready item without evidence was trusted');
  if (isLearningQueueItem({ ...valid, occurrenceCount: 2, conversationIds: ['conversation-a', 'conversation-a'] })) throw new Error('duplicate evidence was trusted');
});
