# PAYMENT-RUNTIME-BRIDGE-01 — Stage B Evidence

Date: 21 Aug 2026
Status: STAGE B COMPLETE / SIGNED TEST EVIDENCE PENDING
Issues: #130, #136
Production project: Local-Lead-Forge

## Owner authorization
The owner approved additive production schema/functions from payment-runtime migrations 012–015 plus immediate verification. No new Edge Function deployment, Stripe key-scope change, webhook endpoint change, payment action, onboarding release, legal/address change, or outreach was authorized.

## Applied migrations
Applied successfully in order:
1. `012_payment_entitlement_foundation`
2. `013_payment_entitlement_atomic_apply`
3. `014_payment_correlation_bootstrap`
4. `015_payment_runtime_service_role_least_privilege`

No existing table was dropped, renamed, truncated, or backfilled.

## Production result
Added hardened objects:
- `public.llf_payment_entitlements`
- `public.llf_stripe_event_receipts`
- `public.llf_recompute_onboarding_eligibility(uuid)`
- `public.llf_apply_payment_entitlement_state(uuid,text,timestamptz,text,text,text,text,text)`
- `public.llf_bootstrap_payment_correlation(uuid,text,text,text)`

Existing `llf_legal_acceptances`, `llf_first_sale_payment_state`, and `llf_stripe_event_ledger` were preserved.

Immediately after Stage B:
- `llf_payment_entitlements`: 0 rows
- `llf_stripe_event_receipts`: 0 rows

## Least-privilege verification
Verified:
- RLS enabled on private payment/legal runtime tables;
- `service_role` can INSERT hardened receipts;
- `service_role` can UPDATE only receipt `processing_status` and `processed_at`;
- `service_role` can SELECT receipt `stripe_event_id` for predicate filtering, not table-wide receipt data;
- `service_role` can SELECT only required entitlement correlation/current-state columns;
- no direct INSERT/UPDATE/DELETE on hardened entitlements;
- `service_role` can EXECUTE hardened atomic-apply and bootstrap RPCs;
- `anon` and `authenticated` cannot read hardened entitlements or invoke atomic apply.

Negative checks passed for receipt table-wide SELECT, receipt DELETE, receipt unrelated-column UPDATE, entitlement table-wide SELECT, and direct entitlement INSERT/UPDATE/DELETE.

## Active runtime audit
A fresh read confirmed production `llf-stripe-events` v6 performs authoritative provider checks before mutation. It uses a restricted live Stripe key, supports separate TEST secret/key names when configured, verifies environment match, retrieves current Stripe Checkout/Subscription state, and passes confirmed paid/active booleans into `llf_apply_first_sale_stripe_event_v2(...)`.

The older function remains in the database but is not called by v6.

## Source-control evidence
PR #143 carries the least-privilege migration record plus executable regression coverage for the authoritative source runtime. It is preparation/review only and does not deploy production.

## Remaining validation gap
Historical HTTP 500 webhook evidence belongs to v5. V6 still requires one signed Stripe TEST-mode end-to-end validation proving HTTP/ledger behavior, provider-state reconciliation, fail-closed unknown correlation, dedupe/stale protection, and no automatic onboarding.

## Release posture
**Production/customer release remains NO-GO.**

No live Stripe object or payment action is authorized merely to obtain test evidence.
