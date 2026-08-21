-- LOCAL LEAD FORGE — SUPABASE RUNTIME HARDENING
-- Mirrors production Supabase hardening applied 20 Aug 2026.

alter table llf_conversations
  drop constraint if exists llf_conversations_intent_level_check,
  add constraint llf_conversations_intent_level_check check (intent_level in ('LOW','MEDIUM','HIGH','READY_TO_BUY')),
  drop constraint if exists llf_conversations_satisfaction_state_check,
  add constraint llf_conversations_satisfaction_state_check check (satisfaction_state in ('UNKNOWN','SATISFIED','NOT_SATISFIED'));

create schema if not exists llf_private;
revoke all on schema llf_private from public;
grant usage on schema llf_private to authenticated;

alter function public.llf_is_active_agent() set schema llf_private;
alter function public.llf_current_client_account_id() set schema llf_private;
alter function public.llf_claim_conversation(uuid, uuid) set schema llf_private;

revoke all on function llf_private.llf_is_active_agent() from public, anon;
revoke all on function llf_private.llf_current_client_account_id() from public, anon;
revoke all on function llf_private.llf_claim_conversation(uuid, uuid) from public, anon, authenticated;
grant execute on function llf_private.llf_is_active_agent() to authenticated;
grant execute on function llf_private.llf_current_client_account_id() to authenticated;

revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

-- Internal security/governance/capability tables explicitly deny user roles.
create policy llf_security_events_deny_users on llf_security_events for all to anon, authenticated using (false) with check (false);
create policy llf_retention_deny_users on llf_data_retention_policies for all to anon, authenticated using (false) with check (false);
create policy llf_knowledge_governance_deny_users on llf_knowledge_governance_reviews for all to anon, authenticated using (false) with check (false);
create policy llf_incident_replay_deny_users on llf_incident_replay_index for all to anon, authenticated using (false) with check (false);
create policy llf_capability_registry_deny_users on llf_capability_registry for all to anon, authenticated using (false) with check (false);
create policy llf_capability_events_deny_users on llf_capability_activation_events for all to anon, authenticated using (false) with check (false);

-- Foreign-key support indexes used by operational queries.
create index if not exists idx_llf_agent_audit_agent on llf_agent_audit_log(agent_user_id);
create index if not exists idx_llf_agent_audit_conversation on llf_agent_audit_log(conversation_id);
create index if not exists idx_llf_messages_conversation on llf_conversation_messages(conversation_id);
create index if not exists idx_llf_conversations_assigned_agent on llf_conversations(assigned_agent_user_id);
create index if not exists idx_llf_notification_conversation on llf_notification_events(conversation_id);
create index if not exists idx_llf_notes_conversation on llf_private_agent_notes(conversation_id);
create index if not exists idx_llf_transfers_conversation on llf_internal_transfers(conversation_id);
create index if not exists idx_llf_device_events_agent on llf_device_security_events(agent_user_id);
create index if not exists idx_llf_device_events_device on llf_device_security_events(trusted_device_id);
