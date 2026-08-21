-- LOCAL LEAD FORGE — HARDENED PAYMENT RUNTIME LEAST-PRIVILEGE GRANTS
-- PAYMENT-RUNTIME-BRIDGE-01 / Issue #136
-- Source-control preparation only. Do not apply to production without explicit owner approval.
-- Run only AFTER migrations 012, 013 and 014 have created the referenced tables/functions.

begin;

-- Fail closed on the new hardened tables: the service-role runtime should not inherit
-- broader table privileges than the current payment-events code path requires.
revoke all on table public.llf_stripe_event_receipts from service_role;
revoke all on table public.llf_payment_entitlements from service_role;

-- Payment-events receipt path:
-- INSERT one immutable receipt envelope, then update only processing status/timestamp.
-- PostgreSQL/PostgREST filtering on stripe_event_id requires SELECT on that predicate column.
grant insert on table public.llf_stripe_event_receipts to service_role;
grant update (processing_status, processed_at)
  on table public.llf_stripe_event_receipts to service_role;
grant select (stripe_event_id)
  on table public.llf_stripe_event_receipts to service_role;

-- Authoritative correlation/current-state lookups are read-only in the Edge Function.
-- State mutation happens only through the SECURITY DEFINER atomic-apply function.
grant select (
  acceptance_ref,
  stripe_customer_ref,
  setup_payment_ref,
  subscription_ref,
  setup_status,
  monthly_status
) on table public.llf_payment_entitlements to service_role;

-- Default EXECUTE is revoked from PUBLIC in migrations 013/014, therefore service_role
-- must be explicitly allowed to invoke the two server-only SECURITY DEFINER functions.
grant execute on function public.llf_apply_payment_entitlement_state(
  uuid,text,timestamptz,text,text,text,text,text
) to service_role;

grant execute on function public.llf_bootstrap_payment_correlation(
  uuid,text,text,text
) to service_role;

commit;

-- Intentionally NOT granted:
-- - DELETE/TRUNCATE on either hardened table
-- - UPDATE on llf_payment_entitlements from the Edge Function
-- - table-wide SELECT on llf_stripe_event_receipts
-- - INSERT on llf_payment_entitlements from the payment-events webhook runtime
-- - any privilege to anon/authenticated
-- - checkout/payment creation authority
-- - onboarding trigger authority

-- Post-apply verification queries (read-only):
-- select grantee, table_name, privilege_type
-- from information_schema.role_table_grants
-- where grantee='service_role'
--   and table_schema='public'
--   and table_name in ('llf_stripe_event_receipts','llf_payment_entitlements')
-- order by table_name, privilege_type;
--
-- select routine_name,
--        has_function_privilege('service_role', p.oid, 'EXECUTE') as service_role_execute
-- from pg_proc p
-- join pg_namespace n on n.oid=p.pronamespace
-- where n.nspname='public'
--   and routine_name in ('llf_apply_payment_entitlement_state','llf_bootstrap_payment_correlation');
