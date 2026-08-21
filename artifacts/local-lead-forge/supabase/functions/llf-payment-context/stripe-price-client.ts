import type { StripePriceSnapshot } from './offer-verifier.ts';

export async function fetchStripePrice(priceId: string, secretKey: string): Promise<StripePriceSnapshot> {
  const response = await fetch(`https://api.stripe.com/v1/prices/${encodeURIComponent(priceId)}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Stripe-Version': '2024-06-20',
    },
  });

  if (!response.ok) {
    throw new Error(`stripe_price_fetch_failed:${response.status}`);
  }

  const price = await response.json();
  return {
    id: String(price.id ?? ''),
    active: Boolean(price.active),
    currency: String(price.currency ?? ''),
    unit_amount: typeof price.unit_amount === 'number' ? price.unit_amount : null,
    type: price.type === 'recurring' ? 'recurring' : 'one_time',
    recurring: price.recurring ? { interval: String(price.recurring.interval ?? '') } : null,
  };
}