# LLF Payment Events Runtime Contract

Status: FOUNDATION / FAIL-CLOSED

This runtime contract supports Issue #80 and does not authorize checkout, customer charging, legal release, or onboarding.

## Authoritative event rules

1. Accept only POST requests from Stripe's webhook delivery path.
2. Read the raw request body before JSON parsing.
3. Require `stripe-signature` and verify HMAC-SHA256 against `STRIPE_WEBHOOK_SECRET` with timestamp tolerance before parsing or mutating state.
4. Reject unverified, stale, malformed or mismatched signatures without mutating any LLF table.
5. Deduplicate every verified event by `stripe_event_id` in `llf_stripe_event_receipts` before applying state changes.
6. Never infer current billing state solely from delivery order. Reconcile against authoritative Stripe object state when ordering or staleness is ambiguous.
7. Map setup payment and subscription state to exactly one acceptance/customer context. Zero matches, multiple matches or conflicting refs are blocking failures.
8. Recompute onboarding eligibility only after verified authoritative state writes. Eligibility remains `false` unless setup is `PAID` and monthly is `ACTIVE`.
9. Browser success URLs, client-side checkboxes, localStorage, query parameters or UI state are never proof of payment or acceptance.
10. Do not store raw card/bank/CVV data, payment method secrets, client secrets, service-role credentials or full webhook payloads by default.

## Supported event categories

- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `charge.refunded`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`
- `invoice.paid`
- duplicate event delivery
- out-of-order event delivery
- unknown/irrelevant event types recorded as ignored

## Current runtime state

Implemented in the foundation branch:
- raw-body signature validation with timestamp tolerance
- event normalization
- event receipt hashing/ledger insertion
- primary-key idempotency handling
- unknown-event ignore path
- conservative setup/subscription/refund state mapping helpers
- strict single-context correlation helper

Still intentionally locked:
- authoritative retrieval of current PaymentIntent/Charge/Subscription/Invoice state during webhook processing
- entitlement mutation from webhook data
- onboarding trigger
- checkout creation

## Release conditions

Production readiness requires all of the following:
- signature path tests green
- durable server-side legal acceptance endpoint implemented
- Stripe customer/setup/subscription correlation proven
- duplicate/idempotency tests green
- out-of-order reconciliation tests green
- failure/refund/cancellation tests green
- authoritative Stripe-object retrieval in webhook path
- entitlement recomputation tests
- legal release remains separately gated
- no onboarding trigger until authoritative eligibility is true
