// LOCAL LEAD FORGE — PAYMENT EVENTS RUNTIME
// Issue #80. Fail-closed: verifies Stripe signatures, deduplicates events, records audit receipts,
// retrieves current Stripe object state, requires one existing durable correlation, and only then
// applies authoritative entitlement state atomically. No checkout creation and no onboarding trigger.

import { createClient } from 'jsr:@supabase/supabase-js@2';
import { verifyStripeSignature } from './stripe-signature.ts';
import { normalizeStripeEvent, SUPPORTED_EVENT_TYPES } from './event-normalizer.ts';
import { reconcileStripeObject } from './authoritative-reconciler.ts';
import { resolveSingleCorrelation, type CorrelationCandidate } from './correlation.ts';
import { applyAuthoritativeEntitlementState } from './entitlement-mutation.ts';

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

  // Correlation is deliberately bootstrap-closed. This runtime may mutate only when one entitlement
  // already contains a matching Stripe customer/payment/subscription reference. The future checkout
  // creation path must establish that durable correlation server-side before first webhook mutation.
  let candidates: CorrelationCandidate[];
  try {
    candidates = await loadCorrelationCandidates(admin, reconciled);
  } catch {
    await markReceipt(admin, event.id, 'FAILED');
    return json({ error: 'correlation_lookup_failed' }, 503);
  }

  const correlation = resolveSingleCorrelation(candidates, {
    customerRef: reconciled.stripe_customer_ref ?? null,
    paymentIntentRef: reconciled.setup_payment_ref ?? null,
    subscriptionRef: reconciled.subscription_ref ?? null,
  });

  if (!correlation) {
    await markReceipt(admin, event.id, 'FAILED');
    return json({
      error: 'unique_existing_correlation_required',
      state_mutation: 'blocked',
    }, 503);
  }

  const { data: current, error: currentError } = await admin
    .from('llf_payment_entitlements')
    .select('setup_status,monthly_status')
    .eq('acceptance_ref', correlation.acceptance_ref)
    .maybeSingle();
  if (currentError || !current) {
    await markReceipt(admin, event.id, 'FAILED');
    return json({ error: 'entitlement_state_lookup_failed' }, 503);
  }

  try {
    const result = await applyAuthoritativeEntitlementState(admin, {
      acceptanceRef: correlation.acceptance_ref,
      eventId: event.id,
      eventCreatedAt: event.created ? new Date(event.created * 1000).toISOString() : null,
      stripeCustomerRef: reconciled.stripe_customer_ref ?? correlation.stripe_customer_ref,
      setupPaymentRef: reconciled.setup_payment_ref ?? correlation.setup_payment_ref,
      subscriptionRef: reconciled.subscription_ref ?? correlation.subscription_ref,
      setupStatus: reconciled.setup_status ?? current.setup_status,
      monthlyStatus: reconciled.monthly_status ?? current.monthly_status,
    });

    return json({
      ok: true,
      accepted: true,
      authoritative_state_observed: true,
      state_mutation: result.applied ? 'applied' : 'stale_event_ignored',
      onboarding_eligible: result.onboardingEligible,
      onboarding_triggered: false,
    });
  } catch {
    await markReceipt(admin, event.id, 'FAILED');
    return json({ error: 'entitlement_atomic_apply_failed' }, 503);
  }
});

async function loadCorrelationCandidates(admin: any, reconciled: any): Promise<CorrelationCandidate[]> {
  const refs: Array<[string, string | null | undefined]> = [
    ['stripe_customer_ref', reconciled.stripe_customer_ref],
    ['setup_payment_ref', reconciled.setup_payment_ref],
    ['subscription_ref', reconciled.subscription_ref],
  ];
  const byAcceptance = new Map<string, CorrelationCandidate>();

  for (const [column, value] of refs) {
    if (!value || typeof value !== 'string') continue;
    const { data, error } = await admin
      .from('llf_payment_entitlements')
      .select('acceptance_ref,stripe_customer_ref,setup_payment_ref,subscription_ref')
      .eq(column, value)
      .limit(2);
    if (error) throw new Error('candidate_lookup_failed');
    for (const row of data ?? []) byAcceptance.set(row.acceptance_ref, row as CorrelationCandidate);
  }

  return [...byAcceptance.values()];
}

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
