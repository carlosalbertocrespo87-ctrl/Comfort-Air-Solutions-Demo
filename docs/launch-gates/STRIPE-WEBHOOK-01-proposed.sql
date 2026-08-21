-- STRIPE-WEBHOOK-01 — HISTORICAL LEGACY-TABLE PERMISSION EVIDENCE
-- DO NOT EXECUTE THIS FILE AS A MIGRATION.
-- PHASE A + NARROW FOLLOW-UP WERE APPLIED 2026-08-21 WITH EXPLICIT OWNER APPROVAL.
-- Active production runtime is now llf-stripe-events v6.
-- Current validation plan: docs/launch-gates/STRIPE-WEBHOOK-02-authoritative-runtime-cutover-plan.md

-- Applied historically and verified:
-- grant insert, update on public.llf_stripe_event_ledger to service_role;
-- grant select, update on public.llf_first_sale_payment_state to service_role;
-- grant select (stripe_event_id) on public.llf_stripe_event_ledger to service_role;

-- Validation evidence for the active legacy-table storage path:
-- - service_role ledger insert + status update using WHERE stripe_event_id=... succeeded
--   inside a transaction.
-- - transaction was rolled back and zero synthetic probe rows persisted.
-- - table-wide SELECT on llf_stripe_event_ledger remains false.
-- - DELETE on the legacy ledger/payment-state tables remains false.

-- Superseding production-runtime evidence:
-- - active Edge Function is llf-stripe-events v6, not v5;
-- - v6 verifies live/TEST environment consistency;
-- - v6 uses restricted Stripe provider access and a separate TEST key when configured;
-- - v6 retrieves current Checkout Session / Subscription state before advancement;
-- - setup advancement requires provider-confirmed Checkout payment_status=paid;
-- - monthly advancement requires provider-confirmed Subscription status=active;
-- - v6 calls llf_apply_first_sale_stripe_event_v2(...) with explicit confirmation booleans;
-- - v6 does not automatically trigger onboarding.

-- Separate hardened foundation already present:
-- - llf_payment_entitlements and llf_stripe_event_receipts exist with RLS enabled;
-- - Stage B migrations 012–015 were already applied and least-privilege verified;
-- - migration 015 is now source-controlled and regression-tested on Draft PR #143;
-- - PR #143 is an alternate hardened receipt/entitlement runtime path, not an automatic v6 replacement.

-- Remaining release proof:
-- - one legitimate signed Stripe TEST-mode end-to-end event against active v6;
-- - durable ledger evidence;
-- - authoritative TEST provider retrieval;
-- - missing/unknown acceptance fail-closed behavior;
-- - duplicate/stale protections;
-- - no live customer/payment/onboarding side effects.

-- Intentionally NOT authorized by this file:
-- - any additional database grants/revokes;
-- - schema/table/function changes;
-- - Edge Function deployment/replacement;
-- - Stripe credential creation/rotation/scope expansion;
-- - signed Stripe event generation from live context;
-- - checkout, charges, refunds, payouts, subscriptions or onboarding;
-- - customer/prospect outreach or production release.

-- This file is evidence only. Do not re-run the historical GRANT statements blindly.
