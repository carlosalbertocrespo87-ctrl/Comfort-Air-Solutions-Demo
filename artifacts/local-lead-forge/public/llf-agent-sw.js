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

  const title = typeof payload.title === 'string' ? payload.title : 'Local Lead Forge';
  const body = typeof payload.body === 'string'
    ? payload.body
    : 'New activity needs your attention. Tap to open securely.';
  const target = typeof payload.deepLink === 'string' && payload.deepLink.startsWith('/')
    ? payload.deepLink
    : '/agent-demo/';

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      tag: typeof payload.dedupeKey === 'string' ? payload.dedupeKey : 'llf-agent-activity',
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
