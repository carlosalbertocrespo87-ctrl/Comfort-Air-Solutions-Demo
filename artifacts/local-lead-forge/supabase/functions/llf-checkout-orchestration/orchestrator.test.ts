import { assertEquals, assertRejects } from 'jsr:@std/assert';
import {
  orchestrateCheckout,
  type CheckoutOrchestrationDeps,
  type DurableAcceptance,
  type ExistingCorrelation,
} from './orchestrator.ts';

const acceptanceRef = '10000000-0000-4000-8000-000000000001';
const acceptance: DurableAcceptance = {
  acceptanceRef,
  legalVersion: 'llf-legal-v1',
  customerName: 'Test Customer',
  companyName: 'Test HVAC',
  customerEmail: 'test@example.com',
};

const releasedInput = {
  acceptanceRef,
  idempotencyKey: 'checkout-test-001',
  legalReleased: true,
  checkoutCreationReleased: true,
  releasedLegalVersion: 'llf-legal-v1',
};

function fakeDeps(overrides: Partial<CheckoutOrchestrationDeps> = {}) {
  const calls: string[] = [];
  let correlation: ExistingCorrelation = { stripeCustomerRef: null, setupPaymentRef: null, subscriptionRef: null };
  const deps: CheckoutOrchestrationDeps = {
    async loadAcceptance() { calls.push('loadAcceptance'); return acceptance; },
    async loadCorrelation() { calls.push('loadCorrelation'); return { ...correlation }; },
    async verifyApprovedOffer() { calls.push('verifyApprovedOffer'); return { ok: true, errors: [] }; },
    async createCustomer() { calls.push('createCustomer'); return 'cus_test_123'; },
    async persistCustomerCorrelation(_acceptanceRef, customerRef) { calls.push('persistCustomerCorrelation'); correlation = { ...correlation, stripeCustomerRef: customerRef }; },
    async createHostedCheckoutSession() { calls.push('createHostedCheckoutSession'); return { sessionRef: 'cs_test_123', url: 'https://checkout.stripe.com/c/pay/test' }; },
    ...overrides,
  };
  return { deps, calls, setCorrelation(next: ExistingCorrelation) { correlation = next; } };
}

async function rejects(fn: () => Promise<unknown>, pattern: RegExp) {
  await assertRejects(fn, Error, pattern.source);
}

{
  const { deps, calls } = fakeDeps();
  await rejects(() => orchestrateCheckout({ ...releasedInput, checkoutCreationReleased: false }, deps), /checkout_creation_release_disabled/);
  assertEquals(calls, []);
}
{
  const { deps } = fakeDeps({ loadAcceptance: async () => null });
  await rejects(() => orchestrateCheckout(releasedInput, deps), /acceptance_not_found/);
}
{
  const { deps } = fakeDeps({ loadAcceptance: async () => ({ ...acceptance, legalVersion: 'wrong-version' }) });
  await rejects(() => orchestrateCheckout(releasedInput, deps), /legal_version_mismatch/);
}
{
  const { deps, calls } = fakeDeps({ verifyApprovedOffer: async () => ({ ok: false, errors: ['setup_amount_mismatch'] }) });
  await rejects(() => orchestrateCheckout(releasedInput, deps), /offer_not_verified:setup_amount_mismatch/);
  assertEquals(calls.includes('createCustomer'), false);
  assertEquals(calls.includes('createHostedCheckoutSession'), false);
}
{
  const { deps, calls } = fakeDeps();
  const result = await orchestrateCheckout(releasedInput, deps);
  assertEquals(calls, ['loadAcceptance', 'verifyApprovedOffer', 'loadCorrelation', 'createCustomer', 'persistCustomerCorrelation', 'createHostedCheckoutSession']);
  assertEquals(result.stripeCustomerRef, 'cus_test_123');
  assertEquals(result.checkoutSessionRef, 'cs_test_123');
  assertEquals(result.setupStatus, 'PENDING');
  assertEquals(result.monthlyStatus, 'PENDING');
  assertEquals(result.onboardingEligible, false);
}
{
  const calls: string[] = [];
  const { deps } = fakeDeps({
    createCustomer: async () => { calls.push('createCustomer'); return 'cus_test_123'; },
    persistCustomerCorrelation: async () => { calls.push('persistCustomerCorrelation'); throw new Error('correlation_persist_failed'); },
    createHostedCheckoutSession: async () => { calls.push('createHostedCheckoutSession'); return { sessionRef: 'cs_test_should_not_exist', url: 'https://checkout.stripe.com/blocked' }; },
  });
  await rejects(() => orchestrateCheckout(releasedInput, deps), /correlation_persist_failed/);
  assertEquals(calls, ['createCustomer', 'persistCustomerCorrelation']);
}
{
  const { deps, calls, setCorrelation } = fakeDeps();
  setCorrelation({ stripeCustomerRef: 'cus_existing_123', setupPaymentRef: null, subscriptionRef: null });
  await orchestrateCheckout(releasedInput, deps);
  assertEquals(calls.includes('createCustomer'), false);
  assertEquals(calls.includes('persistCustomerCorrelation'), true);
  assertEquals(calls.includes('createHostedCheckoutSession'), true);
}
{
  const { deps, calls, setCorrelation } = fakeDeps();
  setCorrelation({ stripeCustomerRef: 'cus_existing_123', setupPaymentRef: 'pi_existing_123', subscriptionRef: 'sub_existing_123' });
  await rejects(() => orchestrateCheckout(releasedInput, deps), /existing_payment_objects_require_reconciliation/);
  assertEquals(calls.includes('createHostedCheckoutSession'), false);
}
{
  const { deps, setCorrelation } = fakeDeps();
  setCorrelation({ stripeCustomerRef: null, setupPaymentRef: 'pi_orphan_123', subscriptionRef: null });
  await rejects(() => orchestrateCheckout(releasedInput, deps), /incomplete_existing_correlation/);
}
{
  const { deps } = fakeDeps({ createHostedCheckoutSession: async () => ({ sessionRef: 'cs_test_123', url: 'http://example.invalid' }) });
  await rejects(() => orchestrateCheckout(releasedInput, deps), /invalid_checkout_url/);
}

console.log('checkout orchestration tests passed');
