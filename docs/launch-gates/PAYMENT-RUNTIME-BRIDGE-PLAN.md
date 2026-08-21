# PAYMENT-RUNTIME-BRIDGE-01 — Authoritative Stripe Runtime Bridge

Status: INTERNAL PREP COMPLETE / PRODUCTION CHANGES GATED
Date: 21 Aug 2026
Cost target: $0
Issue: #136

## Why this bridge exists

The live Supabase project and protected source control currently represent two payment-runtime generations.

### Live production evidence

Present in `public`:
- `llf_legal_acceptances`
- `llf_first_sale_payment_state` (legacy payment state)
- `llf_stripe_event_ledger` (legacy event ledger)

Not currently present:
- `llf_payment_entitlements`
- `llf_stripe_event_receipts`

The deployed `llf-stripe-events` function uses the legacy state/ledger plus `llf_apply_first_sale_stripe_event(...)`. Its database permission blocker has been repaired and the service-role runtime-shape permission probe passes. That proves database authorization for the legacy path; it does **not** make the legacy state transition authoritative enough for final release.

### Protected source-control evidence

Merged PR #95 already contains the hardened design:
- migration 012: durable acceptance/payment-entitlement/event-receipt foundation;
- migration 013: atomic authoritative entitlement application;
- migration 014: immutable payment-correlation bootstrap;
- `llf-payment-events`: verifies Stripe signature, records a receipt hash, retrieves current Stripe object state, requires one existing durable correlation, then atomically applies entitlement state;
- no checkout creation and no onboarding trigger.

## Security correction prepared in this branch

The hardened runtime previously expected `STRIPE_SECRET_KEY`. This bridge branch changes it to require `STRIPE_RESTRICTED_KEY` only.

Policy: the payment-events runtime must **not** require a general-purpose live secret key merely to read current Stripe payment state.

Required Stripe restricted-key capabilities before any canary deployment:
- READ Payment Intents;
- READ Charges;
- READ Subscriptions;
- READ Invoices.

No Stripe write permission is required by the authoritative webhook runtime itself.

Exact restricted-key permissions must be verified in Stripe before deployment. Do not assume the currently created key already has all four reads.

## Production compatibility observations

The existing production `llf_legal_acceptances` table is already populated with the durable acceptance reference contract but its columns are not byte-for-byte identical to migration 012. Therefore migration 012 must be treated as **additive schema bootstrap**, not as permission to replace/drop the live acceptance table.

The missing hardened tables can be introduced additively:
- `llf_payment_entitlements` references existing `llf_legal_acceptances(acceptance_ref)`;
- `llf_stripe_event_receipts` is a separate audit/idempotency ledger;
- legacy `llf_first_sale_payment_state` and `llf_stripe_event_ledger` remain untouched during canary.

Migrations 013 and 014 then create the hardened server-side functions. No legacy table drop, rename, data delete or endpoint replacement is required for the canary stage.

## Staged bridge sequence

### Stage A — completed safely
1. Diagnose live/source-control mismatch.
2. Repair least-privilege legacy runtime database permissions with explicit owner approvals.
3. Verify rollback-only legacy runtime-shape probe.
4. Verify payment-state RPC unknown acceptance fails closed.
5. Verify Stripe account/banking payout destination readiness read-only.
6. Prepare restricted-key-only source change for hardened runtime.

### Stage B — requires explicit owner approval before production DDL
1. Snapshot schema metadata and row counts for the affected tables.
2. Apply only the missing additive hardened schema/function pieces from migrations 012–014.
3. Do not drop or mutate legacy state/ledger data.
4. Verify RLS/revokes and function privileges.
5. Verify new tables start empty unless an explicitly reviewed backfill is separately approved.

### Stage C — requires explicit owner approval before Stripe key-scope or Edge Function changes
1. Verify the runtime restricted key has only the four required Stripe READ capabilities plus no unnecessary write access.
2. Configure `STRIPE_RESTRICTED_KEY` for a **new canary function**, not the legacy function.
3. Deploy hardened runtime under a separate slug, suggested: `llf-payment-events-canary`.
4. Keep the existing `llf-stripe-events` endpoint unchanged.
5. Do not repoint a live Stripe webhook yet.

### Stage D — TEST mode evidence only
1. Obtain an authenticated Stripe test-mode channel.
2. Create a test-only durable legal acceptance + entitlement correlation context.
3. Deliver signed TEST events to the canary endpoint.
4. Confirm current Stripe object state is retrieved before mutation.
5. Confirm duplicate event IDs dedupe.
6. Confirm unknown/ambiguous correlation fails closed.
7. Confirm stale events cannot roll state backward.
8. Confirm onboarding is never triggered by the webhook.
9. Confirm event receipt/audit evidence.
10. Confirm no live Stripe object, customer, charge, payout or subscription is touched.

### Stage E — explicit go/no-go cutover decision
Cutover must be a new approval. Required evidence:
- TEST-mode canary passes;
- restricted-key scope verified;
- database/security advisors acceptable;
- rollback plan documented;
- iPostal/legal/entity release gates satisfied where applicable;
- final checkout/acceptance QA complete.

Only then may LLF consider repointing the real Stripe webhook or replacing the legacy function.

## Rollback design

During canary, rollback is simple because the legacy runtime stays intact:
- stop using the canary endpoint;
- leave hardened additive tables/functions dormant;
- do not drop evidence tables during incident response;
- keep checkout/onboarding release fail-closed.

A destructive rollback (dropping tables/functions) is neither required nor authorized.

## Explicitly not authorized by this document

- production DDL execution;
- Edge Function deployment;
- Stripe restricted-key permission changes;
- webhook endpoint changes;
- live/test Stripe object creation through a live-only tool context;
- charges, refunds, payouts or subscription changes;
- legal/address changes;
- customer/prospect outreach;
- onboarding release.

## Current decision

**NO-GO for production cutover.**

Internal bridge preparation is ready. The next irreversible/security-sensitive action is the additive production schema/function stage and requires explicit owner approval before execution.
