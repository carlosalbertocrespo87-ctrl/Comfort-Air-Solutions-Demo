# STRIPE-WEBHOOK-02 — Authoritative Runtime Cutover Plan

Status: REVIEW / PREP ONLY — NO DEPLOYMENT AUTHORIZED
Date: 21 Aug 2026
Issue: #130

## Purpose

Define the smallest safe path from the currently deployed legacy `llf-stripe-events` v5 runtime to the authoritative Stripe-state runtime already source-controlled on protected `main`, without creating real Stripe objects, changing live payment state, or applying database/credential changes from this document.

## Evidence-backed production state

Read-only production inspection on 21 Aug 2026 confirms all five relevant tables currently exist and have RLS enabled:

- `llf_legal_acceptances` — 0 rows observed
- `llf_payment_entitlements` — 0 rows observed
- `llf_stripe_event_receipts` — 0 rows observed
- `llf_first_sale_payment_state` — 0 rows observed
- `llf_stripe_event_ledger` — 0 rows observed

The newer receipt/entitlement schema is already present in production; core authoritative table creation is not the remaining blocker.

Production also contains:

- legacy `llf_apply_first_sale_stripe_event(...)` — SECURITY INVOKER;
- authoritative `llf_apply_payment_entitlement_state(...)` — SECURITY DEFINER;
- correlation bootstrap `llf_bootstrap_payment_correlation(...)` — SECURITY DEFINER.

Read-only function checks confirm `service_role` has EXECUTE on the authoritative apply and correlation-bootstrap functions.

## Current mismatch

### Deployed runtime

`llf-stripe-events` v5 currently:

1. verifies Stripe webhook signatures and live/test consistency;
2. writes `llf_stripe_event_ledger`;
3. reads `llf_acceptance_ref` from event metadata;
4. calls legacy `llf_apply_first_sale_stripe_event(...)`;
5. updates the legacy event ledger.

The legacy RPC can mark setup/monthly state from event type plus object references without independently retrieving current Stripe object status. It is therefore not the final release architecture.

### Hardened source runtime

`artifacts/local-lead-forge/supabase/functions/llf-payment-events`:

1. verifies signatures;
2. normalizes supported events;
3. records an idempotent receipt in `llf_stripe_event_receipts`;
4. retrieves current Stripe PaymentIntent / Charge / Subscription / Invoice state;
5. requires exactly one existing durable correlation in `llf_payment_entitlements`;
6. applies state atomically through `llf_apply_payment_entitlement_state(...)`;
7. ignores stale events and blocks ambiguous/missing correlation;
8. never triggers onboarding directly.

## Authoritative least-privilege compatibility — PROBE PASS

A more precise column-level privilege inspection supersedes the earlier table-level-only reading.

Observed `service_role` access matches the hardened webhook runtime shape:

- `llf_stripe_event_receipts`
  - INSERT on receipt columns used by the runtime;
  - UPDATE on `processing_status` and `processed_at`;
  - column-scoped SELECT on `stripe_event_id` for the UPDATE predicate;
  - no DELETE requirement.
- `llf_payment_entitlements`
  - column-scoped SELECT on exactly the runtime-read fields: `acceptance_ref`, `stripe_customer_ref`, `setup_payment_ref`, `subscription_ref`, `setup_status`, `monthly_status`;
  - no direct runtime UPDATE requirement because authoritative mutation is through the SECURITY DEFINER RPC.
- `llf_apply_payment_entitlement_state(...)`
  - EXECUTE for `service_role` observed.

A rollback-only production permission probe was then executed as `service_role` using a synthetic event ID:

1. insert synthetic receipt;
2. update receipt status using `WHERE stripe_event_id=...`;
3. perform the entitlement read shape used by the runtime;
4. rollback transaction;
5. verify persisted probe rows = 0.

Result: **PASS**. No database privilege/schema change was applied.

This closes the authoritative webhook database-permission compatibility sub-gate on current evidence. Permissions must still be re-verified if schema/runtime code changes before deployment.

## Checkout / correlation bootstrap dependency

The authoritative webhook intentionally refuses to mutate an entitlement unless exactly one durable Stripe correlation already exists.

The source legal-acceptance endpoint initializes `llf_payment_entitlements` with a PENDING row. The merged checkout-orchestration core requires the Stripe Customer reference to be durably persisted before a hosted Checkout Session may be created.

Therefore the production provider adapter must preserve this sequence:

1. durable legal acceptance exists;
2. PENDING entitlement row exists;
3. create or reuse Stripe Customer server-side only after release gates permit;
4. persist `acceptance_ref <-> cus_...` through the correlation-bootstrap path;
5. only then create hosted Checkout;
6. webhook retrieves authoritative Stripe state and can correlate by customer/payment/subscription reference;
7. entitlement remains fail-closed until setup=`PAID` and monthly=`ACTIVE`.

No provider adapter is deployed by the current checkout-orchestration source foundation.

## Stripe credential + environment compatibility

Draft PR #143 (`Issue #130: harden authoritative Stripe webhook runtime compatibility`) now prepares this source-only compatibility layer:

- replaces generic `STRIPE_SECRET_KEY` usage in the authoritative webhook with the least-privilege restricted-key contract;
- separates live and TEST-mode restricted credentials so test events cannot retrieve objects through a live-mode key;
- verifies webhook signature mode before JSON parsing;
- requires event `livemode` to match the verified webhook environment;
- adds executable tests and runtime typecheck/security guards.

PR #143 is source-only/draft. It does not create/rotate credentials, deploy the Edge Function, send Stripe events or alter production state.

Before future deployment, the relevant restricted key must be verified to have only the required read permissions for PaymentIntent, Charge, Subscription and Invoice retrieval. Credential scope expansion or creation remains separately gated.

## Zero-row cutover advantage

At this checkpoint, both legacy and authoritative payment-state/receipt tables report zero rows. If that remains true immediately before a future approved cutover, no production customer/payment backfill is required.

This condition must be re-verified immediately before deployment. If any relevant table contains real rows at that time, cutover must stop and a record-by-record migration/reconciliation plan is required.

## Remaining safe sequence

1. complete CI/review evidence on draft PR #143;
2. verify restricted live/test key scopes without exposing secret values;
3. re-verify authoritative table/function permissions and zero-row state immediately before any cutover decision;
4. obtain explicit owner approval before Edge Function deployment or any credential/configuration mutation;
5. deploy only the reviewed target runtime;
6. send one signed Stripe TEST-mode event with a TEST-mode restricted retrieval credential;
7. require HTTP 200 plus receipt evidence, authoritative Stripe retrieval, unique correlation and correct state mutation/ignore behavior;
8. retain legacy tables/functions during the first cutover for rollback; do not drop them;
9. keep checkout release, real charges/refunds/payouts, onboarding, outreach and production traffic OFF until all separate launch gates clear.

## Rollback boundary

A future deployment plan must preserve the ability to revert the Edge Function version without deleting either ledger. Do not drop legacy tables/functions during the first authoritative-runtime cutover. Retain them read-only/historical until test evidence and a later decommission review prove they are no longer required.

## Decision

**Authoritative schema + current database permission shape are validated; production cutover remains HOLD.**

The remaining technical work is primarily PR #143 code/CI evidence, restricted-key scope verification, explicit deployment approval, and a signed TEST-mode end-to-end webhook run. No live payment/customer release is implied.