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

export type CheckoutSessionResult = {
  sessionRef: string;
  url: string;
};

export type CheckoutOrchestrationDeps = {
  loadAcceptance(acceptanceRef: string): Promise<DurableAcceptance | null>;
  loadCorrelation(acceptanceRef: string): Promise<ExistingCorrelation | null>;
  verifyApprovedOffer(): Promise<{ ok: boolean; errors: string[] }>;
  createCustomer(acceptance: DurableAcceptance, idempotencyKey: string): Promise<string>;
  persistCustomerCorrelation(acceptanceRef: string, customerRef: string): Promise<void>;
  createHostedCheckoutSession(
    customerRef: string,
    acceptanceRef: string,
    idempotencyKey: string,
  ): Promise<CheckoutSessionResult>;
};

export type CheckoutOrchestrationInput = {
  acceptanceRef: string;
  idempotencyKey: string;
  legalReleased: boolean;
  checkoutCreationReleased: boolean;
  releasedLegalVersion: string;
};

export type CheckoutOrchestrationResult = {
  ok: true;
  acceptanceRef: string;
  stripeCustomerRef: string;
  checkoutSessionRef: string;
  checkoutUrl: string;
  setupStatus: 'PENDING';
  monthlyStatus: 'PENDING';
  onboardingEligible: false;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CUSTOMER = /^cus_[A-Za-z0-9_]+$/;
const PAYMENT_INTENT = /^pi_[A-Za-z0-9_]+$/;
const SUBSCRIPTION = /^sub_[A-Za-z0-9_]+$/;
const CHECKOUT_SESSION = /^cs_(test_|live_)?[A-Za-z0-9_]+$/;

/**
 * Trusted server-side sequencing for a future hosted Stripe Checkout release.
 *
 * Browser input supplies only an opaque acceptance reference plus an idempotency
 * key. Price IDs, amounts, customer IDs, payment state and redirect state are
 * never accepted as authority. The durable acceptance <-> Stripe Customer link
 * must exist before a Checkout Session may be created.
 *
 * A subscription-mode Checkout Session can contain the one-time setup price plus
 * the recurring monthly price. PaymentIntent/subscription references are learned
 * from authoritative Stripe events/retrieval and filled by the webhook path;
 * this function never marks setup PAID or monthly ACTIVE from session creation.
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
  if (!input.checkoutCreationReleased) throw new Error('checkout_creation_release_disabled');

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

  // If provider payment/subscription refs already exist, the caller must rely on
  // authoritative reconciliation instead of creating another checkout flow.
  if (correlation.setupPaymentRef || correlation.subscriptionRef) {
    throw new Error('existing_payment_objects_require_reconciliation');
  }

  const customerRef = correlation.stripeCustomerRef ?? await deps.createCustomer(
    acceptance,
    `${input.idempotencyKey}:customer`,
  );
  if (!CUSTOMER.test(customerRef)) throw new Error('invalid_stripe_customer_ref');

  // Critical ordering invariant: this persistence must succeed before Checkout
  // can create any downstream invoice/PaymentIntent/subscription objects.
  await deps.persistCustomerCorrelation(input.acceptanceRef, customerRef);

  const session = await deps.createHostedCheckoutSession(
    customerRef,
    input.acceptanceRef,
    `${input.idempotencyKey}:checkout`,
  );
  if (!CHECKOUT_SESSION.test(session.sessionRef)) throw new Error('invalid_checkout_session_ref');
  if (!isHttpsUrl(session.url)) throw new Error('invalid_checkout_url');

  return {
    ok: true,
    acceptanceRef: input.acceptanceRef,
    stripeCustomerRef: customerRef,
    checkoutSessionRef: session.sessionRef,
    checkoutUrl: session.url,
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

function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

function clean(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}
