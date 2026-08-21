import { assertEquals } from 'jsr:@std/assert@1';
import { loadPaymentEventRuntimeConfig } from './runtime-config.ts';

function env(values: Record<string, string | undefined>) {
  return { get: (name: string) => values[name] };
}

Deno.test('loads authoritative webhook config only with restricted Stripe credential', () => {
  const config = loadPaymentEventRuntimeConfig(env({
    SUPABASE_URL: 'https://example.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'service-role',
    STRIPE_RESTRICTED_KEY: 'rk_live_example',
    STRIPE_WEBHOOK_SECRET: 'whsec_live',
    STRIPE_WEBHOOK_SECRET_TEST: 'whsec_test',
  }));

  assertEquals(config?.stripeRestrictedKey, 'rk_live_example');
  assertEquals(config?.testWebhookSecret, 'whsec_test');
});

Deno.test('generic Stripe secret alone does not satisfy runtime config', () => {
  const config = loadPaymentEventRuntimeConfig(env({
    SUPABASE_URL: 'https://example.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'service-role',
    STRIPE_SECRET_KEY: 'sk_live_broader',
    STRIPE_WEBHOOK_SECRET: 'whsec_live',
  }));

  assertEquals(config, null);
});

Deno.test('test webhook secret is optional but live secret is mandatory', () => {
  const liveOnly = loadPaymentEventRuntimeConfig(env({
    SUPABASE_URL: 'https://example.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'service-role',
    STRIPE_RESTRICTED_KEY: 'rk_live_example',
    STRIPE_WEBHOOK_SECRET: 'whsec_live',
  }));
  assertEquals(liveOnly?.testWebhookSecret, null);

  const noLiveSecret = loadPaymentEventRuntimeConfig(env({
    SUPABASE_URL: 'https://example.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'service-role',
    STRIPE_RESTRICTED_KEY: 'rk_live_example',
    STRIPE_WEBHOOK_SECRET_TEST: 'whsec_test',
  }));
  assertEquals(noLiveSecret, null);
});
