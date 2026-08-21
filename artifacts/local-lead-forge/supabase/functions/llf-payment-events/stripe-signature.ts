const textEncoder = new TextEncoder();

export type StripeSignatureCheck = {
  ok: boolean;
  error?: string;
  timestamp?: number;
};

export async function verifyStripeSignature(
  rawBody: string,
  signatureHeader: string,
  secret: string,
  toleranceSeconds = 300,
  nowSeconds = Math.floor(Date.now() / 1000),
): Promise<StripeSignatureCheck> {
  const parts = signatureHeader.split(',').map((part) => part.trim());
  const timestampPart = parts.find((part) => part.startsWith('t='));
  const signatures = parts.filter((part) => part.startsWith('v1=')).map((part) => part.slice(3));
  if (!timestampPart || signatures.length === 0) return { ok: false, error: 'malformed_signature_header' };

  const timestamp = Number(timestampPart.slice(2));
  if (!Number.isFinite(timestamp)) return { ok: false, error: 'invalid_signature_timestamp' };
  if (Math.abs(nowSeconds - timestamp) > toleranceSeconds) return { ok: false, error: 'signature_timestamp_outside_tolerance', timestamp };

  const signedPayload = `${timestamp}.${rawBody}`;
  const key = await crypto.subtle.importKey(
    'raw',
    textEncoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const digest = await crypto.subtle.sign('HMAC', key, textEncoder.encode(signedPayload));
  const expected = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');

  const ok = signatures.some((candidate) => timingSafeEqualHex(candidate, expected));
  return ok ? { ok: true, timestamp } : { ok: false, error: 'signature_mismatch', timestamp };
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
