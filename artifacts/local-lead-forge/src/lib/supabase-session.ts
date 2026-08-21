const SUPABASE_URL = 'https://iogjlzizzegqarkfyzzx.supabase.co';
const SESSION_KEY = 'llf_agent_session_v1';
const DEVICE_INSTALL_KEY = 'llf_device_install_id_v1';

export type DeviceTrustStatus = 'PENDING' | 'TRUSTED' | 'REVOKED';

export type LLFAgentSession = {
  accessToken: string;
  expiresAt?: number;
  agentUserId: string;
  displayName: string;
  availability: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
  deviceId?: string;
  deviceTrustStatus?: DeviceTrustStatus;
};

function parseHash(): URLSearchParams {
  return new URLSearchParams(window.location.hash.startsWith('#') ? window.location.hash.slice(1) : '');
}

function getOrCreateDeviceInstallId(): string {
  const existing = window.localStorage.getItem(DEVICE_INSTALL_KEY);
  if (existing) return existing;
  const created = crypto.randomUUID();
  window.localStorage.setItem(DEVICE_INSTALL_KEY, created);
  return created;
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function describeDevice(): { deviceLabel: string; platform: string; browser: string } {
  const ua = navigator.userAgent;
  const platform = navigator.platform || 'Web';
  const browser = ua.includes('Edg/') ? 'Edge' : ua.includes('Chrome/') ? 'Chrome' : ua.includes('Safari/') ? 'Safari' : ua.includes('Firefox/') ? 'Firefox' : 'Browser';
  return { deviceLabel: `${platform} · ${browser}`, platform, browser };
}

export function getStoredAgentSession(): LLFAgentSession | null {
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as LLFAgentSession;
    if (session.expiresAt && Date.now() >= session.expiresAt * 1000) {
      window.sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    window.sessionStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function clearStoredAgentSession(): void {
  window.sessionStorage.removeItem(SESSION_KEY);
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

export async function consumeSupabaseAuthHash(): Promise<'consumed' | 'none' | 'error'> {
  if (!window.location.hash) return 'none';

  const params = parseHash();
  const accessToken = params.get('access_token');
  const authError = params.get('error') || params.get('error_description');

  // Remove credentials from the visible URL before any network call or render.
  history.replaceState({}, document.title, window.location.pathname + window.location.search);

  if (authError || !accessToken) {
    clearStoredAgentSession();
    return authError ? 'error' : 'none';
  }

  try {
    const sessionInfo = await callWithToken<{
      ok: boolean;
      agent?: { user_id: string; display_name: string; availability: 'AVAILABLE' | 'BUSY' | 'OFFLINE' };
    }>(accessToken, { action: 'session_info' });

    if (!sessionInfo.ok || !sessionInfo.agent) {
      clearStoredAgentSession();
      return 'error';
    }

    const installId = getOrCreateDeviceInstallId();
    const deviceHash = await sha256Hex(installId);
    const description = describeDevice();
    const deviceResult = await callWithToken<{
      ok: boolean;
      device?: { id: string; trust_status: DeviceTrustStatus };
    }>(accessToken, {
      action: 'register_device',
      device_hash: deviceHash,
      device_label: description.deviceLabel,
      platform: description.platform,
      browser: description.browser,
    });

    if (!deviceResult.ok || !deviceResult.device) {
      clearStoredAgentSession();
      return 'error';
    }

    const expiresAtRaw = params.get('expires_at');
    const expiresInRaw = params.get('expires_in');
    const expiresAt = expiresAtRaw
      ? Number(expiresAtRaw)
      : expiresInRaw
        ? Math.floor(Date.now() / 1000) + Number(expiresInRaw)
        : undefined;

    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify({
      accessToken,
      expiresAt,
      agentUserId: sessionInfo.agent.user_id,
      displayName: sessionInfo.agent.display_name,
      availability: sessionInfo.agent.availability,
      deviceId: deviceResult.device.id,
      deviceTrustStatus: deviceResult.device.trust_status,
    } satisfies LLFAgentSession));

    return 'consumed';
  } catch {
    clearStoredAgentSession();
    return 'error';
  }
}

export async function callAgentOps<T = unknown>(body: Record<string, unknown>): Promise<T> {
  const session = getStoredAgentSession();
  if (!session) throw new Error('authentication_required');

  try {
    return await callWithToken<T>(session.accessToken, body);
  } catch (error) {
    if (error instanceof Error && (error.message.endsWith('_401') || error.message.endsWith('_403'))) clearStoredAgentSession();
    throw error;
  }
}
