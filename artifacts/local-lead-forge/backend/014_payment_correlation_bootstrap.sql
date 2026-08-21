-- LOCAL LEAD FORGE — PAYMENT CORRELATION BOOTSTRAP
-- Issue #80. Server/service-role only. Persists provider references; does not create Stripe objects or charge.

create or replace function public.llf_bootstrap_payment_correlation(
  p_acceptance_ref uuid,
  p_stripe_customer_ref text,
  p_setup_payment_ref text default null,
  p_subscription_ref text default null
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_row public.llf_payment_entitlements%rowtype;
begin
  if p_stripe_customer_ref is null or p_stripe_customer_ref !~ '^cus_' then
    raise exception 'invalid_stripe_customer_ref';
  end if;
  if p_setup_payment_ref is not null and p_setup_payment_ref !~ '^pi_' then
    raise exception 'invalid_setup_payment_ref';
  end if;
  if p_subscription_ref is not null and p_subscription_ref !~ '^sub_' then
    raise exception 'invalid_subscription_ref';
  end if;

  select * into current_row
    from public.llf_payment_entitlements
   where acceptance_ref = p_acceptance_ref
   for update;
  if not found then raise exception 'entitlement_not_found'; end if;

  -- Existing correlations are immutable except for filling a previously-null reference.
  if current_row.stripe_customer_ref is not null and current_row.stripe_customer_ref <> p_stripe_customer_ref then
    raise exception 'stripe_customer_conflict';
  end if;
  if current_row.setup_payment_ref is not null and p_setup_payment_ref is not null and current_row.setup_payment_ref <> p_setup_payment_ref then
    raise exception 'setup_payment_conflict';
  end if;
  if current_row.subscription_ref is not null and p_subscription_ref is not null and current_row.subscription_ref <> p_subscription_ref then
    raise exception 'subscription_conflict';
  end if;

  -- Provider references must not already belong to a different acceptance context.
  if exists (select 1 from public.llf_payment_entitlements where acceptance_ref <> p_acceptance_ref and stripe_customer_ref = p_stripe_customer_ref) then
    raise exception 'stripe_customer_already_correlated';
  end if;
  if p_setup_payment_ref is not null and exists (select 1 from public.llf_payment_entitlements where acceptance_ref <> p_acceptance_ref and setup_payment_ref = p_setup_payment_ref) then
    raise exception 'setup_payment_already_correlated';
  end if;
  if p_subscription_ref is not null and exists (select 1 from public.llf_payment_entitlements where acceptance_ref <> p_acceptance_ref and subscription_ref = p_subscription_ref) then
    raise exception 'subscription_already_correlated';
  end if;

  update public.llf_payment_entitlements
     set stripe_customer_ref = coalesce(stripe_customer_ref, p_stripe_customer_ref),
         setup_payment_ref = coalesce(setup_payment_ref, p_setup_payment_ref),
         subscription_ref = coalesce(subscription_ref, p_subscription_ref),
         updated_at = now()
   where acceptance_ref = p_acceptance_ref;

  return true;
end;
$$;

revoke all on function public.llf_bootstrap_payment_correlation(uuid,text,text,text) from public, anon, authenticated;

comment on function public.llf_bootstrap_payment_correlation(uuid,text,text,text)
is 'Persists immutable Stripe correlation references after server-side Stripe object creation. Never infers correlation from email/name/amount and never creates or charges Stripe objects.';