# STRIPE-WEBHOOK-02 — v6 Validation + Optional Hardened Runtime Plan

Status: REVIEW / PREP ONLY — NO DEPLOYMENT AUTHORIZED
Date: 21 Aug 2026
Issues: #130, #136

## Purpose

Separate two different decisions that must not be conflated:

1. **Immediate release evidence:** validate the already-active production `llf-stripe-events` v6 with one legitimate signed Stripe TEST-mode end-to-end event.
2. **Optional future architecture:** decide later whether to deploy the alternate source-controlled `llf-payment-events` runtime that uses the hardened receipt/entitlement schema.

The second decision is not a prerequisite merely to complete the first.

## Evidence-backed production state

Production currently contains both legacy-path and hardened payment objects with RLS enabled. At the Stage B checkpoint the relevant hardened tables reported zero rows:

- `llf_payment_entitlements` — 0 rows observed;
- `llf_stripe_event_receipts` — 0 rows observed.

Stage B migrations 012–015 were already applied with explicit owner approval and verified. No new DDL is authorized by this document.

Production also contains:

- legacy `llf_first_sale_payment_state` and `llf_stripe_event_ledger`;
- active v2 transition function `llf_apply_first_sale_stripe_event_v2(...)` used by v6;
- hardened `llf_apply_payment_entitlement_state(...)`;
- hardened `llf_bootstrap_payment_correlation(...)`.

## Active production runtime — v6

Fresh production source inspection confirms `llf-stripe-events` v6 is ACTIVE and already performs authoritative provider checks before state advancement:

1. verifies the raw Stripe webhook signature;
2. identifies live vs TEST signature mode using separate webhook secrets when configured;
3. rejects live/TEST event mismatch;
4. uses a restricted live Stripe key for live provider reads;
5. requires a separate TEST restricted key for TEST provider reads;
6. retrieves current Checkout Session state for setup-payment events;
7. advances setup only when current Checkout `payment_status = paid`;
8. retrieves current Subscription state for recurring events;
9. advances monthly only when current Subscription `status = active`;
10. calls `llf_apply_first_sale_stripe_event_v2(...)` with explicit provider-confirmed paid/active booleans;
11. never automatically triggers onboarding.

Historical HTTP 500 evidence belongs to v5 and must not be treated as current v6 evidence.

## Stage B hardened foundation — complete

The additive hardened database foundation is present and least-privilege verified:

- receipt INSERT allowed for `service_role`;
- receipt status/timestamp UPDATE allowed;
- receipt ID predicate SELECT allowed only as required;
- entitlement reads limited to required correlation/state columns;
- direct entitlement INSERT/UPDATE/DELETE denied for the webhook runtime role;
- hardened atomic-apply/bootstrap RPC EXECUTE allowed;
- anon/authenticated hardened access denied;
- RLS enabled.

Migration 015 now exists in source control on Draft PR #143 as the record of the already-applied Stage B grant shape. PR #143 also contains an isolated PostgreSQL regression that applies 012–015 and asserts required and denied privileges.

## Draft PR #143 — alternate hardened source runtime

PR #143 consolidates the stronger source-controlled `llf-payment-events` path:

- separate live and TEST restricted-key contracts;
- wrong-mode and credential-alias rejection;
- separate webhook-secret environment handling;
- signature-mode verification before JSON parsing;
- required event `livemode` matching;
- authoritative PaymentIntent/Charge/Subscription/Invoice reconciliation;
- hardened receipt/entitlement correlation and atomic mutation;
- no automatic onboarding trigger;
- executable Deno + PostgreSQL security regression coverage.

Current head `366a77731a472ecc7fa7acb86841400696976a23` has all four observed workflows PASS:

- Payment Entitlement Security Gate;
- LLF Main Protection Gate;
- LLF Onboarding CI;
- LLF Pixel Match QA.

PR #143 remains DRAFT and source-only. It does not deploy production or change Stripe credentials.

## Immediate remaining payment proof — active v6 TEST E2E

Before payment-runtime release, obtain one legitimate signed Stripe TEST-mode event against active v6. The evidence packet must show:

1. TEST signature accepted through the TEST webhook-secret path;
2. event classified as TEST and not live;
3. TEST restricted Stripe credential used for provider retrieval;
4. current provider state retrieved before advancement;
5. expected HTTP result;
6. durable event-ledger evidence;
7. missing/unknown acceptance/correlation remains fail-closed;
8. duplicate/stale behavior cannot incorrectly advance state;
9. no live customer/payment/onboarding side effects.

The Stripe connector available in the current ChatGPT session exposes live mode only. Do not generate this proof from the live context.

## Optional future hardened-runtime deployment

After the v6 TEST evidence is complete, a separate architecture decision may consider deploying `llf-payment-events`. That later change requires its own explicit approval and must include:

- fresh table/row/permission preflight;
- exact restricted-key read-scope verification;
- environment/secrets readiness without exposing values;
- deployment plan and rollback version;
- webhook endpoint/routing plan if applicable;
- controlled TEST-mode validation after deployment;
- legacy ledgers/functions retained until a later decommission review.

Do not treat PR #143 merge or deployment as automatic follow-on work from Issue #130.

## Checkout / correlation dependency

The hardened alternate runtime intentionally refuses to mutate unless exactly one durable Stripe correlation exists in `llf_payment_entitlements`. Any future provider adapter must preserve this order:

1. durable legal acceptance;
2. PENDING entitlement row;
3. create/reuse Stripe Customer only after release gates permit;
4. persist `acceptance_ref <-> cus_...` through the bootstrap path;
5. only then create hosted Checkout;
6. webhook performs authoritative provider reconciliation;
7. entitlement remains fail-closed until setup=`PAID` and monthly=`ACTIVE`.

PR #134 merged the safe checkout-orchestration core but does not deploy a live Stripe/Supabase provider adapter or create payment objects by itself.

## Safety boundary

Not authorized by this plan:

- new Edge Function deployment/replacement;
- database/schema/privilege mutation;
- Stripe credential creation, rotation or scope expansion;
- webhook repointing;
- live charges, refunds, payouts, subscriptions or customers;
- onboarding release;
- legal/address changes;
- customer/prospect outreach;
- destructive rollback or legacy-table deletion.

## Decision

**Active v6 is the runtime to validate now. Production/customer release remains HOLD.**

The immediate payment-runtime gap is signed Stripe TEST-mode v6 evidence, not an obligatory production cutover to the alternate hardened runtime. PR #143 remains a green, draft, source-control hardening path for a separately reviewed future decision.
