import { createRoot } from 'react-dom/client';

import App from './App';
import { ErrorBoundary } from '@/components/error-boundary';
import OnboardingPage from '@/pages/onboarding';

import './index.css';

const normalizedPath = window.location.pathname.replace(/\/+$/, '') || '/';
const CurrentPage = normalizedPath === '/onboarding' ? OnboardingPage : App;

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
