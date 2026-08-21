# Client #1 Live Gate Reconciliation — 21 Aug 2026

Status: **HOLD FOR REAL-WORLD + RUNTIME GATES**  
Cost target: $0  
Branch: `feature/client1-live-gate-reconciliation`

## Current evidence-backed gate status

| Gate | Status | Evidence / next action |
|---|---|---|
| iPostal1 business address | PENDING | Ticket #3038643 support escalation is not final approval. Do not use/update the commercial address customer-facing, legally or in payment records until final approved/allowed-use evidence exists. |
| Stripe webhook permission sub-gate | PASS | Owner-approved least-privilege grants are present, including column-scoped SELECT on ledger `stripe_event_id`. Table-wide ledger SELECT and DELETE remain absent. |
| Production webhook runtime contract | HOLD — RECONCILIATION REQUIRED | Deployed `llf-stripe-events` v5 uses the legacy ledger/payment-state/RPC contract. Protected `main` has a hardened authoritative reconciler on a different receipt/entitlement contract. Do not deploy it as a drop-in replacement. |
| Deployed payment-state RPC semantics | HOLD | Legacy RPC can mark setup/monthly state from event type + object refs without independently retrieving current Stripe object status. Final release requires authoritative current-state reconciliation. |
| Checkout orchestration source foundation | MERGED / RELEASE OFF | PR #134 is on protected `main`; it enforces durable acceptance, released legal version, approved offer, durable customer correlation and PENDING entitlements. It deploys no provider adapter and creates no live checkout/payment objects by itself. |
| Stripe signed TEST event | DEFERRED UNTIL RUNTIME PLAN | A signed test event is still required, but only after the target runtime/schema contract is reviewed and explicitly approved for testing. Do not validate the legacy optimistic path as if it were final architecture. |
| Banking / payout destination readiness | READ-ONLY VERIFIED | Existing Stripe/Found evidence supports current configuration. No bank/address change is authorized. First real payout receipt remains later post-transaction evidence. |
| PR #94 two-device QA | BLOCKED — MANUAL | Automated gates are green; authenticated physical PC ↔ iPhone QA remains pending. Real messaging/push/conversations remain blocked. |
| Production provider activation | HOLD | Separate runtime, legal/entity, QA and explicit-release gates remain required. |
| Prospect/customer outreach | HOLD | No live email/SMS/calls/postal outreach authorized. |

## Permission evidence — historical action, do not re-run blindly

Previously applied with explicit owner approval and verified read-only afterward:

```sql
grant insert, update on table public.llf_stripe_event_ledger to service_role;
grant select, update on table public.llf_first_sale_payment_state to service_role;
grant select (stripe_event_id) on table public.llf_stripe_event_ledger to service_role;
```

Current read-only evidence confirms the column-scoped SELECT exists. The earlier table-level privilege query did not expose column grants. These statements are **historical evidence, not an instruction to re-apply grants**.

## Superseding runtime reconciliation finding

Production and protected source control are not on the same payment-event contract:

### Production today
- Edge Function: `llf-stripe-events` v5 ACTIVE.
- Writes: `llf_stripe_event_ledger`.
- State table: `llf_first_sale_payment_state`.
- Transition function: `llf_apply_first_sale_stripe_event(...)`.
- Signature and live/test environment checks exist.
- Legacy transition semantics do not independently retrieve current Stripe PaymentIntent/Charge/Subscription/Invoice state before marking payment state.

### Protected `main`
- Hardened source runtime: `artifacts/local-lead-forge/supabase/functions/llf-payment-events`.
- `authoritative-reconciler.ts` retrieves current Stripe PaymentIntent/Charge/Subscription/Invoice state before entitlement mutation.
- Source runtime uses the newer `llf_stripe_event_receipts` / `llf_payment_entitlements` contract.
- Those newer tables are not currently exposed by the production table inventory reviewed on 21 Aug.

Therefore the source runtime **must not** be deployed as a drop-in replacement against the current production schema.

## Required safe sequence

1. Design an explicit migration/bridge between the legacy production webhook contract and the hardened source-controlled authoritative contract.
2. Review tenant scope, RLS, service-role privilege surface, idempotency, correlation, stale/out-of-order handling, rollback and audit evidence.
3. Validate the proposed migration with synthetic/rollback-only probes first.
4. Obtain explicit owner approval before applying any schema/privilege change or replacing the production Edge Function.
5. After the approved target runtime exists, send one signed Stripe **TEST-mode** event through an authenticated test channel.
6. Require HTTP 200 plus receipt/ledger evidence and correct fail-closed correlation/state behavior.
7. Keep real charges, refunds, payouts, subscription creation, onboarding, outreach and customer traffic disabled until separate release gates clear.

## Release decision

**NO-GO for production / real customer traffic.**

The permission sub-gate is verified, but Issue #130 remains open because authoritative webhook runtime/source-control reconciliation and later test-mode evidence are incomplete. iPostal1, PR #94 physical QA and the remaining legal/entity/release gates also remain fail-closed.

No database/schema/privilege change, Edge Function replacement, Stripe event, payment, payout, refund, subscription, customer activation, outreach or production release is authorized by this document.
