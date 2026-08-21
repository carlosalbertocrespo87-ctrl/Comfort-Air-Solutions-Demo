import { useMemo, useState } from 'react';
import {
  Bot,
  CheckCircle2,
  Clock3,
  Headphones,
  LayoutDashboard,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
} from 'lucide-react';

type View = 'client' | 'agent' | 'knowledge';

const conversations = [
  { name: 'Alex — Prospect', tag: 'PROSPECT', status: 'AI active', preview: 'Can this work with my HVAC website?', tone: 'orange' },
  { name: 'ABC Heating & Air', tag: 'CLIENT', status: 'Needs human', preview: 'I want to change where leads are sent.', tone: 'red' },
  { name: 'Jordan — Prospect', tag: 'PROSPECT', status: 'Resolved by AI', preview: 'Do you support English and Spanish?', tone: 'green' },
];

const knowledge = [
  { title: 'What does Local Lead Forge do?', answer: 'LLF helps local service businesses capture, qualify, route, and track opportunities from their website using bilingual AI and structured follow-up.' },
  { title: 'How does human support work?', answer: 'The AI answers first. A visitor can request a specialist at any time, and unresolved or sensitive questions are escalated with the conversation summary attached.' },
  { title: 'What happens after a client signs up?', answer: 'The client enters a guided onboarding flow, confirms business facts and lead routing, then moves through setup, QA, activation, Day 1, Day 7, and Day 30 reviews.' },
  { title: 'Can an agent answer from a phone?', answer: 'The agent console is designed mobile-first so authorized LLF agents can review context, receive an AI summary, and respond by chat without needing a call.' },
];

function Pill({ children, tone = 'slate' }: { children: React.ReactNode; tone?: 'orange' | 'green' | 'red' | 'slate' }) {
  const tones = {
    orange: 'border-orange-500/30 bg-orange-500/10 text-orange-300',
    green: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    red: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
    slate: 'border-white/10 bg-white/5 text-slate-300',
  };
  return <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${tones[tone]}`}>{children}</span>;
}

function ClientPortal() {
  return (
    <div className="grid gap-5 lg:grid-cols-[1.25fr_.75fr]">
      <section className="rounded-2xl border border-white/10 bg-[#07111f] p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Pill tone="orange">CLIENT SIMULATION</Pill>
            <h2 className="mt-4 text-2xl font-black text-white">Welcome, ABC Heating & Air</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">Your implementation is moving forward. This sample portal shows the experience we want every LLF client to have.</p>
          </div>
          <Pill tone="green">On track</Pill>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          {[
            ['Implementation', '72%', 'Setup + QA in progress'],
            ['Leads captured', '18', 'Sample data'],
            ['Response health', '98%', 'Sample data'],
          ].map(([label, value, note]) => (
            <div key={label} className="rounded-xl border border-white/10 bg-[#030914] p-4">
              <div className="text-xs font-semibold text-slate-500">{label}</div>
              <div className="mt-2 text-2xl font-black text-white">{value}</div>
              <div className="mt-1 text-[11px] text-slate-600">{note}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-xl border border-white/10 bg-[#030914] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-extrabold text-white">Implementation timeline</div>
              <div className="mt-1 text-xs text-slate-500">Clear progress without needing to email for updates.</div>
            </div>
            <Clock3 className="h-5 w-5 text-orange-400" />
          </div>
          <div className="mt-5 space-y-4">
            {[
              ['Payment + welcome', true],
              ['Business onboarding', true],
              ['AI + lead routing setup', true],
              ['Desktop / mobile QA', false],
              ['Client validation + activation', false],
            ].map(([label, done]) => (
              <div key={String(label)} className="flex items-center gap-3">
                <CheckCircle2 className={`h-5 w-5 ${done ? 'text-emerald-400' : 'text-slate-700'}`} />
                <div className={`text-sm ${done ? 'font-semibold text-slate-200' : 'text-slate-500'}`}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <aside className="rounded-2xl border border-orange-500/20 bg-[#07111f] p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl border border-orange-500/30 bg-orange-500/10"><Bot className="h-5 w-5 text-orange-400" /></div>
          <div><div className="text-sm font-black text-white">LLF AI Assistant</div><div className="text-[11px] text-emerald-400">● Online now</div></div>
        </div>
        <div className="mt-5 space-y-3 text-sm">
          <div className="max-w-[90%] rounded-2xl rounded-tl-sm bg-white/[0.06] p-3 text-slate-300">Hi! I can help with your implementation, leads, reporting, billing, or support questions.</div>
          <div className="ml-auto max-w-[88%] rounded-2xl rounded-tr-sm bg-orange-600 p-3 text-white">Can a real person help me change my lead routing?</div>
          <div className="max-w-[92%] rounded-2xl rounded-tl-sm bg-white/[0.06] p-3 text-slate-300">Absolutely. I can connect you with an LLF specialist and pass along this conversation so you do not need to repeat yourself.</div>
        </div>
        <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-orange-500/40 bg-orange-500/10 px-4 py-3 text-sm font-extrabold text-orange-300">
          <Headphones className="h-4 w-4" /> Talk to a specialist
        </button>
        <p className="mt-3 text-center text-[10px] text-slate-600">Simulation only — no live message is sent.</p>
      </aside>
    </div>
  );
}

function AgentConsole() {
  const [selected, setSelected] = useState(1);
  const current = conversations[selected];
  return (
    <div className="grid gap-5 lg:grid-cols-[.72fr_1.28fr]">
      <section className="rounded-2xl border border-white/10 bg-[#07111f] p-4">
        <div className="flex items-center justify-between"><div className="text-sm font-black text-white">Live inbox</div><Pill tone="red">1 needs human</Pill></div>
        <div className="mt-4 space-y-2">
          {conversations.map((c, i) => (
            <button key={c.name} onClick={() => setSelected(i)} className={`w-full rounded-xl border p-3 text-left transition ${selected === i ? 'border-orange-500/40 bg-orange-500/10' : 'border-white/8 bg-[#030914] hover:border-white/15'}`}>
              <div className="flex items-center justify-between gap-2"><span className="text-xs font-extrabold text-white">{c.name}</span><Pill tone={c.tone as 'orange' | 'green' | 'red'}>{c.tag}</Pill></div>
              <div className="mt-2 text-[11px] text-slate-500">{c.status}</div>
              <div className="mt-1 truncate text-xs text-slate-400">{c.preview}</div>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#07111f] p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 pb-4">
          <div><div className="text-lg font-black text-white">{current.name}</div><div className="mt-1 text-xs text-slate-500">Channel: LLF web chat · Context preserved</div></div>
          <Pill tone={current.tag === 'CLIENT' ? 'green' : 'orange'}>{current.tag}</Pill>
        </div>

        <div className="mt-5 rounded-xl border border-violet-500/20 bg-violet-500/[0.07] p-4">
          <div className="flex items-center gap-2 text-xs font-black text-violet-300"><Sparkles className="h-4 w-4" /> AI handoff summary</div>
          <p className="mt-2 text-sm leading-6 text-slate-300">Active client wants to change where website leads are delivered. Current routing is the onboarding address on file. No billing issue reported. Recommended action: confirm the new destination and run a test lead before closing the conversation.</p>
        </div>

        <div className="mt-5 space-y-3 text-sm">
          <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-white/[0.06] p-3 text-slate-300"><b className="block text-[10px] uppercase tracking-wider text-slate-500">Customer</b>I need future leads sent to a different email. Can someone help?</div>
          <div className="max-w-[88%] rounded-2xl rounded-tl-sm border border-orange-500/20 bg-orange-500/[0.06] p-3 text-slate-300"><b className="block text-[10px] uppercase tracking-wider text-orange-400">AI Assistant</b>Yes. I’m bringing in an LLF specialist now and I’ll share the conversation context.</div>
          <div className="ml-auto max-w-[82%] rounded-2xl rounded-tr-sm bg-sky-600 p-3 text-white"><b className="block text-[10px] uppercase tracking-wider text-sky-100">LLF Specialist · Draft</b>Absolutely — I can take care of that. Please confirm the new lead-delivery email and I’ll update it, run a test, and confirm when it’s working.</div>
        </div>

        <div className="mt-5 rounded-xl border border-white/10 bg-[#030914] p-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400"><MessageCircle className="h-4 w-4" /> Reply as LLF Specialist</div>
          <div className="mt-3 flex gap-2"><div className="min-h-11 flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-3 text-xs text-slate-600">Type a reply…</div><button className="rounded-lg bg-orange-600 px-4 text-xs font-black text-white">Send</button></div>
          <div className="mt-2 text-[10px] text-slate-600">Simulation only — sending is disabled in this MVP.</div>
        </div>
      </section>
    </div>
  );
}

function KnowledgeCenter() {
  const [query, setQuery] = useState('');
  const results = useMemo(() => knowledge.filter((item) => `${item.title} ${item.answer}`.toLowerCase().includes(query.toLowerCase())), [query]);
  return (
    <section className="rounded-2xl border border-white/10 bg-[#07111f] p-5 sm:p-6">
      <div className="max-w-2xl">
        <Pill tone="orange">LLF SOURCE OF TRUTH</Pill>
        <h2 className="mt-4 text-2xl font-black text-white">Knowledge Center</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">One searchable place for agents and AI to find approved answers, procedures, scripts, and escalation rules.</p>
      </div>
      <div className="relative mt-6 max-w-3xl"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search: billing, onboarding, lead routing, pricing…" className="h-12 w-full rounded-xl border border-white/10 bg-[#030914] pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-700 focus:border-orange-500/40" /></div>
      <div className="mt-6 grid gap-3 lg:grid-cols-2">
        {results.map((item) => <article key={item.title} className="rounded-xl border border-white/10 bg-[#030914] p-4"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" /><div><h3 className="text-sm font-extrabold text-white">{item.title}</h3><p className="mt-2 text-xs leading-5 text-slate-400">{item.answer}</p></div></div></article>)}
      </div>
    </section>
  );
}

export default function ExperienceDemoPage() {
  const [view, setView] = useState<View>('client');
  return (
    <main className="min-h-screen bg-[#030914] px-4 py-6 text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-5 border-b border-white/10 pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-xl border border-orange-500/30 bg-orange-500/10 text-sm font-black text-orange-400">LLF</div><div><div className="text-sm font-black tracking-[.18em] text-white">CLIENT EXPERIENCE LAB</div><div className="mt-1 text-xs text-slate-500">Internal simulation · Sample data only</div></div></div>
          <div className="flex flex-wrap gap-2">
            {([['client', LayoutDashboard, 'Client Portal'], ['agent', Users, 'Agent Console'], ['knowledge', Search, 'Knowledge Center']] as const).map(([id, Icon, label]) => <button key={id} onClick={() => setView(id)} className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-extrabold transition ${view === id ? 'border-orange-500/40 bg-orange-500/10 text-orange-300' : 'border-white/10 bg-white/[0.03] text-slate-400 hover:text-white'}`}><Icon className="h-4 w-4" />{label}</button>)}
          </div>
        </header>

        <div className="my-5 flex flex-wrap items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] px-4 py-3 text-xs text-amber-200"><Bot className="h-4 w-4" /><b>Fail-closed simulation:</b> no live messages, no client data, no checkout, no production actions.</div>

        {view === 'client' && <ClientPortal />}
        {view === 'agent' && <AgentConsole />}
        {view === 'knowledge' && <KnowledgeCenter />}

        <footer className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5 text-[11px] text-slate-600"><span>Local Lead Forge · Experience Complete Client #1</span><span className="flex items-center gap-2"><UserRound className="h-3.5 w-3.5" /> Initial agents: LLF authorized team</span></footer>
      </div>
    </main>
  );
}
