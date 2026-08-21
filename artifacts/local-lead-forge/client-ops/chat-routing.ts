export type ChatRoute = 'PROSPECT' | 'EXISTING_CLIENT' | 'UNKNOWN';

export type ChatRoutingInput = {
  authenticatedClient: boolean;
  hasVerifiedClientContext: boolean;
  intent?: string;
};

export function routeChat(input: ChatRoutingInput): ChatRoute {
  if (input.authenticatedClient && input.hasVerifiedClientContext) return 'EXISTING_CLIENT';
  const intent = (input.intent ?? '').trim().toLowerCase();
  if (intent.includes('estimate') || intent.includes('quote') || intent.includes('service') || intent.includes('repair') || intent.includes('hvac')) return 'PROSPECT';
  return 'UNKNOWN';
}

export function canExposeAccountSpecificData(input: ChatRoutingInput): boolean {
  return input.authenticatedClient && input.hasVerifiedClientContext;
}
