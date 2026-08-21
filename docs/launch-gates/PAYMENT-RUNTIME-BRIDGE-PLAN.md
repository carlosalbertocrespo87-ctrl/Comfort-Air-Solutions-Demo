# PAYMENT-RUNTIME-BRIDGE-01 — Authoritative Stripe Runtime Bridge

Status: INTERNAL PREP / PRODUCTION CHANGES GATED
Date: 21 Aug 2026
Issue: #136

## Current truth

- Legacy production tables remain `llf_legal_acceptances`, `llf_first_sale_payment_state`, and `llf_stripe_event_ledger`.
- `llf-stripe-events` v6 is ACTIVE and is safer than the earlier v5 evidence: it requires authoritative Checkout `payment_status=paid` for setup and Subscription `status=active` for monthly advancement.
- Protected source control contains the more complete hardened payment-events generation from PR #95, based on `llf_payment_entitlements` and `llf_stripe_event_receipts`, with receipt hashing, authoritative PaymentIntent/Charge/Subscription/Invoice retrieval, durable correlation, stale-event protection, and atomic entitlement mutation.
- The hardened tables are not yet deployed in production.
- Production checkout and customer traffic remain HOLD.

## Source-only changes prepared here

1. Hardened `llf-payment-events` requires `STRIPE_RESTRICTED_KEY`, not a general-purpose secret key.
2. Migration 015 grants only the service-role access required by the hardened runtime: receipt INSERT/status UPDATE, predicate-only receipt SELECT, read-only entitlement correlation/state columns, and EXECUTE on the two server-only RPCs.
3. No DELETE/TRUNCATE, direct entitlement UPDATE, table-wide receipt SELECT, checkout creation, charge authority, onboarding trigger, or anon/authenticated access is granted.

## Safe staged release

### Stage A — source preparation
- Merge source-only bridge changes after CI/review.
- No production DDL or Edge Function deployment.

### Stage B — explicit approval required
- Re-snapshot live schema and row counts.
- Add only missing hardened tables/functions from migrations 012–014 without dropping legacy tables.
- Apply migration 015 least-privilege grants.
- Verify RLS/revokes/function EXECUTE and rerun security advisor.

### Stage C — explicit approval required
- Verify a Stripe restricted key has only required READ capabilities for Payment Intents, Charges, Subscriptions and Invoices.
- Deploy hardened runtime under a separate canary slug.
- Keep `llf-stripe-events` v6 unchanged and do not repoint live webhook traffic.

### Stage D — TEST mode only
- Obtain an authenticated Stripe test-mode channel.
- Deliver signed TEST events to canary.
- Require receipt evidence, authoritative object retrieval, duplicate protection, unknown/ambiguous correlation fail-closed, stale-event protection and zero onboarding trigger.

### Stage E — separate go/no-go
Only after TEST canary evidence, restricted-key scope verification, acceptable database/security review, rollback evidence, and legal/entity/release gates may LLF consider production cutover.

## Current decision

NO-GO for production cutover. This document authorizes source preparation only.
