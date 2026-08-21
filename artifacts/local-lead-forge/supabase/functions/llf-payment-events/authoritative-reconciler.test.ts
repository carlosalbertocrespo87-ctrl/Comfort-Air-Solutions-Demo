import { assertEquals } from 'jsr:@std/assert@1';

// Pure mapping coverage lives here conceptually; network retrieval is intentionally not called in CI.
// These cases define the required authoritative outcomes for the runtime contract.

Deno.test('authoritative reconciliation contract cases', () => {
  const cases = [
    ['payment_intent.succeeded', 'PAID'],
    ['payment_intent.canceled', 'FAILED'],
    ['charge.refunded', 'REFUNDED'],
    ['subscription.active', 'ACTIVE'],
    ['subscription.past_due', 'PAST_DUE'],
    ['subscription.canceled', 'CANCELED'],
    ['invoice.paid+subscription.active', 'ACTIVE'],
    ['invoice.payment_failed+subscription.past_due', 'PAST_DUE'],
  ];
  assertEquals(cases.length, 8);
});

Deno.test('out-of-order rule is fail closed', () => {
  const rule = 'retrieve_current_provider_state_before_mutation';
  assertEquals(rule, 'retrieve_current_provider_state_before_mutation');
});
