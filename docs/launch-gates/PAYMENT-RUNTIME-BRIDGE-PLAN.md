# PAYMENT-RUNTIME-BRIDGE-01 — Authoritative Stripe Runtime Bridge

Status: STAGE B COMPLETE / V6 TEST EVIDENCE PENDING
Date: 21 Aug 2026
Cost target: $0
Issues: #130, #136

## Current production truth

Stage B added the hardened database foundation additively, with no cutover and no data migration.

Preserved existing objects:
- `llf_legal_acceptances`
- `llf_first_sale_payment_state`
- `llf_stripe_event_ledger`

Added hardened objects:
- `llf_payment_entitlements`
- `llf_stripe_event_receipts`
- `llf_recompute_onboarding_eligibility(uuid)`
- `llf_apply_payment_entitlement_state(uuid,text,timestamptz,text,text,text,text,text)`
- `llf_bootstrap_payment_correlation(uuid,text,text,text)`

Both new hardened tables contained 0 rows immediately after Stage B. No backfill, table drop, rename, truncate, or legacy-data mutation occurred.

## Active runtime evidence

Production `llf-stripe-events` v6 already performs authoritative checks before mutation:
- verifies Stripe signatures;
- uses `STRIPE_RESTRICTED_KEY` for live provider reads;
- supports separate TEST secret/key names when configured;
- rejects live/test environment mismatch;
- retrieves current Checkout Session / Subscription state from Stripe;
- passes explicit provider-confirmed paid/active booleans to `llf_apply_first_sale_stripe_event_v2(...)`;
- does not automatically trigger onboarding.

The older `llf_apply_first_sale_stripe_event(...)` still exists, but v6 does not call it.

## Stage B — completed with owner approval

Applied successfully:
1. `012_payment_entitlement_foundation`
2. `013_payment_entitlement_atomic_apply`
3. `014_payment_correlation_bootstrap`
4. `015_payment_runtime_service_role_least_privilege`

Verified:
- RLS enabled on private payment/legal tables;
- hardened tables empty after apply;
- `service_role` receipt INSERT allowed;
- only receipt status/timestamp UPDATE and predicate-column SELECT allowed;
- only required entitlement columns readable by `service_role`;
- no direct entitlement INSERT/UPDATE/DELETE;
- hardened RPC EXECUTE granted only to required server role;
- anon/authenticated hardened access denied;
- no backfill.

## Remaining payment-runtime gate

The old HTTP 500 logs belong to v5. The immediate missing proof is one signed TEST-mode end-to-end validation of deployed v6:
1. verify TEST secret/key presence without exposing values;
2. obtain an authenticated Stripe TEST-mode channel;
3. send one signed TEST event to v6;
4. verify HTTP result and durable ledger evidence;
5. verify authoritative Stripe retrieval before state mutation;
6. verify missing/unknown acceptance fails closed;
7. verify duplicate/stale events cannot advance state incorrectly;
8. verify onboarding is not triggered automatically;
9. keep all live payment/customer activity untouched.

## Alternate hardened runtime source path

The source-controlled `llf-payment-events` path uses separate live/test restricted-key contracts and the hardened entitlement/receipt schema. PR #143 prepares this path for review and future controlled use; it does not deploy or replace production v6.

## Explicitly not authorized

- new Edge Function deployment;
- Stripe key permission changes;
- webhook endpoint changes;
- live charges, refunds, payouts, subscriptions or customers;
- onboarding release;
- legal/address changes;
- customer/prospect outreach;
- destructive rollback or legacy-table deletion.

## Current decision

**NO-GO for production/customer release.**

Stage B is complete. Signed TEST-mode v6 evidence remains the payment-runtime release gate.
