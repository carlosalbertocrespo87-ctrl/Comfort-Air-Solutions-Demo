-- LOCAL LEAD FORGE — Agent Console synthetic QA privilege alignment
-- The llf-agent-ops Edge Function reads synthetic handoff facts with the
-- service-role client. Keep this grant explicit so nested protected reads do
-- not fail with PostgREST 403 while customer traffic remains disabled.

grant select on table public.llf_conversation_handoff_facts to service_role;
