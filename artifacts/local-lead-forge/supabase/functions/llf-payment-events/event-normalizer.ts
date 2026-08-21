export type NormalizedStripeEvent = {
  id: string;
  type: string;
  created: number | null;
  objectRef: string | null;
  customerRef: string | null;
  paymentIntentRef: string | null;
  subscriptionRef: string | null;
};

export const SUPPORTED_EVENT_TYPES = new Set([
  'payment_intent.succeeded',
  'payment_intent.payment_failed',
  'charge.refunded',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.payment_failed',
  'invoice.paid',
]);

export function normalizeStripeEvent(input: unknown): NormalizedStripeEvent | null {
  if (!input || typeof input !== 'object') return null;
  const event = input as Record<string, any>;
  const object = event.data?.object;
  if (typeof event.id !== 'string' || typeof event.type !== 'string' || !object || typeof object !== 'object') return null;

  return {
    id: event.id,
    type: event.type,
    created: Number.isFinite(event.created) ? Number(event.created) : null,
    objectRef: typeof object.id === 'string' ? object.id : null,
    customerRef: typeof object.customer === 'string' ? object.customer : null,
    paymentIntentRef: typeof object.payment_intent === 'string'
      ? object.payment_intent
      : (object.object === 'payment_intent' && typeof object.id === 'string' ? object.id : null),
    subscriptionRef: typeof object.subscription === 'string'
      ? object.subscription
      : (object.object === 'subscription' && typeof object.id === 'string' ? object.id : null),
  };
}
