import { assertEquals } from 'jsr:@std/assert';
import { loadPaymentEventRuntimeConfig, stripeRuntimeKeyForMode } from './runtime-config.ts';

function env(values: Record<string, string | undefined>) {
  return { get(name: string) { return values[name]; } };
}

const base = {
  SUPABASE_URL: 'https://synthetic.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'synthetic-service-role',
  STRIPE_RESTRICTED_KEY: 'rk_live_synthetic_live',
  STRIPE_RESTRICTED_KEY_TEST: 'rk_test_synthetic_test',
  STRIPE_WEBHOOK_SECRET: 'whsec_synthetic_live',
  STRIPE_WEBHOOK_SECRET_TEST: 'whsec_synthetic_test',
};

Deno.test('payment runtime keeps live and test credentials separated', () => {
  const config = loadPaymentEventRuntimeConfig(env(base));
  if (!config) throw new Error('expected valid synthetic config');
  assertEquals(stripeRuntimeKeyForMode(config, 'live'), base.STRIPE_RESTRICTED_KEY);
  assertEquals(stripeRuntimeKeyForMode(config, 'test'), base.STRIPE_RESTRICTED_KEY_TEST);
});

Deno.test('test mode stays unavailable when its restricted key is absent', () => {
  const config = loadPaymentEventRuntimeConfig(env({ ...base, STRIPE_RESTRICTED_KEY_TEST: undefined, STRIPE_WEBHOOK_SECRET_TEST: undefined }));
  if (!config) throw new Error('live-only config should remain valid');
  assertEquals(stripeRuntimeKeyForMode(config, 'test'), null);
});

Deno.test('runtime fails closed for wrong key mode or shared webhook secret', () => {
  assertEquals(loadPaymentEventRuntimeConfig(env({ ...base, STRIPE_RESTRICTED_KEY: 'rk_test_wrong_mode' })), null);
  assertEquals(loadPaymentEventRuntimeConfig(env({ ...base, STRIPE_RESTRICTED_KEY_TEST: 'rk_live_wrong_mode' })), null);
  assertEquals(loadPaymentEventRuntimeConfig(env({ ...base, STRIPE_WEBHOOK_SECRET_TEST: base.STRIPE_WEBHOOK_SECRET })), null);
});
