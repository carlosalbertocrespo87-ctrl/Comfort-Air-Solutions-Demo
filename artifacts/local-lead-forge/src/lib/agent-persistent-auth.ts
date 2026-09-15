import { createClient } from '@supabase/supabase-js';

import { getStoredAgentSession, type LLFAgentSession } from '@/lib/supabase-session';

const SUPABASE_URL = 'https://iogjlzizzegqarkfyzzx.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_F9KY7_PBrERwwQjvpoIv5A_bxk_mVXV';
const SESSION_KEY = 'llf_agent_session_v1';
const DEVICE_INSTALL_KEY = 'llf_device_install_id_v1';
const REFRESH_TOKEN_KEY = 'llf_agent_refresh_token_v1';
const CARLOS_AGENT_USER_ID = '1c1e7606-b9dc-4604-8047-df86760809d7';
const REFRESH_EARLY_SECONDS = 5 * 60;

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

type DeviceTrustStatus = 'PENDING' | 'TRUSTED' | 'REVOKED';

type SessionInfoResponse = {
  ok: boolean;
  agent?: {
    user_id: string;
    display_name: string;
    availability: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
  };
};

type RegisterDeviceResponse = {
  ok: boolean;
  device?: {
    id: string;
    trust_status: DeviceTrustStatus;
  };
};

export function captureRefreshTokenFromAuthHash(): string | null {
  if (!window.location.hash) return null;
  const params = new URLSearchParams(window.location.hash.startsWith('#') ? window.location.hash.slice(1) : '');
  const refreshToken = params.get('refresh_token');
  return refreshToken?.trim() || null;
}

export function persistCarlosRefreshToken(refreshToken: string | null, agentUserId: string | undefined): boolean {
  if (!refreshToken || agentUserId !== CARLOS_AGENT_USER_ID) return false;
  window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  return true;
}

export function clearPersistentCarlosAuth(): void {
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.sessionStorage.removeItem(SESSION_KEY);
}

export async function hydratePersistentCarlosSession(): Promise<LLFAgentSession | null> {
  const current = getStoredAgentSession();
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (current && (current.expiresAt === undefined || current.expiresAt - nowSeconds > REFRESH_EARLY_SECONDS)) return current;

  const refreshToken = window.localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) return current;

  try {
    const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
    if (error || !data.session?.access_token || !data.session.refresh_token) throw new Error('refresh_failed');

    const accessToken = data.session.access_token;
    const rotatedRefreshToken = data.session.refresh_token;
    const expiresAt = data.session.expires_at;

    const sessionInfo = await callWithToken<SessionInfoResponse>(accessToken, { action: 'session_info' });
    if (!sessionInfo.ok || !sessionInfo.agent || sessionInfo.agent.user_id !== CARLOS_AGENT_USER_ID) {
      throw new Error('carlos_agent_required');
    }

    const deviceHash = await getCurrentDeviceHash();
    const description = describeDevice();
    const deviceResult = await callWithToken<RegisterDeviceResponse>(accessToken, {
      action: 'register_device',
      device_hash: deviceHash,
      device_label: description.deviceLabel,
      platform: description.platform,
      browser: description.browser,
    });
    if (!deviceResult.ok || !deviceResult.device) throw new Error('invalid_agent_device');

    const restored: LLFAgentSession = {
      accessToken,
      expiresAt,
      agentUserId: sessionInfo.agent.user_id,
      displayName: sessionInfo.agent.display_name,
      availability: sessionInfo.agent.availability,
      deviceId: deviceResult.device.id,
      deviceTrustStatus: deviceResult.device.trust_status,
    };

    window.localStorage.setItem(REFRESH_TOKEN_KEY, rotatedRefreshToken);
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(restored));
    window.dispatchEvent(new Event('llf-agent-session-changed'));
    return restored;
  } catch {
    clearPersistentCarlosAuth();
    return null;
  }
}

async function callWithToken<T>(accessToken: string, body: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/llf-agent-ops`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
    credentials: 'omit',
  });
  if (!response.ok) throw new Error(`agent_ops_failed_${response.status}`);
  return (await response.json()) as T;
}

function getOrCreateDeviceInstallId(): string {
  const existing = window.localStorage.getItem(DEVICE_INSTALL_KEY);
  if (existing) return existing;
  const created = crypto.randomUUID();
  window.localStorage.setItem(DEVICE_INSTALL_KEY, created);
  return created;
}

async function getCurrentDeviceHash(): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(getOrCreateDeviceInstallId()));
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function describeDevice(): { deviceLabel: string; platform: string; browser: string } {
  const ua = navigator.userAgent;
  const platform = navigator.platform || 'Web';
  const browser = ua.includes('Edg/')
    ? 'Edge'
    : ua.includes('Chrome/')
      ? 'Chrome'
      : ua.includes('Safari/')
        ? 'Safari'
        : ua.includes('Firefox/')
          ? 'Firefox'
          : 'Browser';
  return { deviceLabel: `${platform} · ${browser}`, platform, browser };
}
