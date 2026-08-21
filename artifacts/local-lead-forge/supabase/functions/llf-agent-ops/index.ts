import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return json({ error: 'authentication_required' }, 401);

  const url = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !serviceRoleKey) return json({ error: 'server_configuration_error' }, 500);

  const admin = createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const token = authHeader.slice('Bearer '.length);
  const { data: userData, error: userError } = await admin.auth.getUser(token);
  const user = userData?.user;
  if (userError || !user) return json({ error: 'invalid_session' }, 401);

  const { data: agent, error: agentError } = await admin
    .from('llf_agent_profiles')
    .select('user_id,is_active,display_name,role_label,availability')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle();
  if (agentError) return json({ error: 'agent_lookup_failed' }, 500);
  if (!agent) return json({ error: 'active_agent_required' }, 403);

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return json({ error: 'invalid_json' }, 400); }
  const action = String(body.action ?? '');

  if (action === 'session_info') {
    return json({
      ok: true,
      agent: {
        user_id: agent.user_id,
        display_name: agent.display_name,
        role_label: agent.role_label,
        availability: agent.availability,
      },
    });
  }

  if (action === 'set_availability') {
    const availability = String(body.availability ?? '');
    if (!['AVAILABLE','BUSY','OFFLINE'].includes(availability)) return json({ error: 'invalid_availability' }, 400);
    const { error } = await admin.from('llf_agent_profiles')
      .update({ availability, updated_at: new Date().toISOString() })
      .eq('user_id', user.id);
    if (error) return json({ error: 'availability_update_failed' }, 500);
    await audit(admin, null, user.id, 'SET_AVAILABILITY', { availability });
    return json({ ok: true, availability });
  }

  const conversationId = typeof body.conversation_id === 'string' ? body.conversation_id : null;
  if (!conversationId) return json({ error: 'conversation_id_required' }, 400);

  if (action === 'claim') {
    const now = new Date().toISOString();
    const { data: claimed, error } = await admin.from('llf_conversations')
      .update({ status: 'AGENT_ACTIVE', assigned_agent_user_id: user.id, claimed_at: now, updated_at: now })
      .eq('id', conversationId)
      .eq('status', 'WAITING_FOR_AGENT')
      .is('assigned_agent_user_id', null)
      .select('id,status,assigned_agent_user_id,claimed_at,audience,channel')
      .maybeSingle();
    if (error) return json({ error: 'claim_failed' }, 500);
    if (!claimed) return json({ error: 'conversation_not_claimable' }, 409);
    await audit(admin, conversationId, user.id, 'CLAIM_CONVERSATION', {});
    await admin.from('llf_interaction_ledger').insert({
      conversation_id: conversationId,
      audience: claimed.audience,
      channel: claimed.channel,
      interaction_type: 'CLAIM',
      actor_type: 'AGENT',
      actor_user_id: user.id,
      actor_label: agent.display_name,
    });
    return json({ ok: true, conversation: claimed });
  }

  const { data: conversation, error: conversationError } = await admin.from('llf_conversations')
    .select('id,status,assigned_agent_user_id,audience,channel')
    .eq('id', conversationId)
    .maybeSingle();
  if (conversationError) return json({ error: 'conversation_lookup_failed' }, 500);
  if (!conversation) return json({ error: 'conversation_not_found' }, 404);
  if (conversation.assigned_agent_user_id !== user.id) return json({ error: 'conversation_not_owned_by_agent' }, 403);

  if (action === 'send_message') {
    if (conversation.status !== 'AGENT_ACTIVE') return json({ error: 'conversation_not_agent_active' }, 409);
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    if (!message || message.length > 10000) return json({ error: 'invalid_message' }, 400);
    const { data: row, error } = await admin.from('llf_conversation_messages').insert({
      conversation_id: conversationId,
      author: 'AGENT',
      author_user_id: user.id,
      author_label: `${agent.display_name} · LLF Specialist`,
      body: message,
    }).select('id,created_at').single();
    if (error) return json({ error: 'message_insert_failed' }, 500);
    await admin.from('llf_interaction_ledger').insert({
      conversation_id: conversationId,
      audience: conversation.audience,
      channel: conversation.channel,
      interaction_type: 'AGENT_MESSAGE',
      actor_type: 'AGENT',
      actor_user_id: user.id,
      actor_label: agent.display_name,
      message_id: row.id,
    });
    await audit(admin, conversationId, user.id, 'SEND_AGENT_MESSAGE', { message_id: row.id });
    return json({ ok: true, message_id: row.id, created_at: row.created_at });
  }

  if (action === 'resolve') {
    const now = new Date().toISOString();
    const { error } = await admin.from('llf_conversations')
      .update({ status: 'RESOLVED', resolved_at: now, updated_at: now })
      .eq('id', conversationId)
      .eq('assigned_agent_user_id', user.id);
    if (error) return json({ error: 'resolve_failed' }, 500);
    await audit(admin, conversationId, user.id, 'RESOLVE_CONVERSATION', {});
    await admin.from('llf_interaction_ledger').insert({
      conversation_id: conversationId,
      audience: conversation.audience,
      channel: conversation.channel,
      interaction_type: 'RESOLUTION',
      actor_type: 'AGENT',
      actor_user_id: user.id,
      actor_label: agent.display_name,
      outcome: 'RESOLVED',
    });
    return json({ ok: true, resolved_at: now });
  }

  return json({ error: 'unsupported_action' }, 400);
});

async function audit(admin: ReturnType<typeof createClient>, conversationId: string | null, agentUserId: string, action: string, metadata: Record<string, unknown>) {
  await admin.from('llf_agent_audit_log').insert({ conversation_id: conversationId, agent_user_id: agentUserId, action, metadata });
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}
