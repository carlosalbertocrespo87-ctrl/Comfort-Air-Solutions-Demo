// LOCAL LEAD FORGE — LEGAL ACCEPTANCE ENDPOINT
// Issue #80. Fail-closed foundation only: records acceptance, does not create checkout or charge customers.

import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, idempotency-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const url = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const releasedLegalVersion = Deno.env.get('LLF_RELEASED_LEGAL_VERSION');
  const legalReleaseFlag = Deno.env.get('LLF_LEGAL_RELEASED');
  if (!url || !serviceRoleKey) return json({ error: 'server_configuration_error' }, 500);

  // Hard fail-closed gate. Recording a real acceptance is forbidden until release is explicitly enabled server-side.
  if (legalReleaseFlag !== 'true' || !releasedLegalVersion) {
    return json({ error: 'legal_release_not_enabled' }, 503);
  }

  const idempotencyKey = cleanText(req.headers.get('idempotency-key'), 200);
  if (!idempotencyKey) return json({ error: 'idempotency_key_required' }, 400);

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return json({ error: 'invalid_json' }, 400); }

  const legalVersion = cleanText(body.legal_version, 120);
  const customerName = cleanText(body.customer_name, 200);
  const companyName = cleanText(body.company_name, 200);
  const customerEmail = cleanText(body.customer_email, 320).toLowerCase();
  const consent = body.consent === true;

  if (!consent) return json({ error: 'explicit_consent_required' }, 400);
  if (!customerName) return json({ error: 'customer_name_required' }, 400);
  if (!legalVersion || legalVersion !== releasedLegalVersion) return json({ error: 'legal_version_mismatch' }, 409);
  if (customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) return json({ error: 'invalid_email' }, 400);

  const admin = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Retry-safe path: if this key already exists, return the same acceptance only when the payload still matches.
  const { data: existing, error: existingError } = await admin
    .from('llf_legal_acceptances')
    .select('acceptance_ref,legal_version,accepted_at,customer_name,company_name,customer_email')
    .eq('idempotency_key', idempotencyKey)
    .maybeSingle();

  if (existingError) return json({ error: 'acceptance_lookup_failed' }, 500);
  if (existing) {
    const samePayload = existing.legal_version === legalVersion &&
      existing.customer_name === customerName &&
      (existing.company_name ?? '') === companyName &&
      (existing.customer_email ?? '') === customerEmail;
    if (!samePayload) return json({ error: 'idempotency_key_conflict' }, 409);

    const { error: entitlementRetryError } = await admin
      .from('llf_payment_entitlements')
      .upsert({ acceptance_ref: existing.acceptance_ref }, { onConflict: 'acceptance_ref', ignoreDuplicates: true });
    if (entitlementRetryError) return json({ error: 'entitlement_initialize_failed' }, 500);

    return json({
      ok: true,
      acceptance_ref: existing.acceptance_ref,
      legal_version: existing.legal_version,
      accepted_at: existing.accepted_at,
      payment_ready: false,
      onboarding_eligible: false,
      idempotent_replay: true,
    }, 200);
  }

  const { data: acceptance, error: acceptanceError } = await admin
    .from('llf_legal_acceptances')
    .insert({
      legal_version: legalVersion,
      customer_name: customerName,
      company_name: companyName || null,
      customer_email: customerEmail || null,
      source: 'server',
      idempotency_key: idempotencyKey,
    })
    .select('acceptance_ref,legal_version,accepted_at')
    .single();

  if (acceptanceError || !acceptance) return json({ error: 'acceptance_persist_failed' }, 500);

  const { error: entitlementError } = await admin
    .from('llf_payment_entitlements')
    .upsert({ acceptance_ref: acceptance.acceptance_ref }, { onConflict: 'acceptance_ref', ignoreDuplicates: true });

  if (entitlementError) return json({ error: 'entitlement_initialize_failed' }, 500);

  return json({
    ok: true,
    acceptance_ref: acceptance.acceptance_ref,
    legal_version: acceptance.legal_version,
    accepted_at: acceptance.accepted_at,
    payment_ready: false,
    onboarding_eligible: false,
    idempotent_replay: false,
  }, 201);
});

function cleanText(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}
