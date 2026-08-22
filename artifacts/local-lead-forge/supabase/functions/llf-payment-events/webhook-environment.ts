import { verifyStripeSignature } from './stripe-signature.ts';

export type VerifiedWebhookMode = 'live' | 'test';

export type WebhookSignatureModeResult =
  | { ok: true; mode: VerifiedWebhookMode }
  | { ok: false; error: 'stripe_signature_invalid' };

export async function verifyWebhookSignatureMode(input: {
  rawBody: string;
  signatureHeader: string;
  liveSecret: string;
  testSecret: string | null;
  nowSeconds?: number;
}): Promise<WebhookSignatureModeResult> {
  const nowSeconds = input.nowSeconds ?? Math.floor(Date.now() / 1000);

  const live = await verifyStripeSignature(
    input.rawBody,
    input.signatureHeader,
    input.liveSecret,
    300,
    nowSeconds,
  );
  if (live.ok) return { ok: true, mode: 'live' };

  if (!input.testSecret) return { ok: false, error: 'stripe_signature_invalid' };

  const test = await verifyStripeSignature(
    input.rawBody,
    input.signatureHeader,
    input.testSecret,
    300,
    nowSeconds,
  );
  return test.ok
    ? { ok: true, mode: 'test' }
    : { ok: false, error: 'stripe_signature_invalid' };
}

export function webhookModeMatchesEvent(mode: VerifiedWebhookMode, eventLivemode: boolean): boolean {
  return mode === 'live' ? eventLivemode : !eventLivemode;
}
