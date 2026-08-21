-- LOCAL LEAD FORGE — CONVERSATION QA SCORE FOUNDATION
-- INTERNAL / FAIL-CLOSED

create table if not exists llf_conversation_qa_scores (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references llf_conversations(id) on delete cascade,
  score integer not null check (score between 0 and 100),
  grade text not null check (grade in ('EXCELLENT','GOOD','NEEDS_REVIEW','CRITICAL_REVIEW')),
  requires_review boolean not null default false,
  confidence_supported boolean not null,
  explicit_satisfaction text not null check (explicit_satisfaction in ('SATISFIED','NOT_SATISFIED','UNKNOWN')),
  resolved boolean not null,
  correct_escalation boolean not null,
  ai_correction_required boolean not null default false,
  human_correction_required boolean not null default false,
  handoff_complete boolean not null,
  human_response_minutes integer,
  sensitive_data_handling_ok boolean not null default true,
  reasons jsonb not null default '[]'::jsonb,
  scored_at timestamptz not null default now(),
  scored_by text not null default 'SYSTEM',
  unique(conversation_id, scored_at)
);

create index if not exists idx_llf_conversation_qa_scores_conversation
  on llf_conversation_qa_scores(conversation_id, scored_at desc);

create index if not exists idx_llf_conversation_qa_scores_review
  on llf_conversation_qa_scores(requires_review, scored_at desc);

alter table llf_conversation_qa_scores enable row level security;

-- Intentionally no permissive policy here.
-- QA results are internal operational data and must only be readable by authorized LLF agents/admins.

create or replace view llf_conversation_qa_daily as
select
  date_trunc('day', scored_at) as day,
  count(*) as scored_conversations,
  round(avg(score)::numeric, 2) as average_score,
  count(*) filter (where grade = 'EXCELLENT') as excellent_count,
  count(*) filter (where grade = 'GOOD') as good_count,
  count(*) filter (where grade = 'NEEDS_REVIEW') as needs_review_count,
  count(*) filter (where grade = 'CRITICAL_REVIEW') as critical_review_count,
  count(*) filter (where ai_correction_required) as ai_correction_count,
  count(*) filter (where human_correction_required) as human_correction_count,
  count(*) filter (where not sensitive_data_handling_ok) as sensitive_data_failure_count
from llf_conversation_qa_scores
group by date_trunc('day', scored_at);
