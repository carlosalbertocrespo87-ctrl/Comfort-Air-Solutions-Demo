import { createRoot } from 'react-dom/client';

import App from './App';
import { ErrorBoundary } from '@/components/error-boundary';
import OnboardingPage from '@/pages/onboarding';

import './index.css';

const normalizedPath = window.location.pathname.replace(/\/+$/, '') || '/';
const isOnboarding = normalizedPath === '/onboarding';
const CurrentPage = isOnboarding ? OnboardingPage : App;

if (isOnboarding) {
  document.title = 'Client Onboarding | Local Lead Forge';
  const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
  if (description) {
    description.content = 'Secure Local Lead Forge client onboarding for business facts, lead routing, website access coordination, and assistant guardrails.';
  }
  const robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
  if (robots) {
    robots.content = 'noindex, nofollow, noarchive';
  }
}

createRoot(document.getElementById('root')!, {
  // Keeps caught errors off reportError(), which would raise the dev overlay.
  onCaughtError: (error, errorInfo) => {
    console.error(error, errorInfo.componentStack);
  },
}).render(
  <ErrorBoundary>
    <CurrentPage />
  </ErrorBoundary>,
);
