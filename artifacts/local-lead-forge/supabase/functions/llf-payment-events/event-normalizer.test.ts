import { assertEquals } from 'jsr:@std/assert@1';
import { normalizeStripeEvent } from './event-normalizer.ts';

Deno.test('normalizes Stripe livemode and object references', () => {
  const event = normalizeStripeEvent({
    id: 'evt_1',
    type: 'payment_intent.succeeded',
    created: 1_800_000_000,
    livemode: false,
    data: { object: { id: 'pi_1', object: 'payment_intent', customer: 'cus_1' } },
  });

  assertEquals(event?.livemode, false);
  assertEquals(event?.objectRef, 'pi_1');
  assertEquals(event?.paymentIntentRef, 'pi_1');
  assertEquals(event?.customerRef, 'cus_1');
});

Deno.test('rejects events without an explicit livemode boolean', () => {
  const event = normalizeStripeEvent({
    id: 'evt_1',
    type: 'payment_intent.succeeded',
    data: { object: { id: 'pi_1', object: 'payment_intent' } },
  });
  assertEquals(event, null);
});
