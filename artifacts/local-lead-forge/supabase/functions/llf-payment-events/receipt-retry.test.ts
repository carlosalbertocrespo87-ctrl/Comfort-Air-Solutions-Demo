import { assertEquals } from 'jsr:@std/assert';
import { decideDuplicateReceipt } from './receipt-retry.ts';

Deno.test('terminal Stripe receipts acknowledge duplicates without mutation', () => {
  assertEquals(decideDuplicateReceipt('PROCESSED'), 'ack_terminal');
  assertEquals(decideDuplicateReceipt('IGNORED'), 'ack_terminal');
});

Deno.test('failed receipt may be reclaimed while in-progress remains closed', () => {
  assertEquals(decideDuplicateReceipt('FAILED'), 'retry_failed');
  assertEquals(decideDuplicateReceipt('RECEIVED'), 'retry_later');
});

Deno.test('unknown receipt state fails closed', () => {
  assertEquals(decideDuplicateReceipt('UNKNOWN'), 'fail_closed');
  assertEquals(decideDuplicateReceipt(null), 'fail_closed');
});
