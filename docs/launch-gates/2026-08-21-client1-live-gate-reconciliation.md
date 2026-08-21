# Client #1 Live Gate Reconciliation — 21 Aug 2026

Status: **HOLD FOR REAL-WORLD + RELEASE EVIDENCE GATES**  
Cost target: $0  
Branch: `feature/client1-live-gate-reconciliation`

## Current evidence-backed gate status

| Gate | Status | Evidence / next action |
|---|---|---|
| iPostal1 business address | PENDING | Ticket #3038643 support escalation is not final approval. Do not use/update the commercial address customer-facing, legally or in payment records until final approved/allowed-use evidence exists. |
| Stripe legacy webhook permissions | PASS — HISTORICAL PATH | Owner-approved narrow grants are present for the legacy v6 ledger/payment-state path. Table-wide legacy ledger SELECT and DELETE remain absent. |
| Authoritative payment schema | PRESENT / ZERO-ROW CHECKPOINT | `llf_payment_entitlements` and `llf_stripe_event_receipts` exist with RLS enabled and reported zero rows at the Stage B checkpoint. |
| Authoritative runtime permissions | PASS | Stage B migrations 012–015 were applied under explicit owner approval and verified least-privilege. Isolated CI now regression-tests migration 015 and the required/denied permission shape. |
| Production webhook runtime | ACTIVE v6 / TEST EVIDENCE PENDING | `llf-stripe-events` v6 is ACTIVE. It retrieves current Checkout/Subscription state before advancement, uses restricted Stripe provider access, supports separate TEST credentials, checks live/test mismatch and never automatically triggers onboarding. |
| Alternate hardened source runtime | DRAFT #143 / GREEN / NO DEPLOYMENT | PR #143 consolidates the hardened receipt/entitlement runtime, separate live/TEST restricted-key contracts, environment isolation, migration-015 source record and executable CI. Current head `366a77731a472ecc7fa7acb86841400696976a23` has all four observed workflows PASS. It does not deploy or replace v6. |
| Stripe signed TEST event | OPEN — FINAL PAYMENT-RUNTIME PROOF | One authenticated signed Stripe TEST-mode event against active v6 is still required. Connected Stripe tooling in this session exposes live mode only, so do not simulate the TEST proof with live objects. |
| Checkout orchestration source foundation | MERGED / RELEASE OFF | PR #134 is on protected `main`; it enforces durable acceptance, approved offer, durable customer correlation and PENDING entitlements. It deploys no live provider adapter and creates no live checkout/payment objects by itself. |
| Banking / payout destination readiness | READ-ONLY VERIFIED | Existing Stripe/Found evidence supports current configuration. No bank/address change is authorized. First real payout receipt remains later post-transaction evidence. |
| PR #94 two-device QA | BLOCKED — MANUAL | Automated gates are green; authenticated physical PC ↔ iPhone QA remains pending. Real messaging/push/conversations remain blocked. |
| Production/customer release | HOLD | Payment TEST evidence, iPostal/legal/entity gates, physical QA and explicit release decision remain required. |
| Prospect/customer outreach | HOLD | No live email/SMS/calls/postal outreach authorized. |

## Legacy permission evidence — historical only

Previously applied with explicit owner approval and verified afterward:

```sql
grant insert, update on table public.llf_stripe_event_ledger to service_role;
grant select, update on table public.llf_first_sale_payment_state to service_role;
grant select (stripe_event_id) on table public.llf_stripe_event_ledger to service_role;
```

These statements are historical evidence for the active legacy-table v6 path, not instructions to re-apply grants. See `STRIPE-WEBHOOK-01-proposed.sql`.

## Stage B authoritative foundation — complete

Production now contains the hardened payment foundation from migrations 012–015:

- `llf_payment_entitlements`;
- `llf_stripe_event_receipts`;
- `llf_apply_payment_entitlement_state(...)`;
- `llf_bootstrap_payment_correlation(...)`;
- least-privilege `service_role` grants recorded by migration 015.

RLS and the intended least-privilege shape were verified. A rollback-only production probe persisted zero synthetic rows. PR #143 now adds an isolated PostgreSQL regression that applies migrations 012–015 and asserts both required and explicitly denied privileges.

## Production payment webhook truth — v6

Fresh production source inspection confirms active `llf-stripe-events` v6:

1. verifies the Stripe signature;
2. distinguishes live vs TEST webhook secret mode;
3. rejects event/environment mismatch;
4. uses `STRIPE_RESTRICTED_KEY` for live provider reads and requires a separate `STRIPE_RESTRICTED_KEY_TEST` when processing TEST events;
5. for Checkout events retrieves current Checkout Session state and confirms `payment_status = paid` before setup advancement;
6. for subscription events retrieves current Subscription state and confirms `status = active` before monthly advancement;
7. calls `llf_apply_first_sale_stripe_event_v2(...)` with explicit provider-confirmed booleans;
8. records/updates the legacy event ledger;
9. does not automatically trigger onboarding.

The older optimistic function remains in the database but is not the active v6 call path.

## Draft PR #143 — source-control hardening, not production cutover

PR #143 is intentionally DRAFT and current-head CI is fully green:

- Payment Entitlement Security Gate — PASS;
- LLF Main Protection Gate — PASS;
- LLF Onboarding CI — PASS;
- LLF Pixel Match QA — PASS.

The payment gate includes payment-event tests, authoritative runtime typecheck, checkout-orchestration tests, credential/environment isolation guards, accidental checkout/onboarding guards, migrations 012–015, atomic/correlation SQL regressions and the migration-015 least-privilege regression.

PR #143 is an alternate hardened source path using the receipt/entitlement schema. Its future deployment is a separate architecture/release decision; it is **not required merely to complete the final v6 TEST-mode evidence gate**.

Draft PR #142 was closed without merge after its useful migration/evidence material was consolidated into #143.

## Remaining payment-runtime validation

The immediate payment-runtime release proof is one authenticated Stripe **TEST-mode** request against active v6. Require evidence of:

1. valid signed TEST request through an authenticated TEST channel;
2. correct TEST-mode classification;
3. TEST restricted credential used for authoritative provider retrieval;
4. expected HTTP result;
5. durable ledger evidence;
6. missing/unknown acceptance/correlation fails closed;
7. duplicate/stale events cannot incorrectly advance state;
8. no live customer/payment/onboarding side effects.

The connected Stripe account in this ChatGPT session exposes only live mode. Therefore this proof remains externally blocked until a legitimate TEST-mode channel is available; do not use live objects as a substitute.

## Required safe sequence

1. Keep PR #143 draft unless a separate source-merge decision is explicitly made.
2. Obtain legitimate Stripe TEST-mode event capability without exposing secrets or using live payment objects.
3. Re-verify active v6 and relevant zero-row/runtime state immediately before the TEST validation if material time/code changes occur.
4. Send exactly one signed TEST-mode event through the authenticated TEST path.
5. Record HTTP + ledger + provider-reconciliation + fail-closed evidence.
6. Keep checkout release, live charges/refunds/payouts/subscription creation, onboarding, outreach and customer traffic disabled until all separate release gates clear.
7. Treat any future deployment of the alternate hardened `llf-payment-events` runtime as a separate reviewed change with its own explicit approval and rollback plan.

## Release decision

**NO-GO for production / real customer traffic.**

The payment architecture and current source hardening are materially advanced and current PR #143 CI is green, but the signed Stripe TEST-mode v6 evidence is still missing. iPostal1, PR #94 physical QA and remaining legal/entity/release gates also remain fail-closed.

No database/schema/privilege change, Edge Function replacement, Stripe event, payment, payout, refund, subscription, customer activation, outreach or production release is authorized by this document.
