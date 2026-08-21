export type DurableAcceptance = {
  acceptanceRef: string;
  legalVersion: string;
  customerName: string;
  companyName: string | null;
  customerEmail: string | null;
};

export type ExistingCorrelation = {
  stripeCustomerRef: string | null;
  setupPaymentRef: string | null;
  subscriptionRef: string | null;
};

export type CorrelationPatch = {
  acceptanceRef: string;
  stripeCustomerRef: string;
  setupPaymentRef?: string | null;
  subscriptionRef?: string | null;
};

export type CheckoutOrchestrationDeps = {
  loadAcceptance(acceptanceRef: string): Promise<DurableAcceptance | null>;
  loadCorrelation(acceptanceRef: string): Promise<ExistingCorrelation | null>;
  verifyApprovedOffer(): Promise<{ ok: boolean; errors: string[] }>;
  createCustomer(acceptance: DurableAcceptance, idempotencyKey: string): Promise<string>;
  persistCorrelation(patch: CorrelationPatch): Promise<void>;
  createSetupPayment(customerRef: string, acceptanceRef: string, idempotencyKey: string): Promise<string>;
  createSubscription(customerRef: string, acceptanceRef: string, idempotencyKey: string): Promise<string>;
};

export type CheckoutOrchestrationInput = {
  acceptanceRef: string;
  idempotencyKey: string;
  legalReleased: boolean;
  paymentObjectCreationReleased: boolean;
  releasedLegalVersion: string;
};

export type CheckoutOrchestrationResult = {
  ok: true;
  acceptanceRef: string;
  stripeCustomerRef: string;
  setupPaymentRef: string;
  subscriptionRef: string;
  setupStatus: 'PENDING';
  monthlyStatus: 'PENDING';
  onboardingEligible: false;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CUSTOMER = /^cus_[A-Za-z0-9_]+$/;
const PAYMENT_INTENT = /^pi_[A-Za-z0-9_]+$/;
const SUBSCRIPTION = /^sub_[A-Za-z0-9_]+$/;

/**
 * Trusted server-side orchestration only.
 *
 * This function deliberately does not accept browser-supplied price IDs,
 * amounts, Stripe customer IDs, payment state, or redirect state. Provider
 * references are persisted as correlation evidence only. Webhook reconciliation
 * remains authoritative for PAID/ACTIVE state and onboarding eligibility.
 */
export async function orchestrateCheckout(
  input: CheckoutOrchestrationInput,
  deps: CheckoutOrchestrationDeps,
): Promise<CheckoutOrchestrationResult> {
  if (!UUID.test(input.acceptanceRef)) throw new Error('invalid_acceptance_ref');
  if (!clean(input.idempotencyKey, 200)) throw new Error('idempotency_key_required');
  if (!input.legalReleased || !clean(input.releasedLegalVersion, 120)) {
    throw new Error('legal_release_disabled');
  }
  if (!input.paymentObjectCreationReleased) throw new Error('payment_object_creation_release_disabled');

  const acceptance = await deps.loadAcceptance(input.acceptanceRef);
  if (!acceptance || acceptance.acceptanceRef !== input.acceptanceRef) {
    throw new Error('acceptance_not_found');
  }
  if (acceptance.legalVersion !== input.releasedLegalVersion) {
    throw new Error('legal_version_mismatch');
  }

  const offer = await deps.verifyApprovedOffer();
  if (!offer.ok) throw new Error(`offer_not_verified:${offer.errors.join(',')}`);

  const correlation = await deps.loadCorrelation(input.acceptanceRef);
  if (!correlation) throw new Error('entitlement_not_found');
  validateExistingCorrelation(correlation);

  const customerRef = correlation.stripeCustomerRef ?? await deps.createCustomer(
    acceptance,
    `${input.idempotencyKey}:customer`,
  );
  if (!CUSTOMER.test(customerRef)) throw new Error('invalid_stripe_customer_ref');

  // Mandatory ordering invariant: customer correlation is durable before any
  // setup PaymentIntent or Subscription can be created.
  await deps.persistCorrelation({
    acceptanceRef: input.acceptanceRef,
    stripeCustomerRef: customerRef,
  });

  let setupPaymentRef = correlation.setupPaymentRef;
  if (!setupPaymentRef) {
    setupPaymentRef = await deps.createSetupPayment(
      customerRef,
      input.acceptanceRef,
      `${input.idempotencyKey}:setup`,
    );
    if (!PAYMENT_INTENT.test(setupPaymentRef)) throw new Error('invalid_setup_payment_ref');
    await deps.persistCorrelation({
      acceptanceRef: input.acceptanceRef,
      stripeCustomerRef: customerRef,
      setupPaymentRef,
    });
  }

  let subscriptionRef = correlation.subscriptionRef;
  if (!subscriptionRef) {
    subscriptionRef = await deps.createSubscription(
      customerRef,
      input.acceptanceRef,
      `${input.idempotencyKey}:subscription`,
    );
    if (!SUBSCRIPTION.test(subscriptionRef)) throw new Error('invalid_subscription_ref');
    await deps.persistCorrelation({
      acceptanceRef: input.acceptanceRef,
      stripeCustomerRef: customerRef,
      subscriptionRef,
    });
  }

  return {
    ok: true,
    acceptanceRef: input.acceptanceRef,
    stripeCustomerRef: customerRef,
    setupPaymentRef,
    subscriptionRef,
    // Never infer entitlement from object creation responses.
    setupStatus: 'PENDING',
    monthlyStatus: 'PENDING',
    onboardingEligible: false,
  };
}

function validateExistingCorrelation(correlation: ExistingCorrelation): void {
  if (correlation.stripeCustomerRef && !CUSTOMER.test(correlation.stripeCustomerRef)) {
    throw new Error('invalid_existing_customer_ref');
  }
  if (correlation.setupPaymentRef && !PAYMENT_INTENT.test(correlation.setupPaymentRef)) {
    throw new Error('invalid_existing_setup_payment_ref');
  }
  if (correlation.subscriptionRef && !SUBSCRIPTION.test(correlation.subscriptionRef)) {
    throw new Error('invalid_existing_subscription_ref');
  }
  if ((correlation.setupPaymentRef || correlation.subscriptionRef) && !correlation.stripeCustomerRef) {
    throw new Error('incomplete_existing_correlation');
  }
}

function clean(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}
