import { createRoot } from 'react-dom/client';

import App from './App';
import { ErrorBoundary } from '@/components/error-boundary';
import SupportChat from '@/components/support-chat';
import { LEGAL_RELEASED } from '@/lib/legal-release';
import { registerAgentQaServiceWorker } from '@/lib/agent-qa-notifications';
import { consumeSupabaseAuthHash, getStoredAgentSession, reconcileStoredDeviceTrust } from '@/lib/supabase-session';
import AgentMobileDemoPage from '@/pages/agent-mobile-demo';
import AgentSignInPage from '@/pages/agent-sign-in';
import DpaPage from '@/pages/dpa';
import ExperienceDemoPage from '@/pages/experience-demo';
import OnboardingPage from '@/pages/onboarding';
import PrivacyPage from '@/pages/privacy';
import StartPage from '@/pages/start';
import TermsPage from '@/pages/terms';

import './index.css';

function AgentAuthRequired() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#020711] px-6 text-white">
      <div className="max-w-md rounded-2xl border border-white/10 bg-[#07111f] p-6 text-center">
        <div className="text-sm font-black text-orange-400">LLF Agent Console</div>
        <h1 className="mt-3 text-2xl font-black">Authentication required</h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">Use an approved LLF agent sign-in link. This route does not expose internal conversations without a validated agent session.</p>
        <div className="mt-5 flex flex-col gap-2">
          <a href="/agent-sign-in" className="inline-block rounded-xl bg-orange-600 px-4 py-3 text-sm font-black">Request QA sign-in link</a>
          <a href="/" className="inline-block rounded-xl border border-white/10 px-4 py-3 text-sm font-black text-slate-300">Return to Local Lead Forge</a>
        </div>
      </div>
    </main>
  );
}

function DeviceTrustRequired({ status }: { status: 'PENDING' | 'REVOKED' }) {
  const pending = status === 'PENDING';
  return (
    <main className="grid min-h-screen place-items-center bg-[#020711] px-6 text-white">
      <div className="max-w-md rounded-2xl border border-white/10 bg-[#07111f] p-6 text-center">
        <div className="text-sm font-black text-orange-400">LLF Device Trust</div>
        <h1 className="mt-3 text-2xl font-black">{pending ? 'Device approval required' : 'Device access revoked'}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          {pending
            ? 'Your identity is verified. This browser has been registered as a pending device and must be approved before the Agent Console can open.'
            : 'This device is no longer trusted. Sign in from an approved device or request a new device review.'}
        </p>
        <a href="/" className="mt-5 inline-block rounded-xl bg-orange-600 px-4 py-3 text-sm font-black">Return to Local Lead Forge</a>
      </div>
    </main>
  );
}

async function bootstrap() {
  const authResult = await consumeSupabaseAuthHash();
  if (authResult === 'consumed') {
    history.replaceState({}, document.title, '/agent-demo');
  }

  await reconcileStoredDeviceTrust();

  const normalizedPath = window.location.pathname.replace(/\/+$/, '') || '/';
  if (normalizedPath === '/agent-demo') {
    void registerAgentQaServiceWorker().catch((error) => console.warn('Agent QA service worker registration failed.', error));
  }
  const isOnboarding = normalizedPath === '/onboarding';
  const agentSession = getStoredAgentSession();

  let AgentRoute: React.ComponentType = AgentAuthRequired;
  if (agentSession?.deviceTrustStatus === 'TRUSTED') AgentRoute = AgentMobileDemoPage;
  else if (agentSession?.deviceTrustStatus === 'PENDING') AgentRoute = () => <DeviceTrustRequired status="PENDING" />;
  else if (agentSession?.deviceTrustStatus === 'REVOKED') AgentRoute = () => <DeviceTrustRequired status="REVOKED" />;

  const routes: Record<string, { component: React.ComponentType; title: string; description: string; private?: boolean }> = {
    '/onboarding': { component: OnboardingPage, title: 'Client Onboarding | Local Lead Forge', description: 'Secure Local Lead Forge client onboarding for business facts, lead routing, website access coordination, and assistant guardrails.', private: true },
    '/experience-demo': { component: ExperienceDemoPage, title: 'Client Experience Lab | Local Lead Forge', description: 'Private Local Lead Forge simulation of the client portal, agent console, and knowledge center.', private: true },
    '/agent-demo': { component: AgentRoute, title: 'LLF Agent Console | Local Lead Forge', description: 'Private mobile-first Local Lead Forge agent console for authorized specialists on trusted devices.', private: true },
    '/agent-sign-in': { component: AgentSignInPage, title: 'LLF Agent QA Sign-in | Local Lead Forge', description: 'QA-only passwordless sign-in entry for approved Local Lead Forge pilot operators.', private: true },
    '/privacy': { component: PrivacyPage, title: 'Privacy Policy | Local Lead Forge', description: 'Local Lead Forge privacy information.', private: !LEGAL_RELEASED },
    '/terms': { component: TermsPage, title: 'Service Terms | Local Lead Forge', description: 'Local Lead Forge service terms.', private: !LEGAL_RELEASED },
    '/dpa': { component: DpaPage, title: 'Data Processing Addendum | Local Lead Forge', description: 'Local Lead Forge data processing information.', private: !LEGAL_RELEASED },
    '/start': { component: StartPage, title: 'Review & Accept | Local Lead Forge', description: 'Review customer-ready Local Lead Forge terms before secure checkout.', private: !LEGAL_RELEASED },
  };

  const route = isOnboarding ? routes['/onboarding'] : routes[normalizedPath];
  const CurrentPage = route?.component ?? App;
  const supportAudience = normalizedPath === '/experience-demo' ? 'client' : normalizedPath === '/' ? 'prospect' : null;

  if (route) {
    document.title = route.title;
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (description) description.content = route.description;
    const robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (robots && route.private) robots.content = 'noindex, nofollow, noarchive';
  }

  createRoot(document.getElementById('root')!, {
    onCaughtError: (error, errorInfo) => console.error(error, errorInfo.componentStack),
  }).render(
    <ErrorBoundary>
      <>
        <CurrentPage />
        {supportAudience && <SupportChat audience={supportAudience} />}
      </>
    </ErrorBoundary>,
  );
}

void bootstrap();
