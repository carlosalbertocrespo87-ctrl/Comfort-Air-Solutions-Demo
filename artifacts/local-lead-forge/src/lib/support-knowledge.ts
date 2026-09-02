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
    id: 'general-information',
    audiences: ['prospect'],
    localized: {
      en: {
        keywords: ['more information', 'more info', 'tell me more', 'learn more', 'i am interested', 'im interested', 'interested in llf'],
        question: 'Can you tell me more about Local Lead Forge?',
        answer: 'Of course. Local Lead Forge is built for HVAC and local service businesses that want to turn more website traffic into qualified opportunities. LLF can help capture and qualify inquiries in English or Spanish, organize lead delivery and follow-up, and make activity easier to track. If you want to see how it could fit your business, use “Request a Demo” and the LLF team can review your situation.',
      },
      es: {
        keywords: ['mas informacion', 'mas info', 'saber mas', 'conocer mas', 'me interesa', 'estoy interesado', 'informacion sobre llf'],
        question: '¿Me puedes dar más información sobre Local Lead Forge?',
        answer: 'Claro. Local Lead Forge está diseñado para negocios HVAC y otros servicios locales que quieren convertir más tráfico de su página web en oportunidades calificadas. LLF puede ayudar a captar y calificar consultas en español o inglés, organizar la entrega y el seguimiento de oportunidades y facilitar la visibilidad de la actividad. Si quieres ver cómo podría aplicarse a tu negocio, usa “Solicitar Demo” y el equipo de LLF puede revisar tu situación.',
      },
    },
  },
  {
    id: 'how-it-works',
    audiences: ['prospect'],
    localized: {
      en: {
        keywords: ['how does it work', 'how it works', 'how does llf work', 'process', 'what happens'],
        question: 'How does Local Lead Forge work?',
        answer: 'LLF is designed to help move a website visitor from an initial question to a clearer next step. The system can capture inquiry details, qualify the opportunity using approved business information, support English and Spanish, organize lead delivery and tracking, and give the business a clearer follow-up process. Request a demo to review the workflow for your business before anything is implemented.',
      },
      es: {
        keywords: ['como funciona', 'como funciona llf', 'cual es el proceso', 'proceso', 'que pasa despues'],
        question: '¿Cómo funciona Local Lead Forge?',
        answer: 'LLF está diseñado para ayudar a llevar a un visitante de la página web desde una pregunta inicial hasta un próximo paso más claro. El sistema puede captar datos de la consulta, calificar la oportunidad usando información aprobada del negocio, atender en español e inglés, organizar la entrega y el seguimiento de oportunidades y dar al negocio un proceso de seguimiento más claro. Solicita una demo para revisar el flujo aplicado a tu negocio antes de implementar nada.',
      },
    },
  },
  {
    id: 'demo',
    audiences: ['prospect'],
    localized: {
      en: {
        keywords: ['demo', 'request a demo', 'see a demo', 'what is the demo', 'show me'],
        question: 'What happens when I request a demo?',
        answer: '“Request a Demo” sends your business information and the area you want to improve to the LLF team for review. It is the best next step if you want to discuss fit, scope, timing, or questions that require a person. Submitting the form does not activate a service or charge you.',
      },
      es: {
        keywords: ['demo', 'solicitar demo', 'ver una demo', 'que incluye la demo', 'que es la demo', 'muestrame'],
        question: '¿Qué pasa cuando solicito una demo?',
        answer: '“Solicitar Demo” envía al equipo de LLF la información de tu negocio y el área que quieres mejorar para que pueda revisarla. Es el mejor próximo paso si quieres conversar sobre encaje, alcance, tiempos o preguntas que requieren una persona. Enviar el formulario no activa un servicio ni genera un cobro.',
      },
    },
  },
  {
    id: 'hvac-fit',
    audiences: ['prospect'],
    localized: {
      en: {
        keywords: ['hvac business', 'hvac company', 'i own an hvac', 'heating and air', 'air conditioning business', 'can you help my hvac'],
        question: 'Can Local Lead Forge help an HVAC business?',
        answer: 'HVAC is a primary focus of Local Lead Forge. The website experience is designed around common HVAC lead-capture and follow-up needs, including bilingual inquiries, qualification, structured lead delivery, and clearer tracking. Request a demo so the LLF team can review your current website and process before recommending a specific setup.',
      },
      es: {
        keywords: ['negocio hvac', 'empresa hvac', 'tengo hvac', 'calefaccion y aire', 'aire acondicionado', 'pueden ayudar mi hvac', 'me pueden ayudar'],
        question: '¿Local Lead Forge puede ayudar a una empresa HVAC?',
        answer: 'HVAC es uno de los enfoques principales de Local Lead Forge. La experiencia está diseñada alrededor de necesidades comunes de captación y seguimiento de oportunidades HVAC, incluyendo consultas bilingües, calificación, entrega estructurada de oportunidades y seguimiento más claro. Solicita una demo para que el equipo de LLF revise tu página y proceso actual antes de recomendar una configuración específica.',
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
        answer: 'The current founding-client offer is $299 one-time setup plus $199 per month. Online payment is not enabled yet; request a demo so scope, timing, and next steps can be confirmed in writing.',
      },
      es: {
        keywords: ['precio', 'cuanto cuesta', 'costo', 'configuracion', 'mensual', 'mensualidad', '299', '199'],
        question: '¿Cuánto cuesta Local Lead Forge?',
        answer: 'La oferta actual para clientes fundadores es de $299 por la configuración inicial y $199 al mes. El pago en línea aún no está habilitado; solicita una demo para confirmar por escrito el alcance, los tiempos y los próximos pasos.',
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
        answer: 'Yes. The LLF experience is designed for both English and Spanish. This automated assistant answers from approved LLF information and is not live human support.',
      },
      es: {
        keywords: ['espanol', 'ingles', 'bilingue', 'idioma', 'idiomas'],
        question: '¿El asistente funciona en inglés y español?',
        answer: 'Sí. La experiencia de LLF está diseñada para inglés y español. Este asistente automático responde con información aprobada de LLF y no es soporte humano en vivo.',
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
        answer: 'Live-agent chat is not available on this website. Use “Request a Demo” to send your information securely so the LLF team can review and follow up.',
      },
      es: {
        keywords: ['humano', 'agente', 'persona', 'especialista', 'representante', 'carlos', 'maria', 'hablar con alguien'],
        question: '¿Puedo hablar con una persona?',
        answer: 'El chat con un agente en vivo no está disponible en este sitio. Usa “Solicitar Demo” para enviar tus datos de forma segura y permitir que el equipo de LLF revise tu solicitud y te contacte.',
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
        keywords: ['onboarding', 'incorporacion', 'implementacion', 'activacion', 'tiempo', 'lanzamiento', 'configuracion del cliente'],
        question: '¿Qué ocurre durante la incorporación?',
        answer: 'Cuando el proceso de incorporación esté habilitado y una compra esté verificada, LLF recopilará datos del negocio y preferencias de asignación, configurará el sistema, realizará controles de calidad en computadora y móvil, solicitará la validación del cliente y activará el servicio solo después de completar las verificaciones requeridas.',
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
        answer: 'Un cambio en el destino de los leads requiere soporte autorizado de LLF. En la versión en vivo se verificará el destino, se actualizará la configuración, se enviará un lead de prueba y se confirmará la entrega antes de cerrar la solicitud.',
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

  const spanishMarkers = ['que', 'cuanto', 'precio', 'costo', 'espanol', 'ingles', 'idioma', 'humano', 'persona', 'agente', 'onboarding', 'implementacion', 'activacion', 'enrutamiento', 'correo', 'reporte', 'reportes', 'metricas', 'citas', 'como', 'puedo', 'hablar', 'servicio', 'informacion', 'interesa', 'interesado', 'gustaria', 'empresa', 'negocio', 'ayudar', 'funciona', 'demo'];
  const englishMarkers = ['what', 'how', 'price', 'cost', 'english', 'spanish', 'language', 'human', 'person', 'agent', 'implementation', 'activation', 'routing', 'email', 'report', 'metrics', 'appointments', 'service', 'can', 'talk', 'information', 'interested', 'business', 'help', 'works', 'demo', 'more'];
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
