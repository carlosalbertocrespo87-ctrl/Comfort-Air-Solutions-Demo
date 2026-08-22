export type StripeRuntimeMode = 'live' | 'test';

export type PaymentEventRuntimeConfig = {
  supabaseUrl: string;
  serviceRoleKey: string;
  liveStripeRestrictedKey: string;
  testStripeRestrictedKey: string | null;
  liveWebhookSecret: string;
  testWebhookSecret: string | null;
};

type EnvReader = { get(name: string): string | undefined };

export function loadPaymentEventRuntimeConfig(env: EnvReader): PaymentEventRuntimeConfig | null {
  const supabaseUrl = clean(env.get('SUPABASE_URL'));
  const serviceRoleKey = clean(env.get('SUPABASE_SERVICE_ROLE_KEY'));
  const liveStripeRestrictedKey = clean(env.get('STRIPE_RESTRICTED_KEY'));
  const testStripeRestrictedKey = clean(env.get('STRIPE_RESTRICTED_KEY_TEST')) || null;
  const liveWebhookSecret = clean(env.get('STRIPE_WEBHOOK_SECRET'));
  const testWebhookSecret = clean(env.get('STRIPE_WEBHOOK_SECRET_TEST')) || null;

  if (!supabaseUrl || !serviceRoleKey || !liveStripeRestrictedKey || !liveWebhookSecret) return null;

  // Fail closed on credential-class or environment aliasing. The live runtime must use a
  // live restricted key; an optional TEST runtime must use its own TEST restricted key.
  if (!liveStripeRestrictedKey.startsWith('rk_live_')) return null;
  if (testStripeRestrictedKey && !testStripeRestrictedKey.startsWith('rk_test_')) return null;
  if (testStripeRestrictedKey && testStripeRestrictedKey === liveStripeRestrictedKey) return null;
  if (testWebhookSecret && testWebhookSecret === liveWebhookSecret) return null;

  return {
    supabaseUrl,
    serviceRoleKey,
    liveStripeRestrictedKey,
    testStripeRestrictedKey,
    liveWebhookSecret,
    testWebhookSecret,
  };
}

export function stripeRuntimeKeyForMode(config: PaymentEventRuntimeConfig, mode: StripeRuntimeMode): string | null {
  return mode === 'live' ? config.liveStripeRestrictedKey : config.testStripeRestrictedKey;
}

function clean(value: string | undefined): string {
  return typeof value === 'string' ? value.trim() : '';
}
