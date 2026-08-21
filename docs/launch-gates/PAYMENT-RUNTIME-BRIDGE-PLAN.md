# PAYMENT-RUNTIME-BRIDGE-01 — Authoritative Stripe Runtime Bridge

Status: STAGE B COMPLETE / STAGE C GATED
Date: 21 Aug 2026
Cost target: $0
Issue: #136
Draft PR: #137

## Why this bridge exists

The live Supabase project and protected source control represented two payment-runtime generations. Stage B has now added the hardened database foundation without cutting over the deployed legacy webhook.

### Current live production evidence

Preserved legacy objects:
- `llf_legal_acceptances`
- `llf_first_sale_payment_state`
- `llf_stripe_event_ledger`

Hardened objects added during approved Stage B:
- `llf_payment_entitlements`
- `llf_stripe_event_receipts`
- `llf_recompute_onboarding_eligibility(uuid)`
- `llf_apply_payment_entitlement_state(uuid,text,timestamptz,text,text,text,text,text)`
- `llf_bootstrap_payment_correlation(uuid,text,text,text)`

No legacy table was dropped, renamed, truncated or backfilled. The two new hardened tables contain zero rows after migration.

The deployed legacy function path remains separate. Current database definition of `llf_apply_first_sale_stripe_event(...)` still derives state from event type/object references. It is therefore **not** evidence of authoritative Stripe-state reconciliation and must not be used as the final production release path.

### Protected source-control evidence

Merged PR #95 contains the hardened design:
- migration 012: durable acceptance/payment-entitlement/event-receipt foundation;
- migration 013: atomic authoritative entitlement application;
- migration 014: immutable payment-correlation bootstrap;
- `llf-payment-events`: verifies Stripe signature, records a receipt hash, retrieves current Stripe object state, requires one existing durable correlation, then atomically applies entitlement state;
- no checkout creation and no onboarding trigger.

This bridge branch adds:
- `STRIPE_RESTRICTED_KEY` as the required runtime key instead of a general-purpose secret key;
- migration 015 with explicit least-privilege service-role grants;
- staged canary/cutover controls;
- Stage B evidence.

## Stripe restricted-key policy

The hardened runtime must **not** require a general-purpose live secret key merely to read current Stripe payment state.

Required restricted-key capabilities before any canary deployment:
- READ Payment Intents;
- READ Charges;
- READ Subscriptions;
- READ Invoices.

No Stripe write permission is required by the authoritative webhook runtime itself. Exact restricted-key permissions must be verified before deployment.

## Stage B — completed with explicit owner approval

Applied successfully in production, in order:
1. `012_payment_entitlement_foundation`
2. `013_payment_entitlement_atomic_apply`
3. `014_payment_correlation_bootstrap`
4. `015_payment_runtime_service_role_least_privilege`

Verification after apply:
- RLS enabled on all five payment/legal runtime tables;
- new hardened tables remain empty;
- `service_role` has receipt INSERT plus only the required status/timestamp UPDATE and predicate-column SELECT;
- `service_role` has only the required entitlement read columns and no direct INSERT/UPDATE/DELETE;
- hardened atomic-apply and bootstrap RPC EXECUTE granted to `service_role`;
- `anon` and `authenticated` remain denied from entitlement SELECT and atomic-apply EXECUTE;
- receipt table-wide SELECT and DELETE remain denied;
- no backfill performed.

Supabase Security Advisor after Stage B reports INFO notices for RLS-enabled/no-policy private tables and the pre-existing Auth warning that leaked-password protection is disabled. No policy was added because these runtime tables are intentionally private/server-only and anonymous/authenticated access is denied.

Canonical evidence:
`docs/launch-gates/PAYMENT-RUNTIME-STAGE-B-EVIDENCE.md`

## Stage A — completed safely

1. Diagnosed live/source-control mismatch.
2. Repaired least-privilege legacy runtime database permissions with explicit owner approvals.
3. Verified rollback-only legacy runtime-shape probe.
4. Verified unknown acceptance fails closed.
5. Prepared restricted-key-only source change.
6. Audited hardened service-role access path and prepared migration 015.
7. Confirmed affected live tables were empty before Stage B.

## Stage C — requires a new explicit owner approval

Stage C has **not** been executed.

1. Verify the runtime restricted key has only the four required Stripe READ capabilities and no unnecessary write access.
2. Configure `STRIPE_RESTRICTED_KEY` for a **new canary function**, not the legacy function.
3. Deploy hardened runtime under a separate slug, suggested: `llf-payment-events-canary`.
4. Keep the existing `llf-stripe-events` endpoint unchanged.
5. Do not repoint a live Stripe webhook.

## Stage D — TEST-mode evidence only

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

## Stage E — explicit go/no-go cutover decision

Cutover must be a new approval. Required evidence:
- TEST-mode canary passes;
- restricted-key scope verified;
- database/security advisors acceptable;
- rollback plan documented;
- external legal/entity release gates satisfied where applicable;
- final checkout/acceptance QA complete.

Only then may LLF consider repointing the real Stripe webhook or replacing the legacy function.

## Rollback design

The legacy runtime remains intact during the canary path. Rollback therefore does not require destructive schema changes:
- stop using the canary endpoint;
- leave hardened additive tables/functions dormant;
- preserve evidence tables;
- keep checkout/onboarding release fail-closed.

## Explicitly not authorized by Stage B

- Edge Function deployment;
- Stripe restricted-key permission changes;
- webhook endpoint changes;
- live/test Stripe object creation through a live-only tool context;
- charges, refunds, payouts or subscription changes;
- legal/address changes;
- customer/prospect outreach;
- onboarding release;
- destructive rollback or legacy table deletion.

## Current decision

**NO-GO for production cutover.**

Stage B is complete. The next security-sensitive action is Stage C restricted-key verification + isolated canary deployment, which requires a separate explicit owner approval.