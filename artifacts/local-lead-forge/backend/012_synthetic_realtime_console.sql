-- LOCAL LEAD FORGE — SYNTHETIC REALTIME AGENT CONSOLE
-- Authenticated QA only. No live customer traffic or outbound messaging.

alter table public.llf_conversations
  add column if not exists is_synthetic boolean not null default false;

create index if not exists idx_llf_conversations_synthetic_status
  on public.llf_conversations (is_synthetic, status, updated_at desc);

-- Private Realtime authorization. The browser may receive only a fixed refresh
-- signal; conversation data is still fetched through llf-agent-ops after its
-- user and trusted-device checks.
grant select on table realtime.messages to authenticated;

drop policy if exists llf_synthetic_console_receive on realtime.messages;
create policy llf_synthetic_console_receive
on realtime.messages for select
to authenticated
using (
  extension = 'broadcast'
  and (select realtime.topic()) = 'llf-agent-console-synthetic'
  and exists (
    select 1
      from public.llf_agent_profiles agent
     where agent.user_id = (select auth.uid())
       and agent.is_active = true
  )
);

create or replace function public.llf_notify_synthetic_console()
returns trigger
language plpgsql
security definer
set search_path = public, realtime
as $$
declare
  synthetic boolean;
begin
  if tg_table_name = 'llf_conversations' then
    synthetic := coalesce(new.is_synthetic, old.is_synthetic, false);
  else
    select c.is_synthetic into synthetic
      from public.llf_conversations c
     where c.id = coalesce(new.conversation_id, old.conversation_id);
  end if;

  if synthetic then
    perform realtime.send(
      jsonb_build_object('reason', lower(tg_op), 'entity', tg_table_name),
      'refresh',
      'llf-agent-console-synthetic',
      true
    );
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

revoke all on function public.llf_notify_synthetic_console() from public;

drop trigger if exists llf_synthetic_conversation_refresh on public.llf_conversations;
create trigger llf_synthetic_conversation_refresh
after insert or update or delete on public.llf_conversations
for each row execute function public.llf_notify_synthetic_console();

drop trigger if exists llf_synthetic_message_refresh on public.llf_conversation_messages;
create trigger llf_synthetic_message_refresh
after insert or update or delete on public.llf_conversation_messages
for each row execute function public.llf_notify_synthetic_console();

insert into public.llf_conversations (
  id, audience, channel, status, contact_name, company_name,
  handoff_reason, handoff_user_intent, handoff_unresolved_question,
  handoff_suggested_next_action, human_requested, waiting_since, is_synthetic
) values
(
  '10000000-0000-4000-8000-000000000001', 'CLIENT', 'CLIENT_PORTAL',
  'WAITING_FOR_AGENT', '[QA] Alex', '[QA] ABC Heating & Air',
  'Synthetic lead-routing change requires an authorized human action.',
  'Validate the synthetic lead-delivery workflow',
  'Which synthetic destination should receive future test leads?',
  'Claim this QA chat and resolve it after checking the protected workflow.',
  true, now(), true
),
(
  '10000000-0000-4000-8000-000000000002', 'PROSPECT', 'PUBLIC_WEB',
  'WAITING_FOR_AGENT', '[QA] Jordan', '[QA] Peachtree HVAC',
  'Synthetic high-intent prospect requested a human specialist.',
  'Validate the synthetic implementation-timeline handoff',
  'What approved test timeline should be shown in this QA scenario?',
  'Claim this QA chat and resolve it without sending any external message.',
  true, now(), true
)
on conflict (id) do update set
  audience = excluded.audience,
  channel = excluded.channel,
  contact_name = excluded.contact_name,
  company_name = excluded.company_name,
  handoff_reason = excluded.handoff_reason,
  handoff_user_intent = excluded.handoff_user_intent,
  handoff_unresolved_question = excluded.handoff_unresolved_question,
  handoff_suggested_next_action = excluded.handoff_suggested_next_action,
  human_requested = excluded.human_requested,
  is_synthetic = true,
  updated_at = now();

insert into public.llf_conversation_messages
  (id, conversation_id, author, author_label, body, created_at)
values
  ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'VISITOR', '[QA] Alex', 'Synthetic request: change the destination for future test leads.', now() - interval '4 minutes'),
  ('20000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001', 'AI', 'LLF AI Assistant · QA', 'This is a synthetic handoff. No customer or external system will be contacted.', now() - interval '3 minutes'),
  ('20000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000002', 'VISITOR', '[QA] Jordan', 'Synthetic request: explain the test implementation timeline.', now() - interval '2 minutes'),
  ('20000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000002', 'AI', 'LLF AI Assistant · QA', 'A synthetic LLF specialist handoff has been prepared for validation.', now() - interval '1 minute')
on conflict (id) do update set
  author = excluded.author,
  author_label = excluded.author_label,
  body = excluded.body;

insert into public.llf_conversation_handoff_facts (id, conversation_id, fact)
values
  ('30000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'Synthetic client scenario'),
  ('30000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001', 'No external delivery destination is changed'),
  ('30000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000002', 'Synthetic prospect scenario'),
  ('30000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000002', 'No sales promise or outbound message is sent')
on conflict (id) do update set fact = excluded.fact;

-- Realtime remains capability-gated until two-device QA is complete.
update public.llf_capability_registry
   set reason = 'Private synthetic Realtime integration installed; activation waits for two-device authenticated QA.',
       last_evaluated_at = now()
 where capability_key = 'REALTIME_CONVERSATIONS';
