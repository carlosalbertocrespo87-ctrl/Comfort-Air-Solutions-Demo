-- Local Lead Forge — first-sale payment runtime foundation
-- Fail-closed durable evidence model for Issue #80.
-- This migration stores only non-sensitive Stripe references; never card/bank credentials.

create table if not exists public.llf_legal_acceptances (
  id uuid primary key default gen_random_uuid(),
  acceptance_ref uuid not null default gen_random_uuid() unique,
  client_account_id uuid,
  customer_email text not null,
  company_name text not null,
  legal_version text not null,
  accepted_at timestamptz not null default now(),
  source text not null default 'server',
  idempotency_key text not null unique,
  created_at timestamptz not null default now(),
  constraint llf_legal_acceptances_source_server check (source = 'server')
);

create table if not exists public.llf_first_sale_payment_state (
  id uuid primary key default gen_random_uuid(),
  acceptance_ref uuid not null references public.llf_legal_acceptances(acceptance_ref),
  stripe_customer_id text,
  setup_checkout_session_id text unique,
  setup_payment_intent_id text unique,
  setup_paid_at timestamptz,
  monthly_subscription_id text unique,
  monthly_checkout_session_id text unique,
  monthly_active_at timestamptz,
  onboarding_released_at timestamptz,
  last_stripe_event_created_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint llf_onboarding_requires_setup_and_monthly check (
    onboarding_released_at is null or (setup_paid_at is not null and monthly_active_at is not null)
  )
);

create table if not exists public.llf_stripe_event_ledger (
  stripe_event_id text primary key,
  stripe_event_type text not null,
  stripe_event_created_at timestamptz not null,
  object_ref text,
  processing_status text not null default 'RECEIVED',
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint llf_stripe_event_status check (processing_status in ('RECEIVED','PROCESSED','IGNORED','FAILED'))
);

alter table public.llf_legal_acceptances enable row level security;
alter table public.llf_first_sale_payment_state enable row level security;
alter table public.llf_stripe_event_ledger enable row level security;

-- Deliberately no anon/authenticated policies. These tables are server-only and fail closed.
revoke all on public.llf_legal_acceptances from anon, authenticated;
revoke all on public.llf_first_sale_payment_state from anon, authenticated;
revoke all on public.llf_stripe_event_ledger from anon, authenticated;

comment on table public.llf_legal_acceptances is 'Server-side durable legal acceptance evidence. No browser-local evidence is authoritative.';
comment on table public.llf_first_sale_payment_state is 'Authoritative first-sale setup + monthly state. Onboarding cannot release until both are verified.';
comment on table public.llf_stripe_event_ledger is 'Idempotent Stripe event ledger keyed by Stripe event ID.';
