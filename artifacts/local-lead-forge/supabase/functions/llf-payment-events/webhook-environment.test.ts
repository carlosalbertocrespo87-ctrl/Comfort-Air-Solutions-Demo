import { assertEquals } from 'jsr:@std/assert@1';
import { verifyWebhookSignatureMode, webhookModeMatchesEvent } from './webhook-environment.ts';

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

Deno.test('detects live signature mode before payload parsing', async () => {
  const now = 1_800_000_000;
  const body = '{"id":"evt_live"}';
  const signature = await sign('whsec_live', now, body);
  const result = await verifyWebhookSignatureMode({
    rawBody: body,
    signatureHeader: `t=${now},v1=${signature}`,
    liveSecret: 'whsec_live',
    testSecret: 'whsec_test',
    nowSeconds: now,
  });
  assertEquals(result, { ok: true, mode: 'live' });
  if (result.ok) {
    assertEquals(webhookModeMatchesEvent(result.mode, true), true);
    assertEquals(webhookModeMatchesEvent(result.mode, false), false);
  }
});

Deno.test('detects test signature mode before payload parsing', async () => {
  const now = 1_800_000_000;
  const body = '{"id":"evt_test"}';
  const signature = await sign('whsec_test', now, body);
  const result = await verifyWebhookSignatureMode({
    rawBody: body,
    signatureHeader: `t=${now},v1=${signature}`,
    liveSecret: 'whsec_live',
    testSecret: 'whsec_test',
    nowSeconds: now,
  });
  assertEquals(result, { ok: true, mode: 'test' });
  if (result.ok) {
    assertEquals(webhookModeMatchesEvent(result.mode, false), true);
    assertEquals(webhookModeMatchesEvent(result.mode, true), false);
  }
});

Deno.test('fails closed when neither configured secret verifies', async () => {
  const now = 1_800_000_000;
  const body = '{"id":"evt_bad"}';
  const signature = await sign('whsec_other', now, body);
  const result = await verifyWebhookSignatureMode({
    rawBody: body,
    signatureHeader: `t=${now},v1=${signature}`,
    liveSecret: 'whsec_live',
    testSecret: 'whsec_test',
    nowSeconds: now,
  });
  assertEquals(result, { ok: false, error: 'stripe_signature_invalid' });
});
