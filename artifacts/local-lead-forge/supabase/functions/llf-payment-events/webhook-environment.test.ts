import { assertEquals } from 'jsr:@std/assert@1';
import { verifyWebhookEnvironment } from './webhook-environment.ts';

async function sign(secret: string, timestamp: number, body: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const digest = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${timestamp}.${body}`));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

Deno.test('accepts live signature only for livemode event', async () => {
  const now = 1_800_000_000;
  const body = '{"id":"evt_live","livemode":true}';
  const signature = await sign('whsec_live', now, body);
  const result = await verifyWebhookEnvironment({
    rawBody: body,
    signatureHeader: `t=${now},v1=${signature}`,
    liveSecret: 'whsec_live',
    testSecret: 'whsec_test',
    eventLivemode: true,
    nowSeconds: now,
  });
  assertEquals(result, { ok: true, mode: 'live' });
});

Deno.test('accepts test signature only for non-livemode event', async () => {
  const now = 1_800_000_000;
  const body = '{"id":"evt_test","livemode":false}';
  const signature = await sign('whsec_test', now, body);
  const result = await verifyWebhookEnvironment({
    rawBody: body,
    signatureHeader: `t=${now},v1=${signature}`,
    liveSecret: 'whsec_live',
    testSecret: 'whsec_test',
    eventLivemode: false,
    nowSeconds: now,
  });
  assertEquals(result, { ok: true, mode: 'test' });
});

Deno.test('fails closed on live/test environment mismatch', async () => {
  const now = 1_800_000_000;
  const body = '{"id":"evt_mismatch","livemode":false}';
  const signature = await sign('whsec_live', now, body);
  const result = await verifyWebhookEnvironment({
    rawBody: body,
    signatureHeader: `t=${now},v1=${signature}`,
    liveSecret: 'whsec_live',
    testSecret: 'whsec_test',
    eventLivemode: false,
    nowSeconds: now,
  });
  assertEquals(result, { ok: false, error: 'environment_mismatch' });
});

Deno.test('fails closed when neither configured secret verifies', async () => {
  const now = 1_800_000_000;
  const body = '{"id":"evt_bad","livemode":false}';
  const signature = await sign('whsec_other', now, body);
  const result = await verifyWebhookEnvironment({
    rawBody: body,
    signatureHeader: `t=${now},v1=${signature}`,
    liveSecret: 'whsec_live',
    testSecret: 'whsec_test',
    eventLivemode: false,
    nowSeconds: now,
  });
  assertEquals(result, { ok: false, error: 'stripe_signature_invalid' });
});
