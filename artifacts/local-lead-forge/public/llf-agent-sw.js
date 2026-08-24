/* LOCAL LEAD FORGE — AGENT NOTIFICATION SERVICE WORKER
 * Notification-only foundation. Intentionally NO fetch handler and NO offline cache
 * for real customer/prospect conversation data.
 */

self.addEventListener('push', (event) => {
  let payload = {};

  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = {};
  }

  // Fail closed: this service worker is an internal synthetic-QA surface only.
  // Production/customer push needs a separately approved transport and payload contract.
  if (payload.mode !== 'SYNTHETIC_QA') return;

  const title = '[QA] Local Lead Forge';
  const body = 'Synthetic QA activity needs attention. Tap to open the protected console.';
  const target = typeof payload.deepLink === 'string' && payload.deepLink.startsWith('/agent-demo')
    ? payload.deepLink
    : '/agent-demo/';

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      tag: 'llf-agent-synthetic-qa',
      renotify: false,
      data: { deepLink: target },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const deepLink = event.notification?.data?.deepLink || '/agent-demo/';
  const targetUrl = new URL(deepLink, self.location.origin).href;

  event.waitUntil((async () => {
    const windows = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of windows) {
      if ('focus' in client) {
        await client.focus();
        if ('navigate' in client) await client.navigate(targetUrl);
        return;
      }
    }

    if (clients.openWindow) await clients.openWindow(targetUrl);
  })());
});
