// LOCAL LEAD FORGE — PAYMENT EVENTS RUNTIME
// Issue #80. Fail-closed: verifies Stripe signatures, deduplicates events, records audit receipts,
// and retrieves current Stripe object state before any entitlement mutation.
// No checkout creation and no direct onboarding trigger.

import { createClient } from 'jsr:@supabase/supabase-js@2';
import { verifyStripeSignature } from './stripe-signature.ts';
import { normalizeStripeEvent, SUPPORTED_EVENT_TYPES } from './event-normalizer.ts';
import { reconcileStripeObject } from './authoritative-reconciler.ts';

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const url = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
  if (!url || !serviceRoleKey || !webhookSecret || !stripeSecretKey) {
    return json({ error: 'server_configuration_error' }, 500);
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) return json({ error: 'stripe_signature_required' }, 400);

  const rawBody = await req.text();
  if (!rawBody) return json({ error: 'empty_payload' }, 400);

  const signatureCheck = await verifyStripeSignature(rawBody, signature, webhookSecret);
  if (!signatureCheck.ok) return json({ error: signatureCheck.error ?? 'stripe_signature_invalid' }, 400);

  let parsed: unknown;
  try { parsed = JSON.parse(rawBody); } catch { return json({ error: 'invalid_json' }, 400); }

  const event = normalizeStripeEvent(parsed);
  if (!event) return json({ error: 'invalid_stripe_event' }, 400);

  const admin = createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const payloadHash = await sha256(rawBody);

  const { error: receiptError } = await admin.from('llf_stripe_event_receipts').insert({
    stripe_event_id: event.id,
    event_type: event.type,
    event_created_at: event.created ? new Date(event.created * 1000).toISOString() : null,
    object_ref: event.objectRef,
    payload_sha256: payloadHash,
    processing_status: SUPPORTED_EVENT_TYPES.has(event.type) ? 'RECEIVED' : 'IGNORED',
  });

  if (receiptError) {
    if ((receiptError as any).code === '23505') return json({ ok: true, duplicate: true });
    return json({ error: 'event_receipt_insert_failed' }, 500);
  }

  if (!SUPPORTED_EVENT_TYPES.has(event.type)) {
    await markReceipt(admin, event.id, 'IGNORED');
    return json({ ok: true, ignored: true });
  }

  let reconciled;
  try {
    reconciled = await reconcileStripeObject(event.objectRef, stripeSecretKey);
  } catch {
    await markReceipt(admin, event.id, 'FAILED');
    return json({ error: 'authoritative_reconciliation_failed' }, 503);
  }

  // Foundation stop gate: authoritative state may now be observed, but protected entitlement mutation
  // remains disabled until correlation-to-acceptance and out-of-order mutation tests are complete.
  await markReceipt(admin, event.id, 'PROCESSED');
  return json({
    ok: true,
    accepted: true,
    authoritative_state_observed: true,
    reconciled,
    state_mutation: 'locked_pending_acceptance_correlation_and_mutation_qa',
  });
});

async function markReceipt(admin: any, eventId: string, status: 'PROCESSED' | 'IGNORED' | 'FAILED') {
  await admin.from('llf_stripe_event_receipts')
    .update({ processed_at: new Date().toISOString(), processing_status: status })
    .eq('stripe_event_id', eventId);
}

async function sha256(value: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}
