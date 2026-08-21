-- LOCAL LEAD FORGE — CONVERSATION INTELLIGENCE FOUNDATION
-- INTERNAL / FAIL-CLOSED

create type if not exists llf_conversation_topic as enum (
  'PRICING',
  'IMPLEMENTATION',
  'CONTRACT_TERMS',
  'LEAD_DELIVERY',
  'REPORTING',
  'SUPPORT',
  'SECURITY_PRIVACY',
  'BILINGUAL_SUPPORT',
  'INTEGRATIONS',
  'OTHER'
);

create table if not exists llf_conversation_signals (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references llf_conversations(id) on delete cascade,
  audience llf_conversation_audience not null,
  topic llf_conversation_topic not null default 'OTHER',
  intent_level text not null default 'LOW' check (intent_level in ('LOW','MEDIUM','HIGH','READY_TO_BUY')),
  satisfaction text not null default 'UNKNOWN' check (satisfaction in ('UNKNOWN','SATISFIED','NOT_SATISFIED')),
  human_requested boolean not null default false,
  repeated_question boolean not null default false,
  knowledge_gap_detected boolean not null default false,
  objection text,
  source_message_id uuid references llf_conversation_messages(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_llf_conversation_signals_conversation
  on llf_conversation_signals(conversation_id, created_at desc);

create index if not exists idx_llf_conversation_signals_topic
  on llf_conversation_signals(topic, created_at desc);

create index if not exists idx_llf_conversation_signals_intent
  on llf_conversation_signals(intent_level, created_at desc);

alter table llf_conversation_signals enable row level security;

-- No permissive policy is added here. Analytics access remains agent/admin only
-- after deployment-specific RLS has been reviewed and approved.

create or replace view llf_conversation_intelligence_daily as
select
  date_trunc('day', created_at) as day,
  count(distinct conversation_id) as conversations,
  count(*) filter (where intent_level in ('HIGH','READY_TO_BUY')) as high_intent_signals,
  count(*) filter (where intent_level = 'READY_TO_BUY') as ready_to_buy_signals,
  count(*) filter (where human_requested) as human_request_signals,
  count(*) filter (where satisfaction = 'SATISFIED') as satisfied_signals,
  count(*) filter (where satisfaction = 'NOT_SATISFIED') as not_satisfied_signals,
  count(*) filter (where knowledge_gap_detected) as knowledge_gap_signals
from llf_conversation_signals
group by date_trunc('day', created_at);
