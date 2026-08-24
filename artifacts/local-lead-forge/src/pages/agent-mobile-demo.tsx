import { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, Bot, ChevronLeft, MessageCircle, ShieldCheck, Smartphone, Users } from 'lucide-react';
import { AgentMacroDrawer } from '@/components/agent-macro-drawer';
import { ControlledLearningPanel } from '@/components/controlled-learning-panel';
import { archiveLearningItem, isLearningQueueItem, queueLearningCandidate, type LearningQueueItem } from '@/lib/controlled-learning';
import { detectConversationLanguage, shouldQueueNewQuestion, type MacroLanguage } from '@/lib/agent-macros';
import { INITIAL_AGENTS, resolvePilotAgentId, type AgentId, type Conversation } from '@/lib/conversation-model';
import { planAgentNotification, type AgentAvailability, type NotificationPlan } from '@/lib/agent-notification-policy';
import { AGENT_SESSION_CHANGED_EVENT, callAgentOps, getStoredAgentSession, type LLFAgentSession } from '@/lib/supabase-session';
import { subscribeToSyntheticRefresh, unsubscribeFromSyntheticRefresh, type SyntheticRealtimeState } from '@/lib/synthetic-realtime';

const seed: Conversation[] = [
  { id: '10000000-0000-4000-8000-000000000001', audience: 'CLIENT', channel: 'CLIENT_PORTAL', status: 'WAITING_FOR_AGENT', contactName: '[QA] Alex', companyName: '[QA] ABC Heating & Air', messages: [] },
  { id: '10000000-0000-4000-8000-000000000002', audience: 'PROSPECT', channel: 'PUBLIC_WEB', status: 'WAITING_FOR_AGENT', contactName: '[QA] Jordan', companyName: '[QA] Peachtree HVAC', messages: [] },
];

const EMPTY_NOTIFICATION_PLAN: NotificationPlan = { shouldNotify: false, recipients: [], escalationLabel: 'NORMAL', reason: 'No synthetic conversation selected.' };

export default function AgentMobileDemoPage() {
  const [session, setSession] = useState<LLFAgentSession | null>(() => getStoredAgentSession());
  const me = resolvePilotAgentId(session?.agentUserId);
  const initialAvailability = (session?.availability ?? 'OFFLINE') as AgentAvailability;
  const [conversations, setConversations] = useState(seed);
  const [selectedId, setSelectedId] = useState(seed[0].id);
  const [availability, setAvailability] = useState<Record<AgentId, AgentAvailability>>({ CARLOS: me === 'CARLOS' ? initialAvailability : 'OFFLINE', MARIA: me === 'MARIA' ? initialAvailability : 'OFFLINE' });
  const [availabilityState, setAvailabilityState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [dataState, setDataState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [realtimeState, setRealtimeState] = useState<SyntheticRealtimeState>('CONNECTING');
  const [actionState, setActionState] = useState<'idle' | 'saving' | 'error'>('idle');
  const [composerDrafts, setComposerDrafts] = useState<Record<string, string>>({});
  const [languageByConversation, setLanguageByConversation] = useState<Record<string, MacroLanguage>>({});
  const [learningQueue, setLearningQueue] = useState<LearningQueueItem[]>([]);
  const [learningQueueLoaded, setLearningQueueLoaded] = useState(false);
  const refreshChainRef = useRef<Promise<boolean>>(Promise.resolve(true));
  const sessionGenerationRef = useRef(0);
  const current = conversations.find((item) => item.id === selectedId) ?? conversations[0];

  const invalidateProtectedView = () => {
    setConversations([]);
    setSelectedId('');
    setDataState('error');
  };

  const resetSessionBoundUi = (next: LLFAgentSession | null) => {
    const nextAgent = resolvePilotAgentId(next?.agentUserId);
    const nextAvailability = (next?.availability ?? 'OFFLINE') as AgentAvailability;
    setAvailability({
      CARLOS: nextAgent === 'CARLOS' ? nextAvailability : 'OFFLINE',
      MARIA: nextAgent === 'MARIA' ? nextAvailability : 'OFFLINE',
    });
    setAvailabilityState('idle');
    setActionState('idle');
    setRealtimeState('CONNECTING');
    setComposerDrafts({});
    setLanguageByConversation({});
    setLearningQueue([]);
    setLearningQueueLoaded(false);
    setConversations([]);
    setSelectedId('');
    setDataState(next ? 'loading' : 'error');
  };

  useEffect(() => {
    const syncSession = () => {
      const next = getStoredAgentSession();
      sessionGenerationRef.current += 1;
      refreshChainRef.current = Promise.resolve(false);
      setSession(next);
      resetSessionBoundUi(next);
    };
    window.addEventListener(AGENT_SESSION_CHANGED_EVENT, syncSession);
    return () => window.removeEventListener(AGENT_SESSION_CHANGED_EVENT, syncSession);
  }, []);

  const loadSyntheticConversations = (): Promise<boolean> => {
    const execute = async (): Promise<boolean> => {
      const generation = sessionGenerationRef.current;
      if (!me) { invalidateProtectedView(); return false; }
      try {
        const result = await callAgentOps<{ ok: boolean; conversations: BackendConversation[] }>({ action: 'list_synthetic_conversations' });
        if (generation !== sessionGenerationRef.current) return false;
        const mapped = result.conversations.map(mapBackendConversation);
        setConversations(mapped);
        setSelectedId((value) => mapped.some((item) => item.id === value) ? value : (mapped[0]?.id ?? ''));
        setDataState('ready');
        return true;
      } catch {
        if (generation === sessionGenerationRef.current) invalidateProtectedView();
        return false;
      }
    };
    const next = refreshChainRef.current.then(execute, execute);
    refreshChainRef.current = next.catch(() => false);
    return next;
  };

  useEffect(() => {
    let active = true;
    let channel: Awaited<ReturnType<typeof subscribeToSyntheticRefresh>> | undefined;
    const startRealtime = async () => {
      const loaded = await loadSyntheticConversations();
      if (!active || !loaded) { if (active) setRealtimeState('CHANNEL_ERROR'); return; }
      try {
        const value = await subscribeToSyntheticRefresh(
          () => { if (active) void loadSyntheticConversations(); },
          (state) => { if (active) setRealtimeState(state); },
        );
        if (!active) { await unsubscribeFromSyntheticRefresh(value); return; }
        channel = value;
      } catch { if (active) setRealtimeState('CHANNEL_ERROR'); }
    };
    void startRealtime();
    return () => { active = false; if (channel) void unsubscribeFromSyntheticRefresh(channel); };
  }, [me]);

  const notificationPlan = useMemo(() => current ? planAgentNotification(current, [
    { agent: 'CARLOS', availability: availability.CARLOS },
    { agent: 'MARIA', availability: availability.MARIA },
  ]) : EMPTY_NOTIFICATION_PLAN, [current, availability]);

  const latestCustomerEntry = useMemo(() => {
    if (!current) return undefined;
    return [...current.messages].reverse().find((message) => message.author === 'VISITOR');
  }, [current]);
  const latestCustomerMessage = latestCustomerEntry?.body ?? '';

  useEffect(() => {
    if (!current || !latestCustomerMessage.trim()) return;
    setLanguageByConversation((value) => {
      const nextLanguage = detectConversationLanguage(latestCustomerMessage, value[current.id] ?? 'EN');
      return value[current.id] === nextLanguage ? value : { ...value, [current.id]: nextLanguage };
    });
  }, [current?.id, latestCustomerMessage]);

  useEffect(() => {
    if (!me) {
      setLearningQueue([]);
      setLearningQueueLoaded(true);
      return;
    }
    try {
      const saved = JSON.parse(localStorage.getItem(`llf-controlled-learning:${me}`) ?? '[]');
      setLearningQueue(Array.isArray(saved) ? saved.filter(isLearningQueueItem) : []);
    } catch {
      setLearningQueue([]);
    } finally {
      setLearningQueueLoaded(true);
    }
  }, [me]);

  useEffect(() => {
    if (!me || !learningQueueLoaded) return;
    try {
      localStorage.setItem(`llf-controlled-learning:${me}`, JSON.stringify(learningQueue));
    } catch {
      // Preview-local persistence is optional; approved content remains unchanged.
    }
  }, [learningQueue, learningQueueLoaded, me]);

  const detectedLanguage = current ? (languageByConversation[current.id] ?? detectConversationLanguage(latestCustomerMessage, 'EN')) : 'EN';
  const assignedElsewhere = !me || Boolean(current?.status === 'AGENT_ACTIVE' && current.assignedAgent !== me);
  const canDraft = Boolean(me && current?.status === 'AGENT_ACTIVE' && !assignedElsewhere);
  const composerDraft = current ? (composerDrafts[current.id] ?? '') : '';

  const insertMacroDraft = (text: string) => {
    if (!current || !canDraft) return;
    setComposerDrafts((value) => {
      const previous = value[current.id]?.trim();
      return { ...value, [current.id]: previous ? `${previous}\n\n${text}` : text };
    });
  };

  const learningCandidate = current && shouldQueueNewQuestion(latestCustomerMessage, detectedLanguage)
    ? latestCustomerMessage
    : '';

  const queueCurrentLearningCandidate = () => {
    if (!current || !latestCustomerEntry || !canDraft || !learningCandidate) return;
    setLearningQueue((value) => queueLearningCandidate(value, {
      question: learningCandidate,
      language: detectedLanguage,
      conversationId: current.id,
      sourceMessageId: latestCustomerEntry.id,
    }));
  };

  const runConversationAction = async (action: 'claim' | 'resolve') => {
    if (!me || !current || actionState === 'saving') { setActionState('error'); return; }
    const generation = sessionGenerationRef.current;
    setActionState('saving');
    try {
      await callAgentOps({ action, conversation_id: current.id });
      if (generation !== sessionGenerationRef.current) return;
      const refreshed = await loadSyntheticConversations();
      if (generation === sessionGenerationRef.current) setActionState(refreshed ? 'idle' : 'error');
    } catch {
      if (generation === sessionGenerationRef.current) setActionState('error');
    }
  };

  const updateAvailability = async (next: AgentAvailability) => {
    if (!me || availabilityState === 'saving') { setAvailabilityState('error'); return; }
    const generation = sessionGenerationRef.current;
    const previous = availability[me];
    setAvailability((value) => ({ ...value, [me]: next }));
    setAvailabilityState('saving');
    try {
      const result = await callAgentOps<{ ok: boolean; availability: AgentAvailability }>({ action: 'set_availability', availability: next });
      if (generation !== sessionGenerationRef.current) return;
      if (!result.ok || !['AVAILABLE','BUSY','OFFLINE'].includes(result.availability)) throw new Error('availability_confirmation_invalid');
      setAvailability((value) => ({ ...value, [me]: result.availability }));
      setAvailabilityState('saved');
    } catch {
      if (generation === sessionGenerationRef.current) {
        setAvailability((value) => ({ ...value, [me]: previous }));
        setAvailabilityState('error');
      }
    }
  };

  const operatorLabel = session?.displayName ?? (me ? INITIAL_AGENTS[me].displayName : 'Unknown operator');

  return (
    <main className="min-h-screen bg-[#030913] text-white">
      <div className="mx-auto min-h-screen max-w-md border-x border-white/10 bg-[#050d18] shadow-2xl">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#050d18]/95 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-2"><ChevronLeft className="h-4 w-4" /><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-400">Local Lead Forge</p><p className="text-xs font-black">Agent Console · QA</p></div></div>
          <div className={`flex items-center gap-2 rounded-full border px-2 py-1 text-[9px] font-bold ${session ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300' : 'border-rose-500/25 bg-rose-500/10 text-rose-300'}`}><ShieldCheck className="h-3.5 w-3.5" /> {session ? 'Authenticated' : 'Authentication required'}</div>
        </header>

        <section className="border-b border-white/10 px-4 py-3">
          <div className="flex items-center justify-between gap-3"><div><p className="text-[10px] text-slate-400">Signed in as</p><p className="text-sm font-black">{operatorLabel}</p></div><Smartphone className="h-5 w-5 text-orange-400" /></div>
          {!session && <p className="mt-2 text-[9px] text-rose-300">No authenticated agent session is available. Protected actions stay blocked.</p>}
          {session && !me && <p className="mt-2 text-[9px] text-rose-300">This authenticated account is not mapped to an approved pilot operator. Protected actions stay blocked.</p>}
          <div className="mt-3 grid grid-cols-3 gap-2">
            {(['AVAILABLE','BUSY','OFFLINE'] as const).map((state) => <button key={state} disabled={!me || availabilityState === 'saving'} onClick={() => void updateAvailability(state)} className={`rounded-lg border px-2 py-2 text-[9px] font-black ${me && availability[me] === state ? 'border-orange-500/40 bg-orange-500/10 text-orange-300' : 'border-white/10 bg-white/[0.03] text-slate-400'} disabled:cursor-not-allowed disabled:opacity-30`}>{state}</button>)}
          </div>
          {availabilityState === 'error' && <p className="mt-2 text-[9px] text-rose-300">Availability update could not be safely confirmed.</p>}
        </section>

        <section className="px-4 py-4">
          <div className="flex items-center justify-between"><h1 className="text-sm font-black">Needs attention</h1><span className="rounded-full bg-rose-500/10 px-2 py-1 text-[9px] font-bold text-rose-300">{conversations.filter((c) => c.status === 'WAITING_FOR_AGENT').length} waiting</span></div>
          <div className={`mt-2 text-[9px] ${dataState === 'error' || realtimeState === 'CHANNEL_ERROR' ? 'text-rose-300' : realtimeState === 'SUBSCRIBED' ? 'text-emerald-300' : 'text-amber-300'}`}>{dataState === 'error' ? 'Secure synthetic data could not be loaded. Stale conversation data has been cleared.' : realtimeState === 'SUBSCRIBED' ? 'Private Realtime connected · synthetic data only' : 'Connecting private Realtime…'}</div>
          <div className="mt-3 space-y-2">
            {conversations.length === 0 && <div className="rounded-xl border border-white/10 bg-[#07111f] p-4 text-[10px] text-slate-400">No synthetic conversations are currently available. No conversation action can be taken.</div>}
            {conversations.map((conversation) => <button key={conversation.id} onClick={() => setSelectedId(conversation.id)} className={`w-full rounded-xl border p-3 text-left ${selectedId === conversation.id ? 'border-orange-500/35 bg-orange-500/[0.07]' : 'border-white/10 bg-[#07111f]'}`}><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-black">{conversation.contactName}</p><p className="text-[9px] text-slate-400">{conversation.companyName} · {conversation.channel}</p></div><span className={`rounded-full px-2 py-1 text-[8px] font-black ${conversation.status === 'WAITING_FOR_AGENT' ? 'bg-rose-500/10 text-rose-300' : conversation.status === 'AGENT_ACTIVE' ? 'bg-orange-500/10 text-orange-300' : 'bg-emerald-500/10 text-emerald-300'}`}>{conversation.status}</span></div></button>)}
          </div>

          {current ? <div className="mt-4 rounded-2xl border border-white/10 bg-[#07111f] p-4">
            <div className="flex items-center justify-between"><div><p className="text-xs font-black">{current.contactName}</p><p className="text-[9px] text-slate-500">{current.audience} · {current.channel}</p></div>{current.audience === 'CLIENT' ? <Users className="h-4 w-4 text-blue-300" /> : <MessageCircle className="h-4 w-4 text-orange-300" />}</div>
            <div className="mt-3 space-y-2">{current.messages.map((message) => <div key={message.id} className="rounded-xl border border-white/10 bg-black/20 p-3"><div className="flex items-center justify-between"><span className="text-[9px] font-bold text-slate-300">{message.authorLabel}</span><span className="text-[8px] text-slate-600">{message.createdAt}</span></div><p className="mt-1 text-[10px] leading-4 text-slate-300">{message.body}</p></div>)}</div>
            {current.handoffSummary && <div className="mt-3 rounded-xl border border-orange-500/20 bg-orange-500/[0.05] p-3"><div className="flex items-center gap-2 text-[9px] font-black text-orange-300"><Bot className="h-3.5 w-3.5" /> AI handoff summary</div><p className="mt-2 text-[10px] leading-4 text-slate-300">{current.handoffSummary.reason}</p><p className="mt-2 text-[9px] text-slate-400"><b className="text-white">Intent:</b> {current.handoffSummary.userIntent}</p><p className="mt-1 text-[9px] text-slate-400"><b className="text-white">Open:</b> {current.handoffSummary.unresolvedQuestion}</p><p className="mt-1 text-[9px] text-slate-400"><b className="text-white">Next:</b> {current.handoffSummary.suggestedNextAction}</p></div>}
            <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3"><div className="flex items-center gap-2 text-[9px] font-black text-slate-300"><Bell className="h-3.5 w-3.5" /> Notification plan</div><p className="mt-2 text-[9px] text-slate-400">Primary: <b className="text-white">{notificationPlan.primary ?? 'None'}</b> · Fallback: <b className="text-white">{notificationPlan.fallback ?? 'None'}</b></p></div>
            {current.status === 'AGENT_ACTIVE' && <p className="mt-2 text-[10px] text-slate-500">Assigned to <b className="text-white">{current.assignedAgent ? INITIAL_AGENTS[current.assignedAgent].displayName : 'Unknown / not in pilot'}</b>. Claim lock prevents a second specialist from replying.</p>}
            <div className="mt-3 grid grid-cols-2 gap-2"><button disabled={!me || current.status !== 'WAITING_FOR_AGENT' || actionState === 'saving'} onClick={() => void runConversationAction('claim')} className="rounded-lg bg-orange-600 px-3 py-2.5 text-[10px] font-black text-white disabled:cursor-not-allowed disabled:opacity-30">Take as {operatorLabel}</button><button disabled={!me || current.status !== 'AGENT_ACTIVE' || assignedElsewhere || actionState === 'saving'} onClick={() => void runConversationAction('resolve')} className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-[10px] font-black text-emerald-300 disabled:opacity-30">Resolve</button><button disabled className="col-span-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-[10px] font-bold text-slate-300 disabled:opacity-30">Return to AI — blocked during QA</button></div>
            {actionState === 'error' && <p className="mt-2 text-[9px] text-rose-300">The action could not be safely confirmed. Protected data was invalidated; refresh and verify assignment before retrying.</p>}
          </div> : <div className="mt-4 rounded-2xl border border-white/10 bg-[#07111f] p-4 text-[10px] text-slate-400">Select a synthetic conversation after protected data is available.</div>}

          <div className="mt-3 rounded-xl border border-white/10 bg-[#07111f] p-3">
            {current && <AgentMacroDrawer
              language={detectedLanguage}
              context={{
                firstName: current.contactName?.replace(/^\[QA\]\s*/i, '').split(/\s+/)[0],
                companyName: current.companyName?.replace(/^\[QA\]\s*/i, ''),
                operatorName: operatorLabel,
              }}
              latestCustomerMessage={latestCustomerMessage}
              disabled={!canDraft}
              storageKey={`llf-agent-macros:${me ?? 'unmapped'}`}
              onInsert={insertMacroDraft}
            />}
            <ControlledLearningPanel
              items={learningQueue}
              candidateQuestion={learningCandidate}
              disabled={!canDraft}
              language={detectedLanguage}
              onQueueCandidate={queueCurrentLearningCandidate}
              onArchive={(itemId) => canDraft && setLearningQueue((value) => archiveLearningItem(value, itemId))}
            />
            <textarea
              disabled={!canDraft}
              rows={4}
              value={composerDraft}
              onChange={(event) => current && setComposerDrafts((value) => ({ ...value, [current.id]: event.target.value }))}
              placeholder={canDraft ? (detectedLanguage === 'ES' ? 'Borrador interno para revisión…' : 'Internal draft for review…') : 'Real sending remains disabled during authenticated QA.'}
              className="mt-3 w-full resize-none rounded-lg border border-white/10 bg-black/20 p-3 text-[10px] text-slate-300 outline-none disabled:cursor-not-allowed disabled:opacity-40"
            />
            <p className="mt-2 text-[9px] text-slate-500">Detected language: <b className="text-white">{detectedLanguage}</b> · Draft only · no automatic send</p>
            <button disabled className="mt-2 w-full rounded-lg bg-orange-600 px-3 py-2.5 text-[10px] font-black text-white opacity-40">Send — blocked until final GO</button>
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/[0.05] p-3 text-[10px] leading-4 text-amber-200"><Users className="h-4 w-4 shrink-0" /> Auth, trusted-device checks, synthetic persistence and private Realtime are active for QA. Live customer messages and push remain blocked.</div>
        </section>
      </div>
    </main>
  );
}

type BackendConversation = {
  id: string;
  audience: Conversation['audience'];
  channel: Conversation['channel'];
  status: Conversation['status'];
  contact_name?: string;
  company_name?: string;
  assigned_agent_user_id?: string;
  handoff_reason?: string;
  handoff_user_intent?: string;
  handoff_unresolved_question?: string;
  handoff_suggested_next_action?: string;
  llf_conversation_messages?: Array<{ id: string; author: 'VISITOR' | 'AI' | 'AGENT'; author_label: string; body: string; created_at: string }>;
  llf_conversation_handoff_facts?: Array<{ fact: string }>;
};

function mapBackendConversation(row: BackendConversation): Conversation {
  return {
    id: row.id,
    audience: row.audience,
    channel: row.channel,
    status: row.status,
    contactName: row.contact_name,
    companyName: row.company_name,
    assignedAgent: resolvePilotAgentId(row.assigned_agent_user_id),
    messages: (row.llf_conversation_messages ?? [])
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
      .map((message) => ({ id: message.id, author: message.author, authorLabel: message.author_label, body: message.body, createdAt: new Date(message.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) })),
    handoffSummary: row.handoff_reason ? {
      reason: row.handoff_reason,
      userIntent: row.handoff_user_intent ?? 'Synthetic QA handoff',
      knownFacts: (row.llf_conversation_handoff_facts ?? []).map((item) => item.fact),
      unresolvedQuestion: row.handoff_unresolved_question ?? 'No open question',
      suggestedNextAction: row.handoff_suggested_next_action ?? 'Validate the synthetic workflow.',
    } : undefined,
  };
}