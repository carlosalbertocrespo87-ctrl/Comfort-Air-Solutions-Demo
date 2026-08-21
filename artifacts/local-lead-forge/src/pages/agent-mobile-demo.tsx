import { useMemo, useState } from 'react';
import { Bell, Bot, CheckCircle2, ChevronLeft, MessageCircle, ShieldCheck, Smartphone, UserRound, Users } from 'lucide-react';
import {
  INITIAL_AGENTS,
  claimConversation,
  resolveConversation,
  returnConversationToAI,
  type AgentId,
  type Conversation,
} from '@/lib/conversation-model';
import { planAgentNotification, type AgentAvailability } from '@/lib/agent-notification-policy';

const seed: Conversation[] = [
  {
    id: 'conv-client-001',
    audience: 'CLIENT',
    channel: 'CLIENT_PORTAL',
    status: 'WAITING_FOR_AGENT',
    contactName: 'Alex Morgan',
    companyName: 'ABC Heating & Air',
    messages: [
      { id: '1', author: 'VISITOR', authorLabel: 'Alex', body: 'I need future website leads sent to a different email. Can someone help?', createdAt: '8:21 PM' },
      { id: '2', author: 'AI', authorLabel: 'LLF AI Assistant', body: 'Yes. This change needs an LLF specialist. I will preserve this conversation so you do not have to repeat yourself.', createdAt: '8:21 PM' },
    ],
    handoffSummary: {
      reason: 'Lead-routing change requires authorized human action.',
      userIntent: 'Change lead delivery destination',
      knownFacts: ['Active client', 'Source: Client Portal', 'No billing issue reported'],
      unresolvedQuestion: 'What new email should receive future leads?',
      suggestedNextAction: 'Claim the chat, confirm the new destination, then run a test lead before resolving.',
    },
  },
  {
    id: 'conv-prospect-001',
    audience: 'PROSPECT',
    channel: 'PUBLIC_WEB',
    status: 'WAITING_FOR_AGENT',
    contactName: 'Jordan',
    companyName: 'Peachtree HVAC',
    messages: [
      { id: '1', author: 'VISITOR', authorLabel: 'Jordan', body: 'I like the demo. Before I buy, can a person explain how long setup usually takes?', createdAt: '8:24 PM' },
      { id: '2', author: 'AI', authorLabel: 'LLF AI Assistant', body: 'I can explain the normal process, and I can also connect you with an LLF specialist for your specific situation.', createdAt: '8:24 PM' },
    ],
    handoffSummary: {
      reason: 'High-intent prospect requested a human specialist.',
      userIntent: 'Clarify implementation timeline before purchase',
      knownFacts: ['Prospect', 'Source: Public Website', 'Viewed a demo'],
      unresolvedQuestion: 'What timeline should be expected for this prospect?',
      suggestedNextAction: 'Claim the chat and answer using the approved implementation range without promising an unsupported date.',
    },
  },
];

const statusLabel = {
  AI_ACTIVE: 'AI active',
  WAITING_FOR_AGENT: 'Waiting for agent',
  AGENT_ACTIVE: 'Agent active',
  RESOLVED: 'Resolved',
} as const;

export default function AgentMobileDemoPage() {
  const [conversations, setConversations] = useState(seed);
  const [selectedId, setSelectedId] = useState(seed[0].id);
  const [me, setMe] = useState<AgentId>('CARLOS');
  const [availability, setAvailability] = useState<Record<AgentId, AgentAvailability>>({ CARLOS: 'AVAILABLE', MARIA: 'AVAILABLE' });
  const current = conversations.find((item) => item.id === selectedId) ?? conversations[0];

  const notificationPlan = useMemo(
    () => planAgentNotification(current, [
      { agent: 'CARLOS', availability: availability.CARLOS },
      { agent: 'MARIA', availability: availability.MARIA },
    ]),
    [current, availability],
  );

  const patch = (next: Conversation) => setConversations((items) => items.map((item) => item.id === next.id ? next : item));
  const assignedElsewhere = current.assignedAgent && current.assignedAgent !== me;

  return (
    <main className="min-h-screen bg-[#020711] text-white">
      <div className="mx-auto min-h-screen max-w-md border-x border-white/10 bg-[#050d19] shadow-2xl">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-[#050d19]/95 px-4 pb-3 pt-[max(14px,env(safe-area-inset-top))] backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl border border-orange-500/30 bg-orange-500/10 text-xs font-black text-orange-400">LLF</div>
              <div><div className="text-sm font-black">Agent Console</div><div className="text-[10px] text-slate-500">iPhone simulation · internal only</div></div>
            </div>
            <Bell className="h-5 w-5 text-orange-400" />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            {(['CARLOS', 'MARIA'] as AgentId[]).map((agent) => (
              <button key={agent} onClick={() => setMe(agent)} className={`rounded-xl border px-3 py-2 text-left ${me === agent ? 'border-orange-500/40 bg-orange-500/10' : 'border-white/10 bg-white/[0.025]'}`}>
                <div className="text-[10px] font-black text-white">Acting as {INITIAL_AGENTS[agent].displayName}</div>
                <div className="mt-1 text-[9px] text-slate-500">{INITIAL_AGENTS[agent].role}</div>
              </button>
            ))}
          </div>
        </header>

        <section className="border-b border-white/10 px-4 py-3">
          <div className="flex items-center justify-between"><span className="text-xs font-black">Availability</span><Smartphone className="h-4 w-4 text-slate-500" /></div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {(['CARLOS', 'MARIA'] as AgentId[]).map((agent) => (
              <select key={agent} value={availability[agent]} onChange={(e) => setAvailability((v) => ({ ...v, [agent]: e.target.value as AgentAvailability }))} className="rounded-lg border border-white/10 bg-[#07111f] px-2 py-2 text-[11px] text-slate-200 outline-none">
                <option value="AVAILABLE">{INITIAL_AGENTS[agent].displayName}: Available</option>
                <option value="BUSY">{INITIAL_AGENTS[agent].displayName}: Busy</option>
                <option value="OFFLINE">{INITIAL_AGENTS[agent].displayName}: Offline</option>
              </select>
            ))}
          </div>
        </section>

        <section className="px-4 py-4">
          <div className="flex items-center justify-between"><h1 className="text-sm font-black">Needs attention</h1><span className="rounded-full bg-rose-500/10 px-2 py-1 text-[9px] font-bold text-rose-300">{conversations.filter((c) => c.status === 'WAITING_FOR_AGENT').length} waiting</span></div>
          <div className="mt-3 space-y-2">
            {conversations.map((conversation) => (
              <button key={conversation.id} onClick={() => setSelectedId(conversation.id)} className={`w-full rounded-xl border p-3 text-left ${selectedId === conversation.id ? 'border-orange-500/35 bg-orange-500/[0.07]' : 'border-white/10 bg-[#07111f]'}`}>
                <div className="flex items-center justify-between gap-2"><span className="text-xs font-black">{conversation.companyName}</span><span className={`rounded-full px-2 py-1 text-[9px] font-bold ${conversation.audience === 'CLIENT' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-orange-500/10 text-orange-300'}`}>{conversation.audience}</span></div>
                <div className="mt-1 text-[10px] text-slate-500">{conversation.channel === 'CLIENT_PORTAL' ? 'Client Portal' : 'Public Website'} · {statusLabel[conversation.status]}</div>
              </button>
            ))}
          </div>
        </section>

        <section className="border-t border-white/10 px-4 pb-[max(24px,env(safe-area-inset-bottom))] pt-4">
          <div className="flex items-center gap-2 text-xs text-slate-500"><ChevronLeft className="h-4 w-4" /> Conversation</div>
          <div className="mt-3 flex items-start justify-between gap-3"><div><h2 className="text-lg font-black">{current.companyName}</h2><p className="mt-1 text-[10px] text-slate-500">{current.contactName} · {current.channel === 'CLIENT_PORTAL' ? 'Client Portal' : 'Public Website'}</p></div><span className="rounded-full border border-white/10 px-2 py-1 text-[9px] text-slate-300">{statusLabel[current.status]}</span></div>

          {current.handoffSummary && (
            <div className="mt-4 rounded-xl border border-violet-500/20 bg-violet-500/[0.06] p-3">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-violet-300"><Bot className="h-4 w-4" /> AI handoff summary</div>
              <p className="mt-2 text-xs leading-5 text-slate-300">{current.handoffSummary.reason}</p>
              <p className="mt-2 text-xs leading-5 text-white"><b>Open question:</b> {current.handoffSummary.unresolvedQuestion}</p>
              <p className="mt-2 text-[10px] leading-4 text-slate-500">Next: {current.handoffSummary.suggestedNextAction}</p>
            </div>
          )}

          <div className="mt-4 space-y-2">
            {current.messages.map((message) => (
              <div key={message.id} className={`max-w-[88%] rounded-2xl p-3 text-xs leading-5 ${message.author === 'VISITOR' ? 'bg-white/[0.06] text-slate-200' : 'ml-auto bg-orange-600/90 text-white'}`}>
                <div className="mb-1 text-[9px] font-black uppercase opacity-70">{message.authorLabel}</div>{message.body}
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-xl border border-white/10 bg-[#07111f] p-3">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-300"><ShieldCheck className="h-4 w-4 text-emerald-400" /> Claim protection</div>
            {current.status === 'WAITING_FOR_AGENT' && <p className="mt-2 text-[10px] text-slate-500">Available to claim. Notification plan: {notificationPlan.recipients.map((id) => INITIAL_AGENTS[id].displayName).join(' + ') || 'queued'}.</p>}
            {current.status === 'AGENT_ACTIVE' && <p className="mt-2 text-[10px] text-slate-500">Assigned to <b className="text-white">{current.assignedAgent ? INITIAL_AGENTS[current.assignedAgent].displayName : '—'}</b>. The other agent should not reply.</p>}

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button disabled={current.status !== 'WAITING_FOR_AGENT'} onClick={() => patch(claimConversation(current, me))} className="rounded-lg bg-orange-600 px-3 py-2.5 text-[10px] font-black text-white disabled:cursor-not-allowed disabled:opacity-30">Take as {INITIAL_AGENTS[me].displayName}</button>
              <button disabled={current.status !== 'AGENT_ACTIVE' || assignedElsewhere} onClick={() => patch(resolveConversation(current))} className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-[10px] font-black text-emerald-300 disabled:opacity-30">Resolve</button>
              <button disabled={current.status !== 'AGENT_ACTIVE' || assignedElsewhere} onClick={() => patch(returnConversationToAI(current))} className="col-span-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-[10px] font-bold text-slate-300 disabled:opacity-30">Return to AI</button>
            </div>
          </div>

          <div className="mt-3 rounded-xl border border-white/10 bg-[#07111f] p-3">
            <div className="flex items-center gap-2 text-[10px] font-black"><MessageCircle className="h-4 w-4 text-orange-400" /> Reply as {current.assignedAgent ? INITIAL_AGENTS[current.assignedAgent].displayName : 'LLF Specialist'}</div>
            <textarea disabled={current.status !== 'AGENT_ACTIVE' || assignedElsewhere} placeholder={assignedElsewhere ? `${INITIAL_AGENTS[current.assignedAgent!].displayName} is handling this conversation` : 'Type your reply…'} className="mt-3 min-h-20 w-full resize-none rounded-lg border border-white/10 bg-[#020711] p-3 text-xs text-white outline-none placeholder:text-slate-700 disabled:opacity-40" />
            <button disabled className="mt-2 w-full rounded-lg bg-orange-600 px-3 py-2.5 text-[10px] font-black text-white opacity-40">Send — disabled until secure backend</button>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/[0.05] p-3 text-[10px] leading-4 text-amber-200"><Users className="h-4 w-4 shrink-0" /> Simulation only. No real notifications, authentication, customer data, or messages are active yet.</div>
        </section>
      </div>
    </main>
  );
}
