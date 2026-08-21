# LLF Payment Offer Verification Test Matrix

Status: FOUNDATION / FAIL-CLOSED
Issue: #80

Approved offer invariant:
- setup: USD 29900 cents, one-time
- monthly: USD 19900 cents, recurring every month

No test in this matrix authorizes checkout, charging, legal release, or onboarding.

## Server-authoritative configuration tests

| Case | Expected result |
|---|---|
| setup Price missing | BLOCK / 503 |
| monthly Price missing | BLOCK / 503 |
| setup Price inactive | BLOCK |
| monthly Price inactive | BLOCK |
| setup currency != usd | BLOCK |
| monthly currency != usd | BLOCK |
| setup unit_amount != 29900 | BLOCK |
| monthly unit_amount != 19900 | BLOCK |
| setup is recurring | BLOCK |
| monthly is one-time | BLOCK |
| monthly recurring interval != month | BLOCK |
| browser submits alternate price_id | IGNORE browser value; server config remains authoritative |
| browser submits alternate amount | IGNORE browser value |
| acceptance_ref absent/invalid | BLOCK |
| acceptance_ref not found | BLOCK |
| payment release false | VALIDATED BUT LOCKED; no Checkout Session |
| all price invariants match but Checkout implementation absent | BLOCK / 503 |

## Correlation tests

- Setup and monthly Price objects must be retrieved independently from Stripe using server-held IDs.
- Both verified prices must be correlated to the same LLF approved offer version.
- The payment context must remain tied to one durable `acceptance_ref`.
- A Stripe customer/payment/subscription from another acceptance context must never satisfy entitlement.

## Manipulation tests

Requests attempting any of the following must not alter the authoritative offer:
- `setup_price_id`
- `monthly_price_id`
- `setup_amount`
- `monthly_amount`
- `currency`
- `interval`
- `coupon`
- `discount`
- `trial_period_days`
- `onboarding_eligible`

## Release rule

Checkout remains unavailable until official Stripe API retrieval proves every invariant above server-side and the separate legal/payment release gates are explicitly true.