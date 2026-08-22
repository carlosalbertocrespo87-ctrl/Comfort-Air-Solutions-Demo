-- LOCAL LEAD FORGE — HARDENED PAYMENT RUNTIME LEAST-PRIVILEGE GRANTS
-- PAYMENT-RUNTIME-BRIDGE-01 / Issue #136
-- Source-control record of the owner-approved Stage B grants applied on 21 Aug 2026.
-- Run only AFTER migrations 012, 013 and 014 have created the referenced tables/functions.

begin;

revoke all on table public.llf_stripe_event_receipts from service_role;
revoke all on table public.llf_payment_entitlements from service_role;

grant insert on table public.llf_stripe_event_receipts to service_role;
grant update (processing_status, processed_at)
  on table public.llf_stripe_event_receipts to service_role;
grant select (stripe_event_id)
  on table public.llf_stripe_event_receipts to service_role;

grant select (
  acceptance_ref,
  stripe_customer_ref,
  setup_payment_ref,
  subscription_ref,
  setup_status,
  monthly_status
) on table public.llf_payment_entitlements to service_role;

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
