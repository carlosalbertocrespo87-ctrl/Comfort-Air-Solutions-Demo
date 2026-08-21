-- STRIPE-WEBHOOK-01
-- PHASE A + NARROW FOLLOW-UP APPLIED 2026-08-21 WITH EXPLICIT OWNER APPROVAL.

-- Applied and verified:
-- grant insert, update on public.llf_stripe_event_ledger to service_role;
-- grant select, update on public.llf_first_sale_payment_state to service_role;
-- grant select (stripe_event_id) on public.llf_stripe_event_ledger to service_role;

-- Validation evidence:
-- - service_role ledger insert + status update using WHERE stripe_event_id=... succeeded
--   inside a transaction.
-- - transaction was rolled back and zero synthetic probe rows persisted.
-- - payment-state SECURITY INVOKER RPC can execute as service_role and fails closed
--   on an unknown acceptance_ref with reason `unknown_acceptance_ref`.
-- - table-wide SELECT on llf_stripe_event_ledger remains false.
-- - DELETE on ledger and payment-state tables remains false.

-- Intentionally NOT granted:
-- - table-wide SELECT on the event ledger
-- - DELETE
-- - schema-wide privileges
-- - privileges to anon/authenticated
-- - legal-acceptance mutations
-- - customer-facing or payment-creation authority

-- Remaining validation before this gate can be considered fully cleared:
-- 1) send one Stripe TEST-mode signed event only through an authenticated test-mode channel;
-- 2) expect HTTP 200 and verify a ledger row;
-- 3) confirm missing/unknown acceptance_ref fails closed / is ignored;
-- 4) inspect logs/security advisor;
-- 5) keep real charges/refunds/payouts/production activation disabled.
