-- LOCAL LEAD FORGE — FAILED EVENT RETRY PRIVILEGE REGRESSION
-- Runs only in isolated CI after migrations 012–016.

begin;

do $$
begin
  if not has_column_privilege('service_role', 'public.llf_stripe_event_receipts', 'processing_status', 'SELECT') then
    raise exception 'receipt_processing_status_select_missing';
  end if;

  if has_table_privilege('service_role', 'public.llf_stripe_event_receipts', 'SELECT') then
    raise exception 'receipt_table_wide_select_must_remain_denied';
  end if;

  if has_column_privilege('service_role', 'public.llf_stripe_event_receipts', 'payload_sha256', 'SELECT')
     or has_column_privilege('service_role', 'public.llf_stripe_event_receipts', 'event_type', 'SELECT')
     or has_column_privilege('service_role', 'public.llf_stripe_event_receipts', 'object_ref', 'SELECT') then
    raise exception 'receipt_unneeded_read_column_must_remain_denied';
  end if;

  if has_table_privilege('service_role', 'public.llf_stripe_event_receipts', 'DELETE')
     or has_table_privilege('service_role', 'public.llf_stripe_event_receipts', 'TRUNCATE') then
    raise exception 'receipt_destructive_privilege_must_remain_denied';
  end if;
end
$$;

rollback;
