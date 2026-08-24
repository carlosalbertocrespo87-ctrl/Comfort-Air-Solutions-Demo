import { useEffect, useState, type ReactNode } from 'react';
import { ScanFace, ShieldCheck } from 'lucide-react';
import {
  biometricLockConfigured,
  biometricLockSupported,
  configureBiometricLock,
  unlockWithBiometrics,
} from '@/lib/agent-biometric-lock';
import type { LLFAgentSession } from '@/lib/supabase-session';

export const AGENT_LOCK_EVENT = 'llf-agent-lock-requested';

export function requestAgentLock(): void {
  window.dispatchEvent(new Event(AGENT_LOCK_EVENT));
}

export function AgentBiometricGate({ session, children }: { session: LLFAgentSession; children: ReactNode }) {
  const supported = biometricLockSupported();
  const [configured, setConfigured] = useState(() => biometricLockConfigured());
  const [unlocked, setUnlocked] = useState(false);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const lock = () => setUnlocked(false);
    window.addEventListener(AGENT_LOCK_EVENT, lock);
    return () => window.removeEventListener(AGENT_LOCK_EVENT, lock);
  }, []);

  if (!supported) return <>{children}</>;
  if (unlocked) return <>{children}</>;

  const run = async () => {
    if (working) return;
    setWorking(true);
    setError(false);
    try {
      if (!configured) {
        await configureBiometricLock(session.agentUserId, session.displayName);
        setConfigured(true);
      } else {
        await unlockWithBiometrics();
      }
      setUnlocked(true);
    } catch {
      setError(true);
    } finally {
      setWorking(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-[#020711] px-6 text-white">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#07111f] p-6 text-center shadow-2xl">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-orange-500/30 bg-orange-500/10 text-orange-300">
          <ScanFace className="h-9 w-9" />
        </div>
        <div className="mt-4 text-sm font-black text-orange-400">LLF Agent Console</div>
        <h1 className="mt-2 text-2xl font-black">{configured ? 'Unlock with Face ID' : 'Protect with Face ID'}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          {configured
            ? `Confirm that you are ${session.displayName} to open the protected Agent Console.`
            : 'Set up Face ID once on this trusted iPhone. Your email sign-in and device approval remain unchanged.'}
        </p>
        <button type="button" disabled={working} onClick={() => void run()} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3 text-sm font-black disabled:opacity-50">
          <ShieldCheck className="h-5 w-5" />
          {working ? 'Waiting for Face ID…' : configured ? 'Use Face ID' : 'Enable Face ID'}
        </button>
        {error && <p className="mt-3 text-xs text-rose-300">Face ID was not completed. Try again to enter.</p>}
        <p className="mt-4 text-[11px] leading-5 text-slate-500">Face ID is handled by your iPhone. Local Lead Forge does not receive or store your face.</p>
      </div>
    </main>
  );
}
