import { resolveSingleCorrelation } from './correlation.ts';

const base = [
  { acceptance_ref: 'a1', stripe_customer_ref: 'cus_1', setup_payment_ref: 'pi_1', subscription_ref: 'sub_1' },
  { acceptance_ref: 'a2', stripe_customer_ref: 'cus_2', setup_payment_ref: 'pi_2', subscription_ref: 'sub_2' },
];

Deno.test('returns exactly one matching entitlement context', () => {
  const found = resolveSingleCorrelation(base, { customerRef: 'cus_1' });
  if (found?.acceptance_ref !== 'a1') throw new Error('wrong correlation');
});

Deno.test('fails closed on no match or ambiguous match', () => {
  if (resolveSingleCorrelation(base, { customerRef: 'cus_missing' }) !== null) throw new Error('accepted missing correlation');
  const ambiguous = [...base, { acceptance_ref: 'a3', stripe_customer_ref: 'cus_1', setup_payment_ref: null, subscription_ref: null }];
  if (resolveSingleCorrelation(ambiguous, { customerRef: 'cus_1' }) !== null) throw new Error('accepted ambiguous correlation');
});

Deno.test('fails closed on conflicting known refs', () => {
  const found = resolveSingleCorrelation(base, { customerRef: 'cus_1', subscriptionRef: 'sub_2' });
  if (found !== null) throw new Error('accepted conflicting refs');
});
