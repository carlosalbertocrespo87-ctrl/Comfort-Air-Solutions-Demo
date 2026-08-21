# Client #1 Live Gate Reconciliation — 21 Aug 2026

Status: **HOLD FOR REAL-WORLD + RUNTIME GATES**  
Cost target: $0  
Branch: `feature/client1-live-gate-reconciliation`

## Current evidence-backed gate status

| Gate | Status | Evidence / next action |
|---|---|---|
| iPostal1 business address | PENDING | Ticket #3038643 support escalation is not final approval. Do not use/update the commercial address customer-facing, legally or in payment records until final approved/allowed-use evidence exists. |
| Stripe webhook permission sub-gate | PASS — LEGACY PATH | Owner-approved least-privilege grants are present, including column-scoped SELECT on legacy ledger `stripe_event_id`. Table-wide legacy ledger SELECT and DELETE remain absent. |
| Authoritative payment schema | PRESENT / ZERO-ROW CHECKPOINT | Read-only production inspection confirms `llf_payment_entitlements` and `llf_stripe_event_receipts` already exist, RLS is enabled, and both report zero rows at this checkpoint. |
| Authoritative runtime permissions | PASS — ROLLBACK PROBE | Column-level inspection matches the hardened runtime read/update shape. A rollback-only `service_role` probe successfully inserted/updated a synthetic receipt and performed the entitlement read shape; persisted probe rows = 0. No permission change was applied. |
| Production webhook runtime contract | HOLD — CUTOVER REQUIRED | Deployed `llf-stripe-events` v5 still uses the legacy ledger/payment-state/RPC contract. The hardened authoritative runtime is source-controlled but not deployed. |
| Deployed payment-state RPC semantics | HOLD | Legacy RPC can mark setup/monthly state from event type + object refs without independently retrieving current Stripe object status. Final release requires the authoritative runtime. |
| Checkout orchestration source foundation | MERGED / RELEASE OFF | PR #134 is on protected `main`; it enforces durable acceptance, released legal version, approved offer, durable customer correlation and PENDING entitlements. It deploys no provider adapter and creates no live checkout/payment objects by itself. |
| Authoritative webhook compatibility PR | DRAFT #143 | Adds restricted-key-only runtime configuration, separate live/test restricted keys, signature-mode detection before JSON parse, `livemode` isolation and executable security/typecheck coverage. No deployment or credential mutation. |
| Stripe signed TEST event | DEFERRED UNTIL TARGET RUNTIME | A signed test event is still required after the approved authoritative runtime is deployed with a TEST-mode retrieval credential. Do not validate the legacy optimistic path as final architecture. |
| Banking / payout destination readiness | READ-ONLY VERIFIED | Existing Stripe/Found evidence supports current configuration. No bank/address change is authorized. First real payout receipt remains later post-transaction evidence. |
| PR #94 two-device QA | BLOCKED — MANUAL | Automated gates are green; authenticated physical PC ↔ iPhone QA remains pending. Real messaging/push/conversations remain blocked. |
| Production provider activation | HOLD | Separate runtime, legal/entity, QA and explicit-release gates remain required. |
| Prospect/customer outreach | HOLD | No live email/SMS/calls/postal outreach authorized. |

## Permission evidence — historical legacy action, do not re-run blindly

Previously applied with explicit owner approval and verified read-only afterward:

```sql
grant insert, update on table public.llf_stripe_event_ledger to service_role;
grant select, update on table public.llf_first_sale_payment_state to service_role;
grant select (stripe_event_id) on table public.llf_stripe_event_ledger to service_role;
```

These statements are historical evidence for the legacy runtime, not instructions to re-apply grants.

## Authoritative runtime permission evidence

More precise column-level production inspection confirms `service_role` already has the authoritative webhook shape required today:

- receipt INSERT columns;
- receipt UPDATE on `processing_status` and `processed_at`;
- receipt SELECT on `stripe_event_id` for the update predicate;
- entitlement SELECT on `acceptance_ref`, `stripe_customer_ref`, `setup_payment_ref`, `subscription_ref`, `setup_status`, `monthly_status`;
- EXECUTE on `llf_apply_payment_entitlement_state(...)`;
- EXECUTE on `llf_bootstrap_payment_correlation(...)`.

A synthetic rollback-only probe executed as `service_role` completed the receipt insert + predicate update + entitlement read shape and rolled back successfully. A follow-up query verified zero probe rows persisted.

**Result: authoritative DB permission compatibility PASS on current evidence.** No grant/revoke/schema change was performed.

## Superseding runtime reconciliation finding

The main technical gap is now runtime/provider compatibility and deployment/test evidence — not authoritative schema or DB permission availability.

### Production today
- Edge Function: `llf-stripe-events` v5 ACTIVE.
- Writes legacy `llf_stripe_event_ledger`.
- Uses legacy `llf_first_sale_payment_state`.
- Calls `llf_apply_first_sale_stripe_event(...)`.
- Signature and live/test environment checks exist.
- Legacy transition semantics do not independently retrieve current Stripe PaymentIntent/Charge/Subscription/Invoice state before marking payment state.

### Authoritative production foundation already present
- `llf_legal_acceptances`, `llf_payment_entitlements`, and `llf_stripe_event_receipts` exist with RLS enabled and zero rows observed at this checkpoint.
- `llf_apply_payment_entitlement_state(...)` exists as SECURITY DEFINER.
- `llf_bootstrap_payment_correlation(...)` exists as SECURITY DEFINER.
- Current `service_role` permission shape passes the hardened webhook runtime probe.

### Draft PR #143
PR #143 prepares the source runtime to preserve/strengthen production safety parity:
- restricted Stripe credentials only;
- separate live vs TEST-mode restricted retrieval credentials;
- webhook signature mode verified before parsing;
- event `livemode` must match verified endpoint-secret mode;
- test credential absence fails closed;
- Payment Entitlement Security Gate now includes runtime typecheck and explicit guards.

PR #143 remains draft/source-only. It does not deploy or alter production credentials/state.

## Controlling technical plan

See `docs/launch-gates/STRIPE-WEBHOOK-02-authoritative-runtime-cutover-plan.md`.

## Required safe sequence

1. Complete CI/review evidence on draft PR #143.
2. Verify exact read scopes of the relevant restricted Stripe credentials without exposing secret values.
3. Re-verify authoritative zero-row/permission state immediately before any future deployment decision.
4. Obtain explicit owner approval before replacing the production Edge Function or changing credential/configuration state.
5. Deploy only the reviewed authoritative runtime.
6. Send one signed Stripe **TEST-mode** event through the authenticated test endpoint using TEST-mode retrieval credentials.
7. Require HTTP 200 plus receipt evidence, authoritative Stripe retrieval, unique correlation and correct state mutation/ignore behavior.
8. Retain legacy tables/functions for rollback during the initial cutover; do not drop them.
9. Keep real charges, refunds, payouts, subscription creation, onboarding, outreach and customer traffic disabled until separate release gates clear.

## Release decision

**NO-GO for production / real customer traffic.**

Authoritative schema and current database permission compatibility are now validated. Issue #130 remains open because PR #143 code/CI evidence, restricted-key scope verification, explicit deployment approval and signed TEST-mode end-to-end validation are still incomplete. iPostal1, PR #94 physical QA and remaining legal/entity/release gates also remain fail-closed.

No database/schema/privilege change, Edge Function replacement, Stripe event, payment, payout, refund, subscription, customer activation, outreach or production release is authorized by this document.
