import { createRoot } from 'react-dom/client';

import App from './App';
import { ErrorBoundary } from '@/components/error-boundary';
import { LEGAL_RELEASED } from '@/lib/legal-release';
import DpaPage from '@/pages/dpa';
import ExperienceDemoPage from '@/pages/experience-demo';
import OnboardingPage from '@/pages/onboarding';
import PrivacyPage from '@/pages/privacy';
import StartPage from '@/pages/start';
import TermsPage from '@/pages/terms';

import './index.css';

const normalizedPath = window.location.pathname.replace(/\/+$/, '') || '/';
const isOnboarding = normalizedPath === '/onboarding';

const routes: Record<string, { component: React.ComponentType; title: string; description: string; private?: boolean }> = {
  '/onboarding': {
    component: OnboardingPage,
    title: 'Client Onboarding | Local Lead Forge',
    description: 'Secure Local Lead Forge client onboarding for business facts, lead routing, website access coordination, and assistant guardrails.',
    private: true,
  },
  '/experience-demo': {
    component: ExperienceDemoPage,
    title: 'Client Experience Lab | Local Lead Forge',
    description: 'Private Local Lead Forge simulation of the client portal, agent console, and knowledge center.',
    private: true,
  },
  '/privacy': {
    component: PrivacyPage,
    title: 'Privacy Policy | Local Lead Forge',
    description: 'Local Lead Forge privacy information.',
    private: !LEGAL_RELEASED,
  },
  '/terms': {
    component: TermsPage,
    title: 'Service Terms | Local Lead Forge',
    description: 'Local Lead Forge service terms.',
    private: !LEGAL_RELEASED,
  },
  '/dpa': {
    component: DpaPage,
    title: 'Data Processing Addendum | Local Lead Forge',
    description: 'Local Lead Forge data processing information.',
    private: !LEGAL_RELEASED,
  },
  '/start': {
    component: StartPage,
    title: 'Review & Accept | Local Lead Forge',
    description: 'Review customer-ready Local Lead Forge terms before secure checkout.',
    private: !LEGAL_RELEASED,
  },
};

const route = isOnboarding ? routes['/onboarding'] : routes[normalizedPath];
const CurrentPage = route?.component ?? App;

if (route) {
  document.title = route.title;
  const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
  if (description) description.content = route.description;

  const robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
  if (robots && route.private) robots.content = 'noindex, nofollow, noarchive';
}

createRoot(document.getElementById('root')!, {
  onCaughtError: (error, errorInfo) => {
    console.error(error, errorInfo.componentStack);
  },
}).render(
  <ErrorBoundary>
    <CurrentPage />
  </ErrorBoundary>,
);
