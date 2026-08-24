const SUPABASE_URL = 'https://iogjlzizzegqarkfyzzx.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_F9KY7_PBrERwwQjvpoIv5A_bxk_mVXV';
const SESSION_KEY = 'llf_agent_session_v1';
const DEVICE_INSTALL_KEY = 'llf_device_install_id_v1';
const AUTH_BRIDGE_COOKIE = '__Host-llf_agent_auth_bridge_v1';
const AUTH_BRIDGE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
export const AGENT_SESSION_CHANGED_EVENT = 'llf-agent-session-changed';

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

type AgentAuthBridge = {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
};

function emitSessionChanged(): void {
  window.dispatchEvent(new Event(AGENT_SESSION_CHANGED_EVENT));
}

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

async function getCurrentDeviceHash(): Promise<string> {
  return sha256Hex(getOrCreateDeviceInstallId());
}

function describeDevice(): { deviceLabel: string; platform: string; browser: string } {
  const ua = navigator.userAgent;
  const platform = navigator.platform || 'Web';
  const browser = ua.includes('Edg/') ? 'Edge' : ua.includes('Chrome/') ? 'Chrome' : ua.includes('Safari/') ? 'Safari' : ua.includes('Firefox/') ? 'Firefox' : 'Browser';
  return { deviceLabel: `${platform} · ${browser}`, platform, browser };
}

function parseTokenExpiry(params: URLSearchParams): number | undefined {
  const expiresAtRaw = params.get('expires_at');
  const expiresInRaw = params.get('expires_in');
  if (!expiresAtRaw && !expiresInRaw) return undefined;
  if (expiresAtRaw) {
    const parsed = Number(expiresAtRaw);
    if (!Number.isFinite(parsed) || parsed <= 0) throw new Error('invalid_token_expiry');
    return parsed;
  }
  const expiresIn = Number(expiresInRaw);
  if (!Number.isFinite(expiresIn) || expiresIn <= 0) throw new Error('invalid_token_expiry');
  return Math.floor(Date.now() / 1000) + expiresIn;
}

export function clearStoredAgentSession(): void {
  window.sessionStorage.removeItem(SESSION_KEY);
  window.localStorage.removeItem(SESSION_KEY);
  document.cookie = `${AUTH_BRIDGE_COOKIE}=; Path=/; Max-Age=0; Secure; SameSite=Strict`;
  emitSessionChanged();
}

function clearStoredSessionRecord(): void {
  window.sessionStorage.removeItem(SESSION_KEY);
  window.localStorage.removeItem(SESSION_KEY);
}

function encodeBridge(bridge: AgentAuthBridge): string {
  const bytes = new TextEncoder().encode(JSON.stringify(bridge));
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}

function decodeBridge(value: string): AgentAuthBridge | null {
  try {
    const padded = value.replaceAll('-', '+').replaceAll('_', '/') + '='.repeat((4 - value.length % 4) % 4);
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    const parsed = JSON.parse(new TextDecoder().decode(bytes)) as AgentAuthBridge;
    if (!parsed.accessToken || typeof parsed.accessToken !== 'string') return null;
    if (parsed.refreshToken !== undefined && typeof parsed.refreshToken !== 'string') return null;
    if (parsed.expiresAt !== undefined && (!Number.isFinite(parsed.expiresAt) || parsed.expiresAt <= 0)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeAuthBridge(bridge: AgentAuthBridge): void {
  document.cookie = `${AUTH_BRIDGE_COOKIE}=${encodeBridge(bridge)}; Path=/; Max-Age=${AUTH_BRIDGE_MAX_AGE_SECONDS}; Secure; SameSite=Strict`;
}

function readAuthBridge(): AgentAuthBridge | null {
  const prefix = `${AUTH_BRIDGE_COOKIE}=`;
  const value = document.cookie.split('; ').find((part) => part.startsWith(prefix))?.slice(prefix.length);
  return value ? decodeBridge(value) : null;
}

function storeAgentSession(session: LLFAgentSession): void {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  window.sessionStorage.removeItem(SESSION_KEY);
  emitSessionChanged();
}

export function getStoredAgentSession(): LLFAgentSession | null {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY) ?? window.sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as LLFAgentSession;
    if (session.expiresAt !== undefined && (!Number.isFinite(session.expiresAt) || Date.now() >= session.expiresAt * 1000)) {
      clearStoredSessionRecord();
      return null;
    }
    if (!window.localStorage.getItem(SESSION_KEY)) storeAgentSession(session);
    return session;
  } catch {
    clearStoredSessionRecord();
    return null;
  }
}

async function callWithToken<T>(accessToken: string, body: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/llf-agent-ops`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
    credentials: 'omit',
  });
  if (!response.ok) throw new Error(`agent_ops_failed_${response.status}`);
  return (await response.json()) as T;
}

async function establishAgentSession(accessToken: string, expiresAt?: number): Promise<LLFAgentSession> {
  const sessionInfo = await callWithToken<{ ok: boolean; agent?: { user_id: string; display_name: string; availability: 'AVAILABLE' | 'BUSY' | 'OFFLINE' } }>(accessToken, { action: 'session_info' });
  if (!sessionInfo.ok || !sessionInfo.agent) throw new Error('invalid_agent_session');
  const deviceHash = await getCurrentDeviceHash();
  const description = describeDevice();
  const deviceResult = await callWithToken<{ ok: boolean; device?: { id: string; trust_status: DeviceTrustStatus } }>(accessToken, {
    action: 'register_device', device_hash: deviceHash, device_label: description.deviceLabel, platform: description.platform, browser: description.browser,
  });
  if (!deviceResult.ok || !deviceResult.device) throw new Error('invalid_agent_device');
  const session: LLFAgentSession = {
    accessToken,
    expiresAt,
    agentUserId: sessionInfo.agent.user_id,
    displayName: sessionInfo.agent.display_name,
    availability: sessionInfo.agent.availability,
    deviceId: deviceResult.device.id,
    deviceTrustStatus: deviceResult.device.trust_status,
  };
  storeAgentSession(session);
  return session;
}

async function refreshAuthBridge(bridge: AgentAuthBridge): Promise<AgentAuthBridge> {
  if (!bridge.refreshToken) throw new Error('refresh_token_missing');
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
    method: 'POST',
    headers: { apikey: SUPABASE_PUBLISHABLE_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: bridge.refreshToken }),
    cache: 'no-store',
    credentials: 'omit',
  });
  if (!response.ok) throw new Error(`refresh_failed_${response.status}`);
  const refreshed = await response.json() as { access_token?: string; refresh_token?: string; expires_in?: number };
  if (!refreshed.access_token || !refreshed.refresh_token || !Number.isFinite(refreshed.expires_in) || Number(refreshed.expires_in) <= 0) {
    throw new Error('invalid_refresh_response');
  }
  const next = {
    accessToken: refreshed.access_token,
    refreshToken: refreshed.refresh_token,
    expiresAt: Math.floor(Date.now() / 1000) + Number(refreshed.expires_in),
  } satisfies AgentAuthBridge;
  writeAuthBridge(next);
  return next;
}

export async function hydratePersistedAgentSession(): Promise<LLFAgentSession | null> {
  const stored = getStoredAgentSession();
  if (stored) return stored;
  const bridge = readAuthBridge();
  if (!bridge) return null;
  try {
    const activeBridge = bridge.expiresAt !== undefined && Date.now() >= bridge.expiresAt * 1000
      ? await refreshAuthBridge(bridge)
      : bridge;
    return await establishAgentSession(activeBridge.accessToken, activeBridge.expiresAt);
  } catch {
    clearStoredAgentSession();
    return null;
  }
}

export async function consumeSupabaseAuthHash(): Promise<'consumed' | 'none' | 'error'> {
  if (!window.location.hash) return 'none';
  const params = parseHash();
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token') ?? undefined;
  const authError = params.get('error') || params.get('error_description');
  history.replaceState({}, document.title, window.location.pathname + window.location.search);
  if (authError || !accessToken) {
    clearStoredAgentSession();
    return authError ? 'error' : 'none';
  }
  try {
    const expiresAt = parseTokenExpiry(params);
    writeAuthBridge({ accessToken, refreshToken, expiresAt });
    await establishAgentSession(accessToken, expiresAt);
    return 'consumed';
  } catch {
    clearStoredAgentSession();
    return 'error';
  }
}

export async function reconcileStoredDeviceTrust(): Promise<LLFAgentSession | null> {
  const session = getStoredAgentSession();
  if (!session || session.deviceTrustStatus === 'TRUSTED' || session.deviceTrustStatus === 'REVOKED') return session;
  try {
    const deviceHash = await getCurrentDeviceHash();
    const result = await callWithToken<{ ok: boolean; device?: { id: string; trust_status: DeviceTrustStatus } | null }>(session.accessToken, {
      action: 'device_status',
      device_hash: deviceHash,
    });
    if (!result.ok || !result.device) return session;
    const updated: LLFAgentSession = {
      ...session,
      deviceId: result.device.id,
      deviceTrustStatus: result.device.trust_status,
    };
    storeAgentSession(updated);
    if (updated.deviceTrustStatus !== session.deviceTrustStatus) emitSessionChanged();
    return updated;
  } catch (error) {
    if (error instanceof Error && (error.message.endsWith('_401') || error.message.endsWith('_403'))) clearStoredAgentSession();
    return getStoredAgentSession();
  }
}

export async function callAgentOps<T = unknown>(body: Record<string, unknown>): Promise<T> {
  const session = getStoredAgentSession();
  if (!session) throw new Error('authentication_required');
  if (session.deviceTrustStatus !== 'TRUSTED') throw new Error('trusted_device_required');
  try {
    const deviceHash = await getCurrentDeviceHash();
    return await callWithToken<T>(session.accessToken, { ...body, device_hash: deviceHash });
  } catch (error) {
    if (error instanceof Error && (error.message.endsWith('_401') || error.message.endsWith('_403'))) clearStoredAgentSession();
    throw error;
  }
}
