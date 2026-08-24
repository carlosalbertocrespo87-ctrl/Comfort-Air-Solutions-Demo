const sw = await Deno.readTextFile(new URL('../public/llf-agent-sw.js', import.meta.url));
const manifest = JSON.parse(await Deno.readTextFile(new URL('../public/manifest.webmanifest', import.meta.url)));

Deno.test('Agent PWA remains scoped to the protected internal console', () => {
  if (manifest.start_url !== '/agent-demo/' || manifest.id !== '/agent-demo/') throw new Error('agent PWA start surface escaped protected console');
  if (manifest.display !== 'standalone') throw new Error('agent PWA is not installable as a standalone internal surface');
});

Deno.test('service worker does not cache protected conversation data', () => {
  if (/addEventListener\(['"]fetch['"]/.test(sw)) throw new Error('protected data cache/fetch handler must remain absent');
  if (/caches\.(open|match)|cache\.put/.test(sw)) throw new Error('protected data caching must remain absent');
});

Deno.test('notification display fails closed outside synthetic QA mode', () => {
  if (!sw.includes("payload.mode !== 'SYNTHETIC_QA'")) throw new Error('synthetic QA notification gate missing');
  if (sw.includes('payload.body') || sw.includes('payload.title')) throw new Error('untrusted push text could leak into a notification');
  if (!sw.includes("deepLink.startsWith('/agent-demo')")) throw new Error('notification deep link is not limited to protected Agent Console');
});
