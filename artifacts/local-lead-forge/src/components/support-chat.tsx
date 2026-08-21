import { useMemo, useState } from 'react';
import { Bot, Headphones, MessageCircle, Send, UserRound, X } from 'lucide-react';
import { findKnowledgeAnswer, type SupportAudience } from '@/lib/support-knowledge';

type Message = {
  id: number;
  role: 'assistant' | 'user' | 'system';
  text: string;
};

type Props = {
  audience: SupportAudience;
  embedded?: boolean;
  defaultOpen?: boolean;
};

export default function SupportChat({ audience, embedded = false, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen || embedded);
  const [input, setInput] = useState('');
  const [handoff, setHandoff] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'assistant',
      text: audience === 'prospect'
        ? 'Hi — I’m the LLF AI Assistant. I can answer questions about Local Lead Forge, pricing, bilingual support, and how the system works. If you prefer a person, choose “Talk to a specialist” at any time.'
        : 'Hi — I’m the LLF AI Assistant. I can help with onboarding, implementation, reporting, support, and common account questions. If you prefer a person, choose “Talk to a specialist” at any time.',
    },
  ]);

  const contextLabel = audience === 'prospect' ? 'PROSPECT · Website' : 'CLIENT · Portal';
  const nextId = useMemo(() => messages.length + 1, [messages.length]);

  const ask = () => {
    const question = input.trim();
    if (!question) return;
    const userMessage: Message = { id: nextId, role: 'user', text: question };
    const answer = findKnowledgeAnswer(question, audience);
    const reply: Message = answer
      ? { id: nextId + 1, role: 'assistant', text: answer.answer }
      : {
          id: nextId + 1,
          role: 'assistant',
          text: 'I do not have enough approved information to answer that confidently. I can hand this conversation to an LLF specialist instead of guessing.',
        };
    setMessages((current) => [...current, userMessage, reply]);
    setInput('');
    if (!answer) setHandoff(true);
  };

  const requestHuman = () => {
    setHandoff(true);
    setMessages((current) => [
      ...current,
      {
        id: current.length + 1,
        role: 'system',
        text: 'Human handoff requested. Conversation context will be preserved for an authorized LLF specialist (Carlos or María).',
      },
    ]);
  };

  const panel = (
    <div className={`${embedded ? 'w-full' : 'w-[min(390px,calc(100vw-24px))]'} overflow-hidden rounded-2xl border border-orange-500/25 bg-[#06101d] shadow-[0_30px_90px_rgba(0,0,0,.55)]`}>
      <div className="flex items-center justify-between border-b border-white/10 bg-[#081421] px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl border border-orange-500/30 bg-orange-500/10"><Bot className="h-4 w-4 text-orange-400" /></div>
          <div>
            <div className="text-xs font-black text-white">LLF AI Assistant</div>
            <div className="mt-0.5 text-[10px] font-semibold text-emerald-400">● AI online · {contextLabel}</div>
          </div>
        </div>
        {!embedded && <button onClick={() => setOpen(false)} className="rounded-lg p-2 text-slate-500 hover:bg-white/5 hover:text-white" aria-label="Close support chat"><X className="h-4 w-4" /></button>}
      </div>

      <div className="max-h-[390px] space-y-3 overflow-y-auto px-4 py-4 text-sm">
        {messages.map((message) => (
          <div key={message.id} className={message.role === 'user' ? 'ml-auto max-w-[86%]' : 'max-w-[92%]'}>
            {message.role === 'system' ? (
              <div className="rounded-xl border border-sky-500/25 bg-sky-500/[0.07] p-3 text-xs leading-5 text-sky-200">{message.text}</div>
            ) : (
              <div className={`rounded-2xl p-3 leading-5 ${message.role === 'user' ? 'rounded-tr-sm bg-orange-600 text-white' : 'rounded-tl-sm bg-white/[0.06] text-slate-300'}`}>{message.text}</div>
            )}
          </div>
        ))}
      </div>

      {handoff && (
        <div className="mx-4 mb-3 rounded-xl border border-sky-500/20 bg-sky-500/[0.06] p-3">
          <div className="flex items-center gap-2 text-xs font-black text-sky-300"><UserRound className="h-4 w-4" /> Waiting for LLF specialist</div>
          <p className="mt-1 text-[10px] leading-4 text-slate-500">MVP simulation: the future live system will notify Carlos and María, show whether this is a prospect or client, and include an AI-generated conversation summary. No live message is sent yet.</p>
        </div>
      )}

      <div className="border-t border-white/10 p-3">
        <button onClick={requestHuman} className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl border border-sky-500/25 bg-sky-500/[0.06] px-3 py-2.5 text-xs font-extrabold text-sky-300">
          <Headphones className="h-4 w-4" /> Talk to a specialist
        </button>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => { if (event.key === 'Enter') ask(); }}
            placeholder={audience === 'prospect' ? 'Ask about LLF…' : 'Ask about your LLF service…'}
            className="h-11 min-w-0 flex-1 rounded-xl border border-white/10 bg-[#030914] px-3 text-xs text-white outline-none placeholder:text-slate-700 focus:border-orange-500/40"
          />
          <button onClick={ask} className="grid h-11 w-11 place-items-center rounded-xl bg-orange-600 text-white" aria-label="Send question"><Send className="h-4 w-4" /></button>
        </div>
        <div className="mt-2 text-center text-[9px] text-slate-700">Knowledge-driven MVP · Human handoff is simulated until the secure backend is connected.</div>
      </div>
    </div>
  );

  if (embedded) return panel;

  return (
    <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      {open ? panel : (
        <button onClick={() => setOpen(true)} className="flex items-center gap-3 rounded-full border border-orange-400/40 bg-orange-600 px-5 py-3 text-sm font-black text-white shadow-[0_18px_55px_rgba(255,106,0,.28)]">
          <MessageCircle className="h-5 w-5" /> Questions? Ask LLF AI
        </button>
      )}
    </div>
  );
}
