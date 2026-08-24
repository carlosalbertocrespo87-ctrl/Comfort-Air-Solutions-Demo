import { parseLearningWriteCommand } from '../supabase/functions/llf-agent-ops/learning-write-contract.ts';

const conversationId = '10000000-0000-4000-8000-000000000001';
const messageId = '10000000-0000-4000-8000-000000000002';
const gapId = '10000000-0000-4000-8000-000000000003';

Deno.test('queue contract derives normalized fingerprint and ignores client fingerprint', () => {
  const result = parseLearningWriteCommand({ action: 'queue_learning_signal', conversation_id: conversationId, source_message_id: messageId, language: 'ES', question: '¿Cómo funciona la configuración?', fingerprint: 'forged' });
  if (!result.ok || result.command.action !== 'queue_learning_signal') throw new Error('valid queue signal rejected');
  if (result.command.fingerprint !== 'ES:como funciona la configuracion') throw new Error('server fingerprint not derived');
});

Deno.test('queue contract rejects invalid ids and language', () => {
  if (parseLearningWriteCommand({ action: 'queue_learning_signal', conversation_id: 'bad', language: 'EN', question: 'Valid question?' }).ok) throw new Error('invalid UUID accepted');
  if (parseLearningWriteCommand({ action: 'queue_learning_signal', conversation_id: conversationId, language: 'FR', question: 'Valid question?' }).ok) throw new Error('invalid language accepted');
});

Deno.test('queue and draft contracts reject secrets and payment-card-like values', () => {
  const values = ['sk_live_examplevalue', 'Bearer abc.def.ghi', 'password: unsafe-value', '4111 1111 1111 1111'];
  for (const value of values) {
    if (parseLearningWriteCommand({ action: 'queue_learning_signal', conversation_id: conversationId, language: 'EN', question: value }).ok) throw new Error('sensitive question accepted');
    if (parseLearningWriteCommand({ action: 'save_learning_draft', gap_id: gapId, draft_answer: value }).ok) throw new Error('sensitive draft accepted');
  }
});

Deno.test('draft and review commands accept bounded non-sensitive text only', () => {
  const draft = parseLearningWriteCommand({ action: 'save_learning_draft', gap_id: gapId, draft_answer: 'Internal draft for human review.' });
  if (!draft.ok || draft.command.action !== 'save_learning_draft') throw new Error('valid draft rejected');
  const review = parseLearningWriteCommand({ action: 'submit_learning_for_review', gap_id: gapId, review_notes: 'Evidence threshold checked by reviewer.' });
  if (!review.ok || review.command.action !== 'submit_learning_for_review') throw new Error('valid review rejected');
});

Deno.test('approval and publication are not part of the write contract', () => {
  if (parseLearningWriteCommand({ action: 'approve_learning_answer', gap_id: gapId }).ok) throw new Error('approval entered contract');
  if (parseLearningWriteCommand({ action: 'publish_learning_answer', gap_id: gapId }).ok) throw new Error('publication entered contract');
});
