import type { SupportLocale } from './support-knowledge';

const FAIL_CLOSED_RUNTIME = {
  mode: 'SIMULATION',
  liveAiProvider: false,
  liveCustomerMessaging: false,
  liveHumanHandoff: false,
} as const;

export const SUPPORT_RUNTIME_DISCLOSURE = {
  ...FAIL_CLOSED_RUNTIME,
  assistantTitle: 'LLF Support Assistant',
  statusLabel: 'Knowledge demo · no live messaging',
  handoffActionLabel: 'Preview specialist handoff',
  handoffTitle: 'Handoff simulation prepared',
  handoffMessage:
    'No LLF specialist has been notified. This demo preserves the local conversation context only so the future authenticated handoff experience can be rehearsed safely.',
  launcherLabel: 'Questions? Ask LLF',
  footerLabel: 'Knowledge-driven demo · AI provider and human handoff are not live yet.',
} as const;

export const SUPPORT_RUNTIME_DISCLOSURE_ES = {
  ...FAIL_CLOSED_RUNTIME,
  assistantTitle: 'Asistente de Soporte LLF',
  statusLabel: 'Demo de conocimiento · sin mensajes en vivo',
  handoffActionLabel: 'Vista previa del traspaso a especialista',
  handoffTitle: 'Simulación de traspaso preparada',
  handoffMessage:
    'Ningún especialista de LLF ha sido notificado. Esta demo conserva el contexto de la conversación solo de forma local para ensayar con seguridad la futura experiencia autenticada de traspaso.',
  launcherLabel: '¿Preguntas? Consulta a LLF',
  footerLabel: 'Demo basada en conocimiento · la IA en vivo y el traspaso humano aún no están activos.',
} as const;

export function getSupportRuntimeDisclosure(locale: SupportLocale = 'en') {
  return locale === 'es' ? SUPPORT_RUNTIME_DISCLOSURE_ES : SUPPORT_RUNTIME_DISCLOSURE;
}

export function getSupportIntro(audience: 'prospect' | 'client', locale: SupportLocale = 'en') {
  if (locale === 'es') {
    return audience === 'prospect'
      ? 'Hola — soy el Asistente de Soporte LLF en modo demo. Puedo responder preguntas aprobadas sobre Local Lead Forge, precios, soporte bilingüe y cómo funciona el sistema. El traspaso humano es una simulación hasta que se habilite el sistema seguro de soporte.'
      : 'Hola — soy el Asistente de Soporte LLF en modo demo. Puedo responder preguntas aprobadas sobre incorporación, implementación, reportes, soporte y temas comunes de la cuenta. El traspaso humano es una simulación hasta que se habilite el sistema seguro de soporte.';
  }
  return audience === 'prospect'
    ? 'Hi — I’m the LLF Support Assistant in demo mode. I can answer approved questions about Local Lead Forge, pricing, bilingual support, and how the system works. Human handoff is simulated until the secure live support backend is released.'
    : 'Hi — I’m the LLF Support Assistant in demo mode. I can answer approved questions about onboarding, implementation, reporting, support, and common account topics. Human handoff is simulated until the secure live support backend is released.';
}

export function getUnknownAnswerDisclosure(locale: SupportLocale = 'en') {
  return locale === 'es'
    ? 'No tengo suficiente información aprobada para responder con seguridad y no voy a adivinar. Una futura versión en vivo podrá transferir esta conversación a un especialista autorizado de LLF; en esta demo solo puedo preparar localmente el estado de traspaso.'
    : 'I do not have enough approved information to answer that confidently. I will not guess. A future live release can hand this conversation to an authorized LLF specialist; in this demo, I can only prepare the handoff state locally.';
}
