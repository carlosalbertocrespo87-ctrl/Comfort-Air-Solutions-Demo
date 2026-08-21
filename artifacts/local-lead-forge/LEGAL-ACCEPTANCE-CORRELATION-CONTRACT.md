# LLF Legal Acceptance → Payment Correlation Contract

Status: FOUNDATION / FAIL-CLOSED

Purpose: define the correlation contract for Issue #80 without enabling checkout, charging, legal release, or onboarding.

## Required correlation chain

1. A server-side legal acceptance produces one opaque `acceptance_ref`.
2. Exactly one `llf_payment_entitlements` row is initialized for that `acceptance_ref`.
3. Future Stripe checkout/session/customer objects must carry the same `acceptance_ref` in metadata or another server-controlled correlation field.
4. Setup payment and monthly subscription references must resolve back to the same entitlement row.
5. A payment event that cannot be correlated uniquely must not mutate entitlement state and must be recorded as failed/ignored for review.
6. Browser URLs, query params, cookies, localStorage, or client-generated IDs are never authoritative correlation evidence.

## Legal acceptance endpoint invariants

- Real acceptance is blocked unless `LLF_LEGAL_RELEASED=true` server-side.
- The submitted legal version must exactly equal `LLF_RELEASED_LEGAL_VERSION`.
- Consent must be explicit (`consent=true`); no pre-checked or inferred acceptance.
- The endpoint records acceptance only. It never creates a Stripe Checkout Session, charges a customer, or activates onboarding.
- Returned `payment_ready` and `onboarding_eligible` remain false at creation.

## Future Stripe correlation requirements

Before production checkout exists, define and test server-side creation so the following are immutable/correlated:

- `acceptance_ref`
- Stripe customer ID
- setup PaymentIntent/Checkout Session reference
- subscription ID
- expected setup price/product identity
- expected monthly price/product identity

Do not trust amount alone as product identity when a stable Stripe price/product reference is available.

## Stop conditions

Stop and keep onboarding false when:

- legal version mismatch
- missing explicit consent
- no unique acceptance correlation
- setup payment belongs to a different Stripe customer/context
- subscription belongs to a different customer/context
- price/product identity does not match the approved LLF offer
- webhook signature is unverified
- event is stale/ambiguous and current Stripe state has not been reconciled

This contract is documentation/foundation only and does not authorize live checkout or payment activity.
