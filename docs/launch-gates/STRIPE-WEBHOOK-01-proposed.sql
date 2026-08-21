-- STRIPE-WEBHOOK-01
-- PHASE A APPLIED 2026-08-21 WITH EXPLICIT OWNER APPROVAL.
-- FOLLOW-UP BELOW REMAINS PROPOSED ONLY.

-- Applied and verified:
-- grant insert, update on public.llf_stripe_event_ledger to service_role;
-- grant select, update on public.llf_first_sale_payment_state to service_role;

-- Post-change permission probe result:
-- - payment-state SECURITY INVOKER RPC can execute as service_role and fails closed
--   on an unknown acceptance_ref with reason `unknown_acceptance_ref`.
-- - ledger insert+update probe failed because PostgreSQL requires SELECT privilege
--   on the predicate column used by the UPDATE WHERE clause.
-- - probe transaction left zero synthetic rows behind.

-- FOLLOW-UP PROPOSED ONLY — REQUIRES A NEW EXPLICIT OWNER APPROVAL BEFORE APPLYING.
-- Narrowest observed additional privilege for the existing runtime path:
-- grant select (stripe_event_id)
-- on table public.llf_stripe_event_ledger
-- to service_role;

-- Why column-level SELECT instead of table-wide SELECT:
-- Edge Function `llf-stripe-events` updates processing status using
-- `.eq("stripe_event_id", event.id)`. PostgreSQL requires SELECT on that predicate
-- column. No read access to the remaining ledger columns is required by the current
-- code path.

-- Intentionally NOT added by this follow-up:
-- - table-wide SELECT on the event ledger
-- - DELETE
-- - schema-wide privileges
-- - privileges to anon/authenticated
-- - legal-acceptance mutations
-- - customer-facing or payment-creation authority

-- Required validation after separate approval of the column-level SELECT:
-- 1) rerun the service_role ledger insert/update probe inside a transaction and roll it back;
-- 2) confirm zero probe rows persist;
-- 3) send one Stripe TEST-mode signed event only through an authenticated test-mode channel;
-- 4) expect HTTP 200 rather than 500 and verify a ledger row;
-- 5) confirm unknown/missing acceptance_ref fails closed / is ignored;
-- 6) inspect logs/security advisor;
-- 7) keep real charges/refunds/payouts/production activation disabled.
