const SUPABASE_URL = 'https://iogjlzizzegqarkfyzzx.supabase.co';
const SESSION_KEY = 'llf_supabase_session_v1';

export type LLFAuthSession = {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  tokenType: string;
  userId: string;
  email?: string;
};

function parseHash(): URLSearchParams {
  return new URLSearchParams(window.location.hash.startsWith('#') ? window.location.hash.slice(1) : '');
}

function decodeJwtPayload(token: string): { sub?: string; email?: string } {
  const [, payload] = token.split('.');
  if (!payload) return {};
  try {
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(normalized)
        .split('')
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join(''),
    );
    return JSON.parse(json) as { sub?: string; email?: string };
  } catch {
    return {};
  }
}

export function getStoredSession(): LLFAuthSession | null {
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as LLFAuthSession;
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

export function clearStoredSession(): void {
  window.sessionStorage.removeItem(SESSION_KEY);
}

async function callAgentOpsWithToken<T>(accessToken: string, body: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/llf-agent-ops`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  if (!response.ok) throw new Error(`agent_ops_failed_${response.status}`);
  return (await response.json()) as T;
}

export async function consumeSupabaseAuthHash(): Promise<'consumed' | 'none' | 'error'> {
  if (!window.location.hash) return 'none';

  const params = parseHash();
  const accessToken = params.get('access_token');
  const error = params.get('error') || params.get('error_description');

  // Never leave session credentials in the visible URL.
  history.replaceState({}, document.title, window.location.pathname + window.location.search);

  if (error || !accessToken) return error ? 'error' : 'none';

  try {
    const jwt = decodeJwtPayload(accessToken);
    if (!jwt.sub) return 'error';

    await callAgentOpsWithToken(accessToken, { action: 'session_info' });

    const expiresAtRaw = params.get('expires_at');
    const expiresInRaw = params.get('expires_in');
    const expiresAt = expiresAtRaw
      ? Number(expiresAtRaw)
      : expiresInRaw
        ? Math.floor(Date.now() / 1000) + Number(expiresInRaw)
        : undefined;

    const session: LLFAuthSession = {
      accessToken,
      refreshToken: params.get('refresh_token') || undefined,
      expiresAt,
      tokenType: params.get('token_type') || 'bearer',
      userId: jwt.sub,
      email: jwt.email,
    };

    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    history.replaceState({}, document.title, '/agent-demo');
    return 'consumed';
  } catch {
    clearStoredSession();
    return 'error';
  }
}

export async function callAgentOps<T = unknown>(body: Record<string, unknown>): Promise<T> {
  const session = getStoredSession();
  if (!session) throw new Error('authentication_required');

  try {
    return await callAgentOpsWithToken<T>(session.accessToken, body);
  } catch (error) {
    if (String(error).includes('401') || String(error).includes('403')) clearStoredSession();
    throw error;
  }
}
