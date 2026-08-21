import { assertEquals } from 'jsr:@std/assert@1';
import { loadPaymentEventRuntimeConfig, stripeRuntimeKeyForMode } from './runtime-config.ts';

function env(values: Record<string, string | undefined>) {
  return { get: (name: string) => values[name] };
}

Deno.test('loads separate live and test restricted Stripe credentials', () => {
  const config = loadPaymentEventRuntimeConfig(env({
    SUPABASE_URL: 'https://example.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'service-role',
    STRIPE_RESTRICTED_KEY: 'rk_live_example',
    STRIPE_RESTRICTED_KEY_TEST: 'rk_test_example',
    STRIPE_WEBHOOK_SECRET: 'whsec_live',
    STRIPE_WEBHOOK_SECRET_TEST: 'whsec_test',
  }));

  if (!config) throw new Error('expected runtime config');
  assertEquals(stripeRuntimeKeyForMode(config, 'live'), 'rk_live_example');
  assertEquals(stripeRuntimeKeyForMode(config, 'test'), 'rk_test_example');
  assertEquals(config.testWebhookSecret, 'whsec_test');
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

Deno.test('test-mode secrets are optional until test mode is actually used', () => {
  const liveOnly = loadPaymentEventRuntimeConfig(env({
    SUPABASE_URL: 'https://example.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'service-role',
    STRIPE_RESTRICTED_KEY: 'rk_live_example',
    STRIPE_WEBHOOK_SECRET: 'whsec_live',
  }));
  if (!liveOnly) throw new Error('expected live-only config');
  assertEquals(liveOnly.testWebhookSecret, null);
  assertEquals(stripeRuntimeKeyForMode(liveOnly, 'test'), null);

  const noLiveSecret = loadPaymentEventRuntimeConfig(env({
    SUPABASE_URL: 'https://example.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'service-role',
    STRIPE_RESTRICTED_KEY: 'rk_live_example',
    STRIPE_WEBHOOK_SECRET_TEST: 'whsec_test',
    STRIPE_RESTRICTED_KEY_TEST: 'rk_test_example',
  }));
  assertEquals(noLiveSecret, null);
});
