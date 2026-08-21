# LLF Checkout Orchestration Contract

Status: FOUNDATION / TEST-ONLY / FAIL-CLOSED
Issue: #80

## Purpose
Define the last server-side layer between durable legal acceptance and Stripe object creation without authorizing a live customer charge.

## Preconditions
1. Durable `acceptance_ref` exists server-side.
2. Legal release gate is explicitly enabled by a separate release decision.
3. Approved offer is resolved server-side: setup $299 + monthly $199.
4. Stripe Price objects are retrieved server-side and pass currency/amount/recurrence invariants.
5. No browser-provided amount, price ID, payment status, customer ID, or redirect is trusted as authority.

## Orchestration sequence
1. Receive opaque `acceptance_ref` plus minimum customer contact context.
2. Load durable acceptance server-side; fail closed if missing, ambiguous, unreleased, or inconsistent.
3. Resolve the approved offer from server-held configuration.
4. Retrieve and verify Stripe Price objects server-side.
5. Create or reuse one Stripe Customer in trusted server context.
6. Immediately persist `acceptance_ref <-> cus_...` via `llf_bootstrap_payment_correlation`.
7. Only after correlation persistence succeeds may a future released implementation create setup/subscription payment objects.
8. Persist returned `pi_...` / `sub_...` references through the same bootstrap RPC.
9. Webhook remains the authority for paid/active state and onboarding eligibility.

## Fail-closed rules
- Zero/multiple acceptance matches: block.
- Legal release disabled: block.
- Price invariant mismatch: block.
- Existing conflicting Stripe correlation: block.
- Correlation persistence failure: block before payment object creation.
- Never infer identity from email/name/amount/return URL.
- Never mark setup PAID or monthly ACTIVE from the checkout response.
- Never trigger onboarding from checkout creation or redirect.

## Current release boundary
This contract does NOT create a Stripe Customer, Checkout Session, PaymentIntent, Subscription, charge, payment link, legal publication, or onboarding event. Live object creation requires a separate reviewed implementation and explicit release gate.