-- LOCAL LEAD FORGE — SECURITY + KNOWLEDGE GOVERNANCE FOUNDATION
-- INTERNAL / FAIL-CLOSED
-- Migration ordering: after base conversation/auth foundation.

create type llf_security_event_type as enum (
  'PROMPT_INJECTION',
  'DATA_EXFILTRATION_ATTEMPT',
  'SENSITIVE_DATA_DETECTED',
  'ABUSE_OR_SPAM',
  'RATE_LIMITED',
  'KNOWLEDGE_CONFLICT',
  'STALE_KNOWLEDGE',
  'UNSUPPORTED_ANSWER',
  'DEVICE_NEW',
  'DEVICE_REVOKED'
);

create table if not exists llf_security_events (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references llf_conversations(id) on delete set null,
  agent_user_id uuid references llf_agent_profiles(user_id) on delete set null,
  event_type llf_security_event_type not null,
  severity text not null check (severity in ('LOW','MEDIUM','HIGH','CRITICAL')),
  safe_summary text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists llf_data_retention_policies (
  id uuid primary key default gen_random_uuid(),
  data_class text not null unique,
  retention_days integer not null check (retention_days > 0),
  legal_hold_allowed boolean not null default false,
  redact_before_analytics boolean not null default true,
  approved_at timestamptz,
  approved_by uuid references llf_agent_profiles(user_id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists llf_knowledge_governance_reviews (
  id uuid primary key default gen_random_uuid(),
  source_key text not null,
  version text,
  approved boolean not null default false,
  superseded boolean not null default false,
  conflicting_source_count integer not null default 0 check (conflicting_source_count >= 0),
  last_reviewed_at timestamptz,
  expires_at timestamptz,
  reviewed_by uuid references llf_agent_profiles(user_id),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(source_key, version)
);

create table if not exists llf_incident_replay_index (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references llf_conversations(id) on delete cascade,
  correlation_id uuid not null default gen_random_uuid(),
  event_type text not null,
  actor_type text not null,
  actor_user_id uuid,
  safe_summary text not null,
  occurred_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists llf_security_events_conversation_idx
  on llf_security_events(conversation_id, created_at desc);
create index if not exists llf_incident_replay_conversation_idx
  on llf_incident_replay_index(conversation_id, occurred_at asc);

alter table llf_security_events enable row level security;
alter table llf_data_retention_policies enable row level security;
alter table llf_knowledge_governance_reviews enable row level security;
alter table llf_incident_replay_index enable row level security;

-- No permissive policies here. These tables remain internal/admin security data.
-- Before production activation:
-- 1) define retention durations per data class;
-- 2) verify redaction before analytics/export;
-- 3) prohibit secrets/payment credentials/auth tokens in safe_summary or metadata;
-- 4) review rate limits and abuse thresholds;
-- 5) test prompt-injection/data-exfiltration negative cases;
-- 6) validate knowledge freshness/conflict fail-closed behavior.
