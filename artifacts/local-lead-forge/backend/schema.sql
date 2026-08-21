-- LOCAL LEAD FORGE — SUPPORT BACKEND SCHEMA FOUNDATION
-- INTERNAL / FAIL-CLOSED
-- Intended for a PostgreSQL/Supabase-style backend after environment review.

create extension if not exists pgcrypto;

create type llf_conversation_audience as enum ('PROSPECT', 'CLIENT');
create type llf_conversation_channel as enum ('PUBLIC_WEB', 'CLIENT_PORTAL');
create type llf_conversation_status as enum ('AI_ACTIVE', 'WAITING_FOR_AGENT', 'AGENT_ACTIVE', 'RESOLVED');
create type llf_message_author as enum ('VISITOR', 'AI', 'AGENT', 'SYSTEM');
create type llf_agent_availability as enum ('AVAILABLE', 'BUSY', 'OFFLINE');

create table if not exists llf_agent_profiles (
  user_id uuid primary key,
  display_name text not null,
  role_label text not null default 'LLF Specialist',
  availability llf_agent_availability not null default 'OFFLINE',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists llf_conversations (
  id uuid primary key default gen_random_uuid(),
  audience llf_conversation_audience not null,
  channel llf_conversation_channel not null,
  status llf_conversation_status not null default 'AI_ACTIVE',
  contact_name text,
  company_name text,
  client_account_id uuid,
  visitor_access_token_hash text,
  assigned_agent_user_id uuid references llf_agent_profiles(user_id),
  handoff_reason text,
  handoff_user_intent text,
  handoff_unresolved_question text,
  handoff_suggested_next_action text,
  claimed_at timestamptz,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists llf_conversation_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references llf_conversations(id) on delete cascade,
  author llf_message_author not null,
  author_user_id uuid,
  author_label text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists llf_conversation_handoff_facts (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references llf_conversations(id) on delete cascade,
  fact text not null,
  created_at timestamptz not null default now()
);

create table if not exists llf_agent_audit_log (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references llf_conversations(id) on delete set null,
  agent_user_id uuid references llf_agent_profiles(user_id),
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists llf_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  agent_user_id uuid not null references llf_agent_profiles(user_id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  device_label text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(agent_user_id, endpoint)
);

-- Atomic claim foundation: only the first eligible active agent wins.
-- This base function is NOT executable by PUBLIC. The authenticated deployment
-- migration replaces it with auth.uid()-bound verification before granting execute.
create or replace function llf_claim_conversation(p_conversation_id uuid, p_agent_user_id uuid)
returns llf_conversations
language plpgsql
security definer
set search_path = public
as $$
declare
  claimed llf_conversations;
begin
  if not exists (
    select 1 from llf_agent_profiles
     where user_id = p_agent_user_id
       and is_active = true
  ) then
    raise exception 'active_agent_required';
  end if;

  update llf_conversations
     set status = 'AGENT_ACTIVE',
         assigned_agent_user_id = p_agent_user_id,
         claimed_at = now(),
         updated_at = now()
   where id = p_conversation_id
     and status = 'WAITING_FOR_AGENT'
     and assigned_agent_user_id is null
  returning * into claimed;

  if claimed.id is null then
    raise exception 'conversation_not_claimable';
  end if;

  insert into llf_agent_audit_log(conversation_id, agent_user_id, action)
  values (p_conversation_id, p_agent_user_id, 'CLAIM_CONVERSATION');

  return claimed;
end;
$$;

-- Fail closed at the base layer: no browser/client role receives execute here.
revoke all on function llf_claim_conversation(uuid, uuid) from public;

-- Security remains deny-by-default until deployment-specific RLS policies are reviewed.
alter table llf_agent_profiles enable row level security;
alter table llf_conversations enable row level security;
alter table llf_conversation_messages enable row level security;
alter table llf_conversation_handoff_facts enable row level security;
alter table llf_agent_audit_log enable row level security;
alter table llf_push_subscriptions enable row level security;

-- Intentionally no permissive RLS policies in this foundation migration.
-- Production activation requires explicit reviewed policies for:
-- 1) authenticated LLF agents,
-- 2) authenticated clients bound to their account,
-- 3) public visitors through a server-mediated scoped token.
