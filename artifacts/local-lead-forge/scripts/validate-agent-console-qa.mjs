import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const edge = await readFile(new URL('../supabase/functions/llf-agent-ops/index.ts', import.meta.url), 'utf8');
const sql = await readFile(new URL('../backend/012_synthetic_realtime_console.sql', import.meta.url), 'utf8');
const page = await readFile(new URL('../src/pages/agent-mobile-demo.tsx', import.meta.url), 'utf8');
const policy = await readFile(new URL('../src/lib/agent-notification-policy.ts', import.meta.url), 'utf8');

const checks = [
  ['allowed production origins', edge.includes("'https://localleadforge.com'") && edge.includes("'https://www.localleadforge.com'")],
  ['active agent required', edge.includes(".eq('is_active', true)")],
  ['trusted device required', edge.includes("trustedDevice.trust_status !== 'TRUSTED'")],
  ['synthetic list filter', edge.includes(".eq('is_synthetic', true)")],
  ['synthetic mutation filter', edge.match(/\.eq\('is_synthetic', true\)/g)?.length >= 3],
  ['outbound message blocked', edge.includes("messaging_capability_blocked")],
  ['private realtime topic', sql.includes("'llf-agent-console-synthetic'") && sql.includes("extension = 'broadcast'")],
  ['fixed refresh payload', sql.includes("jsonb_build_object('reason', lower(tg_op), 'entity', tg_table_name)")],
  ['realtime capability remains gated', sql.includes('activation waits for two-device authenticated QA')],
  ['reply UI disabled', page.includes('Real sending remains disabled during authenticated QA.')],
  ['return-to-AI UI disabled', page.includes('Return to AI — blocked during QA')],
  ['live notification transport disabled', policy.includes('LIVE_NOTIFICATION_TRANSPORT_ENABLED = false')],
];

for (const [name, passed] of checks) {
  assert.equal(Boolean(passed), true, `FAIL: ${name}`);
  console.log(`PASS: ${name}`);
}

console.log(`Agent Console static QA: ${checks.length}/${checks.length} checks passed.`);
