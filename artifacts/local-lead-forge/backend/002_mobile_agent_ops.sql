-- LOCAL LEAD FORGE — MOBILE AGENT OPERATIONS EXTENSION
-- INTERNAL / FAIL-CLOSED

alter table llf_conversations
  add column if not exists intent_level text not null default 'LOW',
  add column if not exists satisfaction_state text not null default 'UNKNOWN',
  add column if not exists human_requested boolean not null default false,
  add column if not exists critical_client_issue boolean not null default false,
  add column if not exists snoozed_until timestamptz,
  add column if not exists waiting_since timestamptz;

create table if not exists llf_private_agent_notes (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references llf_conversations(id) on delete cascade,
  author_agent_user_id uuid not null references llf_agent_profiles(user_id),
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists llf_internal_transfers (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references llf_conversations(id) on delete cascade,
  from_agent_user_id uuid not null references llf_agent_profiles(user_id),
  to_agent_user_id uuid not null references llf_agent_profiles(user_id),
  private_handoff_note text,
  created_at timestamptz not null default now()
);

create table if not exists llf_conversation_feedback (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references llf_conversations(id) on delete cascade,
  source text not null check (source in ('EXPLICIT_CONFIRMATION','THUMBS_UP','THUMBS_DOWN')),
  satisfied boolean not null,
  created_at timestamptz not null default now()
);

create table if not exists llf_notification_events (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references llf_conversations(id) on delete cascade,
  event_type text not null,
  dedupe_key text not null unique,
  priority text not null check (priority in ('NORMAL','HIGH','URGENT')),
  created_at timestamptz not null default now(),
  delivered_at timestamptz
);

alter table llf_private_agent_notes enable row level security;
alter table llf_internal_transfers enable row level security;
alter table llf_conversation_feedback enable row level security;
alter table llf_notification_events enable row level security;

-- Intentionally no permissive RLS policies here.
-- Agent-only notes/transfers must never be readable through prospect/client sessions.
-- Live notification delivery remains disabled until authenticated device registration and reviewed RLS policies exist.
