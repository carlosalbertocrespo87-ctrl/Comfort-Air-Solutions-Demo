import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://iogjlzizzegqarkfyzzx.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_F9KY7_PBrERwwQjvpoIv5A_bxk_mVXV';
const SESSION_KEY = 'llf_agent_session_v1';
const DEVICE_INSTALL_KEY = 'llf_device_install_id_v1';
const LEGACY_AUTH_BRIDGE_COOKIE = '__Host-llf_agent_auth_bridge_v1';
const PERSISTENT_AUTH_STORAGE_KEY = 'llf_agent_auth_v2';
export const AGENT_SESSION_CHANGED_EVENT = 'llf-agent-session-changed';

const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storageKey: PERSISTENT_AUTH_STORAGE_KEY,
  },
});

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

function emitSessionChanged(): void {
  window.dispatchEvent(new Event(AGENT_SESSION_CHANGED_EVENT));
}

function parseHash(): URLSearchParams {
  return new URLSearchParams(window.location.hash.startsWith('#') ? window.location.hash.slice(1) : '');
}

function purgeLegacyPersistentAuthArtifacts(): void {
  window.localStorage.removeItem(SESSION_KEY);
  document.cookie = `${LEGACY_AUTH_BRIDGE_COOKIE}=; Path=/; Max-Age=0; Secure; SameSite=Strict`;
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
  purgeLegacyPersistentAuthArtifacts();
  void supabaseAuth.auth.signOut({ scope: 'local' });
  emitSessionChanged();
}

function clearStoredSessionRecord(): void {
  window.sessionStorage.removeItem(SESSION_KEY);
  purgeLegacyPersistentAuthArtifacts();
}

function storeAgentSession(session: LLFAgentSession): void {
  purgeLegacyPersistentAuthArtifacts();
  window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  emitSessionChanged();
}

export function getStoredAgentSession(): LLFAgentSession | null {
  purgeLegacyPersistentAuthArtifacts();
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as LLFAgentSession;
    if (session.expiresAt !== undefined && (!Number.isFinite(session.expiresAt) || Date.now() >= session.expiresAt * 1000)) {
      clearStoredSessionRecord();
      return null;
    }
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

async function getPersistentAuthSession(): Promise<{ accessToken: string; expiresAt?: number } | null> {
  const { data, error } = await supabaseAuth.auth.getSession();
  if (error || !data.session) return null;
  return {
    accessToken: data.session.access_token,
    expiresAt: data.session.expires_at,
  };
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

export async function hydratePersistedAgentSession(): Promise<LLFAgentSession | null> {
  purgeLegacyPersistentAuthArtifacts();
  const existing = getStoredAgentSession();
  if (existing) return existing;

  try {
    const persisted = await getPersistentAuthSession();
    if (!persisted) return null;
    return await establishAgentSession(persisted.accessToken, persisted.expiresAt);
  } catch {
    clearStoredSessionRecord();
    return null;
  }
}

export async function requestPersistentAgentSignIn(email: string, redirectTo: string): Promise<void> {
  const { error } = await supabaseAuth.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: redirectTo,
    },
  });
  if (error) throw error;
}

export async function consumeSupabaseAuthHash(): Promise<'consumed' | 'none' | 'error'> {
  if (!window.location.hash) return 'none';
  const params = parseHash();
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');
  const authError = params.get('error') || params.get('error_description');
  history.replaceState({}, document.title, window.location.pathname + window.location.search);
  if (authError || !accessToken) {
    clearStoredAgentSession();
    return authError ? 'error' : 'none';
  }
  try {
    let activeAccessToken = accessToken;
    let expiresAt = parseTokenExpiry(params);

    if (refreshToken) {
      const { data, error } = await supabaseAuth.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (error || !data.session) throw error ?? new Error('persistent_session_setup_failed');
      activeAccessToken = data.session.access_token;
      expiresAt = data.session.expires_at;
    }

    await establishAgentSession(activeAccessToken, expiresAt);
    return 'consumed';
  } catch {
    clearStoredAgentSession();
    return 'error';
  }
}

export async function reconcileStoredDeviceTrust(): Promise<LLFAgentSession | null> {
  let session = getStoredAgentSession();
  if (!session) return null;

  try {
    const persisted = await getPersistentAuthSession();
    if (persisted && persisted.accessToken !== session.accessToken) {
      session = { ...session, accessToken: persisted.accessToken, expiresAt: persisted.expiresAt };
      storeAgentSession(session);
    }

    if (session.deviceTrustStatus === 'REVOKED') return session;

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
    return updated;
  } catch (error) {
    if (error instanceof Error && (error.message.endsWith('_401') || error.message.endsWith('_403'))) clearStoredAgentSession();
    return getStoredAgentSession();
  }
}

export async function callAgentOps<T = unknown>(body: Record<string, unknown>): Promise<T> {
  let session = getStoredAgentSession();
  if (!session) throw new Error('authentication_required');
  if (session.deviceTrustStatus !== 'TRUSTED') throw new Error('trusted_device_required');
  try {
    const persisted = await getPersistentAuthSession();
    if (persisted && persisted.accessToken !== session.accessToken) {
      session = { ...session, accessToken: persisted.accessToken, expiresAt: persisted.expiresAt };
      storeAgentSession(session);
    }
    const deviceHash = await getCurrentDeviceHash();
    return await callWithToken<T>(session.accessToken, { ...body, device_hash: deviceHash });
  } catch (error) {
    if (error instanceof Error && (error.message.endsWith('_401') || error.message.endsWith('_403'))) clearStoredAgentSession();
    throw error;
  }
}
