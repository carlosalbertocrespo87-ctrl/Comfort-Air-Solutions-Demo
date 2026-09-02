(() => {
  const originalFetch = window.fetch.bind(window);
  const workerUrl = 'https://local-lead-forge-demo-mailer.localleadforgeagency.workers.dev/';
  const productionHosts = new Set(['localleadforge.com', 'www.localleadforge.com']);

  function jsonResponse(body, status) {
    return new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  window.fetch = (input, init = {}) => {
    const method = String(init?.method || 'GET').toUpperCase();
    const url = typeof input === 'string' ? input : input instanceof Request ? input.url : String(input);
    const isLlfFormPost = method === 'POST' && (url === '/' || url === '/home-preview' || url.endsWith('/home-preview'));

    if (!isLlfFormPost) return originalFetch(input, init);

    // Netlify deploy previews keep using the detector form. Production is hosted on
    // GitHub Pages, so its request must be delivered through the LLF mailer worker.
    if (!productionHosts.has(window.location.hostname)) {
      return originalFetch('/llf-form-blueprint.html', init);
    }

    const rawBody = typeof init.body === 'string' ? init.body : '';
    const params = new URLSearchParams(rawBody);

    // Preserve the honeypot without exposing a different success path to bots.
    if (params.get('bot-field')) return Promise.resolve(jsonResponse({ success: true }, 200));

    const name = String(params.get('name') || '').trim();
    const business = String(params.get('business') || '').trim();
    const email = String(params.get('email') || '').trim();
    const phone = String(params.get('phone') || '').trim();
    const need = String(params.get('need') || '').trim();
    const smsConsent = params.get('sms-consent') === 'yes' ? 'Yes' : 'No';

    if (!name || !business || !email) {
      return Promise.resolve(jsonResponse({ error: 'Missing required form information' }, 400));
    }

    const language = document.documentElement.lang.toLowerCase().startsWith('es') ? 'es' : 'en';
    const issue = [
      need || 'Website demo request',
      `Business: ${business}`,
      `Contact email: ${email}`,
      `Optional SMS consent: ${smsConsent}`,
    ].join('\n');

    return originalFetch(workerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        phone: phone || 'Not provided',
        issue,
        location: business,
        timing: `Website demo request — contact by email: ${email}`,
        language,
        demoEmail: 'localleadforgeagency@gmail.com',
      }),
    });
  };
})();
