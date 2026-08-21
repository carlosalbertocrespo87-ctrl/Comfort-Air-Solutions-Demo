import { strict as assert } from 'node:assert';
import { buildCheckoutPlan } from './checkout-orchestration.ts';

const acceptanceRef = '10000000-0000-4000-8000-000000000001';

assert.throws(() => buildCheckoutPlan({ acceptanceRef, legalReleased: false, setupPriceVerified: true, monthlyPriceVerified: true }), /legal_release_disabled/);
assert.throws(() => buildCheckoutPlan({ acceptanceRef, legalReleased: true, setupPriceVerified: false, monthlyPriceVerified: true }), /offer_not_verified/);
assert.throws(() => buildCheckoutPlan({ acceptanceRef, legalReleased: true, setupPriceVerified: true, monthlyPriceVerified: false }), /offer_not_verified/);
assert.throws(() => buildCheckoutPlan({ acceptanceRef, legalReleased: true, setupPriceVerified: true, monthlyPriceVerified: true, existingCustomerRef: 'customer_bad' }), /invalid_existing_customer_ref/);

const createPlan = buildCheckoutPlan({ acceptanceRef, legalReleased: true, setupPriceVerified: true, monthlyPriceVerified: true });
assert.equal(createPlan.customerAction, 'CREATE_TRUSTED_CUSTOMER');
assert.equal(createPlan.persistCorrelationBeforePaymentObjects, true);
assert.equal(createPlan.mayCreatePaymentObjects, false);

const reusePlan = buildCheckoutPlan({ acceptanceRef, legalReleased: true, setupPriceVerified: true, monthlyPriceVerified: true, existingCustomerRef: 'cus_test_123' });
assert.equal(reusePlan.customerAction, 'REUSE_CORRELATED_CUSTOMER');
assert.equal(reusePlan.mayCreatePaymentObjects, false);

console.log('checkout orchestration planner tests passed');
