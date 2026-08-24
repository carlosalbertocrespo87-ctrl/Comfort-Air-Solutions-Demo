import { canExposeAccountSpecificData, routeChat } from './chat-routing.ts';

Deno.test('verified client routes to existing client', () => {
  const route = routeChat({ authenticatedClient: true, hasVerifiedClientContext: true, intent: 'I need help' });
  if (route !== 'EXISTING_CLIENT') throw new Error(`unexpected route ${route}`);
});

Deno.test('authentication alone does not grant existing-client routing', () => {
  const route = routeChat({ authenticatedClient: true, hasVerifiedClientContext: false, intent: 'I need help' });
  if (route === 'EXISTING_CLIENT') throw new Error('unverified client context routed as existing client');
});

Deno.test('prospect intent routes to prospect without client context', () => {
  const route = routeChat({ authenticatedClient: false, hasVerifiedClientContext: false, intent: 'I need an HVAC repair estimate' });
  if (route !== 'PROSPECT') throw new Error(`unexpected route ${route}`);
});

Deno.test('verified client context wins over prospect-like intent', () => {
  const route = routeChat({ authenticatedClient: true, hasVerifiedClientContext: true, intent: 'I need an HVAC repair estimate' });
  if (route !== 'EXISTING_CLIENT') throw new Error(`verified client misrouted as ${route}`);
});

Deno.test('account data stays hidden without verified context', () => {
  if (canExposeAccountSpecificData({ authenticatedClient: true, hasVerifiedClientContext: false })) {
    throw new Error('account data exposed without verified context');
  }
});

Deno.test('unauthenticated user never receives account-specific data', () => {
  if (canExposeAccountSpecificData({ authenticatedClient: false, hasVerifiedClientContext: true })) {
    throw new Error('account data exposed without authentication');
  }
});
