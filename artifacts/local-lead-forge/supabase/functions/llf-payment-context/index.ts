// LOCAL LEAD FORGE — PAYMENT CONTEXT FOUNDATION
// Issue #80. Fail-closed only: validates server-side offer configuration and existing legal acceptance.
// Does NOT create a Stripe Checkout Session or charge a customer.

import { createClient } from 'jsr:@supabase/supabase-js@2';

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const url = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const setupPriceId = Deno.env.get('LLF_STRIPE_SETUP_PRICE_ID');
  const monthlyPriceId = Deno.env.get('LLF_STRIPE_MONTHLY_PRICE_ID');
  const paymentRelease = Deno.env.get('LLF_PAYMENT_RELEASED') === 'true';
  if (!url || !serviceRoleKey) return json({ error: 'server_configuration_error' }, 500);

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return json({ error: 'invalid_json' }, 400); }

  const acceptanceRef = typeof body.acceptance_ref === 'string' ? body.acceptance_ref.trim() : '';
  if (!/^[0-9a-fA-F-]{36}$/.test(acceptanceRef)) return json({ error: 'invalid_acceptance_ref' }, 400);

  const admin = createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: acceptance, error: acceptanceError } = await admin
    .from('llf_legal_acceptances')
    .select('acceptance_ref,legal_version,customer_name,company_name,customer_email,accepted_at')
    .eq('acceptance_ref', acceptanceRef)
    .maybeSingle();

  if (acceptanceError) return json({ error: 'acceptance_lookup_failed' }, 500);
  if (!acceptance) return json({ error: 'acceptance_not_found' }, 404);

  // Never accept browser-provided price IDs or amounts as authoritative.
  if (!setupPriceId || !monthlyPriceId) {
    return json({ error: 'approved_price_configuration_missing' }, 503);
  }

  // Keep release separate from configuration. This foundation never returns a checkout URL.
  if (!paymentRelease) {
    return json({
      ok: true,
      released: false,
      acceptance_ref: acceptance.acceptance_ref,
      offer: { setup_usd_cents: 29900, monthly_usd_cents: 19900, interval: 'month' },
      state: 'PAYMENT_CONTEXT_VALIDATED_BUT_RELEASE_LOCKED',
    });
  }

  // Intentionally fail closed until official Stripe API price verification and Checkout creation are implemented.
  return json({ error: 'stripe_price_verification_and_checkout_not_implemented' }, 503);
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}
