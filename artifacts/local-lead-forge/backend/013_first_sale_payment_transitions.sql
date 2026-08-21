-- Authoritative first-sale payment transitions for Issue #80.
-- Server/service-role only. Browser state and redirect URLs are never authoritative.

create or replace function public.llf_apply_first_sale_stripe_event(
  p_event_id text,
  p_event_type text,
  p_event_created_at timestamptz,
  p_acceptance_ref uuid,
  p_object_id text,
  p_customer_id text default null,
  p_payment_intent_id text default null,
  p_subscription_id text default null
) returns table (
  processed boolean,
  onboarding_ready boolean,
  reason text
)
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_state public.llf_first_sale_payment_state%rowtype;
begin
  select * into v_state
  from public.llf_first_sale_payment_state
  where acceptance_ref = p_acceptance_ref
  for update;

  if not found then
    return query select false, false, 'unknown_acceptance_ref';
    return;
  end if;

  -- Ignore stale events for this acceptance reference. Event ledger still retains them.
  if v_state.last_stripe_event_created_at is not null
     and p_event_created_at < v_state.last_stripe_event_created_at then
    return query select false,
      (v_state.setup_paid_at is not null and v_state.monthly_active_at is not null),
      'stale_event';
    return;
  end if;

  if p_event_type = 'checkout.session.completed' and p_payment_intent_id is not null then
    update public.llf_first_sale_payment_state
    set stripe_customer_id = coalesce(p_customer_id, stripe_customer_id),
        setup_checkout_session_id = coalesce(setup_checkout_session_id, p_object_id),
        setup_payment_intent_id = coalesce(setup_payment_intent_id, p_payment_intent_id),
        setup_paid_at = coalesce(setup_paid_at, p_event_created_at),
        last_stripe_event_created_at = greatest(coalesce(last_stripe_event_created_at, p_event_created_at), p_event_created_at),
        updated_at = now()
    where acceptance_ref = p_acceptance_ref;
  elsif p_event_type in ('customer.subscription.created','customer.subscription.updated') and p_subscription_id is not null then
    update public.llf_first_sale_payment_state
    set stripe_customer_id = coalesce(p_customer_id, stripe_customer_id),
        monthly_subscription_id = coalesce(monthly_subscription_id, p_subscription_id),
        monthly_active_at = coalesce(monthly_active_at, p_event_created_at),
        last_stripe_event_created_at = greatest(coalesce(last_stripe_event_created_at, p_event_created_at), p_event_created_at),
        updated_at = now()
    where acceptance_ref = p_acceptance_ref;
  else
    return query select false,
      (v_state.setup_paid_at is not null and v_state.monthly_active_at is not null),
      'event_not_applicable';
    return;
  end if;

  select * into v_state
  from public.llf_first_sale_payment_state
  where acceptance_ref = p_acceptance_ref;

  return query select true,
    (v_state.setup_paid_at is not null and v_state.monthly_active_at is not null),
    case when v_state.setup_paid_at is not null and v_state.monthly_active_at is not null
      then 'payment_requirements_verified'
      else 'waiting_for_counterpart_payment'
    end;
end;
$$;

revoke all on function public.llf_apply_first_sale_stripe_event(text,text,timestamptz,uuid,text,text,text,text) from public, anon, authenticated;
grant execute on function public.llf_apply_first_sale_stripe_event(text,text,timestamptz,uuid,text,text,text,text) to service_role;
