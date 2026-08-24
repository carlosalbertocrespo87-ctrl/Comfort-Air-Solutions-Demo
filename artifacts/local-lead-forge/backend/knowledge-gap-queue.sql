-- LOCAL LEAD FORGE — KNOWLEDGE GAP AUTO-QUEUE
-- INTERNAL / FAIL-CLOSED

create table if not exists llf_knowledge_gap_queue (
  id uuid primary key default gen_random_uuid(),
  fingerprint text not null unique,
  normalized_question text not null,
  detected_language text not null default 'EN' check (detected_language in ('EN','ES')),
  topic text not null,
  audience llf_conversation_audience not null,
  severity text not null default 'LOW' check (severity in ('LOW','MEDIUM','HIGH')),
  status text not null default 'OBSERVING' check (status in ('OBSERVING','REVIEW_READY','RESOLVED','DISMISSED','MERGED','ARCHIVED')),
  answer_status text not null default 'DRAFT_ONLY' check (answer_status in ('DRAFT_ONLY','ARCHIVED')),
  draft_answer text,
  review_notes text,
  merged_into_gap_id uuid references llf_knowledge_gap_queue(id) on delete restrict,
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
  archived_at timestamptz,
  updated_by_agent_user_id uuid references llf_agent_profiles(user_id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_llf_knowledge_gap_queue_status
  on llf_knowledge_gap_queue(status, severity, updated_at desc);

create index if not exists idx_llf_knowledge_gap_queue_merge_target
  on llf_knowledge_gap_queue(merged_into_gap_id)
  where merged_into_gap_id is not null;

create table if not exists llf_knowledge_gap_evidence (
  id uuid primary key default gen_random_uuid(),
  gap_id uuid not null references llf_knowledge_gap_queue(id) on delete cascade,
  conversation_id uuid not null references llf_conversations(id) on delete cascade,
  source_message_id uuid references llf_conversation_messages(id) on delete set null,
  signal_id uuid references llf_conversation_signals(id) on delete set null,
  created_at timestamptz not null default now(),
  unique(gap_id, conversation_id)
);

-- The unique(gap_id, conversation_id) index covers gap_id. Separate indexes are
-- required for the remaining foreign-key delete paths because Postgres does not
-- create indexes for referencing columns automatically.
create index if not exists idx_llf_knowledge_gap_evidence_conversation
  on llf_knowledge_gap_evidence(conversation_id);

create index if not exists idx_llf_knowledge_gap_evidence_source_message
  on llf_knowledge_gap_evidence(source_message_id)
  where source_message_id is not null;

create index if not exists idx_llf_knowledge_gap_evidence_signal
  on llf_knowledge_gap_evidence(signal_id)
  where signal_id is not null;

alter table llf_knowledge_gap_queue enable row level security;
alter table llf_knowledge_gap_evidence enable row level security;

-- Defense in depth: this source remains internal-only even if Data API exposure
-- defaults or grants differ between projects. A future access policy must be a
-- separately reviewed release migration.
revoke all on table llf_knowledge_gap_queue from anon, authenticated;
revoke all on table llf_knowledge_gap_evidence from anon, authenticated;

-- Existing installations stay deny-by-default while gaining the controlled-review fields.
alter table llf_knowledge_gap_queue add column if not exists detected_language text not null default 'EN';
alter table llf_knowledge_gap_queue add column if not exists answer_status text not null default 'DRAFT_ONLY';
alter table llf_knowledge_gap_queue add column if not exists draft_answer text;
alter table llf_knowledge_gap_queue add column if not exists review_notes text;
alter table llf_knowledge_gap_queue add column if not exists merged_into_gap_id uuid references llf_knowledge_gap_queue(id) on delete restrict;
alter table llf_knowledge_gap_queue add column if not exists archived_at timestamptz;
alter table llf_knowledge_gap_queue add column if not exists updated_by_agent_user_id uuid references llf_agent_profiles(user_id) on delete set null;

create index if not exists idx_llf_knowledge_gap_queue_updated_by_agent
  on llf_knowledge_gap_queue(updated_by_agent_user_id)
  where updated_by_agent_user_id is not null;

alter table llf_knowledge_gap_queue drop constraint if exists llf_knowledge_gap_queue_status_check;
alter table llf_knowledge_gap_queue
  add constraint llf_knowledge_gap_queue_status_check
  check (status in ('OBSERVING','REVIEW_READY','RESOLVED','DISMISSED','MERGED','ARCHIVED'));

alter table llf_knowledge_gap_queue drop constraint if exists llf_knowledge_gap_queue_detected_language_check;
alter table llf_knowledge_gap_queue
  add constraint llf_knowledge_gap_queue_detected_language_check
  check (detected_language in ('EN','ES'));

alter table llf_knowledge_gap_queue drop constraint if exists llf_knowledge_gap_queue_answer_status_check;
alter table llf_knowledge_gap_queue
  add constraint llf_knowledge_gap_queue_answer_status_check
  check (answer_status in ('DRAFT_ONLY','ARCHIVED'));

alter table llf_knowledge_gap_queue drop constraint if exists llf_knowledge_gap_review_ready_evidence_check;
alter table llf_knowledge_gap_queue
  add constraint llf_knowledge_gap_review_ready_evidence_check
  check (
    status <> 'REVIEW_READY'
    or (
      answer_status = 'DRAFT_ONLY'
      and nullif(btrim(draft_answer), '') is not null
      and distinct_conversation_count >= 3
    )
  );

alter table llf_knowledge_gap_queue drop constraint if exists llf_knowledge_gap_draft_length_check;
alter table llf_knowledge_gap_queue
  add constraint llf_knowledge_gap_draft_length_check
  check (draft_answer is null or char_length(draft_answer) <= 2000);

alter table llf_knowledge_gap_queue drop constraint if exists llf_knowledge_gap_review_notes_length_check;
alter table llf_knowledge_gap_queue
  add constraint llf_knowledge_gap_review_notes_length_check
  check (review_notes is null or char_length(review_notes) <= 1000);

alter table llf_knowledge_gap_queue drop constraint if exists llf_knowledge_gap_identity_check;
alter table llf_knowledge_gap_queue
  add constraint llf_knowledge_gap_identity_check
  check (
    char_length(normalized_question) between 4 and 500
    and normalized_question = btrim(normalized_question)
    and fingerprint = detected_language || ':' || normalized_question
    and char_length(fingerprint) between 7 and 503
  );

alter table llf_knowledge_gap_queue drop constraint if exists llf_knowledge_gap_count_bounds_check;
alter table llf_knowledge_gap_queue
  add constraint llf_knowledge_gap_count_bounds_check
  check (
    occurrence_count >= 0
    and distinct_conversation_count between 0 and occurrence_count
    and high_intent_count between 0 and occurrence_count
    and not_satisfied_count between 0 and occurrence_count
    and human_request_count between 0 and occurrence_count
  );

alter table llf_knowledge_gap_queue drop constraint if exists llf_knowledge_gap_lifecycle_check;
alter table llf_knowledge_gap_queue
  add constraint llf_knowledge_gap_lifecycle_check
  check (
    case
      when status in ('MERGED','ARCHIVED') then answer_status = 'ARCHIVED'
      else answer_status = 'DRAFT_ONLY'
    end
    and (
      (status = 'MERGED' and merged_into_gap_id is not null and merged_into_gap_id <> id)
      or (status <> 'MERGED' and merged_into_gap_id is null)
    )
  );

-- APPROVED is intentionally absent until a separately authorized release migration exists.

-- Intentionally no permissive policies in this migration.
-- Review queue and evidence are internal agent/admin data only.
-- No task-system integration is activated here; external task creation must be idempotent,
-- auditable, and explicitly enabled after backend/auth QA.
