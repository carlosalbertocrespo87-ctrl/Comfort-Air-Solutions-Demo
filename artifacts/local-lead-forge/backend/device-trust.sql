-- LOCAL LEAD FORGE — DEVICE TRUST FOUNDATION
-- INTERNAL / FAIL-CLOSED
-- Purpose: bind authenticated LLF agent sessions and push subscriptions to reviewed devices.

create table if not exists llf_trusted_devices (
  id uuid primary key default gen_random_uuid(),
  agent_user_id uuid not null references llf_agent_profiles(user_id) on delete cascade,
  device_fingerprint_hash text not null,
  device_label text,
  platform text,
  browser text,
  trust_status text not null default 'PENDING' check (trust_status in ('PENDING','TRUSTED','REVOKED')),
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  trusted_at timestamptz,
  revoked_at timestamptz,
  unique(agent_user_id, device_fingerprint_hash)
);

create table if not exists llf_device_security_events (
  id uuid primary key default gen_random_uuid(),
  agent_user_id uuid references llf_agent_profiles(user_id) on delete set null,
  trusted_device_id uuid references llf_trusted_devices(id) on delete set null,
  event_type text not null check (event_type in (
    'DEVICE_FIRST_SEEN',
    'DEVICE_TRUSTED',
    'DEVICE_REVOKED',
    'UNTRUSTED_DEVICE_BLOCKED',
    'PUSH_SUBSCRIPTION_REGISTERED',
    'PUSH_SUBSCRIPTION_REVOKED'
  )),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table llf_trusted_devices enable row level security;
alter table llf_device_security_events enable row level security;

-- Deployment-specific policies must restrict these tables to the authenticated agent's own devices,
-- with security/admin review paths as needed. No anonymous access is permitted.

-- Push subscription activation requirement:
-- a push endpoint may be marked active only when tied to a TRUSTED device owned by the same authenticated agent.

-- Trust flow (server mediated):
-- 1. authenticated agent signs in;
-- 2. unknown device is recorded PENDING and triggers a "new device" security event;
-- 3. stronger re-verification is required before trust is granted;
-- 4. trusted device can register push;
-- 5. revoking device also revokes push subscriptions and active sessions when supported by auth provider.

-- Do not store raw hardware identifiers. Store only a privacy-preserving server-generated fingerprint/hash.
