# Client #1 Live Gate Reconciliation — 21 Aug 2026

Status: HOLD FOR REAL-WORLD GATES
Cost target: $0
Branch: `feature/client1-live-gate-reconciliation`

## Current evidence-backed gate status

| Gate | Status | Evidence / next action |
|---|---|---|
| iPostal1 business address | PENDING | Ticket #3038643. Support escalation is not final approval. Do not update customer-facing, payment, legal or business records until explicit approved/activated + allowed-use evidence exists. |
| Stripe webhook runtime permissions | PERMISSION PROBE PASS / TEST EVENT PENDING | Owner approved Phase A and the narrow column-level follow-up. Ledger INSERT/UPDATE, payment-state SELECT/UPDATE, and SELECT only on ledger `stripe_event_id` are now applied. Rollback-only runtime-shape probe passed. |
| Stripe restricted key | EVIDENCE PRESENT / VERIFY-ONLY | Stripe confirmed restricted key `LLF Supabase Webhook Runtime`; deployed function reads `STRIPE_RESTRICTED_KEY`. No rotation/deletion authorized. |
| Stripe event ledger | PERMISSION PROBE PASS | service_role can insert a receipt and update processing status using `WHERE stripe_event_id=...`. Probe transaction rolled back; zero synthetic rows persisted. Table-wide ledger SELECT remains denied. |
| First-sale payment state RPC | PERMISSION PROBE PASS | SECURITY INVOKER RPC executed as `service_role`; unknown synthetic acceptance ref returned `processed=false`, `onboarding_ready=false`, reason `unknown_acceptance_ref`. |
| Stripe signed TEST event | PENDING / BLOCKED-BY-TEST-CHANNEL | Not sent. Connected Stripe tool context currently exposes Local Lead Forge in livemode only. Do not generate a live event merely for validation. |
| Banking / payout destination readiness | GREEN — READ-ONLY VERIFIED | Stripe account reports `payouts_enabled=true`, `charges_enabled=true`, details submitted, no current/future account requirements due, and one default USD external bank account at Lead Bank. Found email evidence also confirms the business account is open and its debit card shipped. Do not change payout bank or business address solely from this check. |
| Real payment transaction validation | PENDING | No real charge, refund, payout, subscription creation or customer activation is authorized. A real transaction remains a separate owner/release gate after the test webhook and other launch gates pass. |
| PR #94 two-device QA | BLOCKED-PC / OWNER | Draft PR remains open; physical Carlos PC ↔ María iPhone QA still pending. Real messaging/push/conversations remain blocked. |
| Production provider activation | HOLD | Separate production gates remain required. |
| Prospect/customer outreach | HOLD | No live email/SMS/calls/postal outreach authorized. |

## Applied permission changes

Applied 21 Aug 2026 after explicit owner approvals:

```sql
grant insert, update on table public.llf_stripe_event_ledger to service_role;
grant select, update on table public.llf_first_sale_payment_state to service_role;
grant select (stripe_event_id) on table public.llf_stripe_event_ledger to service_role;
```

Verification confirms:
- table-wide SELECT on `llf_stripe_event_ledger`: false
- column SELECT on `stripe_event_id`: true
- DELETE on event ledger: false
- DELETE on first-sale payment state: false

No schema-wide privileges, anon/authenticated grants, legal mutations or payment-creation authority were added.

## Validation result

A rollback-only service-role probe matched the runtime ledger path:
1. insert synthetic receipt row;
2. update processing status using `WHERE stripe_event_id=...`;
3. rollback transaction;
4. verify zero probe rows persisted.

Result: PASS.

The payment-state RPC was also tested separately under `service_role` using an unknown synthetic UUID and passed intended fail-closed behavior:
- processed: false
- onboarding_ready: false
- reason: `unknown_acceptance_ref`

Supabase security advisor was re-run. Existing notices remain: RLS enabled/no policy on the three private runtime tables and leaked-password protection disabled. No new advisory was introduced by this narrow permission change.

## Banking / payout readiness validation

A read-only Stripe account inspection on 21 Aug 2026 confirmed:
- `charges_enabled=true`;
- `payouts_enabled=true`;
- account details submitted;
- no currently due, past due, eventually due, pending-verification or future requirements on the account;
- one default USD external bank account is linked at Lead Bank with standard payouts available.

Separate Found email evidence confirms the Found account is open and the Found debit card has shipped. This closes the banking / payout-destination readiness sub-gate for the current setup. It does **not** authorize a payout, change bank details, change the business address, or represent completion of a real-money end-to-end payment test.

## Remaining Stripe validation

The permission blocker is repaired at database level, but the end-to-end Stripe webhook gate is not fully cleared until one Stripe TEST-mode signed event can be sent through an authenticated test-mode channel.

Connected Stripe tools currently expose the account in livemode only, so no live event will be generated for this validation.

Remaining steps:
1. obtain authenticated Stripe test-mode channel;
2. send one signed TEST event;
3. expect HTTP 200 and verify ledger write;
4. confirm missing/unknown `llf_acceptance_ref` fails closed / is ignored;
5. inspect Edge Function logs;
6. keep real charges, refunds, payouts, subscriptions and production release disabled.

## Release decision

**NO-GO for production / real customer traffic.**

The database-permission sub-gate and banking/payout-destination readiness sub-gate are validated. Safe internal preparation can continue while iPostal1, Stripe test-event validation, PR #94 physical QA and remaining external release gates stay fail-closed.
