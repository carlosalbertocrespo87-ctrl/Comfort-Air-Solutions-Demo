-- LOCAL LEAD FORGE — KNOWLEDGE GAP AUTO-QUEUE
-- INTERNAL / FAIL-CLOSED

create table if not exists llf_knowledge_gap_queue (
  id uuid primary key default gen_random_uuid(),
  fingerprint text not null unique,
  normalized_question text not null,
  topic text not null,
  audience llf_conversation_audience not null,
  severity text not null default 'LOW' check (severity in ('LOW','MEDIUM','HIGH')),
  status text not null default 'OBSERVING' check (status in ('OBSERVING','REVIEW_READY','RESOLVED','DISMISSED')),
  occurrence_count integer not null default 0,
  distinct_conversation_count integer not null default 0,
  high_intent_count integer not null default 0,
  not_satisfied_count integer not null default 0,
  human_request_count integer not null default 0,
  recommended_action text check (recommended_action in ('ADD_KNOWLEDGE_ENTRY','IMPROVE_EXISTING_ENTRY','REVIEW_POLICY')),
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  review_ready_at timestamptz,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_llf_knowledge_gap_queue_status
  on llf_knowledge_gap_queue(status, severity, updated_at desc);

create table if not exists llf_knowledge_gap_evidence (
  id uuid primary key default gen_random_uuid(),
  gap_id uuid not null references llf_knowledge_gap_queue(id) on delete cascade,
  conversation_id uuid not null references llf_conversations(id) on delete cascade,
  source_message_id uuid references llf_conversation_messages(id) on delete set null,
  signal_id uuid references llf_conversation_signals(id) on delete set null,
  created_at timestamptz not null default now(),
  unique(gap_id, conversation_id)
);

alter table llf_knowledge_gap_queue enable row level security;
alter table llf_knowledge_gap_evidence enable row level security;

-- Intentionally no permissive policies in this migration.
-- Review queue and evidence are internal agent/admin data only.
-- No task-system integration is activated here; external task creation must be idempotent,
-- auditable, and explicitly enabled after backend/auth QA.
