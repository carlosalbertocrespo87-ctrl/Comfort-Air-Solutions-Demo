export type SupportAudience = 'prospect' | 'client';
export type SupportLocale = 'en' | 'es';

type LocalizedKnowledge = {
  keywords: string[];
  question: string;
  answer: string;
};

export type KnowledgeEntry = {
  id: string;
  audiences: SupportAudience[];
  localized: Record<SupportLocale, LocalizedKnowledge>;
};

export type SupportKnowledgeAnswer = {
  id: string;
  audiences: SupportAudience[];
  locale: SupportLocale;
  question: string;
  answer: string;
  score: number;
};

export const supportKnowledge: KnowledgeEntry[] = [
  {
    id: 'what-is-llf',
    audiences: ['prospect', 'client'],
    localized: {
      en: {
        keywords: ['what is local lead forge', 'what does llf do', 'local lead forge', 'llf', 'service', 'website leads'],
        question: 'What does Local Lead Forge do?',
        answer: 'Local Lead Forge helps local service businesses capture, qualify, route, and track website opportunities with bilingual automation, structured lead delivery, reporting, and ongoing optimization.',
      },
      es: {
        keywords: ['que es local lead forge', 'que hace llf', 'local lead forge', 'llf', 'servicio', 'leads del sitio', 'clientes potenciales'],
        question: '¿Qué hace Local Lead Forge?',
        answer: 'Local Lead Forge ayuda a negocios de servicios locales a captar, calificar, dirigir y dar seguimiento a oportunidades del sitio web mediante automatización bilingüe, entrega estructurada de leads, reportes y optimización continua.',
      },
    },
  },
  {
    id: 'pricing',
    audiences: ['prospect'],
    localized: {
      en: {
        keywords: ['price', 'pricing', 'cost', 'how much', 'setup fee', 'monthly', '299', '199'],
        question: 'How much does Local Lead Forge cost?',
        answer: 'The current founding-client offer is $299 one-time setup plus $199 per month. Customer-ready checkout remains blocked until LLF completes its legal and first-sale release gates.',
      },
      es: {
        keywords: ['precio', 'cuanto cuesta', 'costo', 'configuracion', 'mensual', 'mensualidad', '299', '199'],
        question: '¿Cuánto cuesta Local Lead Forge?',
        answer: 'La oferta actual para clientes fundadores es de $299 por la configuración inicial y $199 al mes. El checkout para clientes sigue bloqueado hasta que LLF complete sus gates legales y de primera venta.',
      },
    },
  },
  {
    id: 'bilingual',
    audiences: ['prospect', 'client'],
    localized: {
      en: {
        keywords: ['spanish', 'english', 'bilingual', 'language', 'languages'],
        question: 'Does the assistant support English and Spanish?',
        answer: 'Yes. The LLF experience is designed for both English and Spanish. This knowledge demo answers from approved local content and does not call a live AI provider.',
      },
      es: {
        keywords: ['espanol', 'ingles', 'bilingue', 'idioma', 'idiomas'],
        question: '¿El asistente funciona en inglés y español?',
        answer: 'Sí. La experiencia de LLF está diseñada para inglés y español. Esta demo de conocimiento responde desde contenido local aprobado y no llama a un proveedor de IA en vivo.',
      },
    },
  },
  {
    id: 'human-support',
    audiences: ['prospect', 'client'],
    localized: {
      en: {
        keywords: ['human', 'agent', 'person', 'specialist', 'representative', 'carlos', 'maria', 'talk to someone'],
        question: 'Can I speak with a real person?',
        answer: 'The demo can preview the future specialist handoff experience, but it does not notify a person or send a live message. The authenticated release is designed to preserve approved conversation context for an authorized LLF specialist.',
      },
      es: {
        keywords: ['humano', 'agente', 'persona', 'especialista', 'representante', 'carlos', 'maria', 'hablar con alguien'],
        question: '¿Puedo hablar con una persona?',
        answer: 'La demo puede mostrar cómo será el futuro traspaso a un especialista, pero no notifica a ninguna persona ni envía mensajes en vivo. La versión autenticada está diseñada para conservar el contexto aprobado de la conversación para un especialista autorizado de LLF.',
      },
    },
  },
  {
    id: 'onboarding',
    audiences: ['client'],
    localized: {
      en: {
        keywords: ['onboarding', 'implementation', 'activation', 'timeline', 'launch', 'client setup'],
        question: 'What happens during onboarding?',
        answer: 'When live onboarding is released and a purchase is verified, LLF will collect business facts and routing preferences, configure the system, perform desktop and mobile QA, request client validation, activate only after the required gates pass, and follow up after launch.',
      },
      es: {
        keywords: ['onboarding', 'implementacion', 'activacion', 'tiempo', 'lanzamiento', 'configuracion del cliente'],
        question: '¿Qué ocurre durante el onboarding?',
        answer: 'Cuando el onboarding en vivo sea liberado y una compra esté verificada, LLF recopilará datos del negocio y preferencias de enrutamiento, configurará el sistema, hará QA en escritorio y móvil, solicitará validación del cliente y activará solo después de superar los gates requeridos.',
      },
    },
  },
  {
    id: 'lead-routing',
    audiences: ['client'],
    localized: {
      en: {
        keywords: ['routing', 'lead delivery', 'send leads', 'destination', 'change email', 'routing email'],
        question: 'How do I change where leads are sent?',
        answer: 'A lead-routing change requires authorized LLF support. In the live release, the destination is verified, the configuration is updated, a test lead is run, and delivery is confirmed before the request is closed.',
      },
      es: {
        keywords: ['enrutamiento', 'entrega de leads', 'enviar leads', 'destino', 'cambiar correo', 'correo de leads'],
        question: '¿Cómo cambio dónde se envían los leads?',
        answer: 'Un cambio de enrutamiento de leads requiere soporte autorizado de LLF. En la versión en vivo se verificará el destino, se actualizará la configuración, se ejecutará un lead de prueba y se confirmará la entrega antes de cerrar la solicitud.',
      },
    },
  },
  {
    id: 'reporting',
    audiences: ['client'],
    localized: {
      en: {
        keywords: ['report', 'metrics', 'dashboard', 'results', 'appointments', 'roi', 'client portal'],
        question: 'What can I see in the client portal?',
        answer: 'The portal is designed to show implementation status, lead activity, qualification and appointment outcomes, support context, and periodic value reviews so the client can understand what LLF is doing and what happens next.',
      },
      es: {
        keywords: ['reporte', 'reportes', 'metricas', 'panel', 'resultados', 'citas', 'roi', 'portal del cliente'],
        question: '¿Qué puedo ver en el portal del cliente?',
        answer: 'El portal está diseñado para mostrar el estado de implementación, actividad de leads, resultados de calificación y citas, contexto de soporte y revisiones periódicas de valor para que el cliente entienda qué está haciendo LLF y qué sigue.',
      },
    },
  },
];

export function detectSupportLocale(text: string, fallback: SupportLocale = 'en'): SupportLocale {
  const tokens = new Set(normalizeSearch(text).split(' ').filter(Boolean));
  if (tokens.size === 0) return fallback;

  const spanishMarkers = ['que', 'cuanto', 'precio', 'costo', 'espanol', 'ingles', 'idioma', 'humano', 'persona', 'agente', 'onboarding', 'implementacion', 'activacion', 'enrutamiento', 'correo', 'reporte', 'reportes', 'metricas', 'citas', 'como', 'puedo', 'hablar', 'servicio'];
  const englishMarkers = ['what', 'how', 'price', 'cost', 'english', 'spanish', 'language', 'human', 'person', 'agent', 'implementation', 'activation', 'routing', 'email', 'report', 'metrics', 'appointments', 'service', 'can', 'talk'];
  const spanishScore = spanishMarkers.reduce((score, marker) => score + (tokens.has(marker) ? 1 : 0), 0);
  const englishScore = englishMarkers.reduce((score, marker) => score + (tokens.has(marker) ? 1 : 0), 0);
  return spanishScore > englishScore ? 'es' : englishScore > spanishScore ? 'en' : fallback;
}

export function findKnowledgeAnswer(
  question: string,
  audience: SupportAudience,
  preferredLocale?: SupportLocale,
): SupportKnowledgeAnswer | null {
  const normalized = normalizeSearch(question);
  if (!normalized) return null;
  const locale = preferredLocale ?? detectSupportLocale(question);

  let best: SupportKnowledgeAnswer | null = null;
  for (const entry of supportKnowledge) {
    if (!entry.audiences.includes(audience)) continue;
    const localized = entry.localized[locale];
    const score = localized.keywords.reduce((total, keyword) => {
      const normalizedKeyword = normalizeSearch(keyword);
      return total + (normalizedKeyword && normalized.includes(normalizedKeyword) ? 1 : 0);
    }, 0);
    if (score > 0 && (!best || score > best.score)) {
      best = {
        id: entry.id,
        audiences: entry.audiences,
        locale,
        question: localized.question,
        answer: localized.answer,
        score,
      };
    }
  }

  return best;
}

function normalizeSearch(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}
