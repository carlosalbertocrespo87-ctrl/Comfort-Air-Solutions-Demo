import { verifyStripeSignature } from './stripe-signature.ts';

export type VerifiedWebhookMode = 'live' | 'test';

export type WebhookEnvironmentResult =
  | { ok: true; mode: VerifiedWebhookMode }
  | { ok: false; error: 'stripe_signature_invalid' | 'environment_mismatch' };

export async function verifyWebhookEnvironment(input: {
  rawBody: string;
  signatureHeader: string;
  liveSecret: string;
  testSecret: string | null;
  eventLivemode: boolean;
  nowSeconds?: number;
}): Promise<WebhookEnvironmentResult> {
  const nowSeconds = input.nowSeconds ?? Math.floor(Date.now() / 1000);

  const live = await verifyStripeSignature(
    input.rawBody,
    input.signatureHeader,
    input.liveSecret,
    300,
    nowSeconds,
  );
  if (live.ok) {
    return input.eventLivemode
      ? { ok: true, mode: 'live' }
      : { ok: false, error: 'environment_mismatch' };
  }

  if (!input.testSecret) return { ok: false, error: 'stripe_signature_invalid' };

  const test = await verifyStripeSignature(
    input.rawBody,
    input.signatureHeader,
    input.testSecret,
    300,
    nowSeconds,
  );
  if (!test.ok) return { ok: false, error: 'stripe_signature_invalid' };

  return input.eventLivemode
    ? { ok: false, error: 'environment_mismatch' }
    : { ok: true, mode: 'test' };
}
