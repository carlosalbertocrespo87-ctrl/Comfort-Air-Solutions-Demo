export const SUPPORT_RUNTIME_DISCLOSURE = {
  mode: 'SIMULATION',
  liveAiProvider: false,
  liveCustomerMessaging: false,
  liveHumanHandoff: false,
  assistantTitle: 'LLF Support Assistant',
  statusLabel: 'Knowledge demo · no live messaging',
  handoffActionLabel: 'Preview specialist handoff',
  handoffTitle: 'Handoff simulation prepared',
  handoffMessage:
    'No LLF specialist has been notified. This demo preserves the local conversation context only so the future authenticated handoff experience can be rehearsed safely.',
  launcherLabel: 'Questions? Ask LLF',
  footerLabel: 'Knowledge-driven demo · AI provider and human handoff are not live yet.',
} as const;

export function getSupportIntro(audience: 'prospect' | 'client') {
  return audience === 'prospect'
    ? 'Hi — I’m the LLF Support Assistant in demo mode. I can answer approved questions about Local Lead Forge, pricing, bilingual support, and how the system works. Human handoff is simulated until the secure live support backend is released.'
    : 'Hi — I’m the LLF Support Assistant in demo mode. I can answer approved questions about onboarding, implementation, reporting, support, and common account topics. Human handoff is simulated until the secure live support backend is released.';
}

export function getUnknownAnswerDisclosure() {
  return 'I do not have enough approved information to answer that confidently. I will not guess. A future live release can hand this conversation to an authorized LLF specialist; in this demo, I can only prepare the handoff state locally.';
}
