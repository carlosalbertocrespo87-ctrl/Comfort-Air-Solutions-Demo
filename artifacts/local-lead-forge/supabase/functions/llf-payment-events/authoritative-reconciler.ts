import {
  retrieveCharge,
  retrieveInvoice,
  retrievePaymentIntent,
  retrieveSubscription,
} from './stripe-object-client.ts';

export type ReconciledState = {
  setup_status?: 'PAID' | 'FAILED' | 'REFUNDED' | 'PENDING';
  monthly_status?: 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'FAILED' | 'PENDING';
  stripe_customer_ref?: string | null;
  setup_payment_ref?: string | null;
  subscription_ref?: string | null;
};

export async function reconcileStripeObject(objectRef: string | null, secretKey: string): Promise<ReconciledState> {
  if (!objectRef) throw new Error('missing_object_ref');

  if (objectRef.startsWith('pi_')) {
    const pi = await retrievePaymentIntent(objectRef, secretKey);
    const status = String(pi.status ?? '');
    return {
      stripe_customer_ref: asRef(pi.customer),
      setup_payment_ref: objectRef,
      setup_status: status === 'succeeded' ? 'PAID' : status === 'canceled' ? 'FAILED' : 'PENDING',
    };
  }

  if (objectRef.startsWith('ch_')) {
    const charge = await retrieveCharge(objectRef, secretKey);
    const refunded = charge.refunded === true || Number(charge.amount_refunded ?? 0) > 0;
    const paid = charge.paid === true && charge.status === 'succeeded';
    return {
      stripe_customer_ref: asRef(charge.customer),
      setup_payment_ref: asRef(charge.payment_intent),
      setup_status: refunded ? 'REFUNDED' : paid ? 'PAID' : 'FAILED',
    };
  }

  if (objectRef.startsWith('sub_')) {
    const sub = await retrieveSubscription(objectRef, secretKey);
    const status = String(sub.status ?? '');
    const monthly = status === 'active' || status === 'trialing'
      ? 'ACTIVE'
      : status === 'past_due' || status === 'unpaid'
        ? 'PAST_DUE'
        : status === 'canceled' || status === 'incomplete_expired'
          ? 'CANCELED'
          : status === 'incomplete'
            ? 'PENDING'
            : 'FAILED';
    return {
      stripe_customer_ref: asRef(sub.customer),
      subscription_ref: objectRef,
      monthly_status: monthly,
    };
  }

  if (objectRef.startsWith('in_')) {
    const invoice = await retrieveInvoice(objectRef, secretKey);
    const status = String(invoice.status ?? '');
    const paid = invoice.paid === true || status === 'paid';
    const subRef = asRef(invoice.subscription);
    const customerRef = asRef(invoice.customer);
    if (!subRef) throw new Error('invoice_subscription_missing');
    const sub = await retrieveSubscription(subRef, secretKey);
    const subStatus = String(sub.status ?? '');
    const monthly = paid && (subStatus === 'active' || subStatus === 'trialing')
      ? 'ACTIVE'
      : subStatus === 'past_due' || subStatus === 'unpaid'
        ? 'PAST_DUE'
        : subStatus === 'canceled' || subStatus === 'incomplete_expired'
          ? 'CANCELED'
          : 'PENDING';
    return { stripe_customer_ref: customerRef, subscription_ref: subRef, monthly_status: monthly };
  }

  throw new Error('unsupported_object_ref');
}

function asRef(value: unknown): string | null {
  if (typeof value === 'string' && value.length > 0) return value;
  if (value && typeof value === 'object' && typeof (value as any).id === 'string') return (value as any).id;
  return null;
}
