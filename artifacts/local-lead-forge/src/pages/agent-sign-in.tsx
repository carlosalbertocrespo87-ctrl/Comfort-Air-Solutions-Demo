import { useState } from 'react';

import { requestPersistentAgentSignIn } from '@/lib/supabase-session';

const APPROVED_CARLOS_EMAIL = 'localleadforgeagency@gmail.com';

export default function AgentSignInPage() {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [copiedLink, setCopiedLink] = useState('');
  const [linkError, setLinkError] = useState(false);

  const activateThisIPhone = async () => {
    if (state === 'sending') return;
    setState('sending');

    try {
      await requestPersistentAgentSignIn(
        APPROVED_CARLOS_EMAIL,
        `${window.location.origin}/agent-demo`,
      );
      setState('sent');
    } catch {
      setState('error');
    }
  };

  const openCopiedLink = () => {
    setLinkError(false);
    try {
      const approved = new URL(copiedLink.trim());
      const redirect = new URL(approved.searchParams.get('redirect_to') ?? '');
      const valid = approved.protocol === 'https:'
        && approved.hostname === 'iogjlzizzegqarkfyzzx.supabase.co'
        && approved.pathname === '/auth/v1/verify'
        && approved.searchParams.get('type') === 'magiclink'
        && Boolean(approved.searchParams.get('token'))
        && redirect.origin === window.location.origin
        && redirect.pathname.replace(/\/+$/, '') === '/agent-demo';
      if (!valid) throw new Error('unapproved_magic_link');
      window.location.assign(approved.toString());
    } catch {
      setLinkError(true);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-[#020711] px-6 text-white">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#07111f] p-6">
        <div className="text-sm font-black text-orange-400">LLF Agent Console · Carlos</div>
        <h1 className="mt-3 text-2xl font-black">Activate this iPhone once</h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          One-time activation for Carlos's trusted iPhone. After activation, LLF restores the approved session automatically and Face ID remains the daily lock — no email entry or sign-in link each time.
        </p>

        <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-4">
          <div className="text-xs font-bold text-slate-400">Approved operator</div>
          <div className="mt-1 text-sm font-black text-white">Carlos · {APPROVED_CARLOS_EMAIL}</div>
        </div>

        <button
          type="button"
          onClick={activateThisIPhone}
          disabled={state === 'sending' || state === 'sent'}
          className="mt-4 w-full rounded-xl bg-orange-600 px-4 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {state === 'sending' ? 'Activating…' : state === 'sent' ? 'Activation link sent' : 'Activate this iPhone'}
        </button>

        {state === 'sent' && (
          <div className="mt-4 space-y-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
            <p className="text-xs leading-5 text-emerald-300">
              This is the last email step for normal use. In Gmail, press and hold the newest LLF sign-in link and choose Copy Link. Return here and paste it below. Once accepted, this iPhone will restore Carlos's session automatically on future launches.
            </p>
            <label className="block text-xs font-bold text-slate-300" htmlFor="agent-magic-link">Copied activation link</label>
            <textarea
              id="agent-magic-link"
              value={copiedLink}
              onChange={(event) => setCopiedLink(event.target.value)}
              rows={3}
              autoCapitalize="none"
              autoCorrect="off"
              className="w-full resize-none rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white outline-none focus:border-orange-500/50"
              placeholder="https://iogjlzizzegqarkfyzzx.supabase.co/auth/v1/verify?..."
            />
            <button
              type="button"
              aria-label="Open approved link in LLF Agent"
              disabled={!copiedLink.trim()}
              onClick={openCopiedLink}
              className="w-full rounded-xl border border-orange-500/30 bg-orange-500/10 px-4 py-3 text-sm font-black text-orange-200 disabled:opacity-40"
            >
              Finish one-time activation
            </button>
            {linkError && <p className="text-xs leading-5 text-rose-300">That is not the newest approved LLF activation link. Copy the complete newest link and try again.</p>}
          </div>
        )}
        {state === 'error' && (
          <p className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs leading-5 text-rose-300">
            Activation could not start. No session was created and no security control was changed.
          </p>
        )}

        <p className="mt-5 text-[10px] leading-4 text-slate-500">
          Carlos-only. Trusted Device and Face ID remain required. María and all LIVE messaging, payment, and automation capabilities remain blocked.
        </p>
      </div>
    </main>
  );
}
