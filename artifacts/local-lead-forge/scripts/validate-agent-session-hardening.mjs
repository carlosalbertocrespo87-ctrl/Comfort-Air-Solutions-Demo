import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const session = await readFile(new URL('../src/lib/supabase-session.ts', import.meta.url), 'utf8');
const signIn = await readFile(new URL('../src/pages/agent-sign-in.tsx', import.meta.url), 'utf8');
const hardening = await readFile(new URL('../../../docs/AGENT-SESSION-HARDENING-OPTIONS.md', import.meta.url), 'utf8');

const durableSessionWrites = [...session.matchAll(/localStorage\.setItem\(([^,\n]+)/g)].map((match) => match[1]?.trim());
const hashClearIndex = session.indexOf('history.replaceState({}, document.title, window.location.pathname + window.location.search)');
const persistentSetSessionIndex = session.indexOf('await supabaseAuth.auth.setSession');

const checks = [
  ['Option A2 is the documented Carlos-only QA decision', hardening.includes('Option A2 — persistent Supabase Auth session on Carlos\'s trusted iPhone + mandatory Face ID gate') && hardening.includes('CARLOS-ONLY PERSISTENT IPHONE SESSION IN QA')],
  ['Issue #210 remains the pre-live controller', hardening.includes('Controller: GitHub Issue #210')],
  ['custom agent session is still written only to sessionStorage', session.includes('window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))') && !session.includes('window.localStorage.setItem(SESSION_KEY')],
  ['direct LLF localStorage writes remain limited to the non-secret device install identifier', durableSessionWrites.length === 1 && durableSessionWrites[0] === 'DEVICE_INSTALL_KEY'],
  ['legacy durable custom agent-session record is actively purged', session.includes('window.localStorage.removeItem(SESSION_KEY)')],
  ['legacy auth bridge cookie remains deletion-only', session.includes("const LEGACY_AUTH_BRIDGE_COOKIE = '__Host-llf_agent_auth_bridge_v1'") && session.includes('Max-Age=0') && !session.includes('AUTH_BRIDGE_MAX_AGE_SECONDS') && !session.includes('writeAuthBridge') && !session.includes('readAuthBridge')],
  ['Supabase persistence is explicit and namespaced', session.includes('persistSession: true') && session.includes('autoRefreshToken: true') && session.includes("const PERSISTENT_AUTH_STORAGE_KEY = 'llf_agent_auth_v2'") && session.includes('storageKey: PERSISTENT_AUTH_STORAGE_KEY')],
  ['refresh credential is handed only to Supabase Auth and not copied into LLF custom session', session.includes("params.get('refresh_token')") && session.includes('refresh_token: refreshToken') && !session.includes('refreshToken: string') && !session.includes('refreshToken?: string')],
  ['persisted auth hydration revalidates the LLF agent and device', session.includes('const persisted = await getPersistentAuthSession()') && session.includes('return await establishAgentSession(persisted.accessToken, persisted.expiresAt)') && session.includes("action: 'session_info'") && session.includes("action: 'register_device'")],
  ['visible auth hash is removed before persistent session setup', hashClearIndex >= 0 && persistentSetSessionIndex > hashClearIndex],
  ['expired custom access tokens still fail closed locally', session.includes("throw new Error('invalid_token_expiry')") && session.includes('Date.now() >= session.expiresAt * 1000')],
  ['backend calls still omit ambient cookies', session.includes("credentials: 'omit'")],
  ['trusted-device guard remains mandatory', session.includes("session.deviceTrustStatus !== 'TRUSTED'") && session.includes("throw new Error('trusted_device_required')")],
  ['explicit sign-out clears persisted Supabase auth locally', session.includes("supabaseAuth.auth.signOut({ scope: 'local' })")],
  ['copied activation-link handoff remains exact-origin and exact-project restricted', signIn.includes("approved.hostname === 'iogjlzizzegqarkfyzzx.supabase.co'") && signIn.includes("redirect.origin === window.location.origin") && signIn.includes("redirect.pathname.replace(/\\/+$/, '') === '/agent-demo'")],
  ['one-time activation is pinned to Carlos approved auth account', signIn.includes("const APPROVED_CARLOS_EMAIL = 'localleadforgeagency@gmail.com'") && signIn.includes('requestPersistentAgentSignIn') && !signIn.includes('type="email"')],
  ['daily UX still preserves Face ID rather than bypassing authentication', hardening.includes('Face ID / platform WebAuthn') && hardening.includes("userVerification: 'required'") && !hardening.includes('Continue without Face ID')],
];

for (const [name, passed] of checks) {
  assert.equal(Boolean(passed), true, `FAIL: ${name}`);
  console.log(`PASS: ${name}`);
}

console.log(`Agent session hardening static QA: ${checks.length}/${checks.length} checks passed.`);
