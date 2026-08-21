import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@18?target=denonext";

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "content-type": "application/json" },
});

type MetadataCarrier = { metadata?: Record<string, string> | null };

type StripeObject = {
  id?: string;
  customer?: string | { id?: string } | null;
  payment_intent?: string | { id?: string } | null;
  subscription?: string | { id?: string } | null;
  metadata?: Record<string, string> | null;
};

function idOf(value: string | { id?: string } | null | undefined): string | null {
  if (typeof value === "string") return value;
  return value?.id ?? null;
}

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

  const object = event.data.object as StripeObject & MetadataCarrier;
  const eventCreatedAt = new Date(event.created * 1000).toISOString();

  const { error: ledgerError } = await db.from("llf_stripe_event_ledger").insert({
    stripe_event_id: event.id,
    stripe_event_type: event.type,
    stripe_event_created_at: eventCreatedAt,
    object_ref: object?.id ?? null,
    processing_status: "RECEIVED",
  });

  if (ledgerError?.code === "23505") return json({ received: true, duplicate: true });
  if (ledgerError) return json({ error: "ledger_write_failed" }, 500);

  const acceptanceRef = object.metadata?.llf_acceptance_ref ?? null;
  if (!acceptanceRef) {
    await db.from("llf_stripe_event_ledger")
      .update({ processing_status: "IGNORED", processed_at: new Date().toISOString() })
      .eq("stripe_event_id", event.id);
    return json({ received: true, processed: false, reason: "missing_acceptance_ref" });
  }

  const { data: transitionRows, error: transitionError } = await db.rpc("llf_apply_first_sale_stripe_event", {
    p_event_id: event.id,
    p_event_type: event.type,
    p_event_created_at: eventCreatedAt,
    p_acceptance_ref: acceptanceRef,
    p_object_id: object.id ?? "",
    p_customer_id: idOf(object.customer),
    p_payment_intent_id: idOf(object.payment_intent),
    p_subscription_id: idOf(object.subscription) ?? (event.type.startsWith("customer.subscription.") ? object.id ?? null : null),
  });

  if (transitionError) {
    await db.from("llf_stripe_event_ledger")
      .update({ processing_status: "FAILED", processed_at: new Date().toISOString() })
      .eq("stripe_event_id", event.id);
    return json({ error: "transition_failed" }, 500);
  }

  const transition = Array.isArray(transitionRows) ? transitionRows[0] : transitionRows;
  const processed = Boolean(transition?.processed);
  await db.from("llf_stripe_event_ledger")
    .update({
      processing_status: processed ? "PROCESSED" : "IGNORED",
      processed_at: new Date().toISOString(),
    })
    .eq("stripe_event_id", event.id);

  return json({
    received: true,
    processed,
    onboarding_ready: Boolean(transition?.onboarding_ready),
    reason: transition?.reason ?? "no_transition_result",
  });
});
