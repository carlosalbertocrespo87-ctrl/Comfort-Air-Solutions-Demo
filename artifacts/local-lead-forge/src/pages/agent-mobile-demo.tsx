import { useEffect, useMemo, useState } from 'react';
import { Bell, Bot, ChevronLeft, MessageCircle, ShieldCheck, Smartphone, Users } from 'lucide-react';
import {
  INITIAL_AGENTS,
  resolvePilotAgentId,
  type AgentId,
  type Conversation,
} from '@/lib/conversation-model';
import { planAgentNotification, type AgentAvailability } from '@/lib/agent-notification-policy';
import { callAgentOps, getStoredAgentSession } from '@/lib/supabase-session';
import { subscribeToSyntheticRefresh, unsubscribeFromSyntheticRefresh, type SyntheticRealtimeState } from '@/lib/synthetic-realtime';

const seed: Conversation[] = [
  {
    id: '10000000-0000-4000-8000-000000000001',
    audience: 'CLIENT',
    channel: 'CLIENT_PORTAL',
    status: 'WAITING_FOR_AGENT',
    contactName: '[QA] Alex',
    companyName: '[QA] ABC Heating & Air',
    messages: [],
  },
  {
    id: '10000000-0000-4000-8000-000000000002',
    audience: 'PROSPECT',
    channel: 'PUBLIC_WEB',
    status: 'WAITING_FOR_AGENT',
    contactName: '[QA] Jordan',
    companyName: '[QA] Peachtree HVAC',
    messages: [],
  },
];

export default function AgentMobileDemoPage() {
  const session = getStoredAgentSession();
  const me = resolvePilotAgentId(session?.agentUserId);
  const initialAvailability = (session?.availability ?? 'OFFLINE') as AgentAvailability;
  const [conversations, setConversations] = useState(seed);
  const [selectedId, setSelectedId] = useState(seed[0].id);
  const [availability, setAvailability] = useState<Record<AgentId, AgentAvailability>>({
    CARLOS: me === 'CARLOS' ? initialAvailability : 'OFFLINE',
    MARIA: me === 'MARIA' ? initialAvailability : 'OFFLINE',
  });
  const [availabilityState, setAvailabilityState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [dataState, setDataState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [realtimeState, setRealtimeState] = useState<SyntheticRealtimeState>('CONNECTING');
  const [actionState, setActionState] = useState<'idle' | 'saving' | 'error'>('idle');
  const current = conversations.find((item) => item.id === selectedId) ?? conversations[0];

  const loadSyntheticConversations = async (): Promise<boolean> => {
    if (!me) {
      setDataState('error');
      return false;
    }
    try {
      const result = await callAgentOps<{ ok: boolean; conversations: BackendConversation[] }>({ action: 'list_synthetic_conversations' });
      const mapped = result.conversations.map(mapBackendConversation);
      setConversations(mapped);
      setSelectedId((value) => mapped.some((item) => item.id === value) ? value : (mapped[0]?.id ?? ''));
      setDataState('ready');
      return true;
    } catch {
      setDataState('error');
      return false;
    }
  };

  useEffect(() => {
    let active = true;
    let channel: Awaited<ReturnType<typeof subscribeToSyntheticRefresh>> | undefined;

    const startRealtime = async () => {
      const loaded = await loadSyntheticConversations();
      if (!active || !loaded) {
        if (active) setRealtimeState('CHANNEL_ERROR');
        return;
      }
      try {
        const value = await subscribeToSyntheticRefresh(
          () => { if (active) void loadSyntheticConversations(); },
          (state) => { if (active) setRealtimeState(state); },
        );
        if (!active) {
          await unsubscribeFromSyntheticRefresh(value);
          return;
        }
        channel = value;
      } catch {
        if (active) setRealtimeState('CHANNEL_ERROR');
      }
    };

    void startRealtime();
    return () => {
      active = false;
      if (channel) void unsubscribeFromSyntheticRefresh(channel);
    };
  }, []);

  const notificationPlan = useMemo(
    () => planAgentNotification(current, [
      { agent: 'CARLOS', availability: availability.CARLOS },
      { agent: 'MARIA', availability: availability.MARIA },
    ]),
    [current, availability],
  );

  const assignedElsewhere = !me || Boolean(current.assignedAgent && current.assignedAgent !== me);

  const runConversationAction = async (action: 'claim' | 'resolve') => {
    if (!me) {
      setActionState('error');
      return;
    }
    setActionState('saving');
    try {
      await callAgentOps({ action, conversation_id: current.id });
      await loadSyntheticConversations();
      setActionState('idle');
    } catch {
      setActionState('error');
    }
  };

  const updateAvailability = async (next: AgentAvailability) => {
    if (!me) {
      setAvailabilityState('error');
      return;
    }
    const previous = availability[me];
    setAvailability((value) => ({ ...value, [me]: next }));
    setAvailabilityState('saving');
    try {
      await callAgentOps({ action: 'set_availability', availability: next });
      setAvailabilityState('saved');
    } catch {
      setAvailability((value) => ({ ...value, [me]: previous }));
      setAvailabilityState('error');
    }
  };

  const operatorLabel = session?.displayName ?? (me ? INITIAL_AGENTS[me].displayName : 'Unknown operator');

  return (
    <main className="min-h-screen bg-[#030913] text-white">
      <div className="mx-auto min-h-screen max-w-md border-x border-white/10 bg-[#050d18] shadow-2xl">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#050d18]/95 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-2"><ChevronLeft className="h-4 w-4" /><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-400">Local Lead Forge</p><p className="text-xs font-black">Agent Console · QA</p></div></div>
          <div className="flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-1 text-[9px] font-bold text-emerald-300"><ShieldCheck className="h-3.5 w-3.5" /> Authenticated</div>
        </header>

        <section className="border-b border-white/10 px-4 py-3">
          <div className="flex items-center justify-between gap-3"><div><p className="text-[10px] text-slate-400">Signed in as</p><p className="text-sm font-black">{operatorLabel}</p></div><Smartphone className="h-5 w-5 text-orange-400" /></div>
          {!me && <p className="mt-2 text-[9px] text-rose-300">This authenticated account is not mapped to an approved pilot operator. Protected actions stay blocked.</p>}
          <div className="mt-3 grid grid-cols-3 gap-2">
            {(['AVAILABLE','BUSY','OFFLINE'] as const).map((state) => <button key={state} disabled={!me} onClick={() => void updateAvailability(state)} className={`rounded-lg border px-2 py-2 text-[9px] font-black ${me && availability[me] === state ? 'border-orange-500/40 bg-orange-500/10 text-orange-300' : 'border-white/10 bg-white/[0.03] text-slate-400'} disabled:cursor-not-allowed disabled:opacity-30`}>{state}</button>)}
          </div>
          {availabilityState === 'error' && <p className="mt-2 text-[9px] text-rose-300">Availability update rejected by protected backend.</p>}
        </section>

        <section className="px-4 py-4">
          <div className="flex items-center justify-between"><h1 className="text-sm font-black">Needs attention</h1><span className="rounded-full bg-rose-500/10 px-2 py-1 text-[9px] font-bold text-rose-300">{conversations.filter((c) => c.status === 'WAITING_FOR_AGENT').length} waiting</span></div>
          <div className={`mt-2 text-[9px] ${dataState === 'error' || realtimeState === 'CHANNEL_ERROR' ? 'text-rose-300' : realtimeState === 'SUBSCRIBED' ? 'text-emerald-300' : 'text-amber-300'}`}>
            {dataState === 'error' ? 'Secure synthetic data could not be loaded.' : realtimeState === 'SUBSCRIBED' ? 'Private Realtime connected · synthetic data only' : 'Connecting private Realtime…'}
          </div>
          <div className="mt-3 space-y-2">
            {conversations.map((conversation) => (
              <button key={conversation.id} onClick={() => setSelectedId(conversation.id)} className={`w-full rounded-xl border p-3 text-left ${selectedId === conversation.id ? 'border-orange-500/35 bg-orange-500/[0.07]' : 'border-white/10 bg-[#07111f]'}`}>
                <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-black">{conversation.contactName}</p><p className="text-[9px] text-slate-400">{conversation.companyName} · {conversation.channel}</p></div><span className={`rounded-full px-2 py-1 text-[8px] font-black ${conversation.status === 'WAITING_FOR_AGENT' ? 'bg-rose-500/10 text-rose-300' : conversation.status === 'AGENT_ACTIVE' ? 'bg-orange-500/10 text-orange-300' : 'bg-emerald-500/10 text-emerald-300'}`}>{conversation.status}</span></div>
              </button>
            ))}
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-[#07111f] p-4">
            <div className="flex items-center justify-between"><div><p className="text-xs font-black">{current.contactName}</p><p className="text-[9px] text-slate-500">{current.audience} · {current.channel}</p></div>{current.audience === 'CLIENT' ? <Users className="h-4 w-4 text-blue-300" /> : <MessageCircle className="h-4 w-4 text-orange-300" />}</div>

            <div className="mt-3 space-y-2">
              {current.messages.map((message) => <div key={message.id} className="rounded-xl border border-white/10 bg-black/20 p-3"><div className="flex items-center justify-between"><span className="text-[9px] font-bold text-slate-300">{message.authorLabel}</span><span className="text-[8px] text-slate-600">{message.createdAt}</span></div><p className="mt-1 text-[10px] leading-4 text-slate-300">{message.body}</p></div>)}
            </div>

            {current.handoffSummary && <div className="mt-3 rounded-xl border border-orange-500/20 bg-orange-500/[0.05] p-3"><div className="flex items-center gap-2 text-[9px] font-black text-orange-300"><Bot className="h-3.5 w-3.5" /> AI handoff summary</div><p className="mt-2 text-[10px] leading-4 text-slate-300">{current.handoffSummary.reason}</p><p className="mt-2 text-[9px] text-slate-400"><b className="text-white">Intent:</b> {current.handoffSummary.userIntent}</p><p className="mt-1 text-[9px] text-slate-400"><b className="text-white">Open:</b> {current.handoffSummary.unresolvedQuestion}</p><p className="mt-1 text-[9px] text-slate-400"><b className="text-white">Next:</b> {current.handoffSummary.suggestedNextAction}</p></div>}

            <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3"><div className="flex items-center gap-2 text-[9px] font-black text-slate-300"><Bell className="h-3.5 w-3.5" /> Notification plan</div><p className="mt-2 text-[9px] text-slate-400">Primary: <b className="text-white">{notificationPlan.primary ?? 'None'}</b> · Fallback: <b className="text-white">{notificationPlan.fallback ?? 'None'}</b></p></div>

            {current.status === 'AGENT_ACTIVE' && <p className="mt-2 text-[10px] text-slate-500">Assigned to <b className="text-white">{current.assignedAgent ? INITIAL_AGENTS[current.assignedAgent].displayName : '—'}</b>. Claim lock prevents a second specialist from replying.</p>}

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button disabled={!me || current.status !== 'WAITING_FOR_AGENT' || actionState === 'saving'} onClick={() => void runConversationAction('claim')} className="rounded-lg bg-orange-600 px-3 py-2.5 text-[10px] font-black text-white disabled:cursor-not-allowed disabled:opacity-30">Take as {operatorLabel}</button>
              <button disabled={!me || current.status !== 'AGENT_ACTIVE' || assignedElsewhere || actionState === 'saving'} onClick={() => void runConversationAction('resolve')} className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-[10px] font-black text-emerald-300 disabled:opacity-30">Resolve</button>
              <button disabled className="col-span-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-[10px] font-bold text-slate-300 disabled:opacity-30">Return to AI — blocked during QA</button>
            </div>
            {actionState === 'error' && <p className="mt-2 text-[9px] text-rose-300">The protected backend rejected the action. Refresh and verify assignment.</p>}
          </div>

          <div className="mt-3 rounded-xl border border-white/10 bg-[#07111f] p-3">
            <textarea disabled rows={3} placeholder="Real sending remains disabled during authenticated QA." className="w-full resize-none rounded-lg border border-white/10 bg-black/20 p-3 text-[10px] text-slate-400 outline-none" />
            <button disabled className="mt-2 w-full rounded-lg bg-orange-600 px-3 py-2.5 text-[10px] font-black text-white opacity-40">Send — blocked until conversation backend QA</button>
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
