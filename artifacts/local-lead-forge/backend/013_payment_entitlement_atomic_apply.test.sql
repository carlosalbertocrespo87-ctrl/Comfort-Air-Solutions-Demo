-- LLF atomic entitlement apply regression scenarios
-- Intended for disposable/test database only. Wrapped in a transaction and rolled back.

begin;

do $$
declare
  a uuid := gen_random_uuid();
  r record;
begin
  insert into public.llf_legal_acceptances (acceptance_ref, legal_version, customer_name, customer_email, idempotency_key)
  values (a, 'qa-test-only', 'QA Test', 'qa@example.invalid', 'qa-entitlement-atomic-001');

  insert into public.llf_payment_entitlements (acceptance_ref)
  values (a);

  insert into public.llf_stripe_event_receipts (stripe_event_id, event_type, processing_status)
  values ('evt_qa_001', 'payment_intent.succeeded', 'RECEIVED');

  select * into r from public.llf_apply_payment_entitlement_state(
    a, 'evt_qa_001', '2026-08-21T13:00:00Z', 'cus_qa', 'pi_qa', 'sub_qa', 'PAID', 'ACTIVE'
  );
  if r.applied is distinct from true or r.onboarding_eligible is distinct from true then
    raise exception 'expected paid+active to become eligible';
  end if;

  insert into public.llf_stripe_event_receipts (stripe_event_id, event_type, processing_status)
  values ('evt_qa_old', 'invoice.payment_failed', 'RECEIVED');

  select * into r from public.llf_apply_payment_entitlement_state(
    a, 'evt_qa_old', '2026-08-21T12:00:00Z', 'cus_qa', 'pi_qa', 'sub_qa', 'PAID', 'PAST_DUE'
  );
  if r.applied is distinct from false or r.onboarding_eligible is distinct from true then
    raise exception 'stale event must not roll state backward';
  end if;

  insert into public.llf_stripe_event_receipts (stripe_event_id, event_type, processing_status)
  values ('evt_qa_new', 'invoice.payment_failed', 'RECEIVED');

  select * into r from public.llf_apply_payment_entitlement_state(
    a, 'evt_qa_new', '2026-08-21T14:00:00Z', 'cus_qa', 'pi_qa', 'sub_qa', 'PAID', 'PAST_DUE'
  );
  if r.applied is distinct from true or r.onboarding_eligible is distinct from false then
    raise exception 'newer authoritative downgrade must revoke eligibility';
  end if;

  begin
    perform public.llf_apply_payment_entitlement_state(
      a, 'evt_qa_conflict', '2026-08-21T15:00:00Z', 'cus_other', 'pi_qa', 'sub_qa', 'PAID', 'ACTIVE'
    );
    raise exception 'expected stripe_customer_conflict';
  exception when others then
    if position('stripe_customer_conflict' in sqlerrm) = 0 then raise; end if;
  end;
end $$;

rollback;