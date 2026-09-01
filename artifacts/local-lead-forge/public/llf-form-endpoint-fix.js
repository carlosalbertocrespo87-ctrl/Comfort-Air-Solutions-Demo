(() => {
  const originalFetch = window.fetch.bind(window);
  window.fetch = (input, init) => {
    const method = String(init?.method || 'GET').toUpperCase();
    const url = typeof input === 'string' ? input : input instanceof Request ? input.url : String(input);
    const isLlfFormPost = method === 'POST' && (url === '/' || url === '/home-preview' || url.endsWith('/home-preview'));
    if (isLlfFormPost) {
      return originalFetch('/llf-form-blueprint.html', init);
    }
    return originalFetch(input, init);
  };
})();
