import { useEffect, useMemo, useState } from 'react';
import { Bot, Headphones, MessageCircle, Send, UserRound, X } from 'lucide-react';
import {
  detectSupportLocale,
  findKnowledgeAnswer,
  type SupportAudience,
  type SupportLocale,
} from '@/lib/support-knowledge';
import {
  getSupportIntro,
  getSupportRuntimeDisclosure,
  getUnknownAnswerDisclosure,
} from '@/lib/support-runtime-disclosure';

type Message = {
  id: number;
  role: 'assistant' | 'user' | 'system';
  text: string;
};

type Props = {
  audience: SupportAudience;
  embedded?: boolean;
  defaultOpen?: boolean;
  locale?: SupportLocale;
  onLocaleChange?: (locale: SupportLocale) => void;
};

export default function SupportChat({ audience, embedded = false, defaultOpen = false, locale: controlledLocale, onLocaleChange }: Props) {
  const [open, setOpen] = useState(defaultOpen || embedded);
  const [input, setInput] = useState('');
  const [handoff, setHandoff] = useState(false);
  const [uncontrolledLocale, setUncontrolledLocale] = useState<SupportLocale>('es');
  const locale = controlledLocale ?? uncontrolledLocale;
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'assistant',
      text: getSupportIntro(audience, controlledLocale ?? 'es'),
    },
  ]);

  useEffect(() => {
    const intro = getSupportIntro(audience, locale);
    setMessages((current) => {
      if (current.length === 1 && current[0]?.id === 1 && current[0]?.role === 'assistant') {
        return current[0].text === intro ? current : [{ ...current[0], text: intro }];
      }
      return current;
    });
  }, [audience, locale]);

  const updateLocale = (nextLocale: SupportLocale) => {
    if (onLocaleChange) onLocaleChange(nextLocale);
    else setUncontrolledLocale(nextLocale);
  };

  const runtime = getSupportRuntimeDisclosure(locale);
  const contextLabel = audience === 'prospect'
    ? (locale === 'es' ? 'PROSPECTO · Sitio web' : 'PROSPECT · Website')
    : (locale === 'es' ? 'CLIENTE · Portal' : 'CLIENT · Portal');
  const nextId = useMemo(() => messages.length + 1, [messages.length]);

  const switchLocale = (nextLocale: SupportLocale) => {
    updateLocale(nextLocale);
    setMessages((current) => {
      if (current.length === 1 && current[0]?.id === 1 && current[0]?.role === 'assistant') {
        return [{ ...current[0], text: getSupportIntro(audience, nextLocale) }];
      }
      return current;
    });
  };

  const ask = () => {
    const question = input.trim();
    if (!question) return;
    const answerLocale = detectSupportLocale(question, locale);
    const userMessage: Message = { id: nextId, role: 'user', text: question };
    const answer = findKnowledgeAnswer(question, audience, answerLocale);
    const reply: Message = answer
      ? { id: nextId + 1, role: 'assistant', text: answer.answer }
      : {
          id: nextId + 1,
          role: 'assistant',
          text: getUnknownAnswerDisclosure(answerLocale),
        };
    updateLocale(answerLocale);
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
        text: `${runtime.handoffTitle}. ${runtime.handoffMessage}`,
      },
    ]);
  };

  const panel = (
    <div className={`${embedded ? 'w-full' : 'w-[min(390px,calc(100vw-24px))]'} overflow-hidden rounded-2xl border border-orange-500/25 bg-[#06101d] shadow-[0_30px_90px_rgba(0,0,0,.55)]`}>
      <div className="border-b border-white/10 bg-[#081421] px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-orange-500/30 bg-orange-500/10"><Bot className="h-4 w-4 text-orange-400" /></div>
            <div className="min-w-0">
              <div className="text-xs font-black text-white">{runtime.assistantTitle}</div>
              <div className="mt-0.5 text-[10px] font-semibold leading-4 text-amber-300">● {runtime.statusLabel} · {contextLabel}</div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {(['en', 'es'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => switchLocale(option)}
                aria-pressed={locale === option}
                aria-label={option === 'en' ? 'Use English' : 'Usar español'}
                className={`rounded-md border px-2 py-1 text-[9px] font-black uppercase ${locale === option ? 'border-orange-400/50 bg-orange-500/15 text-orange-300' : 'border-white/10 text-slate-500 hover:text-white'}`}
              >
                {option}
              </button>
            ))}
            {!embedded && <button onClick={() => setOpen(false)} className="rounded-lg p-2 text-slate-500 hover:bg-white/5 hover:text-white" aria-label={locale === 'es' ? 'Cerrar chat de soporte' : 'Close support chat'}><X className="h-4 w-4" /></button>}
          </div>
        </div>
      </div>

      <div className="max-h-[390px] space-y-3 overflow-y-auto px-4 py-4 text-sm" aria-live="polite">
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
          <div className="flex items-center gap-2 text-xs font-black text-sky-300"><UserRound className="h-4 w-4" /> {runtime.handoffTitle}</div>
          <p className="mt-1 text-[10px] leading-4 text-slate-500">{runtime.handoffMessage}</p>
        </div>
      )}

      <div className="border-t border-white/10 p-3">
        <button onClick={requestHuman} className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl border border-sky-500/25 bg-sky-500/[0.06] px-3 py-2.5 text-xs font-extrabold text-sky-300">
          <Headphones className="h-4 w-4" /> {runtime.handoffActionLabel}
        </button>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => { if (event.key === 'Enter') ask(); }}
            placeholder={audience === 'prospect'
              ? (locale === 'es' ? 'Pregunta sobre LLF…' : 'Ask about LLF…')
              : (locale === 'es' ? 'Pregunta sobre tu servicio LLF…' : 'Ask about your LLF service…')}
            className="h-11 min-w-0 flex-1 rounded-xl border border-white/10 bg-[#030914] px-3 text-xs text-white outline-none placeholder:text-slate-700 focus:border-orange-500/40"
          />
          <button onClick={ask} className="grid h-11 w-11 place-items-center rounded-xl bg-orange-600 text-white" aria-label={locale === 'es' ? 'Enviar pregunta' : 'Send question'}><Send className="h-4 w-4" /></button>
        </div>
        <div className="mt-2 text-center text-[9px] text-slate-700">{runtime.footerLabel}</div>
      </div>
    </div>
  );

  if (embedded) return panel;

  return (
    <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      {open ? panel : (
        <button onClick={() => setOpen(true)} className="flex items-center gap-3 rounded-full border border-orange-400/40 bg-orange-600 px-5 py-3 text-sm font-black text-white shadow-[0_18px_55px_rgba(255,106,0,.28)]">
          <MessageCircle className="h-5 w-5" /> {runtime.launcherLabel}
        </button>
      )}
    </div>
  );
}
