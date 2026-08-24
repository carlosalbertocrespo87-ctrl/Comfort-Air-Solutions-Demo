export type AgentQaNotificationResult =
  | 'SHOWN'
  | 'INSTALL_REQUIRED'
  | 'PERMISSION_DENIED'
  | 'UNSUPPORTED'
  | 'WRONG_ROUTE';

const AGENT_ROUTE = '/agent-demo';
const QA_NOTIFICATION_TITLE = '[QA] Local Lead Forge';
const QA_NOTIFICATION_BODY = 'Synthetic QA activity needs attention. Tap to open the protected console.';

function normalizedPath(): string {
  return window.location.pathname.replace(/\/+$/, '') || '/';
}

export function isInstalledAgentApp(): boolean {
  const iosNavigator = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia('(display-mode: standalone)').matches || iosNavigator.standalone === true;
}

export async function registerAgentQaServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || normalizedPath() !== AGENT_ROUTE || !('serviceWorker' in navigator)) return null;
  return navigator.serviceWorker.register('/llf-agent-sw.js', { scope: '/' });
}

export async function showSyntheticAgentQaNotification(): Promise<AgentQaNotificationResult> {
  if (normalizedPath() !== AGENT_ROUTE) return 'WRONG_ROUTE';
  if (!isInstalledAgentApp()) return 'INSTALL_REQUIRED';
  if (!('Notification' in window) || !('serviceWorker' in navigator)) return 'UNSUPPORTED';

  const registration = await registerAgentQaServiceWorker();
  if (!registration) return 'UNSUPPORTED';

  let permission = Notification.permission;
  if (permission === 'default') permission = await Notification.requestPermission();
  if (permission !== 'granted') return 'PERMISSION_DENIED';

  await registration.showNotification(QA_NOTIFICATION_TITLE, {
    body: QA_NOTIFICATION_BODY,
    tag: 'llf-agent-synthetic-qa',
    data: { mode: 'SYNTHETIC_QA', deepLink: '/agent-demo/' },
  });
  return 'SHOWN';
}
