# LLF Payment Correlation Bootstrap Contract

Status: FOUNDATION / FAIL-CLOSED
Issue: #80

## Purpose

Create the durable bridge between one released legal acceptance and Stripe objects created later by a server-side payment flow.

Canonical relationship:

`acceptance_ref -> stripe_customer_ref -> setup_payment_ref -> subscription_ref`

## Hard rules

1. Correlation is written only from a trusted server/service-role path after Stripe returns object IDs.
2. Never infer correlation from email, customer name, company name, amount, success URL, browser storage, or redirect parameters.
3. `stripe_customer_ref` is required and must be a `cus_` reference.
4. Setup payment, when known, must be a `pi_` reference.
5. Subscription, when known, must be a `sub_` reference.
6. Existing non-null references are immutable; a conflicting reference blocks.
7. A provider reference already tied to another `acceptance_ref` blocks.
8. Bootstrap does not alter setup/monthly status or onboarding eligibility.
9. Bootstrap does not create Stripe objects, Checkout Sessions, charges, subscriptions, or legal acceptance.

## Safe future sequence

1. Customer has a durable, released `acceptance_ref`.
2. Payment endpoint verifies the approved Stripe prices server-side.
3. Payment endpoint creates/reuses the Stripe customer using server-held context.
4. Immediately persist `acceptance_ref <-> cus_...` through the bootstrap RPC.
5. When Stripe returns setup PaymentIntent/subscription IDs, fill only previously-null correlation fields through the same RPC.
6. Webhook independently verifies signature and retrieves current authoritative Stripe state.
7. Webhook resolves exactly one persisted correlation.
8. Atomic entitlement apply may then update payment state.

## Stop gate

Until the server-side Stripe object creation flow exists and is separately released, correlation bootstrap is code-only. No live checkout or charge is authorized by this contract.