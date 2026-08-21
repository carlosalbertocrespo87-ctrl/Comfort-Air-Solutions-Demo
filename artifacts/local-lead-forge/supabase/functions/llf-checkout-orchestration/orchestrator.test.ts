import { strict as assert } from 'node:assert';
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
  let correlation: ExistingCorrelation = {
    stripeCustomerRef: null,
    setupPaymentRef: null,
    subscriptionRef: null,
  };

  const deps: CheckoutOrchestrationDeps = {
    async loadAcceptance() {
      calls.push('loadAcceptance');
      return acceptance;
    },
    async loadCorrelation() {
      calls.push('loadCorrelation');
      return { ...correlation };
    },
    async verifyApprovedOffer() {
      calls.push('verifyApprovedOffer');
      return { ok: true, errors: [] };
    },
    async createCustomer() {
      calls.push('createCustomer');
      return 'cus_test_123';
    },
    async persistCustomerCorrelation(_acceptanceRef, customerRef) {
      calls.push('persistCustomerCorrelation');
      correlation = { ...correlation, stripeCustomerRef: customerRef };
    },
    async createHostedCheckoutSession() {
      calls.push('createHostedCheckoutSession');
      return { sessionRef: 'cs_test_123', url: 'https://checkout.stripe.com/c/pay/test' };
    },
    ...overrides,
  };

  return { deps, calls, setCorrelation(next: ExistingCorrelation) { correlation = next; } };
}

// Release gates fail before any dependency/network-capable action is called.
{
  const { deps, calls } = fakeDeps();
  await assert.rejects(
    orchestrateCheckout({ ...releasedInput, checkoutCreationReleased: false }, deps),
    /checkout_creation_release_disabled/,
  );
  assert.deepEqual(calls, []);
}

// Durable acceptance and exact released legal version are mandatory.
{
  const { deps } = fakeDeps({ loadAcceptance: async () => null });
  await assert.rejects(orchestrateCheckout(releasedInput, deps), /acceptance_not_found/);
}
{
  const { deps } = fakeDeps({
    loadAcceptance: async () => ({ ...acceptance, legalVersion: 'wrong-version' }),
  });
  await assert.rejects(orchestrateCheckout(releasedInput, deps), /legal_version_mismatch/);
}

// Offer mismatch fails before customer or Checkout creation.
{
  const { deps, calls } = fakeDeps({
    verifyApprovedOffer: async () => ({ ok: false, errors: ['setup_amount_mismatch'] }),
  });
  await assert.rejects(orchestrateCheckout(releasedInput, deps), /offer_not_verified:setup_amount_mismatch/);
  assert.equal(calls.includes('createCustomer'), false);
  assert.equal(calls.includes('createHostedCheckoutSession'), false);
}

// Customer correlation MUST persist before Stripe Checkout can be created.
{
  const { deps, calls } = fakeDeps();
  const result = await orchestrateCheckout(releasedInput, deps);
  assert.deepEqual(calls, [
    'loadAcceptance',
    'verifyApprovedOffer',
    'loadCorrelation',
    'createCustomer',
    'persistCustomerCorrelation',
    'createHostedCheckoutSession',
  ]);
  assert.equal(result.stripeCustomerRef, 'cus_test_123');
  assert.equal(result.checkoutSessionRef, 'cs_test_123');
  assert.equal(result.setupStatus, 'PENDING');
  assert.equal(result.monthlyStatus, 'PENDING');
  assert.equal(result.onboardingEligible, false);
}

// Correlation persistence failure blocks Checkout creation entirely.
{
  const calls: string[] = [];
  const { deps } = fakeDeps({
    createCustomer: async () => {
      calls.push('createCustomer');
      return 'cus_test_123';
    },
    persistCustomerCorrelation: async () => {
      calls.push('persistCustomerCorrelation');
      throw new Error('correlation_persist_failed');
    },
    createHostedCheckoutSession: async () => {
      calls.push('createHostedCheckoutSession');
      return { sessionRef: 'cs_test_should_not_exist', url: 'https://checkout.stripe.com/blocked' };
    },
  });
  await assert.rejects(orchestrateCheckout(releasedInput, deps), /correlation_persist_failed/);
  assert.deepEqual(calls, ['createCustomer', 'persistCustomerCorrelation']);
}

// Existing customer correlation is reused; it is re-asserted durably before Checkout creation.
{
  const { deps, calls, setCorrelation } = fakeDeps();
  setCorrelation({ stripeCustomerRef: 'cus_existing_123', setupPaymentRef: null, subscriptionRef: null });
  await orchestrateCheckout(releasedInput, deps);
  assert.equal(calls.includes('createCustomer'), false);
  assert.equal(calls.includes('persistCustomerCorrelation'), true);
  assert.equal(calls.includes('createHostedCheckoutSession'), true);
}

// Once payment/subscription objects exist, never create another checkout from this path.
{
  const { deps, calls, setCorrelation } = fakeDeps();
  setCorrelation({
    stripeCustomerRef: 'cus_existing_123',
    setupPaymentRef: 'pi_existing_123',
    subscriptionRef: 'sub_existing_123',
  });
  await assert.rejects(orchestrateCheckout(releasedInput, deps), /existing_payment_objects_require_reconciliation/);
  assert.equal(calls.includes('createHostedCheckoutSession'), false);
}

// Provider refs without a customer correlation are inconsistent and fail closed.
{
  const { deps, setCorrelation } = fakeDeps();
  setCorrelation({ stripeCustomerRef: null, setupPaymentRef: 'pi_orphan_123', subscriptionRef: null });
  await assert.rejects(orchestrateCheckout(releasedInput, deps), /incomplete_existing_correlation/);
}

// Session response cannot smuggle an invalid/non-HTTPS checkout destination.
{
  const { deps } = fakeDeps({
    createHostedCheckoutSession: async () => ({ sessionRef: 'cs_test_123', url: 'http://example.invalid' }),
  });
  await assert.rejects(orchestrateCheckout(releasedInput, deps), /invalid_checkout_url/);
}

console.log('checkout orchestration tests passed');
