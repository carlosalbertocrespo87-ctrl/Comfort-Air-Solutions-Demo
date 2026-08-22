-- LOCAL LEAD FORGE — PAYMENT RUNTIME LEAST-PRIVILEGE REGRESSION
-- Runs only in isolated CI PostgreSQL after migrations 012–015.

begin;

do $$
begin
  if not has_table_privilege('service_role', 'public.llf_stripe_event_receipts', 'INSERT') then
    raise exception 'service_role_missing_receipt_insert';
  end if;

  if has_table_privilege('service_role', 'public.llf_stripe_event_receipts', 'SELECT') then
    raise exception 'receipt_table_wide_select_must_remain_denied';
  end if;

  if not has_column_privilege('service_role', 'public.llf_stripe_event_receipts', 'stripe_event_id', 'SELECT') then
    raise exception 'receipt_id_predicate_select_missing';
  end if;

  if not has_column_privilege('service_role', 'public.llf_stripe_event_receipts', 'processing_status', 'UPDATE')
     or not has_column_privilege('service_role', 'public.llf_stripe_event_receipts', 'processed_at', 'UPDATE') then
    raise exception 'receipt_status_update_missing';
  end if;

  if has_column_privilege('service_role', 'public.llf_stripe_event_receipts', 'event_type', 'UPDATE') then
    raise exception 'receipt_unrelated_column_update_must_remain_denied';
  end if;

  if has_table_privilege('service_role', 'public.llf_stripe_event_receipts', 'DELETE')
     or has_table_privilege('service_role', 'public.llf_stripe_event_receipts', 'TRUNCATE') then
    raise exception 'receipt_destructive_privilege_must_remain_denied';
  end if;

  if has_table_privilege('service_role', 'public.llf_payment_entitlements', 'SELECT') then
    raise exception 'entitlement_table_wide_select_must_remain_denied';
  end if;

  if not has_column_privilege('service_role', 'public.llf_payment_entitlements', 'acceptance_ref', 'SELECT')
     or not has_column_privilege('service_role', 'public.llf_payment_entitlements', 'stripe_customer_ref', 'SELECT')
     or not has_column_privilege('service_role', 'public.llf_payment_entitlements', 'setup_payment_ref', 'SELECT')
     or not has_column_privilege('service_role', 'public.llf_payment_entitlements', 'subscription_ref', 'SELECT')
     or not has_column_privilege('service_role', 'public.llf_payment_entitlements', 'setup_status', 'SELECT')
     or not has_column_privilege('service_role', 'public.llf_payment_entitlements', 'monthly_status', 'SELECT') then
    raise exception 'entitlement_required_read_column_missing';
  end if;

  if has_column_privilege('service_role', 'public.llf_payment_entitlements', 'id', 'SELECT') then
    raise exception 'entitlement_unneeded_id_read_must_remain_denied';
  end if;

  if has_table_privilege('service_role', 'public.llf_payment_entitlements', 'INSERT')
     or has_table_privilege('service_role', 'public.llf_payment_entitlements', 'UPDATE')
     or has_table_privilege('service_role', 'public.llf_payment_entitlements', 'DELETE')
     or has_table_privilege('service_role', 'public.llf_payment_entitlements', 'TRUNCATE') then
    raise exception 'entitlement_direct_mutation_must_remain_denied';
  end if;

  if not has_function_privilege(
    'service_role',
    'public.llf_apply_payment_entitlement_state(uuid,text,timestamptz,text,text,text,text,text)',
    'EXECUTE'
  ) then
    raise exception 'atomic_apply_execute_missing';
  end if;

  if not has_function_privilege(
    'service_role',
    'public.llf_bootstrap_payment_correlation(uuid,text,text,text)',
    'EXECUTE'
  ) then
    raise exception 'correlation_bootstrap_execute_missing';
  end if;
end
$$;

rollback;
