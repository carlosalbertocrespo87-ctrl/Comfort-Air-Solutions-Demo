-- LOCAL LEAD FORGE — PAYMENT / LEGAL ACCEPTANCE FOUNDATION
-- Issue #80 foundation only. No live checkout, no Stripe secrets, no onboarding trigger.

create table if not exists public.llf_legal_acceptances (
  id uuid primary key default gen_random_uuid(),
  acceptance_ref uuid not null default gen_random_uuid() unique,
  legal_version text not null,
  customer_name text not null,
  company_name text,
  customer_email text,
  accepted_at timestamptz not null default now(),
  source text not null default 'server',
  created_at timestamptz not null default now()
);

create table if not exists public.llf_payment_entitlements (
  id uuid primary key default gen_random_uuid(),
  acceptance_ref uuid not null references public.llf_legal_acceptances(acceptance_ref),
  stripe_customer_ref text,
  setup_payment_ref text,
  subscription_ref text,
  setup_status text not null default 'PENDING' check (setup_status in ('PENDING','PAID','FAILED','REFUNDED')),
  monthly_status text not null default 'PENDING' check (monthly_status in ('PENDING','ACTIVE','PAST_DUE','CANCELED','FAILED')),
  onboarding_eligible boolean not null default false,
  last_event_created_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (acceptance_ref)
);

create table if not exists public.llf_stripe_event_receipts (
  stripe_event_id text primary key,
  event_type text not null,
  event_created_at timestamptz,
  object_ref text,
  payload_sha256 text,
  processed_at timestamptz,
  processing_status text not null default 'RECEIVED' check (processing_status in ('RECEIVED','PROCESSED','IGNORED','FAILED')),
  created_at timestamptz not null default now()
);

create or replace function public.llf_recompute_onboarding_eligibility(p_acceptance_ref uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  eligible boolean;
begin
  update public.llf_payment_entitlements
     set onboarding_eligible = (setup_status = 'PAID' and monthly_status = 'ACTIVE'),
         updated_at = now()
   where acceptance_ref = p_acceptance_ref
   returning onboarding_eligible into eligible;

  return coalesce(eligible, false);
end;
$$;

revoke all on function public.llf_recompute_onboarding_eligibility(uuid) from public;

alter table public.llf_legal_acceptances enable row level security;
alter table public.llf_payment_entitlements enable row level security;
alter table public.llf_stripe_event_receipts enable row level security;

revoke all on public.llf_legal_acceptances from anon, authenticated;
revoke all on public.llf_payment_entitlements from anon, authenticated;
revoke all on public.llf_stripe_event_receipts from anon, authenticated;

comment on table public.llf_legal_acceptances is 'Durable server-side evidence of customer legal acceptance. Do not store card/bank data.';
comment on table public.llf_payment_entitlements is 'Authoritative entitlement state. Onboarding is eligible only after setup PAID + monthly ACTIVE.';
comment on table public.llf_stripe_event_receipts is 'Idempotency/audit ledger for Stripe webhook event IDs.';
