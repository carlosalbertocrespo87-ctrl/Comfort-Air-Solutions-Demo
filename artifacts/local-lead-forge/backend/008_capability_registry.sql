-- LOCAL LEAD FORGE — CAPABILITY REGISTRY / AUTO-ACTIVATION FOUNDATION
-- INTERNAL / FAIL-CLOSED

create table if not exists llf_capability_registry (
  capability_key text primary key,
  state text not null check (state in ('DORMANT','READY','ACTIVE','BLOCKED','ADVISORY_ONLY')),
  reason text not null,
  prerequisites jsonb not null default '{}'::jsonb,
  last_evaluated_at timestamptz not null default now(),
  activated_at timestamptz,
  deactivated_at timestamptz
);

create table if not exists llf_capability_activation_events (
  id uuid primary key default gen_random_uuid(),
  capability_key text not null references llf_capability_registry(capability_key) on delete cascade,
  previous_state text,
  new_state text not null,
  reason text not null,
  evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table llf_capability_registry enable row level security;
alter table llf_capability_activation_events enable row level security;

-- Intentionally no permissive policies.
-- Only trusted backend/admin workflows may evaluate or mutate activation state.
-- User-facing sessions must never be able to activate capabilities directly.
