import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Languages, Search, Sparkles, Star } from 'lucide-react';
import { APPROVED_AGENT_MACROS, renderAgentMacro, searchApprovedMacros, suggestApprovedMacros, type MacroContext, type MacroLanguage } from '@/lib/agent-macros';

type AgentMacroDrawerProps = {
  language: MacroLanguage;
  context: MacroContext;
  latestCustomerMessage?: string;
  disabled?: boolean;
  storageKey: string;
  onInsert: (text: string) => void;
};

export function AgentMacroDrawer({ language, context, latestCustomerMessage = '', disabled = false, storageKey, onInsert }: AgentMacroDrawerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recents, setRecents] = useState<string[]>([]);
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedFavorites = JSON.parse(localStorage.getItem(`${storageKey}:favorites`) ?? '[]');
      const savedRecents = JSON.parse(localStorage.getItem(`${storageKey}:recents`) ?? '[]');
      setFavorites(Array.isArray(savedFavorites) ? savedFavorites.filter((id): id is string => typeof id === 'string') : []);
      setRecents(Array.isArray(savedRecents) ? savedRecents.filter((id): id is string => typeof id === 'string').slice(0, 5) : []);
    } catch {
      setFavorites([]);
      setRecents([]);
    } finally {
      setPreferencesLoaded(true);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!preferencesLoaded) return;
    try {
      localStorage.setItem(`${storageKey}:favorites`, JSON.stringify(favorites));
      localStorage.setItem(`${storageKey}:recents`, JSON.stringify(recents));
    } catch {
      // Local preference persistence is optional; drafting remains fail-safe without it.
    }
  }, [favorites, preferencesLoaded, recents, storageKey]);

  const suggestions = useMemo(() => suggestApprovedMacros(latestCustomerMessage, language, 2), [latestCustomerMessage, language]);
  const visible = useMemo(() => {
    const matches = searchApprovedMacros(query, language);
    return [...matches].sort((a, b) => {
      const favoriteDelta = Number(favorites.includes(b.id)) - Number(favorites.includes(a.id));
      if (favoriteDelta !== 0) return favoriteDelta;
      const aRecent = recents.indexOf(a.id);
      const bRecent = recents.indexOf(b.id);
      if (aRecent === -1 && bRecent === -1) return a.title[language].localeCompare(b.title[language]);
      if (aRecent === -1) return 1;
      if (bRecent === -1) return -1;
      return aRecent - bRecent;
    });
  }, [query, language, favorites, recents]);

  const insert = (macroId: string) => {
    const macro = APPROVED_AGENT_MACROS.find((item) => item.id === macroId);
    if (!macro) return;
    onInsert(renderAgentMacro(macro, language, context));
    setRecents((value) => [macroId, ...value.filter((id) => id !== macroId)].slice(0, 5));
    setOpen(false);
  };

  const toggleFavorite = (macroId: string) => {
    setFavorites((value) => value.includes(macroId) ? value.filter((id) => id !== macroId) : [...value, macroId]);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <button type="button" disabled={disabled} onClick={() => setOpen((value) => !value)} className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-orange-500/30 bg-orange-500/10 px-4 py-3 text-xs font-black text-orange-200 disabled:cursor-not-allowed disabled:opacity-40">
          <BookOpen className="h-4 w-4" /> Macros
        </button>
        <span className="flex min-h-11 items-center gap-1 rounded-xl border border-white/10 bg-white/[0.03] px-3 text-[10px] font-black text-slate-300"><Languages className="h-3.5 w-3.5" /> {language}</span>
      </div>

      {suggestions.length > 0 && !open && <div className="flex gap-2 overflow-x-auto pb-1">
        {suggestions.map((macro) => <button type="button" key={macro.id} disabled={disabled} onClick={() => insert(macro.id)} className="flex min-h-10 shrink-0 items-center gap-1 rounded-full border border-violet-500/20 bg-violet-500/[0.07] px-3 text-[10px] font-bold text-violet-200 disabled:opacity-40"><Sparkles className="h-3 w-3" /> {macro.title[language]}</button>)}
      </div>}

      {open && <div className="rounded-2xl border border-white/10 bg-[#091422] p-3 shadow-2xl">
        <div className="relative"><Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-500" /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder={language === 'ES' ? 'Buscar macro o /atajo' : 'Search macro or /shortcut'} className="min-h-11 w-full rounded-xl border border-white/10 bg-black/20 py-2 pl-9 pr-3 text-xs text-white outline-none placeholder:text-slate-600" /></div>
        <div className="mt-3 max-h-72 space-y-2 overflow-y-auto overscroll-contain">
          {visible.map((macro) => <div key={macro.id} className="rounded-xl border border-white/10 bg-black/20 p-3">
            <div className="flex items-start justify-between gap-2"><button type="button" onClick={() => insert(macro.id)} className="min-h-11 flex-1 text-left"><p className="text-xs font-black text-white">{macro.title[language]}</p><p className="mt-1 text-[9px] font-bold text-orange-300">{macro.shortcut} · {macro.category.replaceAll('_', ' ')}</p><p className="mt-1 line-clamp-2 text-[10px] leading-4 text-slate-400">{renderAgentMacro(macro, language, context)}</p></button><button type="button" aria-label="Favorite macro" onClick={() => toggleFavorite(macro.id)} className="grid min-h-11 min-w-11 place-items-center rounded-lg border border-white/10"><Star className={`h-4 w-4 ${favorites.includes(macro.id) ? 'fill-amber-300 text-amber-300' : 'text-slate-500'}`} /></button></div>
          </div>)}
          {visible.length === 0 && <p className="px-2 py-6 text-center text-[10px] text-slate-500">{language === 'ES' ? 'No hay una macro aprobada que coincida.' : 'No approved macro matches yet.'}</p>}
        </div>
        <p className="mt-3 text-[9px] leading-4 text-slate-500">{language === 'ES' ? 'La macro se inserta para revisión. Nunca se envía automáticamente.' : 'The macro is inserted for review. It is never auto-sent.'}</p>
      </div>}
    </div>
  );
}
