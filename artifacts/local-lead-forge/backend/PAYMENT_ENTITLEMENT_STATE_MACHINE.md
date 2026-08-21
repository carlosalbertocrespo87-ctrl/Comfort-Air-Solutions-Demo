# LLF Payment Entitlement State Machine

Status: FOUNDATION ONLY / FAIL-CLOSED

This document defines the first-sale payment and legal acceptance contract for Issue #80. It does not authorize checkout, publish legal documents, send outreach, charge a customer, or trigger onboarding.

## Authoritative conditions
Onboarding eligibility is true only when all of the following are proven server-side:

1. Durable legal acceptance exists for the exact released legal version.
2. Setup payment status is `PAID`.
3. Monthly subscription status is `ACTIVE`.
4. The states correlate to the same acceptance/customer context.

A browser return URL, localStorage value, unchecked webhook signature, or client-side checkbox is never payment or acceptance evidence.

## Fail-closed transitions

- Initial: setup `PENDING`, monthly `PENDING`, onboarding `false`.
- Setup succeeded only: setup `PAID`, monthly `PENDING`, onboarding `false`.
- Monthly active only: setup not `PAID`, monthly `ACTIVE`, onboarding `false`.
- Both authoritative: setup `PAID`, monthly `ACTIVE`, onboarding `true`.
- Setup failed/refunded: onboarding `false`.
- Monthly past_due/canceled/failed: onboarding `false`.

## Event processing contract

- Every Stripe event must be deduplicated by `stripe_event_id`.
- Webhook signature must be verified by the future runtime handler before any state mutation.
- Out-of-order events must use provider event timestamps/current Stripe state rather than assuming delivery order.
- No raw card, bank account, CVV, payment method secret, client secret, or service-role credential is stored in these tables.
- Event payload storage should be avoided unless specifically needed; use opaque Stripe references and a payload hash for audit correlation.

## Release gate

This foundation is not sufficient for production. Remaining work includes identifying/creating the authoritative webhook runtime, signature verification, server-side acceptance endpoint, Stripe state reconciliation, automated tests, and final legal/entity release QA. `LEGAL_RELEASED` must remain false until those gates are explicitly satisfied.
