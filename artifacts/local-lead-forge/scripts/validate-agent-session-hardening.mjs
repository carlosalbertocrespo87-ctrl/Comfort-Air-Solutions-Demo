import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const session = await readFile(new URL('../src/lib/supabase-session.ts', import.meta.url), 'utf8');
const signIn = await readFile(new URL('../src/pages/agent-sign-in.tsx', import.meta.url), 'utf8');
const hardening = await readFile(new URL('../../../docs/AGENT-SESSION-HARDENING-OPTIONS.md', import.meta.url), 'utf8');

const durableSessionWrites = [...session.matchAll(/localStorage\.setItem\(([^,\n]+)/g)].map((match) => match[1]?.trim());
const hashClearIndex = session.indexOf('history.replaceState({}, document.title, window.location.pathname + window.location.search)');
const establishIndex = session.indexOf('await establishAgentSession(accessToken, expiresAt)');

const checks = [
  ['Option A remains the documented first-live recommendation', hardening.includes('Option A — ephemeral Agent session for first live release') && hardening.includes('implement Option A first')],
  ['Issue #210 remains the pre-live controller', hardening.includes('Controller: GitHub Issue #210')],
  ['agent session is written only to sessionStorage', session.includes('window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))') && !session.includes('window.localStorage.setItem(SESSION_KEY')],
  ['durable localStorage writes are limited to the non-secret device install identifier', durableSessionWrites.length === 1 && durableSessionWrites[0] === 'DEVICE_INSTALL_KEY'],
  ['legacy durable agent-session record is actively purged', session.includes('window.localStorage.removeItem(SESSION_KEY)')],
  ['legacy auth bridge cookie is deletion-only', session.includes("const LEGACY_AUTH_BRIDGE_COOKIE = '__Host-llf_agent_auth_bridge_v1'") && session.includes('Max-Age=0') && !session.includes('AUTH_BRIDGE_MAX_AGE_SECONDS') && !session.includes('writeAuthBridge') && !session.includes('readAuthBridge')],
  ['refresh token is never captured or refreshed by Agent Console', !session.includes("params.get('refresh_token')") && !session.includes('refreshAuthBridge') && !session.includes('grant_type=refresh_token')],
  ['hydration cannot restore durable credentials', session.includes('export async function hydratePersistedAgentSession()') && session.includes('return getStoredAgentSession();')],
  ['visible auth hash is removed before the access token is used', hashClearIndex >= 0 && establishIndex > hashClearIndex],
  ['expired access tokens fail closed locally', session.includes("throw new Error('invalid_token_expiry')") && session.includes('Date.now() >= session.expiresAt * 1000')],
  ['backend calls still omit ambient cookies', session.includes("credentials: 'omit'")],
  ['trusted-device guard remains mandatory', session.includes("session.deviceTrustStatus !== 'TRUSTED'") && session.includes("throw new Error('trusted_device_required')")],
  ['copied magic-link handoff remains exact-origin and exact-project restricted', signIn.includes("approved.hostname === 'iogjlzizzegqarkfyzzx.supabase.co'") && signIn.includes("redirect.origin === window.location.origin") && signIn.includes("redirect.pathname.replace(/\\/+$/, '') === '/agent-demo'")],
  ['sign-in client itself never persists or refreshes a Supabase session', signIn.includes('persistSession: false') && signIn.includes('autoRefreshToken: false') && signIn.includes('detectSessionInUrl: false')],
];

for (const [name, passed] of checks) {
  assert.equal(Boolean(passed), true, `FAIL: ${name}`);
  console.log(`PASS: ${name}`);
}

console.log(`Agent session hardening static QA: ${checks.length}/${checks.length} checks passed.`);
