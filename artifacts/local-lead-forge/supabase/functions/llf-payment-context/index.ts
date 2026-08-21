// LOCAL LEAD FORGE — PAYMENT CONTEXT FOUNDATION
// Issue #80. Fail-closed only: validates server-side offer configuration and existing legal acceptance.
// Does NOT create a Stripe Checkout Session or charge a customer.

import { createClient } from 'jsr:@supabase/supabase-js@2';
import { APPROVED_OFFER, verifyApprovedOffer } from './offer-verifier.ts';
import { fetchStripePrice } from './stripe-price-client.ts';

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const url = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
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

  if (!setupPriceId || !monthlyPriceId) {
    return json({ error: 'approved_price_configuration_missing' }, 503);
  }

  // Keep release separate from configuration. No Stripe API call is needed while payment release is locked.
  if (!paymentRelease) {
    return json({
      ok: true,
      released: false,
      acceptance_ref: acceptance.acceptance_ref,
      offer: APPROVED_OFFER,
      state: 'PAYMENT_CONTEXT_VALIDATED_BUT_RELEASE_LOCKED',
    });
  }

  // Even when payment release is toggled, require a server-held Stripe secret and verify both configured prices.
  if (!stripeSecretKey) return json({ error: 'stripe_server_secret_missing' }, 503);

  try {
    const [setupPrice, monthlyPrice] = await Promise.all([
      fetchStripePrice(setupPriceId, stripeSecretKey),
      fetchStripePrice(monthlyPriceId, stripeSecretKey),
    ]);

    if (setupPrice.id !== setupPriceId || monthlyPrice.id !== monthlyPriceId) {
      return json({ error: 'stripe_price_identity_mismatch' }, 503);
    }

    const verification = verifyApprovedOffer(setupPrice, monthlyPrice);
    if (!verification.ok) {
      return json({ error: 'approved_offer_verification_failed', details: verification.errors }, 503);
    }

    // Price verification can succeed, but Checkout remains intentionally unavailable in this foundation.
    return json({
      ok: true,
      released: false,
      acceptance_ref: acceptance.acceptance_ref,
      offer: APPROVED_OFFER,
      state: 'STRIPE_PRICES_VERIFIED_CHECKOUT_NOT_IMPLEMENTED',
    }, 503);
  } catch {
    return json({ error: 'stripe_price_verification_unavailable' }, 503);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}
