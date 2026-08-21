export type EntitlementPatch = {
  setup_status?: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  monthly_status?: 'PENDING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'FAILED';
  stripe_customer_ref?: string | null;
  setup_payment_ref?: string | null;
  subscription_ref?: string | null;
};

export function paymentIntentPatch(status: string, paymentIntentRef: string | null, customerRef: string | null): EntitlementPatch {
  if (status === 'succeeded') return { setup_status: 'PAID', setup_payment_ref: paymentIntentRef, stripe_customer_ref: customerRef };
  if (status === 'requires_payment_method' || status === 'canceled') return { setup_status: 'FAILED', setup_payment_ref: paymentIntentRef, stripe_customer_ref: customerRef };
  return {};
}

export function subscriptionPatch(status: string, subscriptionRef: string | null, customerRef: string | null): EntitlementPatch {
  const base = { subscription_ref: subscriptionRef, stripe_customer_ref: customerRef };
  if (status === 'active' || status === 'trialing') return { ...base, monthly_status: 'ACTIVE' };
  if (status === 'past_due' || status === 'unpaid') return { ...base, monthly_status: 'PAST_DUE' };
  if (status === 'canceled' || status === 'incomplete_expired') return { ...base, monthly_status: 'CANCELED' };
  if (status === 'incomplete') return { ...base, monthly_status: 'PENDING' };
  return base;
}

export function refundPatch(refunded: boolean): EntitlementPatch {
  return refunded ? { setup_status: 'REFUNDED' } : {};
}
