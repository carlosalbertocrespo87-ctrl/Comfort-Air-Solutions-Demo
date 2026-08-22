-- LOCAL LEAD FORGE — AUXILIARY TABLE PRIVILEGE HARDENING
-- INTERNAL / FAIL-CLOSED
--
-- Context:
-- A read-only runtime audit found Supabase/Postgres default auxiliary table
-- privileges (TRUNCATE, REFERENCES, TRIGGER, MAINTAIN) on public LLF tables for
-- anon/authenticated even though SELECT/INSERT/UPDATE/DELETE remain revoked.
-- These privileges are not required by the LLF browser/PWA or Data API path.
-- Remove them as defense-in-depth and preserve service_role/server workflows.
--
-- IMPORTANT: this migration does NOT grant any new access and does NOT enable
-- live persistence, customer messaging, Realtime customer traffic or push.

-- Existing public tables are LLF-owned in this project at the review checkpoint.
-- Remove auxiliary privileges that are unnecessary for untrusted API roles.
revoke truncate, references, trigger, maintain
on all tables in schema public
from anon, authenticated;

-- Keep future tables created by postgres fail-closed for these auxiliary
-- privileges. Any future need must be granted explicitly in a reviewed migration.
alter default privileges for role postgres in schema public
  revoke truncate, references, trigger, maintain on tables from anon, authenticated;

-- Do not modify service_role privileges here. Trusted server/Edge Function
-- workflows retain their existing access and remain the only privileged runtime
-- path for LLF operations that require database writes.
