# Client #1 Live Gate Reconciliation — 21 Aug 2026

Status: HOLD FOR REAL-WORLD GATES
Cost target: $0
Branch: `feature/client1-live-gate-reconciliation`

## Current evidence-backed gate status

| Gate | Status | Evidence / next action |
|---|---|---|
| iPostal1 business address | PENDING | Ticket #3038643. Support contacted the mail center and expects approval before COB Monday 24 Aug 2026, but no final approved/activated confirmation exists yet. Do not update customer-facing, payment, legal or business records until explicit approval and allowed-use evidence are confirmed. |
| Stripe webhook runtime | BLOCKED-OWNER | `llf-stripe-events` v5 is ACTIVE, but recent POSTs returned 500. Issue #130 documents the least-privilege permission repair. Do not apply security-sensitive DB grants without explicit approval. |
| Stripe restricted key | EVIDENCE PRESENT / VERIFY-ONLY | Stripe confirmed creation of restricted key `LLF Supabase Webhook Runtime`. The Edge Function reads `STRIPE_RESTRICTED_KEY`. No credential rotation or deletion is authorized here. |
| Stripe event ledger | FAILING | `public.llf_stripe_event_ledger` is empty while webhook POSTs return 500. `service_role` lacks INSERT/UPDATE on the ledger. |
| First-sale payment state RPC | WOULD FAIL NEXT | `llf_apply_first_sale_stripe_event(...)` is SECURITY INVOKER; `service_role` lacks SELECT/UPDATE on `llf_first_sale_payment_state`. |
| PR #94 two-device QA | BLOCKED-PC / OWNER | Draft PR remains open and mergeable. Automated gates are green per PR evidence, but Carlos PC ↔ María iPhone physical QA remains pending. Real messaging/push/conversations remain blocked. |
| Real payment / payout validation | PENDING | No real charge, refund, payout or production customer activation is authorized from this reconciliation. Test-only validation follows after webhook permission gate is explicitly approved and repaired. |
| Production provider activation | HOLD | Separate production activation gates remain required. |
| Prospect/customer outreach | HOLD | No live email/SMS/calls/postal outreach is authorized by this phase. |

## Stripe webhook root-cause evidence

The deployed `llf-stripe-events` function verifies Stripe signatures and then writes to `llf_stripe_event_ledger` before calling `llf_apply_first_sale_stripe_event(...)`.

Current database privileges show:
- `service_role`: no INSERT or UPDATE on `public.llf_stripe_event_ledger`.
- `service_role`: no SELECT or UPDATE on `public.llf_first_sale_payment_state`.
- RPC is SECURITY INVOKER, so it runs with the caller's permissions.

This explains the observed 500 behavior and means a ledger-only grant would be incomplete: the runtime would then fail at the payment-state RPC.

## Least-privilege repair prepared, not applied

See `docs/launch-gates/STRIPE-WEBHOOK-01-proposed.sql`.

Design choice: do not convert the RPC to SECURITY DEFINER. Prefer narrow table privileges required by the existing runtime path.

## Validation sequence after explicit approval

1. Apply only the scoped grants in the proposed SQL file.
2. Re-read effective grants; no broad DELETE or schema-wide privileges.
3. Send one Stripe TEST-mode signed event only.
4. Expect HTTP 200 rather than 500.
5. Verify an event ledger record appears.
6. Verify missing or unknown `llf_acceptance_ref` fails closed / is ignored.
7. Verify applicable synthetic/test acceptance updates only the expected payment-state fields.
8. Re-run Supabase security advisor and inspect Edge Function logs.
9. Keep live charges, refunds, payouts, subscriptions and production release disabled until their separate owner/release gates pass.

## Security notes

Supabase security advisor currently reports RLS enabled with no policies on `llf_stripe_event_ledger`, `llf_first_sale_payment_state` and `llf_legal_acceptances`; this is consistent with deny-by-default direct client access, but service-role runtime access still requires explicit table grants. Leaked-password protection is also reported disabled; PR #94 already records that this protection is limited by the current plan.

## Release decision

**NO-GO for production / real customer traffic.**

Safe internal preparation can continue. Real-world gates stay separate and fail closed.