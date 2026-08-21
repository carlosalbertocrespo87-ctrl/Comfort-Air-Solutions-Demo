export type CheckoutPlanInput = {
  acceptanceRef: string;
  legalReleased: boolean;
  setupPriceVerified: boolean;
  monthlyPriceVerified: boolean;
  existingCustomerRef?: string | null;
};

export type CheckoutPlan = {
  acceptanceRef: string;
  customerAction: 'CREATE_TRUSTED_CUSTOMER' | 'REUSE_CORRELATED_CUSTOMER';
  persistCorrelationBeforePaymentObjects: true;
  mayCreatePaymentObjects: false;
  reason: 'TEST_ONLY_RELEASE_LOCK';
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CUSTOMER = /^cus_[A-Za-z0-9_]+$/;

/**
 * Pure planner only. It cannot call Stripe, Supabase, create checkout, charge,
 * mutate payment status, or trigger onboarding.
 */
export function buildCheckoutPlan(input: CheckoutPlanInput): CheckoutPlan {
  if (!UUID.test(input.acceptanceRef)) throw new Error('invalid_acceptance_ref');
  if (!input.legalReleased) throw new Error('legal_release_disabled');
  if (!input.setupPriceVerified || !input.monthlyPriceVerified) {
    throw new Error('offer_not_verified');
  }
  if (input.existingCustomerRef && !CUSTOMER.test(input.existingCustomerRef)) {
    throw new Error('invalid_existing_customer_ref');
  }

  return {
    acceptanceRef: input.acceptanceRef,
    customerAction: input.existingCustomerRef
      ? 'REUSE_CORRELATED_CUSTOMER'
      : 'CREATE_TRUSTED_CUSTOMER',
    persistCorrelationBeforePaymentObjects: true,
    mayCreatePaymentObjects: false,
    reason: 'TEST_ONLY_RELEASE_LOCK',
  };
}
