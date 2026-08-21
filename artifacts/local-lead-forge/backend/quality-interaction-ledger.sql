-- LOCAL LEAD FORGE — QUALITY INTERACTION LEDGER
-- INTERNAL / FAIL-CLOSED
-- Purpose: preserve complete operational interaction history for QA, support continuity, audit and improvement.

create table if not exists llf_interaction_ledger (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references llf_conversations(id) on delete set null,
  audience llf_conversation_audience not null,
  channel llf_conversation_channel not null,
  interaction_type text not null check (interaction_type in (
    'USER_MESSAGE',
    'AI_MESSAGE',
    'AGENT_MESSAGE',
    'HUMAN_REQUEST',
    'HANDOFF',
    'CLAIM',
    'TRANSFER',
    'STATUS_CHANGE',
    'FEEDBACK',
    'RESOLUTION',
    'KNOWLEDGE_GAP',
    'SYSTEM_EVENT'
  )),
  actor_type text not null check (actor_type in ('PROSPECT','CLIENT','AI','AGENT','SYSTEM')),
  actor_user_id uuid,
  actor_label text,
  message_id uuid references llf_conversation_messages(id) on delete set null,
  content_excerpt text,
  outcome text,
  satisfaction text,
  intent_level text,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  recorded_at timestamptz not null default now()
);

create index if not exists idx_llf_interaction_ledger_conversation
  on llf_interaction_ledger(conversation_id, occurred_at);

create index if not exists idx_llf_interaction_ledger_quality
  on llf_interaction_ledger(interaction_type, occurred_at desc);

alter table llf_interaction_ledger enable row level security;

-- QA/privacy design:
-- - full conversation content remains in the conversation/messages tables;
-- - ledger stores traceability and minimal excerpts/metadata needed for quality review;
-- - private notes remain separate and agent-only;
-- - access to analytics/ledger is internal and least-privilege;
-- - retention/deletion periods must be configurable and aligned with approved privacy/legal policy before production;
-- - do not log secrets, passwords, payment credentials, auth tokens, or raw device identifiers;
-- - redact sensitive fields before analytics export where feasible.

create or replace view llf_quality_daily as
select
  date_trunc('day', occurred_at) as day,
  count(*) as interaction_events,
  count(distinct conversation_id) as conversations,
  count(*) filter (where interaction_type = 'HUMAN_REQUEST') as human_requests,
  count(*) filter (where interaction_type = 'HANDOFF') as handoffs,
  count(*) filter (where interaction_type = 'RESOLUTION') as resolutions,
  count(*) filter (where interaction_type = 'KNOWLEDGE_GAP') as knowledge_gap_events
from llf_interaction_ledger
group by date_trunc('day', occurred_at);
