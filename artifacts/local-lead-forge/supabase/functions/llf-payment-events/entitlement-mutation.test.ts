import { assertEquals, assertRejects } from 'jsr:@std/assert';
import { applyAuthoritativeEntitlementState } from './entitlement-mutation.ts';

Deno.test('rejects invalid acceptance ref before RPC', async () => {
  const admin = { rpc: () => { throw new Error('must_not_call'); } };
  await assertRejects(() => applyAuthoritativeEntitlementState(admin, {
    acceptanceRef: 'bad', eventId: 'evt_1', eventCreatedAt: null,
    stripeCustomerRef: null, setupPaymentRef: null, subscriptionRef: null,
    setupStatus: 'PENDING', monthlyStatus: 'PENDING',
  }), Error, 'invalid_acceptance_ref');
});

Deno.test('rejects invalid event id before RPC', async () => {
  const admin = { rpc: () => { throw new Error('must_not_call'); } };
  await assertRejects(() => applyAuthoritativeEntitlementState(admin, {
    acceptanceRef: '11111111-1111-1111-1111-111111111111', eventId: 'bad', eventCreatedAt: null,
    stripeCustomerRef: null, setupPaymentRef: null, subscriptionRef: null,
    setupStatus: 'PENDING', monthlyStatus: 'PENDING',
  }), Error, 'invalid_event_id');
});

Deno.test('returns atomic apply result only from RPC response', async () => {
  let called = false;
  const admin = { rpc: async () => { called = true; return { data: [{ applied: true, onboarding_eligible: false }], error: null }; } };
  const result = await applyAuthoritativeEntitlementState(admin, {
    acceptanceRef: '11111111-1111-1111-1111-111111111111', eventId: 'evt_1', eventCreatedAt: '2026-08-21T12:00:00Z',
    stripeCustomerRef: 'cus_1', setupPaymentRef: 'pi_1', subscriptionRef: 'sub_1',
    setupStatus: 'PAID', monthlyStatus: 'PENDING',
  });
  assertEquals(called, true);
  assertEquals(result, { applied: true, onboardingEligible: false });
});
