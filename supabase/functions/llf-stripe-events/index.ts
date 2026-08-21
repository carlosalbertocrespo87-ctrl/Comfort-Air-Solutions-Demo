import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const allowedTypes = new Set([
  'checkout.session.completed',
  'payment_intent.succeeded',
  'invoice.paid',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
]);

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json(405, { error: 'method_not_allowed' });

  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  // Fail closed until the real Stripe webhook secret and server credentials are configured.
  if (!webhookSecret || !supabaseUrl || !serviceRoleKey) {
    return json(503, { error: 'payment_runtime_not_configured' });
  }

  // Signature verification is intentionally not bypassed. Until Stripe's raw-body
  // signature verifier is wired and tested, no event is accepted as authoritative.
  const signature = req.headers.get('stripe-signature');
  if (!signature) return json(400, { error: 'missing_stripe_signature' });

  const rawBody = await req.text();
  if (!rawBody) return json(400, { error: 'empty_body' });

  // TODO(#80): verify Stripe signature against rawBody + webhookSecret before parsing.
  // This scaffold deliberately returns 501 rather than trusting unsigned/unverified JSON.
  // No payment state may be mutated until this verification step is implemented.
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  void supabase;
  void allowedTypes;
  void webhookSecret;
  return json(501, { error: 'stripe_signature_verification_not_implemented' });
});
