-- LOCAL LEAD FORGE — AUTH + RLS FOUNDATION
-- INTERNAL / FAIL-CLOSED
-- Target: Supabase/PostgreSQL-style authenticated deployment.
-- This migration does not enable the frontend live-backend feature flags.

-- Client-account identity mapping. A user may belong to one client account.
create table if not exists llf_client_memberships (
  user_id uuid primary key,
  client_account_id uuid not null,
  display_name text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table llf_client_memberships enable row level security;

-- SECURITY DEFINER helpers centralize authorization checks.
-- They never accept a caller-supplied identity as proof of authorization.
create or replace function llf_is_active_agent()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
      from llf_agent_profiles p
     where p.user_id = auth.uid()
       and p.is_active = true
  );
$$;

create or replace function llf_current_client_account_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select m.client_account_id
    from llf_client_memberships m
   where m.user_id = auth.uid()
     and m.is_active = true
   limit 1;
$$;

revoke all on function llf_is_active_agent() from public;
revoke all on function llf_current_client_account_id() from public;
grant execute on function llf_is_active_agent() to authenticated;
grant execute on function llf_current_client_account_id() to authenticated;

-- Agent profiles: active agents can see the team presence list; each agent may
-- update only their own availability/profile row through authenticated context.
drop policy if exists llf_agent_profiles_select_agents on llf_agent_profiles;
create policy llf_agent_profiles_select_agents
on llf_agent_profiles for select
to authenticated
using (llf_is_active_agent());

drop policy if exists llf_agent_profiles_update_self on llf_agent_profiles;
create policy llf_agent_profiles_update_self
on llf_agent_profiles for update
to authenticated
using (user_id = auth.uid() and llf_is_active_agent())
with check (user_id = auth.uid() and llf_is_active_agent());

-- Client membership is intentionally private. Clients can only read their own row;
-- agents may read memberships for support context.
drop policy if exists llf_client_memberships_select_self_or_agent on llf_client_memberships;
create policy llf_client_memberships_select_self_or_agent
on llf_client_memberships for select
to authenticated
using (user_id = auth.uid() or llf_is_active_agent());

-- Conversations:
-- * active LLF agents can see all support conversations;
-- * authenticated clients can see only CLIENT_PORTAL conversations bound to
--   their own client_account_id;
-- * anonymous/public prospect conversations have NO direct database RLS path.
--   They must be created/read through a server-mediated scoped API.
drop policy if exists llf_conversations_select_agent_or_client on llf_conversations;
create policy llf_conversations_select_agent_or_client
on llf_conversations for select
to authenticated
using (
  llf_is_active_agent()
  or (
    audience = 'CLIENT'
    and channel = 'CLIENT_PORTAL'
    and client_account_id is not null
    and client_account_id = llf_current_client_account_id()
  )
);

-- Conversation updates are agent-only. Client/visitor message actions should not
-- be able to mutate assignment, status, handoff or resolution fields directly.
drop policy if exists llf_conversations_update_agent_only on llf_conversations;
create policy llf_conversations_update_agent_only
on llf_conversations for update
to authenticated
using (llf_is_active_agent())
with check (llf_is_active_agent());

-- Messages: agents may read all. Authenticated clients may read only messages in
-- their own client conversation. Inserts from clients remain server-mediated in
-- this foundation so author/body attribution and moderation cannot be forged.
drop policy if exists llf_messages_select_agent_or_client on llf_conversation_messages;
create policy llf_messages_select_agent_or_client
on llf_conversation_messages for select
to authenticated
using (
  llf_is_active_agent()
  or exists (
    select 1
      from llf_conversations c
     where c.id = llf_conversation_messages.conversation_id
       and c.audience = 'CLIENT'
       and c.channel = 'CLIENT_PORTAL'
       and c.client_account_id = llf_current_client_account_id()
  )
);

-- Direct message inserts/updates/deletes stay denied by omission. Production
-- message sends go through a reviewed server/RPC layer that derives author from auth.

-- Handoff facts are internal agent context only.
drop policy if exists llf_handoff_facts_agent_only on llf_conversation_handoff_facts;
create policy llf_handoff_facts_agent_only
on llf_conversation_handoff_facts for select
to authenticated
using (llf_is_active_agent());

-- Audit history is internal only and append-only through trusted functions/server.
drop policy if exists llf_agent_audit_select_agents on llf_agent_audit_log;
create policy llf_agent_audit_select_agents
on llf_agent_audit_log for select
to authenticated
using (llf_is_active_agent());

-- Push subscriptions: an authenticated active agent can see/manage only their own
-- device registrations. The push sender itself remains server-side.
drop policy if exists llf_push_select_self on llf_push_subscriptions;
create policy llf_push_select_self
on llf_push_subscriptions for select
to authenticated
using (agent_user_id = auth.uid() and llf_is_active_agent());

drop policy if exists llf_push_insert_self on llf_push_subscriptions;
create policy llf_push_insert_self
on llf_push_subscriptions for insert
to authenticated
with check (agent_user_id = auth.uid() and llf_is_active_agent());

drop policy if exists llf_push_update_self on llf_push_subscriptions;
create policy llf_push_update_self
on llf_push_subscriptions for update
to authenticated
using (agent_user_id = auth.uid() and llf_is_active_agent())
with check (agent_user_id = auth.uid() and llf_is_active_agent());

drop policy if exists llf_push_delete_self on llf_push_subscriptions;
create policy llf_push_delete_self
on llf_push_subscriptions for delete
to authenticated
using (agent_user_id = auth.uid() and llf_is_active_agent());

-- Harden the atomic claim function from schema.sql. The caller-provided agent id
-- is retained for compatibility but MUST equal auth.uid(), and the caller must
-- be an active agent. This prevents a browser from claiming a conversation as
-- another LLF specialist.
create or replace function llf_claim_conversation(p_conversation_id uuid, p_agent_user_id uuid)
returns llf_conversations
language plpgsql
security definer
set search_path = public
as $$
declare
  claimed llf_conversations;
begin
  if auth.uid() is null then
    raise exception 'authentication_required';
  end if;

  if p_agent_user_id is distinct from auth.uid() then
    raise exception 'agent_identity_mismatch';
  end if;

  if not llf_is_active_agent() then
    raise exception 'active_agent_required';
  end if;

  update llf_conversations
     set status = 'AGENT_ACTIVE',
         assigned_agent_user_id = auth.uid(),
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
  values (p_conversation_id, auth.uid(), 'CLAIM_CONVERSATION');

  return claimed;
end;
$$;

revoke all on function llf_claim_conversation(uuid, uuid) from public;
grant execute on function llf_claim_conversation(uuid, uuid) to authenticated;

-- Conversation Intelligence and Knowledge Gap Queue are internal operations data.
-- These tables may not exist if migrations are being applied independently, so
-- their RLS policies belong in their own follow-up deployment migration after
-- schema ordering is validated. Until then they already have RLS enabled with no
-- permissive policy and therefore remain deny-by-default.

-- IMPORTANT:
-- 1. No anon policies are intentionally created.
-- 2. Public website prospects use a server-mediated scoped conversation token.
-- 3. No service-role key may be shipped to the browser/PWA.
-- 4. These policies do not activate live messaging, AI, realtime, or push flags.
-- 5. Environment-specific migration ordering and integration tests are required
--    before production activation.
