# Local Lead Forge — First-Sale Acceptance & Checkout Orchestration

Status: INTERNAL PREPARATION / FAIL-CLOSED

This document defines the technical contract required before Local Lead Forge can release customer acceptance or checkout. It does not authorize publication, charging, or outreach.

## Current safety state

- `LEGAL_RELEASED` remains `false`.
- Setup and monthly checkout URLs remain intentionally empty in the repository release config.
- Existing live Stripe Payment Links are not modified by this work.
- The public `/start/` route remains fail-closed.

## A. Durable acceptance evidence requirement

A checkbox in browser memory is not sufficient acceptance evidence. Before checkout release, the customer flow must record acceptance through an authorized server-side endpoint.

Required request facts:

- customer name
- customer email
- company/business name
- affirmative acceptance = true
- exact `LEGAL_VERSION`
- client timestamp

Required server response:

- opaque `acceptanceReference`
- exact legal version recorded
- authoritative server `recordedAt` timestamp

The server-side record should retain only the evidence necessary for the approved legal/operational policy. Never store full card data, bank credentials, passwords, recovery codes, SSNs, or identity-document content with the acceptance record.

If the endpoint is unavailable, returns a mismatched legal version, or does not provide an acceptance reference, checkout must remain blocked.

## B. Setup + monthly orchestration

The intended founding-client commercial structure is:

1. Customer reviews the customer-ready legal set.
2. Customer identity fields are complete.
3. Affirmative acceptance is durably recorded.
4. Customer completes the $299 setup payment through the approved Stripe flow.
5. LLF verifies the setup payment from an authoritative Stripe/server-side event or payment-status endpoint.
6. Customer completes the $199/month recurring enrollment through the approved Stripe flow.
7. LLF verifies the recurring enrollment/payment state from authoritative Stripe/server-side evidence.
8. Only then may the commercial payment stage be treated as complete and the approved onboarding trigger proceed.

The client must not be treated as fully paid/onboardable merely because the setup Payment Link was opened or because a browser returned from Stripe.

## Required runtime integrations before release

- `POST /api/legal-acceptance` — durable server-side acceptance record.
- `/api/setup-payment-status` or equivalent Stripe webhook-backed verification — authoritative setup-payment state.
- authoritative monthly subscription/enrollment verification — Stripe webhook/API-backed.
- correlation between acceptance reference, customer identity, Stripe customer/payment references, and onboarding trigger using non-sensitive identifiers.
- idempotency/duplicate protection.
- auditable timestamps and failure states.

## State machine

The source contract `src/lib/first-sale-checkout-contract.ts` defines the fail-closed states:

- `LEGAL_NOT_RELEASED`
- `IDENTITY_INCOMPLETE`
- `ACCEPTANCE_NOT_RECORDED`
- `SETUP_PAYMENT_PENDING`
- `MONTHLY_ENROLLMENT_PENDING`
- `READY_FOR_ONBOARDING`

Every transition requires evidence. A browser redirect alone is never evidence of payment or recurring enrollment.

## HOLD rule

Do not wire `/start/` to a live customer checkout until the actual authorized backend that receives Stripe/payment events is identified and the durable acceptance + payment verification endpoints are implemented and tested. If that backend lives outside this repository, integrate there rather than inventing a duplicate store in GitHub Pages or browser storage.

## Release QA

Before release, verify:

- legal version/date exact match
- checkbox default off
- customer identity complete
- acceptance record survives browser/session loss
- duplicate acceptance is safely idempotent
- setup payment evidence is authoritative
- recurring enrollment evidence is authoritative
- setup-only completion does not activate onboarding
- monthly-only completion cannot bypass setup
- failed/cancelled Stripe flow remains HOLD
- desktop + mobile
- no sensitive information stored in Drive/source/client logs
- approved evidence references reach the Client #1 evidence pack
