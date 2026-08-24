import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const edge = await readFile(new URL('../supabase/functions/llf-agent-ops/index.ts', import.meta.url), 'utf8');
const sql = await readFile(new URL('../backend/012_synthetic_realtime_console.sql', import.meta.url), 'utf8');
const page = await readFile(new URL('../src/pages/agent-mobile-demo.tsx', import.meta.url), 'utf8');
const policy = await readFile(new URL('../src/lib/agent-notification-policy.ts', import.meta.url), 'utf8');
const model = await readFile(new URL('../src/lib/conversation-model.ts', import.meta.url), 'utf8');
const session = await readFile(new URL('../src/lib/supabase-session.ts', import.meta.url), 'utf8');
const biometric = await readFile(new URL('../src/lib/agent-biometric-lock.ts', import.meta.url), 'utf8');
const biometricGate = await readFile(new URL('../src/components/agent-biometric-gate.tsx', import.meta.url), 'utf8');
const bootstrap = await readFile(new URL('../src/main.tsx', import.meta.url), 'utf8');
const realtime = await readFile(new URL('../src/lib/synthetic-realtime.ts', import.meta.url), 'utf8');
const serviceWorker = await readFile(new URL('../public/llf-agent-sw.js', import.meta.url), 'utf8');
const learning = await readFile(new URL('../src/lib/controlled-learning.ts', import.meta.url), 'utf8');
const learningPanel = await readFile(new URL('../src/components/controlled-learning-panel.tsx', import.meta.url), 'utf8');
const learningSql = await readFile(new URL('../backend/knowledge-gap-queue.sql', import.meta.url), 'utf8');
const learningContract = await readFile(new URL('../supabase/functions/llf-agent-ops/learning-write-contract.ts', import.meta.url), 'utf8');
const manifest = JSON.parse(await readFile(new URL('../public/manifest.webmanifest', import.meta.url), 'utf8'));
const mariaProtocol = await readFile(new URL('../docs/MARIA-AGENT-CONSOLE-PROTOCOL-ES.md', import.meta.url), 'utf8');
const mergeGate = await readFile(new URL('../../../docs/PR148-SECURITY-MERGE-GATE.md', import.meta.url), 'utf8');
const qaRunbook = await readFile(new URL('../../../docs/LLF-SYNTHETIC-REALTIME-QA.md', import.meta.url), 'utf8');
const equivalence = await readFile(new URL('../../../docs/PR148-PHYSICAL-QA-EQUIVALENCE.md', import.meta.url), 'utf8');
const qaPreviewOrigin = 'https://deploy-preview-190--llf-agent-qa.netlify.app';
const checks = [
['allowed production origins', edge.includes("'https://localleadforge.com'") && edge.includes("'https://www.localleadforge.com'")],
['current dedicated QA preview origin remains allowlisted', edge.includes(`'${qaPreviewOrigin}'`)],
['PR148-only preview origin is not unnecessarily widened', !edge.includes('deploy-preview-148--symphonious-travesseiro-c9bae1.netlify.app')],
['CORS wildcard remains absent', !edge.includes("'Access-Control-Allow-Origin': '*'")],
['active agent required', edge.includes(".eq('is_active', true)")],
['trusted device required', edge.includes("trustedDevice.trust_status !== 'TRUSTED'")],
['synthetic list filter', edge.includes(".eq('is_synthetic', true)")],
['synthetic mutation filter', edge.match(/\.eq\('is_synthetic', true\)/g)?.length >= 3],
['outbound message blocked', edge.includes('messaging_capability_blocked')],
['claim remains atomic on waiting and unassigned state', edge.includes(".eq('status', 'WAITING_FOR_AGENT').is('assigned_agent_user_id', null)") && edge.includes('conversation_not_claimable')],
['resolve requires active agent state', edge.includes(".eq('status', 'AGENT_ACTIVE')")],
['resolve fails closed when no row matches', edge.includes('conversation_not_resolvable')],
['pilot operator identity is centralized by auth user id', model.includes('PILOT_AGENT_USER_IDS') && model.includes('resolvePilotAgentId')],
['display-name heuristics do not choose operator identity', !page.includes("displayName.toLowerCase().includes('maria')")],
['unknown pilot operator blocks protected data load', page.includes('if (!me) { invalidateProtectedView(); return false; }')],
['unknown or busy operator blocks duplicate conversation actions', page.includes("if (!me || !current || actionState === 'saving') { setActionState('error'); return; }")],
['missing session is not labeled authenticated', page.includes("{session ? 'Authenticated' : 'Authentication required'}")],
['empty synthetic list has an explicit safe state', page.includes('No synthetic conversations are currently available. No conversation action can be taken.')],
['empty selection uses a non-actionable notification plan', page.includes('EMPTY_NOTIFICATION_PLAN')],
['unknown active assignment fails closed in UI', page.includes("current?.status === 'AGENT_ACTIVE' && current.assignedAgent !== me")],
['protected view is invalidated on load failure', page.includes('const invalidateProtectedView = () =>') && page.includes('setConversations([])') && page.includes("setSelectedId('')") && page.includes("setDataState('error')")],
['post-action refresh must confirm convergence', page.includes('const refreshed = await loadSyntheticConversations()') && page.includes("setActionState(refreshed ? 'idle' : 'error')")],
['stale protected data is not presented as current after refresh failure', page.includes('Stale conversation data has been cleared.')],
['protected refreshes are serialized', page.includes('refreshChainRef') && page.includes('refreshChainRef.current.then(execute, execute)')],
['session generation invalidates stale protected responses', page.includes('sessionGenerationRef') && page.includes('generation !== sessionGenerationRef.current') && page.includes('generation === sessionGenerationRef.current')],
['session change resets queued refresh chain', page.includes('refreshChainRef.current = Promise.resolve(false)')],
['session-bound ui resets on operator/session changes', page.includes('resetSessionBoundUi') && page.includes("setAvailabilityState('idle')") && page.includes("setActionState('idle')") && page.includes("setRealtimeState('CONNECTING')")],
['availability resyncs from the current authenticated session', page.includes("const nextAvailability = (next?.availability ?? 'OFFLINE') as AgentAvailability") && page.includes("CARLOS: nextAgent === 'CARLOS' ? nextAvailability : 'OFFLINE'") && page.includes("MARIA: nextAgent === 'MARIA' ? nextAvailability : 'OFFLINE'")],
['conversation action completion is generation guarded', page.includes('const generation = sessionGenerationRef.current') && page.includes("if (generation !== sessionGenerationRef.current) return;")],
['availability completion is generation guarded', page.includes("if (generation !== sessionGenerationRef.current) return;") && page.includes("if (generation === sessionGenerationRef.current) {\n        setAvailability")],
['availability changes are single-flight', page.includes("disabled={!me || availabilityState === 'saving'}") && page.includes("if (!me || availabilityState === 'saving')")],
['availability uses backend-confirmed state', page.includes("callAgentOps<{ ok: boolean; availability: AgentAvailability }>") && page.includes('result.availability') && page.includes('availability_confirmation_invalid')],
['session invalidation is reactive', session.includes('AGENT_SESSION_CHANGED_EVENT') && session.includes('emitSessionChanged()') && page.includes('window.addEventListener(AGENT_SESSION_CHANGED_EVENT, syncSession)')],
['invalid token expiry fails closed', session.includes("throw new Error('invalid_token_expiry')") && session.includes('Number.isFinite(session.expiresAt)')],
['trusted-device client guard remains fail closed', session.includes("session.deviceTrustStatus !== 'TRUSTED'")],
['Face ID gate wraps only an authenticated trusted session', bootstrap.includes("agentSession?.deviceTrustStatus === 'TRUSTED'") && bootstrap.includes('<AgentBiometricGate session={agentSession}>')],
['Face ID requires a platform authenticator and user verification', biometric.includes("authenticatorAttachment: 'platform'") && biometric.match(/userVerification: 'required'/g)?.length >= 2],
['Face ID credential identifier remains device-local', biometric.includes("window.localStorage.setItem(CREDENTIAL_KEY") && !biometric.includes('fetch(')],
['Face ID cancellation fails closed', biometricGate.includes('if (unlocked) return') && biometricGate.includes('setError(true)') && !biometricGate.includes('Continue without Face ID')],
['Agent Console provides explicit lock and sign-out controls', page.includes('requestAgentLock') && page.includes('clearStoredAgentSession()') && page.includes("window.location.replace('/agent-sign-in')")],
['auth hash is cleared from visible URL before network use', session.includes('history.replaceState({}, document.title, window.location.pathname + window.location.search)')],
['realtime requires trusted stored session before subscription', realtime.includes("session.deviceTrustStatus !== 'TRUSTED'")],
['private realtime topic', sql.includes("'llf-agent-console-synthetic'") && sql.includes("extension = 'broadcast'")],
['fixed refresh payload', sql.includes("jsonb_build_object('reason', lower(tg_op), 'entity', tg_table_name)")],
['protected data load precedes realtime subscription', page.indexOf('const loaded = await loadSyntheticConversations()') < page.indexOf('const value = await subscribeToSyntheticRefresh(')],
['late realtime subscription is removed after unmount', page.includes('if (!active) { await unsubscribeFromSyntheticRefresh(value); return; }')],
['backend conversation mapping remains wired to persisted relation names', page.includes('llf_conversation_messages') && page.includes('llf_conversation_handoff_facts')],
['notification plan exposes recipients plus UI primary/fallback contract', policy.includes('recipients: AgentId[]') && policy.includes('primary?: AgentId') && policy.includes('fallback?: AgentId')],
['reply UI disabled', page.includes('Real sending remains disabled during authenticated QA.')],
['return-to-AI UI disabled', page.includes('Return to AI — blocked during QA')],
['live notification transport disabled', policy.includes('LIVE_NOTIFICATION_TRANSPORT_ENABLED = false')],
['PWA opens only on protected Agent Console', manifest.id === '/agent-demo/' && manifest.start_url === '/agent-demo/' && manifest.display === 'standalone'],
['service worker never caches protected conversation data', !serviceWorker.includes("addEventListener('fetch'") && !serviceWorker.includes('caches.open') && !serviceWorker.includes('caches.match') && !serviceWorker.includes('cache.put')],
['push display is synthetic-QA only', serviceWorker.includes("payload.mode !== 'SYNTHETIC_QA'") && !serviceWorker.includes('payload.body') && !serviceWorker.includes('payload.title')],
['notification deep links stay on protected Agent Console', serviceWorker.includes("deepLink.startsWith('/agent-demo')")],
['controlled learning persists only in mapped-agent preview namespace', page.includes('llf-controlled-learning:${me}') && page.includes('saved.filter(isLearningQueueItem)')],
['controlled learning refuses sensitive material', learning.includes('SENSITIVE_PATTERNS') && learning.includes("return null")],
['controlled learning rejects unsafe control characters', learning.includes('UNSAFE_CONTROL_CHARACTERS') && learningContract.includes('UNSAFE_CONTROL_CHARACTERS')],
['controlled learning cannot represent approved answers', learning.includes("answerStatus: 'DRAFT_ONLY'") && !learning.includes("'APPROVED'") && learningPanel.includes('Approved content is never created automatically.')],
['persisted learning state is fingerprint and lifecycle checked', learning.includes('buildLearningFingerprint(item.normalizedQuestion, item.language) !== item.fingerprint') && learning.includes("(terminal ? 'ARCHIVED' : 'DRAFT_ONLY') !== item.answerStatus")],
['learning merges cannot cross language or workflow state', learning.includes('source.language !== target.language') && learning.includes("source.status !== 'OBSERVING' || target.status !== 'OBSERVING'")],
['shared learning writes remain release-gated', edge.includes('LEARNING_QUEUE_WRITE_ENABLED = false') && edge.includes('learning_queue_write_blocked')],
['learning approval and publication are backend-forbidden', edge.includes("'approve_learning_answer', 'publish_learning_answer'") && edge.includes('learning_approval_or_publication_blocked')],
['learning write contract remains non-mutating behind two gates', edge.includes('parseLearningWriteCommand(body)') && edge.includes('learning_queue_contract_not_activated') && edge.indexOf('!LEARNING_QUEUE_WRITE_ENABLED') < edge.indexOf('parseLearningWriteCommand(body)')],
['database cannot store approved learning answers', learningSql.includes("answer_status in ('DRAFT_ONLY','ARCHIVED')") && !learningSql.includes("answer_status in ('DRAFT_ONLY','APPROVED','ARCHIVED')")],
['database enforces evidence before review ready', learningSql.includes('llf_knowledge_gap_review_ready_evidence_check') && learningSql.includes('distinct_conversation_count >= 3') && learningSql.includes("nullif(btrim(draft_answer), '') is not null")],
['database learning tables remain private by explicit privilege', learningSql.includes('revoke all on table llf_knowledge_gap_queue from anon, authenticated') && learningSql.includes('revoke all on table llf_knowledge_gap_evidence from anon, authenticated')],
['database learning lifecycle and count bounds are constrained', learningSql.includes('llf_knowledge_gap_lifecycle_check') && learningSql.includes('llf_knowledge_gap_count_bounds_check') && learningSql.includes("status = 'MERGED' and merged_into_gap_id is not null")],
['database learning foreign-key delete paths are indexed', learningSql.includes('idx_llf_knowledge_gap_evidence_conversation') && learningSql.includes('idx_llf_knowledge_gap_evidence_source_message') && learningSql.includes('idx_llf_knowledge_gap_evidence_signal') && learningSql.includes('idx_llf_knowledge_gap_queue_updated_by_agent')],
['isolated learning signals cannot enter review', learning.includes('MIN_DISTINCT_CONVERSATIONS_FOR_REVIEW = 3') && learning.includes('hasLearningEvidenceForReview(item)') && learningPanel.includes('!hasLearningEvidenceForReview(item)')],
['Maria protocol points to replacement PR148 and QA carrier PR94', mariaProtocol.includes('PR #148') && mariaProtocol.includes('PR #94')],
['physical QA is not falsely marked complete', mariaProtocol.includes('PENDING_PHYSICAL')],
['merge gate remains HOLD pending physical QA', mergeGate.includes('**HOLD') && mergeGate.includes('## Physical QA still required')],
['runbook keeps production mutation blocked', qaRunbook.includes('No requiere desplegar') && qaRunbook.includes('no autoriza producción')],
['equivalence evidence explicitly selects PR94 as QA carrier', equivalence.includes('QA_CARRIER_PR_94')],
];
for (const [name, passed] of checks) { assert.equal(Boolean(passed), true, `FAIL: ${name}`); console.log(`PASS: ${name}`); }
console.log(`Agent Console static QA: ${checks.length}/${checks.length} checks passed.`);
