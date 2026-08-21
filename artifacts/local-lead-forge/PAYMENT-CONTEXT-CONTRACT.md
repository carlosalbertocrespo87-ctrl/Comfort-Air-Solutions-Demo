# LLF Payment Context Contract

Status: FOUNDATION / FAIL-CLOSED

This contract supports Issue #80. It defines how an accepted legal context may be bound to the approved founding offer before any payment flow is released.

## Approved founding offer

- Setup: USD 299 one time.
- Monthly: USD 199 recurring monthly.
- No trial.
- No alternative amount, coupon, credit, custom interval, or product substitution may be accepted silently.

## Authoritative binding rules

1. A durable legal acceptance must already exist for the exact released legal version.
2. The payment context must reference exactly one acceptance_ref.
3. The server must bind the exact approved setup and monthly price references before returning any payment destination.
4. Stripe customer, setup payment and subscription references must remain correlated to the same acceptance/customer context.
5. If the price/product/interval/currency differs from the approved offer, stop and return a non-success response.
6. If multiple Stripe customers or subscriptions ambiguously match the same acceptance, stop and require reconciliation.
7. Browser-provided amount, price ID, product ID, coupon, success URL, or onboarding flag is untrusted input and must not override server configuration.
8. Payment completion never bypasses legal release, acceptance-version, or entitlement checks.

## Release requirements before production

- server-side approved Stripe price IDs configured via environment
- official Stripe API verification of those price objects
- setup amount = 29900 USD and recurring amount = 19900 USD/month
- safe checkout/session creation path implemented
- webhook signature verification implemented
- durable correlation metadata written server-side
- automated mismatch and tampering tests
- no onboarding unless setup=PAID and monthly=ACTIVE
