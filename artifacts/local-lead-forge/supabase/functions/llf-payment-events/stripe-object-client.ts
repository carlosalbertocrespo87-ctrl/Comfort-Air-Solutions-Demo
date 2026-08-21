type StripeObject = Record<string, unknown>;

const API = 'https://api.stripe.com/v1';

async function stripeGet(path: string, secretKey: string): Promise<StripeObject> {
  const response = await fetch(`${API}${path}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${secretKey}` },
  });
  if (!response.ok) throw new Error(`stripe_get_failed:${response.status}`);
  return await response.json() as StripeObject;
}

function requireRef(value: string, prefix: string) {
  if (!value || !value.startsWith(prefix)) throw new Error('invalid_stripe_object_ref');
  return encodeURIComponent(value);
}

export async function retrievePaymentIntent(id: string, secretKey: string) {
  return stripeGet(`/payment_intents/${requireRef(id, 'pi_')}`, secretKey);
}

export async function retrieveCharge(id: string, secretKey: string) {
  return stripeGet(`/charges/${requireRef(id, 'ch_')}`, secretKey);
}

export async function retrieveSubscription(id: string, secretKey: string) {
  return stripeGet(`/subscriptions/${requireRef(id, 'sub_')}`, secretKey);
}

export async function retrieveInvoice(id: string, secretKey: string) {
  return stripeGet(`/invoices/${requireRef(id, 'in_')}`, secretKey);
}
