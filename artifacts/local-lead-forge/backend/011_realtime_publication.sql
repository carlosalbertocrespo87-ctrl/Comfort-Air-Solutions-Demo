-- LOCAL LEAD FORGE — REALTIME PUBLICATION FOUNDATION
-- Makes approved operational tables eligible for Supabase Realtime.
-- Product gates remain OFF until authenticated agent/device QA passes.

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'llf_conversations'
  ) then
    alter publication supabase_realtime add table public.llf_conversations;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'llf_conversation_messages'
  ) then
    alter publication supabase_realtime add table public.llf_conversation_messages;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'llf_agent_profiles'
  ) then
    alter publication supabase_realtime add table public.llf_agent_profiles;
  end if;
end
$$;
