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
  paymentObjectCreationReleased: true,
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
    async persistCorrelation(patch) {
      calls.push(`persist:${patch.setupPaymentRef ? 'setup' : patch.subscriptionRef ? 'subscription' : 'customer'}`);
      correlation = {
        stripeCustomerRef: patch.stripeCustomerRef,
        setupPaymentRef: patch.setupPaymentRef ?? correlation.setupPaymentRef,
        subscriptionRef: patch.subscriptionRef ?? correlation.subscriptionRef,
      };
    },
    async createSetupPayment() {
      calls.push('createSetupPayment');
      return 'pi_test_123';
    },
    async createSubscription() {
      calls.push('createSubscription');
      return 'sub_test_123';
    },
    ...overrides,
  };

  return { deps, calls, setCorrelation(next: ExistingCorrelation) { correlation = next; } };
}

// Release gates fail before any external dependency is called.
{
  const { deps, calls } = fakeDeps();
  await assert.rejects(
    orchestrateCheckout({ ...releasedInput, paymentObjectCreationReleased: false }, deps),
    /payment_object_creation_release_disabled/,
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

// Offer mismatch fails before customer/payment object creation.
{
  const { deps, calls } = fakeDeps({
    verifyApprovedOffer: async () => ({ ok: false, errors: ['setup_amount_mismatch'] }),
  });
  await assert.rejects(orchestrateCheckout(releasedInput, deps), /offer_not_verified:setup_amount_mismatch/);
  assert.equal(calls.includes('createCustomer'), false);
  assert.equal(calls.includes('createSetupPayment'), false);
  assert.equal(calls.includes('createSubscription'), false);
}

// Customer correlation MUST persist before setup/subscription creation.
{
  const { deps, calls } = fakeDeps();
  const result = await orchestrateCheckout(releasedInput, deps);
  assert.deepEqual(calls, [
    'loadAcceptance',
    'verifyApprovedOffer',
    'loadCorrelation',
    'createCustomer',
    'persist:customer',
    'createSetupPayment',
    'persist:setup',
    'createSubscription',
    'persist:subscription',
  ]);
  assert.equal(result.stripeCustomerRef, 'cus_test_123');
  assert.equal(result.setupPaymentRef, 'pi_test_123');
  assert.equal(result.subscriptionRef, 'sub_test_123');
  assert.equal(result.setupStatus, 'PENDING');
  assert.equal(result.monthlyStatus, 'PENDING');
  assert.equal(result.onboardingEligible, false);
}

// Correlation persistence failure blocks all payment object creation.
{
  const calls: string[] = [];
  const { deps } = fakeDeps({
    createCustomer: async () => {
      calls.push('createCustomer');
      return 'cus_test_123';
    },
    persistCorrelation: async () => {
      calls.push('persistCustomer');
      throw new Error('correlation_persist_failed');
    },
    createSetupPayment: async () => {
      calls.push('createSetupPayment');
      return 'pi_should_not_exist';
    },
  });
  await assert.rejects(orchestrateCheckout(releasedInput, deps), /correlation_persist_failed/);
  assert.deepEqual(calls, ['createCustomer', 'persistCustomer']);
}

// Retry/resume reuses durable provider refs and creates nothing again.
{
  const { deps, calls, setCorrelation } = fakeDeps();
  setCorrelation({
    stripeCustomerRef: 'cus_existing_123',
    setupPaymentRef: 'pi_existing_123',
    subscriptionRef: 'sub_existing_123',
  });
  const result = await orchestrateCheckout(releasedInput, deps);
  assert.equal(calls.includes('createCustomer'), false);
  assert.equal(calls.includes('createSetupPayment'), false);
  assert.equal(calls.includes('createSubscription'), false);
  assert.equal(calls.includes('persist:customer'), true);
  assert.equal(result.setupStatus, 'PENDING');
  assert.equal(result.monthlyStatus, 'PENDING');
  assert.equal(result.onboardingEligible, false);
}

// Payment/subscription refs without a customer correlation are inconsistent and fail closed.
{
  const { deps, setCorrelation } = fakeDeps();
  setCorrelation({ stripeCustomerRef: null, setupPaymentRef: 'pi_orphan_123', subscriptionRef: null });
  await assert.rejects(orchestrateCheckout(releasedInput, deps), /incomplete_existing_correlation/);
}

console.log('checkout orchestration tests passed');
