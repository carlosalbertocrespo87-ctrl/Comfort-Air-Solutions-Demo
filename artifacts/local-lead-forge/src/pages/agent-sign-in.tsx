import { FormEvent, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://iogjlzizzegqarkfyzzx.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_F9KY7_PBrERwwQjvpoIv5A_bxk_mVXV';

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

export default function AgentSignInPage() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (state === 'sending' || !email.trim()) return;
    setState('sending');

    const redirectTo = `${window.location.origin}/agent-demo`;
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        shouldCreateUser: false,
        emailRedirectTo: redirectTo,
      },
    });

    setState(error ? 'error' : 'sent');
  };

  return (
    <main className="grid min-h-screen place-items-center bg-[#020711] px-6 text-white">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#07111f] p-6">
        <div className="text-sm font-black text-orange-400">LLF Agent Console · QA</div>
        <h1 className="mt-3 text-2xl font-black">Approved agent sign-in</h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          QA-only passwordless sign-in. The link returns to this protected origin and does not create new users.
        </p>

        <form className="mt-6 space-y-3" onSubmit={submit}>
          <label className="block text-xs font-bold text-slate-300" htmlFor="agent-email">Agent email</label>
          <input
            id="agent-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-orange-500/50"
            placeholder="approved-agent@example.com"
          />
          <button
            type="submit"
            disabled={state === 'sending'}
            className="w-full rounded-xl bg-orange-600 px-4 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {state === 'sending' ? 'Sending…' : 'Send QA sign-in link'}
          </button>
        </form>

        {state === 'sent' && (
          <p className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs leading-5 text-emerald-300">
            Sign-in link sent. Open the newest email on the device being tested. It will return to this preview's /agent-demo route.
          </p>
        )}
        {state === 'error' && (
          <p className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs leading-5 text-rose-300">
            The sign-in link could not be sent. No session was created. Retry once or verify the approved agent email.
          </p>
        )}

        <p className="mt-5 text-[10px] leading-4 text-slate-500">
          QA boundary: authentication only. Device Trust remains required and all Agent Console safety controls remain enforced.
        </p>
      </div>
    </main>
  );
}
