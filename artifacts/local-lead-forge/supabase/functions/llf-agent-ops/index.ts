import { createClient } from 'jsr:@supabase/supabase-js@2';

const ALLOWED_ORIGINS = new Set([
  'https://localleadforge.com',
  'https://www.localleadforge.com',
  'https://deploy-preview-94--symphonious-travesseiro-c9bae1.netlify.app',
  'https://deploy-preview-148--symphonious-travesseiro-c9bae1.netlify.app',
]);

function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('Origin');
  const headers: Record<string, string> = {
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  };
  if (origin && ALLOWED_ORIGINS.has(origin)) headers['Access-Control-Allow-Origin'] = origin;
  return headers;
}

function originAllowed(req: Request): boolean {
  const origin = req.headers.get('Origin');
  return !origin || ALLOWED_ORIGINS.has(origin);
}

Deno.serve(async (req: Request) => {
  if (!originAllowed(req)) return json(req, { error: 'origin_not_allowed' }, 403);
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(req) });
  if (req.method !== 'POST') return json(req, { error: 'method_not_allowed' }, 405);

  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return json(req, { error: 'authentication_required' }, 401);

  const url = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !serviceRoleKey) return json(req, { error: 'server_configuration_error' }, 500);

  const admin = createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const token = authHeader.slice('Bearer '.length);
  const { data: userData, error: userError } = await admin.auth.getUser(token);
  const user = userData?.user;
  if (userError || !user) return json(req, { error: 'invalid_session' }, 401);

  const { data: agent, error: agentError } = await admin
    .from('llf_agent_profiles')
    .select('user_id,is_active,display_name,role_label,availability')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle();
  if (agentError) return json(req, { error: 'agent_lookup_failed' }, 500);
  if (!agent) return json(req, { error: 'active_agent_required' }, 403);

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return json(req, { error: 'invalid_json' }, 400); }
  const action = String(body.action ?? '');

  if (action === 'session_info') {
    return json(req, { ok: true, agent: { user_id: agent.user_id, display_name: agent.display_name, role_label: agent.role_label, availability: agent.availability } });
  }

  if (action === 'register_device') {
    const deviceHash = typeof body.device_hash === 'string' ? body.device_hash.toLowerCase() : '';
    if (!/^[a-f0-9]{64}$/.test(deviceHash)) return json(req, { error: 'invalid_device_hash' }, 400);
    const deviceLabel = cleanText(body.device_label, 120);
    const platform = cleanText(body.platform, 80);
    const browser = cleanText(body.browser, 80);
    const now = new Date().toISOString();

    const { data: existing, error: lookupError } = await admin
      .from('llf_trusted_devices')
      .select('id,trust_status,device_label,platform,browser,trusted_at,revoked_at')
      .eq('agent_user_id', user.id)
      .eq('device_fingerprint_hash', deviceHash)
      .maybeSingle();
    if (lookupError) return json(req, { error: 'device_lookup_failed' }, 500);

    if (existing) {
      const { data: updated, error } = await admin
        .from('llf_trusted_devices')
        .update({ device_label: deviceLabel || existing.device_label, platform: platform || existing.platform, browser: browser || existing.browser, last_seen_at: now })
        .eq('id', existing.id)
        .select('id,trust_status,device_label,platform,browser,trusted_at,revoked_at,last_seen_at')
        .single();
      if (error) return json(req, { error: 'device_update_failed' }, 500);
      await admin.from('llf_device_security_events').insert({ agent_user_id: user.id, trusted_device_id: existing.id, event_type: 'DEVICE_SEEN', metadata: { trust_status: existing.trust_status } });
      return json(req, { ok: true, device: updated });
    }

    const { data: created, error } = await admin
      .from('llf_trusted_devices')
      .insert({ agent_user_id: user.id, device_fingerprint_hash: deviceHash, device_label: deviceLabel || null, platform: platform || null, browser: browser || null, trust_status: 'PENDING', first_seen_at: now, last_seen_at: now })
      .select('id,trust_status,device_label,platform,browser,trusted_at,revoked_at,last_seen_at')
      .single();
    if (error) return json(req, { error: 'device_registration_failed' }, 500);
    await admin.from('llf_device_security_events').insert({ agent_user_id: user.id, trusted_device_id: created.id, event_type: 'DEVICE_REGISTERED', metadata: { trust_status: 'PENDING' } });
    await audit(admin, null, user.id, 'REGISTER_DEVICE', { trusted_device_id: created.id, trust_status: 'PENDING' });
    return json(req, { ok: true, device: created });
  }

  if (action === 'device_status') {
    const deviceHash = typeof body.device_hash === 'string' ? body.device_hash.toLowerCase() : '';
    if (!/^[a-f0-9]{64}$/.test(deviceHash)) return json(req, { error: 'invalid_device_hash' }, 400);
    const { data: device, error } = await admin
      .from('llf_trusted_devices')
      .select('id,trust_status,device_label,platform,browser,trusted_at,revoked_at,last_seen_at')
      .eq('agent_user_id', user.id)
      .eq('device_fingerprint_hash', deviceHash)
      .maybeSingle();
    if (error) return json(req, { error: 'device_lookup_failed' }, 500);
    return json(req, { ok: true, device: device ?? null });
  }

  const deviceHash = typeof body.device_hash === 'string' ? body.device_hash.toLowerCase() : '';
  if (!/^[a-f0-9]{64}$/.test(deviceHash)) return json(req, { error: 'trusted_device_required' }, 403);
  const { data: trustedDevice, error: trustedDeviceError } = await admin
    .from('llf_trusted_devices')
    .select('id,trust_status')
    .eq('agent_user_id', user.id)
    .eq('device_fingerprint_hash', deviceHash)
    .maybeSingle();
  if (trustedDeviceError) return json(req, { error: 'device_lookup_failed' }, 500);
  if (!trustedDevice || trustedDevice.trust_status !== 'TRUSTED') {
    if (trustedDevice?.id) {
      await admin.from('llf_device_security_events').insert({
        agent_user_id: user.id,
        trusted_device_id: trustedDevice.id,
        event_type: 'UNTRUSTED_DEVICE_BLOCKED',
        metadata: { action, trust_status: trustedDevice.trust_status },
      });
    }
    return json(req, { error: 'trusted_device_required' }, 403);
  }
  await admin.from('llf_trusted_devices').update({ last_seen_at: new Date().toISOString() }).eq('id', trustedDevice.id);

  if (action === 'set_availability') {
    const availability = String(body.availability ?? '');
    if (!['AVAILABLE','BUSY','OFFLINE'].includes(availability)) return json(req, { error: 'invalid_availability' }, 400);
    const { error } = await admin.from('llf_agent_profiles').update({ availability, updated_at: new Date().toISOString() }).eq('user_id', user.id);
    if (error) return json(req, { error: 'availability_update_failed' }, 500);
    await audit(admin, null, user.id, 'SET_AVAILABILITY', { availability, trusted_device_id: trustedDevice.id });
    return json(req, { ok: true, availability });
  }

  if (action === 'list_synthetic_conversations') {
    const { data: conversations, error } = await admin
      .from('llf_conversations')
      .select('id,audience,channel,status,contact_name,company_name,assigned_agent_user_id,handoff_reason,handoff_user_intent,handoff_unresolved_question,handoff_suggested_next_action,updated_at,llf_conversation_messages(id,author,author_user_id,author_label,body,created_at),llf_conversation_handoff_facts(fact)')
      .eq('is_synthetic', true)
      .order('updated_at', { ascending: false });
    if (error) return json(req, { error: 'synthetic_conversation_lookup_failed' }, 500);
    return json(req, { ok: true, conversations: conversations ?? [] });
  }

  const conversationId = typeof body.conversation_id === 'string' ? body.conversation_id : null;
  if (!conversationId) return json(req, { error: 'conversation_id_required' }, 400);

  if (action === 'claim') {
    const now = new Date().toISOString();
    const { data: claimed, error } = await admin.from('llf_conversations')
      .update({ status: 'AGENT_ACTIVE', assigned_agent_user_id: user.id, claimed_at: now, updated_at: now })
      .eq('id', conversationId).eq('is_synthetic', true).eq('status', 'WAITING_FOR_AGENT').is('assigned_agent_user_id', null)
      .select('id,status,assigned_agent_user_id,claimed_at,audience,channel').maybeSingle();
    if (error) return json(req, { error: 'claim_failed' }, 500);
    if (!claimed) return json(req, { error: 'conversation_not_claimable' }, 409);
    await audit(admin, conversationId, user.id, 'CLAIM_CONVERSATION', { synthetic: true, trusted_device_id: trustedDevice.id });
    await admin.from('llf_interaction_ledger').insert({ conversation_id: conversationId, audience: claimed.audience, channel: claimed.channel, interaction_type: 'CLAIM', actor_type: 'AGENT', actor_user_id: user.id, actor_label: agent.display_name });
    return json(req, { ok: true, conversation: claimed });
  }

  const { data: conversation, error: conversationError } = await admin.from('llf_conversations')
    .select('id,status,assigned_agent_user_id,audience,channel,is_synthetic').eq('id', conversationId).eq('is_synthetic', true).maybeSingle();
  if (conversationError) return json(req, { error: 'conversation_lookup_failed' }, 500);
  if (!conversation) return json(req, { error: 'synthetic_conversation_not_found' }, 404);
  if (conversation.assigned_agent_user_id !== user.id) return json(req, { error: 'conversation_not_owned_by_agent' }, 403);

  if (action === 'send_message') return json(req, { error: 'messaging_capability_blocked' }, 403);

  if (action === 'resolve') {
    const now = new Date().toISOString();
    const { error } = await admin.from('llf_conversations').update({ status: 'RESOLVED', resolved_at: now, updated_at: now }).eq('id', conversationId).eq('is_synthetic', true).eq('assigned_agent_user_id', user.id);
    if (error) return json(req, { error: 'resolve_failed' }, 500);
    await audit(admin, conversationId, user.id, 'RESOLVE_CONVERSATION', { synthetic: true, trusted_device_id: trustedDevice.id });
    await admin.from('llf_interaction_ledger').insert({ conversation_id: conversationId, audience: conversation.audience, channel: conversation.channel, interaction_type: 'RESOLUTION', actor_type: 'AGENT', actor_user_id: user.id, actor_label: agent.display_name, outcome: 'RESOLVED' });
    return json(req, { ok: true, resolved_at: now });
  }

  return json(req, { error: 'unsupported_action' }, 400);
});

function cleanText(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

async function audit(admin: ReturnType<typeof createClient>, conversationId: string | null, agentUserId: string, action: string, metadata: Record<string, unknown>) {
  await admin.from('llf_agent_audit_log').insert({ conversation_id: conversationId, agent_user_id: agentUserId, action, metadata });
}

function json(req: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders(req), 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
}
