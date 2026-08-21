import { paymentIntentPatch, subscriptionPatch, refundPatch } from './reconciler.ts';

Deno.test('payment intent succeeded maps setup to PAID', () => {
  const patch = paymentIntentPatch('succeeded', 'pi_1', 'cus_1');
  if (patch.setup_status !== 'PAID') throw new Error('setup not PAID');
});

Deno.test('failed or canceled setup payment maps to FAILED', () => {
  for (const status of ['requires_payment_method', 'canceled']) {
    const patch = paymentIntentPatch(status, 'pi_1', 'cus_1');
    if (patch.setup_status !== 'FAILED') throw new Error(`expected FAILED for ${status}`);
  }
});

Deno.test('subscription status maps conservatively', () => {
  const cases: Array<[string, string]> = [
    ['active', 'ACTIVE'], ['trialing', 'ACTIVE'], ['past_due', 'PAST_DUE'], ['unpaid', 'PAST_DUE'],
    ['canceled', 'CANCELED'], ['incomplete_expired', 'CANCELED'], ['incomplete', 'PENDING'],
  ];
  for (const [input, expected] of cases) {
    const patch = subscriptionPatch(input, 'sub_1', 'cus_1');
    if (patch.monthly_status !== expected) throw new Error(`${input} mapped to ${patch.monthly_status}`);
  }
});

Deno.test('full refund maps setup to REFUNDED', () => {
  if (refundPatch(true).setup_status !== 'REFUNDED') throw new Error('refund not mapped');
  if (refundPatch(false).setup_status) throw new Error('partial/no refund mutated setup status');
});
