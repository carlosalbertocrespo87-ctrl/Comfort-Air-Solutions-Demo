import { createRoot } from 'react-dom/client';

import App from './App';
import { ErrorBoundary } from '@/components/error-boundary';
import { SelfClosingFunnel } from '@/components/self-closing-funnel';

import './index.css';
import './premium-demo.css';

createRoot(document.getElementById('root')!, {
  // Keeps caught errors off reportError(), which would raise the dev overlay.
  onCaughtError: (error, errorInfo) => {
    console.error(error, errorInfo.componentStack);
  },
}).render(
  <ErrorBoundary>
    <>
      <App />
      <SelfClosingFunnel
        companyName="New Level Mechanical"
        website="https://newlevelmechanical.com"
      />
    </>
  </ErrorBoundary>,
);
