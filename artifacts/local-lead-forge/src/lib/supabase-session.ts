const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
const SESSION_KEY = 'llf_supabase_session_v1';

export type LLFAuthSession = {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  tokenType: string;
  userId: string;
  email?: string;
};

function requireConfig(): { url: string; key: string } {
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) throw new Error('supabase_frontend_config_missing');
  return { url: SUPABASE_URL, key: SUPABASE_PUBLISHABLE_KEY };
}

function parseHash(): URLSearchParams {
  return new URLSearchParams(window.location.hash.startsWith('#') ? window.location.hash.slice(1) : '');
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

export async function consumeSupabaseAuthHash(): Promise<'consumed' | 'none' | 'error'> {
  if (!window.location.hash) return 'none';

  const params = parseHash();
  const accessToken = params.get('access_token');
  const error = params.get('error') || params.get('error_description');

  if (error) {
    history.replaceState({}, document.title, window.location.pathname + window.location.search);
    return 'error';
  }

  if (!accessToken) return 'none';

  history.replaceState({}, document.title, window.location.pathname + window.location.search);

  try {
    const { url, key } = requireConfig();
    const response = await fetch(`${url}/auth/v1/user`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      clearStoredSession();
      return 'error';
    }

    const user = (await response.json()) as { id: string; email?: string };
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
      userId: user.id,
      email: user.email,
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
  const { url, key } = requireConfig();

  const response = await fetch(`${url}/functions/v1/llf-agent-ops`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${session.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  if (response.status === 401) clearStoredSession();
  if (!response.ok) throw new Error(`agent_ops_failed_${response.status}`);
  return (await response.json()) as T;
}
