-- LOCAL LEAD FORGE — FAILED PAYMENT EVENT RETRY READ GRANT
-- Issue #130 / #136
-- Source-only until separately approved for production.
-- Adds only the processing_status predicate/read needed to distinguish terminal duplicates from FAILED retry candidates.

begin;

grant select (processing_status)
  on table public.llf_stripe_event_receipts to service_role;

commit;

-- Intentionally NOT granted:
-- - table-wide SELECT
-- - payload/body reads
-- - DELETE/TRUNCATE
-- - direct entitlement mutation
-- - anon/authenticated access
