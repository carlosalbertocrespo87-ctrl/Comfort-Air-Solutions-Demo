import { verifyStripeSignature } from './stripe-signature.ts';

async function sign(secret: string, timestamp: number, body: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const digest = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${timestamp}.${body}`));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

Deno.test('accepts a valid v1 signature inside tolerance', async () => {
  const secret = 'whsec_test';
  const body = '{"id":"evt_test"}';
  const now = 1_800_000_000;
  const sig = await sign(secret, now, body);
  const result = await verifyStripeSignature(body, `t=${now},v1=${sig}`, secret, 300, now);
  if (!result.ok) throw new Error(`expected valid signature: ${result.error}`);
});

Deno.test('rejects malformed, stale and mismatched signatures', async () => {
  const secret = 'whsec_test';
  const body = '{}';
  const now = 1_800_000_000;
  const malformed = await verifyStripeSignature(body, 'v0=abc', secret, 300, now);
  if (malformed.ok) throw new Error('malformed signature accepted');
  const staleSig = await sign(secret, now - 301, body);
  const stale = await verifyStripeSignature(body, `t=${now - 301},v1=${staleSig}`, secret, 300, now);
  if (stale.ok) throw new Error('stale signature accepted');
  const mismatch = await verifyStripeSignature(body, `t=${now},v1=${'0'.repeat(64)}`, secret, 300, now);
  if (mismatch.ok) throw new Error('mismatched signature accepted');
});
