# Client #1 Live Gate Reconciliation — 21 Aug 2026

Status: **HOLD FOR REAL-WORLD + RUNTIME GATES**  
Cost target: $0  
Branch: `feature/client1-live-gate-reconciliation`

## Current evidence-backed gate status

| Gate | Status | Evidence / next action |
|---|---|---|
| iPostal1 business address | PENDING | Ticket #3038643 support escalation is not final approval. Do not use/update the commercial address customer-facing, legally or in payment records until final approved/allowed-use evidence exists. |
| Stripe webhook permission sub-gate | PASS — LEGACY PATH | Owner-approved least-privilege grants are present, including column-scoped SELECT on legacy ledger `stripe_event_id`. Table-wide legacy ledger SELECT and DELETE remain absent. |
| Authoritative payment schema | PRESENT / ZERO-ROW CHECKPOINT | Read-only production inspection confirms `llf_payment_entitlements` and `llf_stripe_event_receipts` already exist, RLS is enabled, and both report zero rows at this checkpoint. Core schema creation is not the remaining blocker. |
| Production webhook runtime contract | HOLD — CUTOVER REQUIRED | Deployed `llf-stripe-events` v5 still uses the legacy ledger/payment-state/RPC contract. Protected `main` has the hardened authoritative runtime but it is not the deployed function. |
| Authoritative runtime permissions | HOLD — REVIEW REQUIRED | Current read-only inspection shows `service_role` has INSERT on `llf_stripe_event_receipts` and EXECUTE on the authoritative apply RPC, but the source runtime also needs receipt status updates and direct entitlement reads. Minimum additional runtime permissions must be reviewed/rollback-tested before any application. |
| Deployed payment-state RPC semantics | HOLD | Legacy RPC can mark setup/monthly state from event type + object refs without independently retrieving current Stripe object status. Final release requires authoritative current-state reconciliation. |
| Checkout orchestration source foundation | MERGED / RELEASE OFF | PR #134 is on protected `main`; it enforces durable acceptance, released legal version, approved offer, durable customer correlation and PENDING entitlements. It deploys no provider adapter and creates no live checkout/payment objects by itself. |
| Stripe credential compatibility | REVIEW REQUIRED | Hardened source runtime expects `STRIPE_SECRET_KEY`; deployed v5 uses `STRIPE_RESTRICTED_KEY`. Prefer adapting the runtime contract to the existing least-privilege restricted credential after verifying required read scopes; do not introduce a broader secret merely for naming compatibility. |
| Stripe signed TEST event | DEFERRED UNTIL TARGET RUNTIME | A signed test event is still required, but only after the target runtime/permission/provider contract is reviewed and explicitly approved for testing. Do not validate the legacy optimistic path as if it were final architecture. |
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

The main gap is now runtime cutover/compatibility, not absence of the authoritative schema.

### Production today
- Edge Function: `llf-stripe-events` v5 ACTIVE.
- Writes legacy `llf_stripe_event_ledger`.
- Uses legacy `llf_first_sale_payment_state`.
- Calls `llf_apply_first_sale_stripe_event(...)`.
- Signature and live/test environment checks exist.
- Legacy transition semantics do not independently retrieve current Stripe PaymentIntent/Charge/Subscription/Invoice state before marking payment state.

### Authoritative production schema already present
Read-only inspection confirms:
- `llf_legal_acceptances` exists, RLS enabled, zero rows observed;
- `llf_payment_entitlements` exists, RLS enabled, zero rows observed;
- `llf_stripe_event_receipts` exists, RLS enabled, zero rows observed;
- `llf_apply_payment_entitlement_state(...)` exists as SECURITY DEFINER;
- `service_role` has EXECUTE on that authoritative apply function.

### Protected `main`
- Hardened source runtime: `artifacts/local-lead-forge/supabase/functions/llf-payment-events`.
- `authoritative-reconciler.ts` retrieves current Stripe PaymentIntent/Charge/Subscription/Invoice state before entitlement mutation.
- It requires a unique existing correlation in `llf_payment_entitlements` and applies state atomically through the authoritative RPC.
- It never directly triggers onboarding.

The source runtime is therefore structurally closer to production than previously recorded, but it still **must not be deployed as-is** until runtime permissions, restricted-key compatibility and checkout/customer-correlation bootstrap are reviewed and tested.

## Controlling technical plan

See `docs/launch-gates/STRIPE-WEBHOOK-02-authoritative-runtime-cutover-plan.md`.

That plan records:
- the observed zero-row authoritative schema checkpoint;
- exact runtime/permission mismatch;
- checkout correlation bootstrap dependency;
- restricted-key compatibility requirement;
- rollback boundary;
- synthetic/rollback-only validation sequence before any production mutation.

## Required safe sequence

1. Review the authoritative runtime cutover plan and keep this PR documentation-only.
2. Build a separate dedicated source PR for runtime/provider compatibility; do not deploy from this reconciliation PR.
3. Prove minimum privilege requirements using synthetic/rollback-only checks.
4. Re-verify zero real rows immediately before any future cutover decision; if real rows exist, stop and design record-level migration/reconciliation.
5. Obtain explicit owner approval before applying database privilege changes, changing Stripe credential scope/configuration, or replacing the production Edge Function.
6. After the approved target runtime exists, send one signed Stripe **TEST-mode** event through an authenticated test channel.
7. Require HTTP 200 plus receipt evidence, authoritative Stripe retrieval, unique correlation and correct state mutation/ignore behavior.
8. Keep real charges, refunds, payouts, subscription creation, onboarding, outreach and customer traffic disabled until separate release gates clear.

## Release decision

**NO-GO for production / real customer traffic.**

The legacy permission sub-gate is verified and the authoritative schema is already present, but Issue #130 remains open because the hardened runtime is not yet the deployed contract and its permission/provider compatibility has not been release-tested. iPostal1, PR #94 physical QA and the remaining legal/entity/release gates also remain fail-closed.

No database/schema/privilege change, Edge Function replacement, Stripe event, payment, payout, refund, subscription, customer activation, outreach or production release is authorized by this document.
