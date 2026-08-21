// LOCAL LEAD FORGE — PAYMENT EVENTS RUNTIME SKELETON
// Issue #80. Fail-closed foundation only: no checkout creation, no onboarding trigger.

import { createClient } from 'jsr:@supabase/supabase-js@2';

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const url = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  if (!url || !serviceRoleKey || !webhookSecret) return json({ error: 'server_configuration_error' }, 500);

  const signature = req.headers.get('stripe-signature');
  if (!signature) return json({ error: 'stripe_signature_required' }, 400);

  // Intentionally fail closed until signature verification is implemented with Stripe's official verifier.
  // Never parse/mutate entitlement state from an unverified payload.
  const rawBody = await req.text();
  if (!rawBody) return json({ error: 'empty_payload' }, 400);

  const admin = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // The authoritative implementation must:
  // 1) verify the Stripe signature against rawBody + STRIPE_WEBHOOK_SECRET;
  // 2) derive stripe_event_id, event type, provider-created timestamp and object refs;
  // 3) insert llf_stripe_event_receipts first and dedupe by primary key;
  // 4) reconcile current Stripe object state instead of trusting delivery order;
  // 5) update llf_payment_entitlements only after verified authoritative state;
  // 6) call llf_recompute_onboarding_eligibility();
  // 7) never trigger onboarding directly from browser redirects.

  void admin;
  return json({ error: 'signature_verification_not_implemented' }, 503);
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}
