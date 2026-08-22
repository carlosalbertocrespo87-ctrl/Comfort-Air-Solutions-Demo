import { assertEquals } from 'jsr:@std/assert@1';
import { decideDuplicateReceipt } from './receipt-retry.ts';

Deno.test('FAILED receipts are retryable', () => {
  assertEquals(decideDuplicateReceipt('FAILED'), 'retry_failed');
});

Deno.test('PROCESSED and IGNORED receipts are terminal duplicates', () => {
  assertEquals(decideDuplicateReceipt('PROCESSED'), 'ack_terminal');
  assertEquals(decideDuplicateReceipt('IGNORED'), 'ack_terminal');
});

Deno.test('RECEIVED receipts fail closed for a later retry', () => {
  assertEquals(decideDuplicateReceipt('RECEIVED'), 'retry_later');
});

Deno.test('unknown receipt state fails closed', () => {
  assertEquals(decideDuplicateReceipt(null), 'fail_closed');
  assertEquals(decideDuplicateReceipt('BOGUS'), 'fail_closed');
});
