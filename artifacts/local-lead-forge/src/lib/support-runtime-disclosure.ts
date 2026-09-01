import type { SupportAudience, SupportLocale } from './support-knowledge';

const INFORMATIONAL_RUNTIME = {
  mode: 'INFORMATIONAL',
  liveAiProvider: false,
  liveCustomerMessaging: false,
  liveHumanHandoff: false,
} as const;

export const SUPPORT_RUNTIME_DISCLOSURE = {
  ...INFORMATIONAL_RUNTIME,
  assistantTitle: 'LLF Information Assistant',
  statusLabel: 'Automated information · not live support',
  handoffActionLabel: 'Preview specialist handoff',
  handoffTitle: 'Handoff simulation prepared',
  handoffMessage:
    'No LLF specialist has been notified. This internal client preview stores conversation context locally for testing only.',
  launcherLabel: 'Questions? Ask LLF',
  footerLabel: 'Automated answers from approved LLF information · not live support.',
} as const;

export const SUPPORT_RUNTIME_DISCLOSURE_ES = {
  ...INFORMATIONAL_RUNTIME,
  assistantTitle: 'Asistente Informativo LLF',
  statusLabel: 'Información automática · no es soporte en vivo',
  handoffActionLabel: 'Vista previa del traspaso a especialista',
  handoffTitle: 'Simulación de traspaso preparada',
  handoffMessage:
    'Ningún especialista de LLF ha sido notificado. Esta vista interna para clientes conserva el contexto de forma local solo para pruebas.',
  launcherLabel: '¿Preguntas? Consulta a LLF',
  footerLabel: 'Respuestas automáticas basadas en información aprobada de LLF · no es soporte en vivo.',
} as const;

export function getSupportRuntimeDisclosure(locale: SupportLocale = 'en') {
  return locale === 'es' ? SUPPORT_RUNTIME_DISCLOSURE_ES : SUPPORT_RUNTIME_DISCLOSURE;
}

export function getSupportIntro(audience: SupportAudience, locale: SupportLocale = 'en') {
  if (locale === 'es') {
    return audience === 'prospect'
      ? 'Hola — soy el Asistente Informativo LLF. Puedo responder preguntas sobre Local Lead Forge, precios, atención bilingüe y cómo funciona el servicio. No soy un agente en vivo.'
      : 'Hola — soy el Asistente de Soporte LLF en una vista interna de prueba. Puedo responder preguntas aprobadas sobre incorporación, implementación, reportes, soporte y temas comunes de la cuenta.';
  }
  return audience === 'prospect'
    ? 'Hi — I’m the LLF Information Assistant. I can answer questions about Local Lead Forge, pricing, bilingual support, and how the service works. I’m not a live agent.'
    : 'Hi — I’m the LLF Support Assistant in an internal test view. I can answer approved questions about onboarding, implementation, reporting, support, and common account topics.';
}

export function getUnknownAnswerDisclosure(
  locale: SupportLocale = 'en',
  audience: SupportAudience = 'prospect',
) {
  if (audience === 'client') {
    return locale === 'es'
      ? 'No tengo suficiente información aprobada para responder con seguridad y no voy a adivinar. Esta vista interna solo puede preparar localmente una simulación de traspaso.'
      : 'I do not have enough approved information to answer that confidently. I will not guess. This internal view can only prepare a local handoff simulation.';
  }

  return locale === 'es'
    ? 'No tengo suficiente información aprobada para responder con seguridad y no voy a adivinar. Usa “Solicitar Demo” para que el equipo de LLF revise tu consulta.'
    : 'I do not have enough approved information to answer that confidently. I will not guess. Use “Request a Demo” so the LLF team can review your question.';
}
