import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const llfRoot = path.resolve(here, '..');
const authSqlPath = path.join(llfRoot, 'backend', '003_auth_rls.sql');
const backendContractPath = path.join(llfRoot, 'src', 'lib', 'support-backend-contract.ts');

const authSql = fs.readFileSync(authSqlPath, 'utf8');
const backendContract = fs.readFileSync(backendContractPath, 'utf8');

function fail(message) {
  console.error(`SUPPORT AUTHORIZATION GATE FAILED: ${message}`);
  process.exitCode = 1;
}

function requireText(text, fragment, label) {
  if (!text.includes(fragment)) fail(`${label}: missing required fragment: ${fragment}`);
}

function requireRegex(text, regex, label) {
  if (!regex.test(text)) fail(`${label}: required invariant not found (${regex})`);
}

function forbidRegex(text, regex, label) {
  if (regex.test(text)) fail(`${label}: forbidden authorization pattern detected (${regex})`);
}

const normalizedSql = authSql.replace(/\s+/g, ' ').trim();
const statements = authSql
  .split(';')
  .map((statement) => statement.replace(/\s+/g, ' ').trim())
  .filter(Boolean);

const policies = statements.filter((statement) => /create policy /i.test(statement));

function policiesFor(tableName) {
  return policies.filter((statement) => new RegExp(`on ${tableName}\\b`, 'i').test(statement));
}

function findPolicy(tableName, action) {
  return policiesFor(tableName).find((statement) => new RegExp(`for ${action}\\b`, 'i').test(statement));
}

const supportTables = [
  'llf_conversations',
  'llf_conversation_messages',
  'llf_conversation_handoff_facts',
  'llf_agent_audit_log',
];

for (const table of supportTables) {
  const anonPolicy = policiesFor(table).find((statement) => /\bto anon\b/i.test(statement));
  if (anonPolicy) fail(`${table}: direct anon policy is forbidden; public visitors must remain server-mediated`);
}

const conversationSelect = findPolicy('llf_conversations', 'select');
if (!conversationSelect) {
  fail('llf_conversations: authenticated SELECT policy is required');
} else {
  requireText(conversationSelect, 'llf_is_active_agent()', 'conversation SELECT');
  requireText(conversationSelect, "audience = 'CLIENT'", 'conversation SELECT');
  requireText(conversationSelect, "channel = 'CLIENT_PORTAL'", 'conversation SELECT');
  requireText(conversationSelect, 'client_account_id is not null', 'conversation SELECT');
  requireText(conversationSelect, 'client_account_id = llf_current_client_account_id()', 'conversation SELECT');
  requireRegex(conversationSelect, /\bto authenticated\b/i, 'conversation SELECT');
}

const conversationUpdate = findPolicy('llf_conversations', 'update');
if (!conversationUpdate) {
  fail('llf_conversations: agent-only UPDATE policy is required');
} else {
  requireRegex(conversationUpdate, /\bto authenticated\b/i, 'conversation UPDATE');
  requireRegex(conversationUpdate, /using \(llf_is_active_agent\(\)\)/i, 'conversation UPDATE');
  requireRegex(conversationUpdate, /with check \(llf_is_active_agent\(\)\)/i, 'conversation UPDATE');
}

for (const action of ['insert', 'delete']) {
  if (findPolicy('llf_conversations', action)) {
    fail(`llf_conversations: direct authenticated ${action.toUpperCase()} policy is forbidden in this foundation`);
  }
}

const messageSelect = findPolicy('llf_conversation_messages', 'select');
if (!messageSelect) {
  fail('llf_conversation_messages: scoped SELECT policy is required');
} else {
  requireText(messageSelect, 'llf_is_active_agent()', 'message SELECT');
  requireText(messageSelect, 'from llf_conversations c', 'message SELECT');
  requireText(messageSelect, 'c.id = llf_conversation_messages.conversation_id', 'message SELECT');
  requireText(messageSelect, "c.audience = 'CLIENT'", 'message SELECT');
  requireText(messageSelect, "c.channel = 'CLIENT_PORTAL'", 'message SELECT');
  requireText(messageSelect, 'c.client_account_id = llf_current_client_account_id()', 'message SELECT');
}

for (const action of ['insert', 'update', 'delete']) {
  if (findPolicy('llf_conversation_messages', action)) {
    fail(`llf_conversation_messages: direct ${action.toUpperCase()} policy is forbidden; writes must remain server-mediated`);
  }
}

const handoffSelect = findPolicy('llf_conversation_handoff_facts', 'select');
if (!handoffSelect || !/using \(llf_is_active_agent\(\)\)/i.test(handoffSelect)) {
  fail('handoff facts must remain readable only by active LLF agents');
}

const auditSelect = findPolicy('llf_agent_audit_log', 'select');
if (!auditSelect || !/using \(llf_is_active_agent\(\)\)/i.test(auditSelect)) {
  fail('agent audit history must remain readable only by active LLF agents');
}

requireRegex(normalizedSql, /create or replace function llf_claim_conversation\(p_conversation_id uuid, p_agent_user_id uuid\)/i, 'claim function');
requireText(authSql, 'if auth.uid() is null then', 'claim function');
requireText(authSql, 'agent_identity_mismatch', 'claim function');
requireText(authSql, 'if not llf_is_active_agent() then', 'claim function');
requireText(authSql, "status = 'WAITING_FOR_AGENT'", 'claim function');
requireText(authSql, 'assigned_agent_user_id is null', 'claim function');
requireText(authSql, 'assigned_agent_user_id = auth.uid()', 'claim function');
requireRegex(normalizedSql, /revoke all on function llf_claim_conversation\(uuid, uuid\) from public/i, 'claim function');

const interfaceMatch = backendContract.match(/export interface SupportBackendAdapter \{([\s\S]*?)\n\}/);
if (!interfaceMatch) {
  fail('SupportBackendAdapter interface not found');
} else {
  const interfaceBody = interfaceMatch[1];
  forbidRegex(interfaceBody, /\b(?:agentUserId|agent_user_id|userId|user_id)\b/i, 'SupportBackendAdapter');
  requireText(interfaceBody, 'listAuthorizedConversations()', 'SupportBackendAdapter');
  requireText(interfaceBody, 'getConversation(conversationId: string)', 'SupportBackendAdapter');
  requireText(interfaceBody, 'listMessages(conversationId: string)', 'SupportBackendAdapter');
  requireText(interfaceBody, 'claimConversation(conversationId: string)', 'SupportBackendAdapter');
  requireText(interfaceBody, 'resolveConversation(conversationId: string)', 'SupportBackendAdapter');
}

requireText(
  backendContract,
  'Implementations must derive authorization from the authenticated server/session',
  'SupportBackendAdapter documentation',
);
requireText(backendContract, 'class DisabledSupportBackendAdapter', 'disabled adapter');
requireText(
  backendContract,
  'LLF live support backend is disabled until Auth/RLS security QA passes.',
  'disabled adapter',
);

if (!process.exitCode) {
  console.log('SUPPORT AUTHORIZATION GATE PASSED');
  console.log('- no direct anonymous support-table policies');
  console.log('- client conversation/message reads remain account-scoped');
  console.log('- conversation mutation remains active-agent only');
  console.log('- message writes remain server-mediated by omission');
  console.log('- atomic claim remains authenticated, identity-bound, active-agent-only and single-winner');
  console.log('- backend adapter accepts no caller-supplied user/agent identity proof');
  console.log('- disabled adapter remains fail-closed until Auth/RLS security QA passes');
}
