import { createClient, type RealtimeChannel } from '@supabase/supabase-js';
import { getStoredAgentSession } from '@/lib/supabase-session';

const SUPABASE_URL = 'https://iogjlzizzegqarkfyzzx.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_F9KY7_PBrERwwQjvpoIv5A_bxk_mVXV';
const SYNTHETIC_TOPIC = 'llf-agent-console-synthetic';

const realtimeClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});

export type SyntheticRealtimeState = 'CONNECTING' | 'SUBSCRIBED' | 'CLOSED' | 'CHANNEL_ERROR' | 'TIMED_OUT';

export async function subscribeToSyntheticRefresh(
  onRefresh: () => void,
  onState: (state: SyntheticRealtimeState) => void,
): Promise<RealtimeChannel> {
  const session = getStoredAgentSession();
  if (!session) throw new Error('authentication_required');
  if (session.deviceTrustStatus !== 'TRUSTED') throw new Error('trusted_device_required');

  await realtimeClient.realtime.setAuth(session.accessToken);
  const channel = realtimeClient
    .channel(SYNTHETIC_TOPIC, { config: { private: true } })
    .on('broadcast', { event: 'refresh' }, () => onRefresh())
    .subscribe((status) => onState(status as SyntheticRealtimeState));
  return channel;
}

export async function unsubscribeFromSyntheticRefresh(channel: RealtimeChannel): Promise<void> {
  await realtimeClient.removeChannel(channel);
}
