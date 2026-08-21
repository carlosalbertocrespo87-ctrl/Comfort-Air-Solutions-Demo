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

This narrows the problem. The newer receipt/entitlement schema is already present in production; the remaining gap is primarily runtime activation, least-privilege compatibility, checkout/provider wiring, and test evidence — not creation of the core authoritative tables.

Production also contains both transition functions:

- legacy `llf_apply_first_sale_stripe_event(...)` — SECURITY INVOKER
- authoritative `llf_apply_payment_entitlement_state(...)` — SECURITY DEFINER

`service_role` has EXECUTE on the authoritative apply function.

## Current mismatch

### Deployed runtime

`llf-stripe-events` v5 currently:

1. verifies Stripe webhook signatures and live/test consistency;
2. writes `llf_stripe_event_ledger`;
3. reads `llf_acceptance_ref` from event metadata;
4. calls legacy `llf_apply_first_sale_stripe_event(...)`;
5. updates the legacy event ledger.

The legacy RPC can mark setup/monthly state from event type plus object references without independently retrieving current Stripe object status. It is therefore not the final release architecture.

### Hardened source runtime on `main`

`artifacts/local-lead-forge/supabase/functions/llf-payment-events`:

1. verifies signatures;
2. normalizes supported events;
3. records an idempotent receipt in `llf_stripe_event_receipts`;
4. retrieves current Stripe PaymentIntent / Charge / Subscription / Invoice state;
5. requires exactly one existing durable correlation in `llf_payment_entitlements`;
6. applies state atomically through `llf_apply_payment_entitlement_state(...)`;
7. ignores stale events and blocks ambiguous/missing correlation;
8. never triggers onboarding directly.

## Least-privilege compatibility gap

Read-only privilege inspection currently shows only `INSERT` on `llf_stripe_event_receipts` for `service_role`. The hardened runtime also performs receipt status UPDATEs and direct entitlement reads.

Before any cutover, a reviewed permission plan must prove the minimum runtime surface. Expected minimum shape, subject to rollback-only validation before application:

- `llf_stripe_event_receipts`
  - INSERT
  - UPDATE
  - column-scoped SELECT on `stripe_event_id` only if required by the PostgREST UPDATE predicate
  - no DELETE/TRUNCATE requirement
- `llf_payment_entitlements`
  - read-only access limited to columns required for correlation/current-state reads: `acceptance_ref`, `stripe_customer_ref`, `setup_payment_ref`, `subscription_ref`, `setup_status`, `monthly_status`
  - no direct runtime UPDATE required because authoritative mutation is through the SECURITY DEFINER RPC
- `llf_apply_payment_entitlement_state(...)`
  - EXECUTE for `service_role` only; already observed

No permission change is authorized by this plan.

## Checkout / correlation bootstrap dependency

The authoritative webhook intentionally refuses to mutate an entitlement unless exactly one durable Stripe correlation already exists.

The source legal-acceptance endpoint initializes `llf_payment_entitlements` with a PENDING row. The merged checkout-orchestration core requires the Stripe Customer reference to be durably persisted before a hosted Checkout Session may be created.

Therefore the production provider adapter must preserve this sequence:

1. durable legal acceptance exists;
2. PENDING entitlement row exists;
3. create or reuse Stripe Customer server-side only after release gates permit;
4. persist `acceptance_ref <-> cus_...` into `llf_payment_entitlements`;
5. only then create hosted Checkout;
6. webhook retrieves authoritative Stripe state and can correlate by customer/payment/subscription reference;
7. entitlement remains fail-closed until setup=`PAID` and monthly=`ACTIVE`.

No provider adapter is deployed by the current checkout-orchestration source foundation.

## Stripe credential compatibility

The hardened source runtime currently reads `STRIPE_SECRET_KEY`, while the deployed v5 runtime reads `STRIPE_RESTRICTED_KEY`.

Do not introduce a broader Stripe credential merely to match an environment-variable name. The preferred review path is to verify that the existing restricted key has the exact GET permissions required for PaymentIntent, Charge, Subscription and Invoice retrieval, then adapt the source runtime/configuration to consume that restricted credential under an explicit runtime contract.

Credential rotation, permission expansion or creation of a broader secret is outside this plan and requires separate explicit approval.

## Zero-row cutover advantage

At this checkpoint, both legacy and authoritative payment-state/receipt tables report zero rows. If that remains true immediately before a future approved cutover, no production customer/payment backfill is required.

This condition must be re-verified immediately before deployment. If any relevant table contains real rows at that time, cutover must stop and a record-by-record migration/reconciliation plan is required.

## Safe pre-deployment validation sequence

The next technical work can remain non-production:

1. create a dedicated source PR for runtime/config compatibility; do not mix it with this documentation PR;
2. add synthetic tests proving restricted-key retrieval failures fail closed;
3. add permission-contract tests documenting exact receipt/entitlement operations;
4. validate table/function compatibility with rollback-only probes;
5. verify no live customer/payment rows exist before any cutover decision;
6. obtain explicit owner approval before database privilege changes or Edge Function deployment;
7. deploy only the reviewed target runtime;
8. send one signed Stripe TEST-mode event;
9. require HTTP 200 + receipt evidence + authoritative retrieval + unique correlation + correct state mutation/ignore behavior;
10. keep checkout release, real charges/refunds/payouts, onboarding, outreach and production traffic OFF until all separate launch gates clear.

## Rollback boundary

A future deployment plan must preserve the ability to revert the Edge Function version without deleting either ledger. Do not drop legacy tables/functions during the first authoritative-runtime cutover. Retain them read-only/historical until test evidence and a later decommission review prove they are no longer required.

## Decision

**Architecture path identified; production cutover remains HOLD.**

The core authoritative database schema already exists in production, reducing migration scope. Remaining work is a dedicated runtime/provider compatibility PR, least-privilege validation, explicit approval for any production mutation/deployment, and a signed TEST-mode end-to-end webhook run.