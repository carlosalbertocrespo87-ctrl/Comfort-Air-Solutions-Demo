-- LLF PAYMENT CORRELATION BOOTSTRAP REGRESSION TESTS
-- Run only in isolated test DB. Entire script rolls back.
begin;

insert into public.llf_legal_acceptances
  (acceptance_ref, legal_version, customer_name, customer_email, idempotency_key)
values
  ('10000000-0000-0000-0000-000000000001','test-v1','Bootstrap A','a@example.test','bootstrap-a'),
  ('10000000-0000-0000-0000-000000000002','test-v1','Bootstrap B','b@example.test','bootstrap-b');

insert into public.llf_payment_entitlements (acceptance_ref)
values
  ('10000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000002');

-- Initial customer bootstrap.
select public.llf_bootstrap_payment_correlation(
  '10000000-0000-0000-0000-000000000001','cus_test_a',null,null
);

-- Fill only previously-null setup/subscription references.
select public.llf_bootstrap_payment_correlation(
  '10000000-0000-0000-0000-000000000001','cus_test_a','pi_test_a','sub_test_a'
);

do $$
begin
  if not exists (
    select 1 from public.llf_payment_entitlements
    where acceptance_ref='10000000-0000-0000-0000-000000000001'
      and stripe_customer_ref='cus_test_a'
      and setup_payment_ref='pi_test_a'
      and subscription_ref='sub_test_a'
      and setup_status='PENDING'
      and monthly_status='PENDING'
      and onboarding_eligible=false
  ) then raise exception 'bootstrap_fill_failed'; end if;
end $$;

-- Idempotent replay of identical refs succeeds.
select public.llf_bootstrap_payment_correlation(
  '10000000-0000-0000-0000-000000000001','cus_test_a','pi_test_a','sub_test_a'
);

-- Conflicting replacement must fail.
do $$ begin
  begin
    perform public.llf_bootstrap_payment_correlation(
      '10000000-0000-0000-0000-000000000001','cus_other','pi_test_a','sub_test_a'
    );
    raise exception 'expected_customer_conflict';
  exception when others then
    if sqlerrm='expected_customer_conflict' then raise; end if;
  end;
end $$;

-- Reuse of a provider ref across acceptance contexts must fail.
do $$ begin
  begin
    perform public.llf_bootstrap_payment_correlation(
      '10000000-0000-0000-0000-000000000002','cus_test_a',null,null
    );
    raise exception 'expected_cross_acceptance_conflict';
  exception when others then
    if sqlerrm='expected_cross_acceptance_conflict' then raise; end if;
  end;
end $$;

-- Invalid prefixes must fail closed.
do $$ begin
  begin
    perform public.llf_bootstrap_payment_correlation(
      '10000000-0000-0000-0000-000000000002','bad_customer',null,null
    );
    raise exception 'expected_invalid_customer_ref';
  exception when others then
    if sqlerrm='expected_invalid_customer_ref' then raise; end if;
  end;
end $$;

rollback;