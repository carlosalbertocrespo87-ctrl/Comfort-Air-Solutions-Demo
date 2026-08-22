import { assertEquals } from 'jsr:@std/assert';
import { verifyWebhookSignatureMode, webhookModeMatchesEvent } from './webhook-environment.ts';

async function signature(secret: string, payload: string, timestamp: number): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const digest = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${timestamp}.${payload}`));
  const hex = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
  return `t=${timestamp},v1=${hex}`;
}

Deno.test('webhook signature resolves live and test mode independently', async () => {
  const now = 1_800_000_000;
  const payload = '{"id":"evt_synthetic"}';
  const liveSecret = 'whsec_live_synthetic';
  const testSecret = 'whsec_test_synthetic';

  const live = await verifyWebhookSignatureMode({
    rawBody: payload,
    signatureHeader: await signature(liveSecret, payload, now),
    liveSecret,
    testSecret,
    nowSeconds: now,
  });
  assertEquals(live, { ok: true, mode: 'live' });

  const test = await verifyWebhookSignatureMode({
    rawBody: payload,
    signatureHeader: await signature(testSecret, payload, now),
    liveSecret,
    testSecret,
    nowSeconds: now,
  });
  assertEquals(test, { ok: true, mode: 'test' });
});

Deno.test('signature mode must agree with Stripe event livemode', () => {
  assertEquals(webhookModeMatchesEvent('live', true), true);
  assertEquals(webhookModeMatchesEvent('live', false), false);
  assertEquals(webhookModeMatchesEvent('test', false), true);
  assertEquals(webhookModeMatchesEvent('test', true), false);
});

Deno.test('missing test secret cannot validate a test signature', async () => {
  const now = 1_800_000_000;
  const payload = '{"id":"evt_synthetic"}';
  const result = await verifyWebhookSignatureMode({
    rawBody: payload,
    signatureHeader: await signature('whsec_test_synthetic', payload, now),
    liveSecret: 'whsec_live_synthetic',
    testSecret: null,
    nowSeconds: now,
  });
  assertEquals(result, { ok: false, error: 'stripe_signature_invalid' });
});
