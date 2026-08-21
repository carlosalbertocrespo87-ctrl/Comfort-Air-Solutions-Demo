import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const edge = await readFile(new URL('../supabase/functions/llf-agent-ops/index.ts', import.meta.url), 'utf8');
const sql = await readFile(new URL('../backend/012_synthetic_realtime_console.sql', import.meta.url), 'utf8');
const page = await readFile(new URL('../src/pages/agent-mobile-demo.tsx', import.meta.url), 'utf8');
const policy = await readFile(new URL('../src/lib/agent-notification-policy.ts', import.meta.url), 'utf8');
const mariaProtocol = await readFile(new URL('../docs/MARIA-AGENT-CONSOLE-PROTOCOL-ES.md', import.meta.url), 'utf8');
const mergeGate = await readFile(new URL('../../../docs/PR148-SECURITY-MERGE-GATE.md', import.meta.url), 'utf8');
const qaRunbook = await readFile(new URL('../../../docs/LLF-SYNTHETIC-REALTIME-QA.md', import.meta.url), 'utf8');

const currentPreviewOrigin = 'https://deploy-preview-148--symphonious-travesseiro-c9bae1.netlify.app';

const checks = [
  ['allowed production origins', edge.includes("'https://localleadforge.com'") && edge.includes("'https://www.localleadforge.com'")],
  ['current PR148 preview origin prepared in source', edge.includes(`'${currentPreviewOrigin}'`)],
  ['CORS wildcard remains absent', !edge.includes("'Access-Control-Allow-Origin': '*'") && !edge.includes('"Access-Control-Allow-Origin": "*"')],
  ['active agent required', edge.includes(".eq('is_active', true)")],
  ['trusted device required', edge.includes("trustedDevice.trust_status !== 'TRUSTED'")],
  ['synthetic list filter', edge.includes(".eq('is_synthetic', true)")],
  ['synthetic mutation filter', edge.match(/\.eq\('is_synthetic', true\)/g)?.length >= 3],
  ['outbound message blocked', edge.includes('messaging_capability_blocked')],
  ['private realtime topic', sql.includes("'llf-agent-console-synthetic'") && sql.includes("extension = 'broadcast'")],
  ['fixed refresh payload', sql.includes("jsonb_build_object('reason', lower(tg_op), 'entity', tg_table_name)")],
  ['realtime capability remains gated', sql.includes('activation waits for two-device authenticated QA')],
  ['reply UI disabled', page.includes('Real sending remains disabled during authenticated QA.')],
  ['return-to-AI UI disabled', page.includes('Return to AI — blocked during QA')],
  ['live notification transport disabled', policy.includes('LIVE_NOTIFICATION_TRANSPORT_ENABLED = false')],
  ['Maria protocol points to replacement PR148', mariaProtocol.includes('PR #148')],
  ['physical QA is not falsely marked complete', mariaProtocol.includes('PENDING_PHYSICAL') && mariaProtocol.includes('Segundo reclamo simultáneo bloqueado: `PENDING_PHYSICAL`')],
  ['merge gate remains HOLD pending physical QA', mergeGate.includes('**HOLD') && mergeGate.includes('QA físico')],
  ['runbook keeps production mutation separate', qaRunbook.includes('SOURCE_ONLY_NOT_DEPLOYED') && qaRunbook.includes('no autoriza desplegar')],
];

for (const [name, passed] of checks) {
  assert.equal(Boolean(passed), true, `FAIL: ${name}`);
  console.log(`PASS: ${name}`);
}

console.log(`Agent Console static QA: ${checks.length}/${checks.length} checks passed.`);
