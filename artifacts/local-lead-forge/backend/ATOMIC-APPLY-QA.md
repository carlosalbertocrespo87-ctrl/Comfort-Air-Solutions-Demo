# LLF Atomic Entitlement Apply QA

Status: FOUNDATION / FAIL-CLOSED
Issue: #80

This QA matrix validates the database-side atomic entitlement apply contract. It does not authorize checkout, charging, legal release, onboarding, outreach, or production activation.

## Required invariants

1. Unknown setup status -> reject.
2. Unknown monthly status -> reject.
3. Missing entitlement row -> reject.
4. Existing Stripe customer ref + conflicting new customer ref -> reject.
5. Existing setup payment ref + conflicting new payment ref -> reject.
6. Existing subscription ref + conflicting new subscription ref -> reject.
7. Older event_created_at than last_event_created_at -> no state mutation (`applied=false`).
8. Equal/newer event may apply only authoritative state already reconciled from Stripe.
9. `onboarding_eligible` is true only when setup=`PAID` and monthly=`ACTIVE`.
10. Duplicate Stripe webhook delivery is stopped earlier by the event receipt primary key and must not re-apply state.
11. Event receipt is marked PROCESSED only as part of the accepted atomic state transition.
12. Browser roles cannot call the atomic RPC directly.

## Scenario matrix

| Scenario | Expected |
|---|---|
| PENDING + PENDING | eligible=false |
| PAID + PENDING | eligible=false |
| PENDING + ACTIVE | eligible=false |
| PAID + ACTIVE | eligible=true |
| REFUNDED + ACTIVE | eligible=false |
| PAID + PAST_DUE | eligible=false |
| PAID + CANCELED | eligible=false |
| stale event after newer state | applied=false; state unchanged |
| duplicate event id | deduped before mutation |
| conflicting customer/payment/subscription refs | hard failure / fail-closed |
| newer authoritative downgrade ACTIVE -> PAST_DUE | apply; eligible=false |
| newer authoritative refund PAID -> REFUNDED | apply; eligible=false |

## Release gate

This contract remains non-production until runtime correlation passes one unique acceptance context, mutation adapter QA is green, current-head CI is green, and checkout/legal release remain separately controlled.