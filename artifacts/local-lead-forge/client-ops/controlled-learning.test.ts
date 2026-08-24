import { archiveLearningItem, buildLearningFingerprint, isLearningQueueItem, mergeLearningItems, queueLearningCandidate, submitLearningForReview, updateLearningDraft, type LearningQueueItem } from '../src/lib/controlled-learning.ts';

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

Deno.test('human draft can enter review but can never auto-approve', () => {
  let queue: LearningQueueItem[] = [];
  queue = queueLearningCandidate(queue, { question: 'What is the exception policy?', language: 'EN', conversationId: 'conversation-a' });
  queue = updateLearningDraft(queue, queue[0].id, 'Draft response requiring a human decision.');
  if (queue[0].status !== 'OBSERVING' || queue[0].answerStatus !== 'DRAFT_ONLY') throw new Error('draft escaped controlled state');
  queue = submitLearningForReview(queue, queue[0].id);
  if (queue[0].status !== 'REVIEW_READY' || queue[0].answerStatus !== 'DRAFT_ONLY') throw new Error('review submission approved content');
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

Deno.test('archive cannot turn a draft into an approved answer', () => {
  let queue: LearningQueueItem[] = [];
  queue = queueLearningCandidate(queue, { question: 'What is the exception policy?', language: 'EN', conversationId: 'conversation-a' });
  queue = archiveLearningItem(queue, queue[0].id);
  if (queue[0].status !== 'ARCHIVED' || queue[0].answerStatus !== 'ARCHIVED') throw new Error('archive transition invalid');
});

Deno.test('malformed persisted queue state is rejected', () => {
  if (isLearningQueueItem({ id: 'unsafe', status: 'APPROVED', occurrenceCount: 0 })) throw new Error('malformed local state was trusted');
});
