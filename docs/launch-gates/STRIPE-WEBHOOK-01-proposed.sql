-- STRIPE-WEBHOOK-01
-- PROPOSED ONLY — DO NOT AUTO-APPLY.
-- Security-sensitive production database permission change.
-- Requires explicit owner approval before execution.

begin;

-- Edge Function `llf-stripe-events` inserts a receipt row and later updates its processing status.
grant insert, update
on table public.llf_stripe_event_ledger
 to service_role;

-- RPC `llf_apply_first_sale_stripe_event(...)` is SECURITY INVOKER and therefore
-- needs the caller (`service_role`) to read/lock and update the payment-state row.
grant select, update
on table public.llf_first_sale_payment_state
 to service_role;

commit;

-- Intentionally NOT granted:
-- - DELETE
-- - schema-wide privileges
-- - privileges to anon/authenticated
-- - legal-acceptance mutations
-- - customer-facing or payment-creation authority

-- Required post-change verification before any release decision:
-- 1) verify effective grants;
-- 2) issue one Stripe TEST-mode signed event;
-- 3) confirm HTTP 200 and event-ledger write;
-- 4) confirm unknown/missing acceptance ref fails closed;
-- 5) inspect logs/security advisor;
-- 6) keep real charges/refunds/payouts/production activation disabled.