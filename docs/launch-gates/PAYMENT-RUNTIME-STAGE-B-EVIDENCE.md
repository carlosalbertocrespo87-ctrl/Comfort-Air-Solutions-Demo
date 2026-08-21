# PAYMENT-RUNTIME-BRIDGE-01 — Stage B Evidence

Date: 21 Aug 2026
Status: STAGE B COMPLETE / STAGE C GATED
Issue: #136
Draft PR: #137
Production project: Local-Lead-Forge

## Owner authorization
The owner explicitly approved Stage B only: additive production schema/functions from payment-runtime migrations 012–015 plus immediate verification. No Edge Function deployment, Stripe key-scope change, webhook endpoint change, payment action, onboarding release, legal/address change, or outreach was authorized.

## Applied migrations
All four additive migrations were applied successfully to production in order:
1. `012_payment_entitlement_foundation`
2. `013_payment_entitlement_atomic_apply`
3. `014_payment_correlation_bootstrap`
4. `015_payment_runtime_service_role_least_privilege`

No existing table was dropped, renamed, truncated, or backfilled.

## Production schema result
The hardened objects now exist alongside the legacy runtime:
- `public.llf_payment_entitlements`
- `public.llf_stripe_event_receipts`
- `public.llf_recompute_onboarding_eligibility(uuid)`
- `public.llf_apply_payment_entitlement_state(uuid,text,timestamptz,text,text,text,text,text)`
- `public.llf_bootstrap_payment_correlation(uuid,text,text,text)`

The existing production `llf_legal_acceptances`, `llf_first_sale_payment_state`, and `llf_stripe_event_ledger` were preserved.

Immediately after Stage B:
- `llf_payment_entitlements`: 0 rows
- `llf_stripe_event_receipts`: 0 rows

No backfill was performed.

## RLS / privilege verification
RLS is enabled on all five payment/legal runtime tables:
- `llf_legal_acceptances`
- `llf_first_sale_payment_state`
- `llf_stripe_event_ledger`
- `llf_payment_entitlements`
- `llf_stripe_event_receipts`

Verified hardened runtime privileges:
- `service_role` can INSERT receipts;
- `service_role` can UPDATE only `processing_status` and `processed_at` on receipts;
- `service_role` can SELECT only the receipt predicate column `stripe_event_id`, not table-wide receipt data;
- `service_role` can SELECT only the entitlement correlation/current-state columns required by the Edge Function;
- `service_role` has no direct INSERT, UPDATE, or DELETE privilege on `llf_payment_entitlements`;
- `service_role` has EXECUTE on the hardened atomic-apply and bootstrap RPCs;
- `anon` and `authenticated` do not have entitlement SELECT or atomic-apply EXECUTE.

Negative checks passed:
- receipt table-wide SELECT: denied;
- receipt DELETE: denied;
- receipt `event_type` UPDATE: denied;
- entitlement table-wide SELECT: denied;
- entitlement INSERT/UPDATE/DELETE: denied;
- entitlement `onboarding_eligible` direct SELECT: denied (not required by runtime).

## Security Advisor
The post-DDL Supabase Security Advisor reports:
- INFO: RLS enabled with no policies on the five private runtime tables;
- WARN: leaked-password protection disabled in Supabase Auth.

The RLS/no-policy notices are expected for these server-only private tables because `anon`/`authenticated` access is intentionally revoked. The leaked-password warning is a separate Auth-account security setting and was not changed by Stage B.

## Important current-runtime observation
The legacy function `public.llf_apply_first_sale_stripe_event(...)` is still present in production and its current body still derives state from event type/object references rather than the hardened authoritative Stripe-object retrieval path.

Therefore:
- do not treat migration names/history as proof that the legacy path is disabled;
- current function definition is controlling evidence;
- do not repoint or release production webhooks to a new runtime until Stage C/D evidence is complete;
- do not enable onboarding from legacy event-derived state.

## Stage C remains gated
No Stage C action was performed.

Stage C requires a new explicit approval before any of the following:
1. verify or change restricted Stripe runtime-key permissions;
2. configure secrets for a new canary function;
3. deploy `llf-payment-events-canary`;
4. change any webhook endpoint;
5. send TEST-mode events to the canary.

## Release posture
**Production/customer release remains NO-GO.**

Stage B successfully established the additive hardened database foundation with least-privilege access and zero data migration. The legacy function/endpoint remains untouched, preserving rollback and preventing an implicit cutover.