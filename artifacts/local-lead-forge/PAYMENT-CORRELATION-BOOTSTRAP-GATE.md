# LLF Payment Correlation Bootstrap Gate

Status: FAIL-CLOSED / REQUIRED BEFORE LIVE CHECKOUT
Issue: #80

The webhook runtime may apply entitlement state only when exactly one existing `llf_payment_entitlements` row already contains a matching Stripe customer, setup PaymentIntent, or subscription reference.

## Why this gate exists

The first Stripe event cannot safely invent or guess which legal acceptance belongs to a payment. Email, browser redirect state, localStorage, query parameters, amount matching, or customer name are not authoritative correlation evidence.

## Required future checkout behavior

Before the first live Stripe webhook can mutate entitlement state, the server-side checkout creation path must:

1. start from one durable `acceptance_ref`;
2. verify the approved LLF offer server-side;
3. create/reuse exactly one Stripe Customer for that acceptance context;
4. persist `stripe_customer_ref` against that same entitlement before checkout becomes usable;
5. create setup/subscription objects only from the server-held approved Price IDs;
6. persist setup/subscription references as soon as Stripe returns them, without trusting browser callbacks;
7. include an opaque acceptance correlation marker in Stripe metadata where appropriate as a secondary audit/recovery signal;
8. fail closed if any existing Stripe reference conflicts with the acceptance context.

## Current runtime behavior

- verified event + authoritative Stripe state + exactly one existing durable correlation -> atomic entitlement apply is allowed;
- zero correlations -> HTTP 503, receipt FAILED, no entitlement mutation;
- multiple/conflicting correlations -> HTTP 503, receipt FAILED, no entitlement mutation;
- stale event -> atomic apply returns not applied and current eligibility is preserved;
- no onboarding action is triggered by the webhook.

This document does not authorize checkout, charging, legal release, outreach, or onboarding.