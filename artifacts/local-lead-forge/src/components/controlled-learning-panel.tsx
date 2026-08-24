import { Archive, BookOpenCheck, PlusCircle, SendToBack } from 'lucide-react';
import type { LearningQueueItem } from '@/lib/controlled-learning';

type ControlledLearningPanelProps = {
  items: LearningQueueItem[];
  candidateQuestion?: string;
  disabled?: boolean;
  language: 'EN' | 'ES';
  onQueueCandidate: () => void;
  onUpdateDraft: (itemId: string, value: string) => void;
  onSubmitForReview: (itemId: string) => void;
  onArchive: (itemId: string) => void;
};

export function ControlledLearningPanel({ items, candidateQuestion = '', disabled = false, language, onQueueCandidate, onUpdateDraft, onSubmitForReview, onArchive }: ControlledLearningPanelProps) {
  const active = items.filter((item) => !['MERGED', 'ARCHIVED'].includes(item.status)).slice(0, 5);
  const copy = language === 'ES'
    ? {
        title: 'Centro de conocimiento',
        subtitle: 'Aprendizaje controlado · solo borradores',
        queue: 'Añadir pregunta',
        draft: 'Borrador interno; no se publica',
        submit: 'Enviar a revisión humana',
        awaiting: 'Pendiente de aprobación humana',
        empty: 'No hay preguntas nuevas en revisión.',
        occurrences: 'apariciones',
        archive: 'Archivar borrador',
      }
    : {
        title: 'Knowledge Center',
        subtitle: 'Controlled learning · drafts only',
        queue: 'Add question',
        draft: 'Internal draft; never published',
        submit: 'Submit for human review',
        awaiting: 'Awaiting human approval',
        empty: 'No new questions are under review.',
        occurrences: 'occurrences',
        archive: 'Archive draft',
      };

  return (
    <section className="mt-3 rounded-xl border border-violet-500/20 bg-violet-500/[0.04] p-3">
      <div className="flex items-center gap-2"><BookOpenCheck className="h-4 w-4 text-violet-300" /><div><p className="text-[10px] font-black text-violet-200">{copy.title}</p><p className="text-[8px] text-slate-500">{copy.subtitle}</p></div></div>
      {candidateQuestion && <button type="button" disabled={disabled} onClick={onQueueCandidate} className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-violet-500/25 bg-violet-500/10 px-3 text-[10px] font-black text-violet-200 disabled:cursor-not-allowed disabled:opacity-35"><PlusCircle className="h-4 w-4" /> {copy.queue}</button>}
      <div className="mt-3 space-y-2">
        {active.map((item) => <div key={item.id} className="rounded-lg border border-white/10 bg-black/20 p-2.5">
          <div className="flex items-start justify-between gap-2"><div><p className="line-clamp-2 text-[9px] leading-4 text-slate-300">{item.normalizedQuestion}</p><p className="mt-1 text-[8px] font-bold text-amber-300">{item.answerStatus} · {item.occurrenceCount} {copy.occurrences}</p></div><button type="button" disabled={disabled} aria-label={copy.archive} onClick={() => onArchive(item.id)} className="grid min-h-10 min-w-10 place-items-center rounded-lg border border-white/10 text-slate-500 disabled:opacity-30"><Archive className="h-3.5 w-3.5" /></button></div>
          <textarea disabled={disabled || item.status === 'REVIEW_READY'} rows={3} value={item.draftAnswer ?? ''} onChange={(event) => onUpdateDraft(item.id, event.target.value)} placeholder={copy.draft} className="mt-2 w-full resize-none rounded-lg border border-white/10 bg-black/20 p-2 text-[9px] text-slate-300 outline-none disabled:opacity-40" />
          {item.status === 'REVIEW_READY' ? <p className="mt-2 text-[8px] font-bold text-emerald-300">{copy.awaiting}</p> : <button type="button" disabled={disabled || !item.draftAnswer} onClick={() => onSubmitForReview(item.id)} className="mt-2 flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-2 text-[9px] font-black text-emerald-200 disabled:opacity-30"><SendToBack className="h-3.5 w-3.5" /> {copy.submit}</button>}
        </div>)}
        {active.length === 0 && <p className="py-2 text-[9px] text-slate-500">{copy.empty}</p>}
      </div>
      <p className="mt-2 text-[8px] leading-4 text-slate-500">Approved content is never created automatically. This console has no approval or publish action.</p>
    </section>
  );
}
