# Client #1 Live Gate Reconciliation — 21 Aug 2026

Status: HOLD FOR REAL-WORLD GATES
Cost target: $0
Branch: `feature/client1-live-gate-reconciliation`

## Current evidence-backed gate status

| Gate | Status | Evidence / next action |
|---|---|---|
| iPostal1 business address | PENDING | Ticket #3038643. Support escalation is not final approval. Do not update customer-facing, payment, legal or business records until explicit approved/activated + allowed-use evidence exists. |
| Stripe webhook runtime | BLOCKED-OWNER — NARROW FOLLOW-UP | Owner approved and Phase A grants were applied: ledger INSERT/UPDATE and payment-state SELECT/UPDATE. A rollback-only permission probe found one additional least-privilege requirement: SELECT on ledger predicate column `stripe_event_id`. This follow-up has NOT been applied and requires a new explicit approval. |
| Stripe restricted key | EVIDENCE PRESENT / VERIFY-ONLY | Stripe confirmed restricted key `LLF Supabase Webhook Runtime`; deployed function reads `STRIPE_RESTRICTED_KEY`. No rotation/deletion authorized. |
| Stripe event ledger | PARTIAL FIX / STILL BLOCKED | INSERT/UPDATE now granted to `service_role`, but UPDATE with `WHERE stripe_event_id=...` requires SELECT on that predicate column. Probe failed before any row persisted. |
| First-sale payment state RPC | PERMISSION PROBE PASS | SECURITY INVOKER RPC executed as `service_role`; unknown synthetic acceptance ref returned `processed=false`, `onboarding_ready=false`, reason `unknown_acceptance_ref`. |
| PR #94 two-device QA | BLOCKED-PC / OWNER | Draft PR remains open; physical Carlos PC ↔ María iPhone QA still pending. Real messaging/push/conversations remain blocked. |
| Stripe signed TEST event | PENDING | Not sent. Connected Stripe tool context currently exposes Local Lead Forge in livemode only; do not switch or generate a live event. Test event remains pending until an authenticated test-mode channel is available and the ledger SELECT-column gate is approved/repaired. |
| Real payment / payout validation | PENDING | No real charge, refund, payout or customer activation authorized. |
| Production provider activation | HOLD | Separate production gates remain required. |
| Prospect/customer outreach | HOLD | No live email/SMS/calls/postal outreach authorized. |

## Applied Phase A permission change

Applied 21 Aug 2026 after explicit owner approval:

```sql
grant insert, update on table public.llf_stripe_event_ledger to service_role;
grant select, update on table public.llf_first_sale_payment_state to service_role;
```

No DELETE, schema-wide privileges, anon/authenticated grants, legal mutations or payment-creation authority were added.

## Validation result

Effective grants were re-read successfully. A rollback-only service-role probe then attempted the exact ledger shape used by the runtime: insert receipt row, then update processing status using `WHERE stripe_event_id=...`.

PostgreSQL rejected the UPDATE with permission denied and specifically required SELECT on `public.llf_stripe_event_ledger`. The probe transaction persisted zero rows.

The payment-state RPC was tested separately under `service_role` using an unknown synthetic UUID and passed the intended fail-closed behavior:
- processed: false
- onboarding_ready: false
- reason: `unknown_acceptance_ref`

## Narrowest follow-up prepared — NOT applied

Current runtime only needs to read the predicate column used by the UPDATE filter. Proposed next permission:

```sql
grant select (stripe_event_id)
on table public.llf_stripe_event_ledger
to service_role;
```

This is intentionally narrower than table-wide SELECT. It requires a new explicit owner approval before execution.

See `docs/launch-gates/STRIPE-WEBHOOK-01-proposed.sql` for the current staged patch and validation plan.

## Next validation after follow-up approval

1. Apply only column-level SELECT on `stripe_event_id`.
2. Repeat the ledger insert/update probe inside a transaction and roll it back.
3. Confirm zero probe rows persist.
4. Send one Stripe TEST-mode signed event through an authenticated test-mode channel only.
5. Expect HTTP 200 and verify ledger write.
6. Confirm missing/unknown `llf_acceptance_ref` fails closed / is ignored.
7. Re-run Supabase security advisor and inspect Edge Function logs.
8. Keep live charges, refunds, payouts, subscriptions and production release disabled.

## Release decision

**NO-GO for production / real customer traffic.**

Safe internal preparation can continue. Real-world gates remain separate and fail closed.
