-- STRIPE-WEBHOOK-01 — HISTORICAL LEGACY-PATH PERMISSION EVIDENCE
-- DO NOT EXECUTE THIS FILE AS A MIGRATION.
-- PHASE A + NARROW FOLLOW-UP WERE APPLIED 2026-08-21 WITH EXPLICIT OWNER APPROVAL.
-- The final target architecture is now controlled by:
-- docs/launch-gates/STRIPE-WEBHOOK-02-authoritative-runtime-cutover-plan.md

-- Applied historically and verified:
-- grant insert, update on public.llf_stripe_event_ledger to service_role;
-- grant select, update on public.llf_first_sale_payment_state to service_role;
-- grant select (stripe_event_id) on public.llf_stripe_event_ledger to service_role;

-- Validation evidence for the legacy runtime only:
-- - service_role ledger insert + status update using WHERE stripe_event_id=... succeeded
--   inside a transaction.
-- - transaction was rolled back and zero synthetic probe rows persisted.
-- - payment-state SECURITY INVOKER RPC can execute as service_role and fails closed
--   on an unknown acceptance_ref with reason `unknown_acceptance_ref`.
-- - table-wide SELECT on llf_stripe_event_ledger remains false.
-- - DELETE on legacy ledger/payment-state tables remains false.

-- Superseding read-only production evidence:
-- - authoritative tables llf_payment_entitlements and llf_stripe_event_receipts already exist;
-- - both have RLS enabled and reported zero rows at the 21 Aug checkpoint;
-- - llf_apply_payment_entitlement_state(...) exists as SECURITY DEFINER;
-- - service_role has EXECUTE on the authoritative apply RPC;
-- - the deployed Edge Function still uses the legacy ledger/payment-state RPC contract;
-- - therefore a signed TEST event against the legacy path is not sufficient final-release evidence.

-- Intentionally NOT authorized by this file:
-- - any additional database grants/revokes;
-- - schema/table/function changes;
-- - Edge Function deployment/replacement;
-- - Stripe credential creation/rotation/scope expansion;
-- - signed Stripe event generation;
-- - checkout, charges, refunds, payouts, subscriptions or onboarding;
-- - customer/prospect outreach or production release.

-- Next safe work is design/test evidence for the authoritative runtime cutover plan.
