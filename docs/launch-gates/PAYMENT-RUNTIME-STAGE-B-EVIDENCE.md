# PAYMENT RUNTIME STAGE B — EVIDENCE

Date: 21 Aug 2026
Status: STAGE B COMPLETE / POST-STAGE-B TEST DEFECT FOUND
Issues: #130 / #136

## Stage B production evidence
Migrations 012–015 are applied in Supabase production. Hardened payment tables exist with RLS enabled and were empty at the Stage B checkpoint. No legacy table was dropped, renamed, truncated or backfilled.

Least privilege verified at Stage B:
- service_role receipt INSERT allowed;
- receipt UPDATE restricted to processing status/timestamp;
- receipt predicate SELECT restricted to stripe_event_id;
- required entitlement correlation/state columns readable;
- direct entitlement INSERT/UPDATE/DELETE denied;
- hardened RPC EXECUTE granted to service_role;
- anon/authenticated hardened access denied.

## Signed TEST-mode post-Stage-B evidence
A synthetic Stripe TEST subscription with no payment method and no charge generated signed webhook traffic to active `llf-stripe-events` v6.

Observed:
- signed TEST delivery reached v6;
- durable legacy ledger evidence was written;
- corrected `llf_acceptance_ref` metadata caused v6 to enter the authoritative TEST provider-read path;
- that request returned HTTP 503 and the event was marked FAILED;
- Stripe retried the same event id;
- v6 then returned HTTP 200 as a duplicate without rerunning the failed reconciliation.

Therefore payment runtime release remains blocked. This is not a Stage B schema failure; it is a runtime TEST-access + FAILED-event retry defect discovered by the required end-to-end proof.

## Source-only remediation prepared in Draft PR #143
- FAILED receipt retry policy added;
- terminal duplicate acknowledgement restricted to PROCESSED/IGNORED;
- RECEIVED duplicate is retry-later/fail-closed;
- successful hardened entitlement apply now marks receipt PROCESSED;
- migration 016 prepared to add only SELECT(processing_status) for retry-state discrimination;
- regression tests preserve denial of table-wide SELECT and destructive/direct-entitlement privileges.

Migration 016 is NOT applied in production. No Edge Function replacement is deployed by this evidence update.

## Release boundary
Production checkout, customer charges, onboarding activation, legal publication and outreach remain NO-GO until TEST provider access and retry semantics are proven end-to-end after an explicitly approved runtime remediation.
