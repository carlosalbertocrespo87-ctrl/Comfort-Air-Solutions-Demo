# PAYMENT-RUNTIME-BRIDGE-01 — Authoritative Stripe Runtime Bridge

Status: STAGE B COMPLETE / V6 TEST EVIDENCE PENDING
Date: 21 Aug 2026
Cost target: $0
Issue: #136
Draft PR: #137

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

Both new hardened tables contain 0 rows. No backfill, table drop, rename, truncate, or legacy-data mutation occurred.

## Superseding active Edge Function evidence

A fresh read after Stage B shows the active production webhook is `llf-stripe-events` **version 6**.

Version 6 already performs authoritative checks before state mutation:
- verifies Stripe signatures;
- uses `STRIPE_RESTRICTED_KEY` for live Stripe API reads;
- supports separate TEST secret/key names when configured;
- verifies live/test environment match;
- retrieves the current Checkout Session and/or Subscription from Stripe;
- derives `setupPaidConfirmed` / `monthlyActiveConfirmed` from provider state;
- calls `llf_apply_first_sale_stripe_event_v2(...)` with those confirmation booleans;
- does not automatically trigger onboarding.

The current `llf_apply_first_sale_stripe_event_v2(...)` function fails closed if setup payment or monthly subscription is not authoritatively confirmed and rejects stale events.

The older `llf_apply_first_sale_stripe_event(...)` function still exists in the database, but the active v6 Edge Function does **not** call it. Any earlier note treating the old function as the active webhook mutation path is superseded.

## Stage B — completed with explicit owner approval

Applied successfully:
1. `012_payment_entitlement_foundation`
2. `013_payment_entitlement_atomic_apply`
3. `014_payment_correlation_bootstrap`
4. `015_payment_runtime_service_role_least_privilege`

Verification:
- RLS enabled on all five payment/legal runtime tables;
- new hardened tables empty;
- `service_role` receipt INSERT allowed;
- only receipt `processing_status` / `processed_at` UPDATE allowed;
- only receipt `stripe_event_id` predicate SELECT allowed;
- required entitlement columns readable by service_role;
- no direct entitlement INSERT/UPDATE/DELETE;
- hardened atomic/bootstrap RPC EXECUTE allowed to service_role;
- anon/authenticated hardened access denied;
- no backfill.

Supabase Security Advisor reports expected INFO RLS/no-policy notices for the private server-only tables plus the separate Auth warning that leaked-password protection is disabled.

Canonical evidence:
`docs/launch-gates/PAYMENT-RUNTIME-STAGE-B-EVIDENCE.md`

## Source-control branch purpose

Draft PR #137 remains useful as an optional alternate/new-table runtime path:
- `llf-payment-events` uses `STRIPE_RESTRICTED_KEY`;
- migration 015 records least-privilege hardened-table grants;
- bridge/evidence docs are source controlled.

However, because production v6 already performs authoritative Stripe retrieval on the existing first-sale state model, a separate canary runtime is **not automatically required** before validating v6. PR #137 must not be merged as an implicit production cutover.

The stacked base moved during this work, so PR #137 is currently divergent/non-mergeable and requires branch reconciliation before any future merge decision. This is source-control housekeeping, not a production release blocker.

## Next payment-runtime validation

The immediate missing evidence is not another DDL migration. It is end-to-end signed TEST validation of the currently deployed v6 runtime.

Next steps, each fail-closed:
1. verify whether `STRIPE_WEBHOOK_SECRET_TEST` and `STRIPE_RESTRICTED_KEY_TEST` are configured, without exposing values;
2. obtain an authenticated Stripe TEST-mode event channel;
3. send one signed TEST event to existing `llf-stripe-events` v6;
4. verify HTTP result and exactly one ledger receipt;
5. verify authoritative Stripe retrieval occurs before state mutation;
6. verify missing/unknown acceptance correlation fails closed;
7. verify duplicate/stale events cannot advance state incorrectly;
8. verify onboarding is not triggered automatically;
9. keep live charges/refunds/payouts/subscriptions and real customer activation untouched.

The old v5 HTTP 500 logs are historical evidence and do not validate or invalidate v6.

## Optional alternate canary path

If v6 TEST validation cannot be performed safely or if a design defect is found, the hardened new-table runtime in PR #137 can be reconciled and deployed later under a separate canary slug. That would require a separate explicit approval for Edge Function deployment / secret configuration.

## Explicitly not authorized by Stage B

- new Edge Function deployment;
- Stripe key permission changes;
- webhook endpoint changes;
- charges, refunds, payouts or subscription changes;
- onboarding release;
- legal/address changes;
- customer/prospect outreach;
- destructive rollback or legacy-table deletion.

## Current decision

**NO-GO for production/customer release.**

Stage B is complete and secure. The payment runtime is closer to release than previously believed because v6 already performs authoritative provider reconciliation; the remaining technical proof is signed TEST-mode end-to-end evidence.