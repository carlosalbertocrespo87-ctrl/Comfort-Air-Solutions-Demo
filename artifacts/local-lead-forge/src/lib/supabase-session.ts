const SUPABASE_URL = 'https://iogjlzizzegqarkfyzzx.supabase.co';
const SESSION_KEY = 'llf_agent_session_v1';

export type LLFAgentSession = {
  accessToken: string;
  expiresAt?: number;
  agentUserId: string;
  displayName: string;
  availability: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
};

function parseHash(): URLSearchParams {
  return new URLSearchParams(window.location.hash.startsWith('#') ? window.location.hash.slice(1) : '');
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
    const response = await fetch(`${SUPABASE_URL}/functions/v1/llf-agent-ops`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'session_info' }),
      cache: 'no-store',
      credentials: 'omit',
    });

    if (!response.ok) {
      clearStoredAgentSession();
      return 'error';
    }

    const payload = (await response.json()) as {
      ok: boolean;
      agent?: {
        user_id: string;
        display_name: string;
        availability: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
      };
    };

    if (!payload.ok || !payload.agent) {
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
      agentUserId: payload.agent.user_id,
      displayName: payload.agent.display_name,
      availability: payload.agent.availability,
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

  const response = await fetch(`${SUPABASE_URL}/functions/v1/llf-agent-ops`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
    credentials: 'omit',
  });

  if (response.status === 401 || response.status === 403) clearStoredAgentSession();
  if (!response.ok) throw new Error(`agent_ops_failed_${response.status}`);
  return (await response.json()) as T;
}
