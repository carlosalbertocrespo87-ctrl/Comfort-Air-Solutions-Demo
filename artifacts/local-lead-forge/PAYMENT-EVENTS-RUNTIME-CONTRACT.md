# LLF Payment Events Runtime Contract

Status: FOUNDATION / FAIL-CLOSED

This runtime contract supports Issue #80 and does not authorize checkout, customer charging, legal release, or onboarding.

## Authoritative event rules

1. Accept only POST requests from Stripe's webhook delivery path.
2. Read the raw request body before JSON parsing.
3. Require `stripe-signature` and verify it with Stripe's official signature verification mechanism and `STRIPE_WEBHOOK_SECRET`.
4. Reject unverified payloads without mutating any LLF table.
5. Deduplicate every verified event by `stripe_event_id` in `llf_stripe_event_receipts` before applying state changes.
6. Never infer current billing state solely from delivery order. Reconcile against authoritative Stripe object state when ordering or staleness is ambiguous.
7. Map setup payment and subscription state to the same acceptance/customer context.
8. Recompute onboarding eligibility only after verified state writes. Eligibility remains `false` unless setup is `PAID` and monthly is `ACTIVE`.
9. Browser success URLs, client-side checkboxes, localStorage, query parameters, or UI state are never proof of payment or acceptance.
10. Do not store raw card/bank/CVV data, payment method secrets, client secrets, service-role credentials, or full webhook payloads by default.

## Event categories to support before production

- setup payment success
- setup payment failure
- setup refund
- subscription active/created
- subscription updated to past_due/canceled/failed
- invoice/payment failure affecting the monthly entitlement
- duplicate event delivery
- out-of-order event delivery
- unknown/irrelevant event types (record as ignored)

## Release conditions

Production readiness requires all of the following:

- verified Stripe signature path implemented and tested
- durable server-side legal acceptance endpoint implemented
- Stripe customer/setup/subscription correlation defined
- idempotency tests
- duplicate and out-of-order tests
- failure/refund/cancellation tests
- entitlement recomputation tests
- legal release remains separately gated
- no onboarding trigger until authoritative eligibility is true
