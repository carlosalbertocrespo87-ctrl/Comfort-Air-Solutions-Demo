# PAYMENT-RUNTIME-BRIDGE-01 — Stage B Evidence

Date: 21 Aug 2026
Status: STAGE B COMPLETE / TEST EVIDENCE STILL PENDING
Issue: #136
Draft PR: #137
Production project: Local-Lead-Forge

## Owner authorization
The owner explicitly approved Stage B only: additive production schema/functions from payment-runtime migrations 012–015 plus immediate verification. No new Edge Function deployment, Stripe key-scope change, webhook endpoint change, payment action, onboarding release, legal/address change, or outreach was authorized by Stage B.

## Applied migrations
Applied successfully to production, in order:
1. `012_payment_entitlement_foundation`
2. `013_payment_entitlement_atomic_apply`
3. `014_payment_correlation_bootstrap`
4. `015_payment_runtime_service_role_least_privilege`

No existing table was dropped, renamed, truncated, or backfilled.

## Production schema result
The additive hardened objects now exist:
- `public.llf_payment_entitlements`
- `public.llf_stripe_event_receipts`
- `public.llf_recompute_onboarding_eligibility(uuid)`
- `public.llf_apply_payment_entitlement_state(uuid,text,timestamptz,text,text,text,text,text)`
- `public.llf_bootstrap_payment_correlation(uuid,text,text,text)`

The existing `llf_legal_acceptances`, `llf_first_sale_payment_state`, and `llf_stripe_event_ledger` were preserved.

Immediately after Stage B:
- `llf_payment_entitlements`: 0 rows
- `llf_stripe_event_receipts`: 0 rows

No backfill was performed.

## RLS / privilege verification
RLS is enabled on all five payment/legal runtime tables. Verified least-privilege posture:
- `service_role` can INSERT hardened receipts;
- `service_role` can UPDATE only receipt `processing_status` and `processed_at`;
- `service_role` can SELECT only receipt `stripe_event_id`, not table-wide receipt data;
- `service_role` can SELECT only required entitlement correlation/current-state columns;
- `service_role` has no direct INSERT/UPDATE/DELETE on `llf_payment_entitlements`;
- `service_role` has EXECUTE on hardened atomic-apply and bootstrap RPCs;
- `anon` and `authenticated` do not have entitlement SELECT or atomic-apply EXECUTE.

Negative checks passed: receipt table-wide SELECT denied, receipt DELETE denied, receipt `event_type` UPDATE denied, entitlement table-wide SELECT denied, entitlement INSERT/UPDATE/DELETE denied.

## Security Advisor
Post-DDL Supabase Security Advisor reports:
- INFO: RLS enabled with no policies on the five private server-only runtime tables;
- WARN: leaked-password protection disabled in Supabase Auth.

The RLS/no-policy notices are expected for these intentionally private tables because anon/authenticated access is revoked. The leaked-password warning is a separate Auth setting and was not changed by Stage B.

## Superseding deployed-runtime audit
A fresh post-Stage-B read of the active Edge Function corrected an earlier assumption.

Current production function is `llf-stripe-events` **version 6**, not the older v5 runtime. Version 6 already:
- verifies Stripe webhook signatures;
- uses `STRIPE_RESTRICTED_KEY` for live authoritative Stripe reads;
- supports separate `STRIPE_WEBHOOK_SECRET_TEST` and `STRIPE_RESTRICTED_KEY_TEST` paths when configured;
- rejects live/test environment mismatch;
- retrieves current Checkout Session / Subscription state from Stripe before mutation;
- calls `llf_apply_first_sale_stripe_event_v2(...)` with explicit `setup_paid_confirmed` / `monthly_active_confirmed` booleans;
- keeps onboarding release as state only, not an automatic trigger.

The current `llf_apply_first_sale_stripe_event_v2(...)` database function also fails closed when paid/active state is not authoritatively confirmed and rejects stale events.

Therefore the older statement that the currently deployed webhook mutates solely from event type/object references is **superseded and incorrect for v6**. The older `llf_apply_first_sale_stripe_event(...)` function still exists in the database, but the active v6 Edge Function does not call it.

## Remaining real validation gap
The old HTTP 500 evidence belongs to Edge Function version 5. No post-deployment signed event evidence for version 6 has yet been observed.

The next payment-runtime validation is therefore narrower than originally planned:
1. determine whether the v6 TEST secret/key environment names are actually configured, without exposing secret values;
2. obtain an authenticated Stripe TEST-mode event channel;
3. deliver one signed TEST-mode event to the existing v6 endpoint;
4. verify HTTP result, ledger write, authoritative Stripe read, fail-closed correlation, dedupe/stale behavior, and no onboarding trigger;
5. do not repoint a live webhook or create live payment activity merely for testing.

A separate canary runtime is now optional architecture work, not assumed to be required before testing v6.

## Release posture
**Production/customer release remains NO-GO.**

Stage B successfully established the additive hardened database foundation with least-privilege access and zero data migration. The active v6 webhook is materially stronger than the older v5 evidence, but still needs signed TEST-mode end-to-end evidence before the payment runtime gate can be declared closed.