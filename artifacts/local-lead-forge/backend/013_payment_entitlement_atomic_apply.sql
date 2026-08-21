-- LOCAL LEAD FORGE — ATOMIC PAYMENT ENTITLEMENT APPLY
-- Issue #80. Server/service-role path only. No checkout creation and no onboarding trigger.

create or replace function public.llf_apply_payment_entitlement_state(
  p_acceptance_ref uuid,
  p_stripe_event_id text,
  p_event_created_at timestamptz,
  p_stripe_customer_ref text,
  p_setup_payment_ref text,
  p_subscription_ref text,
  p_setup_status text,
  p_monthly_status text
)
returns table(applied boolean, onboarding_eligible boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_row public.llf_payment_entitlements%rowtype;
  next_eligible boolean;
begin
  if p_setup_status not in ('PENDING','PAID','FAILED','REFUNDED') then
    raise exception 'invalid_setup_status';
  end if;
  if p_monthly_status not in ('PENDING','ACTIVE','PAST_DUE','CANCELED','FAILED') then
    raise exception 'invalid_monthly_status';
  end if;

  select * into current_row
    from public.llf_payment_entitlements
   where acceptance_ref = p_acceptance_ref
   for update;

  if not found then raise exception 'entitlement_not_found'; end if;

  -- Correlation is immutable once known. Conflicting provider references fail closed.
  if current_row.stripe_customer_ref is not null and p_stripe_customer_ref is not null
     and current_row.stripe_customer_ref <> p_stripe_customer_ref then raise exception 'stripe_customer_conflict'; end if;
  if current_row.setup_payment_ref is not null and p_setup_payment_ref is not null
     and current_row.setup_payment_ref <> p_setup_payment_ref then raise exception 'setup_payment_conflict'; end if;
  if current_row.subscription_ref is not null and p_subscription_ref is not null
     and current_row.subscription_ref <> p_subscription_ref then raise exception 'subscription_conflict'; end if;

  -- Older provider events cannot roll authoritative state backwards.
  if current_row.last_event_created_at is not null and p_event_created_at is not null
     and p_event_created_at < current_row.last_event_created_at then
    return query select false, current_row.onboarding_eligible;
    return;
  end if;

  next_eligible := (p_setup_status = 'PAID' and p_monthly_status = 'ACTIVE');

  update public.llf_payment_entitlements
     set stripe_customer_ref = coalesce(stripe_customer_ref, p_stripe_customer_ref),
         setup_payment_ref = coalesce(setup_payment_ref, p_setup_payment_ref),
         subscription_ref = coalesce(subscription_ref, p_subscription_ref),
         setup_status = p_setup_status,
         monthly_status = p_monthly_status,
         onboarding_eligible = next_eligible,
         last_event_created_at = greatest(coalesce(last_event_created_at, p_event_created_at), p_event_created_at),
         updated_at = now()
   where acceptance_ref = p_acceptance_ref;

  update public.llf_stripe_event_receipts
     set processing_status = 'PROCESSED', processed_at = now()
   where stripe_event_id = p_stripe_event_id;

  return query select true, next_eligible;
end;
$$;

revoke all on function public.llf_apply_payment_entitlement_state(uuid,text,timestamptz,text,text,text,text,text) from public, anon, authenticated;

comment on function public.llf_apply_payment_entitlement_state(uuid,text,timestamptz,text,text,text,text,text)
is 'Atomically applies already-authoritative Stripe state after strict acceptance correlation. Does not trigger onboarding.';