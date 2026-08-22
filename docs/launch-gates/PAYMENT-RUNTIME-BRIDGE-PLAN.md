# LOCAL LEAD FORGE — PAYMENT RUNTIME BRIDGE PLAN

Status: PREP / NO PRODUCTION RELEASE
Issues: #130 / #136

## Current production truth
- `llf-stripe-events` v6 is ACTIVE in Supabase.
- Stage B migrations 012–015 are applied in production.
- v6 verifies signed live/TEST webhook mode and performs authoritative Checkout/Subscription retrieval before legacy state mutation.
- No automatic onboarding trigger is present.

## Signed TEST evidence — 21 Aug 2026
A real Stripe TEST-mode subscription event reached v6 with a valid signature and durable ledger evidence. A corrected `customer.subscription.updated` event carrying the exact `llf_acceptance_ref` metadata key entered the authoritative TEST reconciliation path and returned HTTP 503; the ledger marked that event FAILED. Stripe then retried the same event id, but v6 treated the existing ledger row as a terminal duplicate and returned HTTP 200 without rerunning authoritative reconciliation.

This proves two remaining runtime defects before release:
1. TEST provider retrieval is not yet completing successfully; current tooling cannot distinguish secret absence from provider-read permission failure without exposing secrets or a response-body delivery trace.
2. FAILED events must remain retryable. A duplicate event id is terminal only after PROCESSED or intentionally IGNORED state; RECEIVED must fail closed/retry later and FAILED must be claimable for reprocessing.

## Source-only hardening in Draft PR #143
The source-controlled hardened payment runtime now prepares the corrected behavior:
- explicit duplicate receipt decision policy;
- FAILED receipt retry claim back to RECEIVED;
- PROCESSED/IGNORED terminal duplicate acknowledgement only;
- RECEIVED duplicate returns retryable 503 rather than false success;
- unknown receipt state fails closed;
- successful authoritative entitlement application marks the receipt PROCESSED;
- migration 016 grants only column-level SELECT on receipt `processing_status`, required for retry-state discrimination;
- CI regression coverage asserts retry policy and preserves denial of table-wide receipt SELECT, destructive grants, direct entitlement mutation and anon/authenticated access.

Migration 016 and the runtime changes are SOURCE ONLY. They are not applied or deployed by this plan.

## Next gates
1. Current-head PR #143 CI must pass.
2. Identify/fix TEST restricted provider access without exposing secret values.
3. Explicit owner approval is required before any production migration 016 or Edge Function replacement/deployment.
4. After deployment approval, rerun a signed TEST event and require: authoritative provider read, durable receipt/ledger state, retry-safe semantics, unknown correlation fail-closed, duplicate/stale safety, and zero live/onboarding side effects.

## Safety boundary
No production checkout, live customer/payment/subscription object, charge, refund, payout, webhook repoint, onboarding activation, legal publication or outreach is authorized by this document.
