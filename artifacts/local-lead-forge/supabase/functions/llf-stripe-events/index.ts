import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@18?target=denonext";

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "content-type": "application/json" },
});

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const stripeKey = Deno.env.get("STRIPE_RESTRICTED_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!webhookSecret || !stripeKey || !supabaseUrl || !serviceRoleKey) {
    return json({ error: "runtime_not_configured" }, 503);
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) return json({ error: "missing_signature" }, 400);

  const rawBody = await req.text();
  const stripe = new Stripe(stripeKey, { apiVersion: "2026-06-24.dahlia" });
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(rawBody, signature, webhookSecret);
  } catch {
    return json({ error: "invalid_signature" }, 400);
  }

  const db = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const object = event.data.object as { id?: string };
  const { error: ledgerError } = await db.from("llf_stripe_event_ledger").insert({
    stripe_event_id: event.id,
    stripe_event_type: event.type,
    stripe_event_created_at: new Date(event.created * 1000).toISOString(),
    object_ref: object?.id ?? null,
    processing_status: "RECEIVED",
  });

  // Duplicate Stripe event IDs are acknowledgements, not reprocessed mutations.
  if (ledgerError?.code === "23505") return json({ received: true, duplicate: true });
  if (ledgerError) return json({ error: "ledger_write_failed" }, 500);

  // State transitions are intentionally handled in the database in the next gate.
  // Until that transition function is installed, verified events are recorded but
  // cannot release onboarding or infer payment from browser redirects.
  const { error: statusError } = await db.from("llf_stripe_event_ledger")
    .update({ processing_status: "IGNORED", processed_at: new Date().toISOString() })
    .eq("stripe_event_id", event.id);
  if (statusError) return json({ error: "ledger_finalize_failed" }, 500);

  return json({ received: true, processed: false, reason: "transition_gate_not_installed" });
});
