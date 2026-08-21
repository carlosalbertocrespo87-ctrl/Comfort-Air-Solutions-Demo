# First-Sale Payment Runtime Test Matrix

Status: FAIL-CLOSED / PRE-LIVE

## Purpose
Prove Issue #80 behavior before any live checkout/onboarding release.

## Required cases
1. Durable acceptance: same `idempotency_key` cannot create two authoritative acceptance rows.
2. Browser-only acceptance: never counts as authoritative evidence.
3. Setup success first: records setup evidence but does not release onboarding without monthly active state.
4. Monthly success first: records monthly evidence but does not release onboarding without setup paid state.
5. Both complete: onboarding may be released only after both authoritative server-side states exist.
6. Duplicate Stripe event: duplicate `stripe_event_id` is idempotently rejected/ignored by the ledger primary key.
7. Older out-of-order event: must not regress a newer payment state; compare against `last_stripe_event_created_at` before applying state changes.
8. Cancelled/failed setup: must not set `setup_paid_at`.
9. Cancelled/incomplete subscription: must not set `monthly_active_at`.
10. Setup-only return URL: must not release onboarding.
11. Monthly-only bypass attempt: must not release onboarding.
12. Unknown/unhandled event type: ledger as `IGNORED`; no state mutation.
13. Processing failure: ledger as `FAILED`; no onboarding release.
14. Sensitive data check: no card number, bank account, CVC, client secret, payment method secret, or raw webhook secret is persisted.
15. Authorization check: `anon` and `authenticated` roles cannot directly read/write payment runtime tables.

## Release evidence
Capture test name, event/order, expected result, actual result, database state, and timestamp. Do not store secrets in screenshots/logs.
