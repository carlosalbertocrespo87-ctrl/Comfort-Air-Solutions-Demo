export type PaymentEventRuntimeConfig = {
  supabaseUrl: string;
  serviceRoleKey: string;
  stripeRestrictedKey: string;
  liveWebhookSecret: string;
  testWebhookSecret: string | null;
};

type EnvReader = { get(name: string): string | undefined };

export function loadPaymentEventRuntimeConfig(env: EnvReader): PaymentEventRuntimeConfig | null {
  const supabaseUrl = clean(env.get('SUPABASE_URL'));
  const serviceRoleKey = clean(env.get('SUPABASE_SERVICE_ROLE_KEY'));
  const stripeRestrictedKey = clean(env.get('STRIPE_RESTRICTED_KEY'));
  const liveWebhookSecret = clean(env.get('STRIPE_WEBHOOK_SECRET'));
  const testWebhookSecret = clean(env.get('STRIPE_WEBHOOK_SECRET_TEST')) || null;

  if (!supabaseUrl || !serviceRoleKey || !stripeRestrictedKey || !liveWebhookSecret) return null;

  return {
    supabaseUrl,
    serviceRoleKey,
    stripeRestrictedKey,
    liveWebhookSecret,
    testWebhookSecret,
  };
}

function clean(value: string | undefined): string {
  return typeof value === 'string' ? value.trim() : '';
}
