export type MacroLanguage = 'EN' | 'ES';
export type MacroStatus = 'DRAFT' | 'APPROVED' | 'ARCHIVED';
export type MacroCategory = 'PRICING' | 'SETUP' | 'SUPPORT' | 'PRODUCT' | 'FOLLOW_UP' | 'ESCALATION';

export type MacroDefinition = {
  id: string;
  shortcut: string;
  category: MacroCategory;
  status: MacroStatus;
  title: { EN: string; ES: string };
  body: { EN: string; ES: string };
  neutralBody?: { EN: string; ES: string };
  tags: string[];
};

export type MacroContext = {
  firstName?: string | null;
  companyName?: string | null;
  operatorName?: string | null;
};

const SAFE_VARIABLES = new Set(['first_name', 'company_name', 'operator_name']);

export const APPROVED_AGENT_MACROS: MacroDefinition[] = [
  {
    id: 'pricing-overview',
    shortcut: '/precio',
    category: 'PRICING',
    status: 'APPROVED',
    title: { EN: 'Pricing overview', ES: 'Resumen de precio' },
    body: {
      EN: 'Hi {{first_name}}, I can walk you through our current approved pricing and what is included for {{company_name}}.',
      ES: 'Hola {{first_name}}, puedo explicarte nuestros precios aprobados actuales y qué incluye el servicio para {{company_name}}.',
    },
    neutralBody: {
      EN: 'Hi, I can walk you through our current approved pricing and what is included for your company.',
      ES: 'Hola, puedo explicarte nuestros precios aprobados actuales y qué incluye el servicio para tu empresa.',
    },
    tags: ['price', 'pricing', 'cost', 'precio', 'costo', 'cuanto'],
  },
  {
    id: 'setup-explainer',
    shortcut: '/setup',
    category: 'SETUP',
    status: 'APPROVED',
    title: { EN: 'Setup process', ES: 'Proceso de configuración' },
    body: {
      EN: 'Hi {{first_name}}, the setup process is designed to be simple. We confirm the approved scope for {{company_name}}, configure the agreed components, and verify everything before launch.',
      ES: 'Hola {{first_name}}, el proceso de configuración está diseñado para ser sencillo. Confirmamos el alcance aprobado para {{company_name}}, configuramos los componentes acordados y verificamos todo antes del lanzamiento.',
    },
    neutralBody: {
      EN: 'Hi, the setup process is designed to be simple. We confirm the approved scope, configure the agreed components, and verify everything before launch.',
      ES: 'Hola, el proceso de configuración está diseñado para ser sencillo. Confirmamos el alcance aprobado, configuramos los componentes acordados y verificamos todo antes del lanzamiento.',
    },
    tags: ['setup', 'install', 'onboarding', 'configuracion', 'instalacion'],
  },
  {
    id: 'support-availability',
    shortcut: '/soporte',
    category: 'SUPPORT',
    status: 'APPROVED',
    title: { EN: 'Support', ES: 'Soporte' },
    body: {
      EN: 'Hi {{first_name}}, we are here to help. Tell me what you need and I will either help directly or escalate it to the right person.',
      ES: 'Hola {{first_name}}, estamos aquí para ayudarte. Cuéntame qué necesitas y te ayudaré directamente o lo escalaré a la persona correcta.',
    },
    neutralBody: {
      EN: 'Hi, we are here to help. Tell me what you need and I will either help directly or escalate it to the right person.',
      ES: 'Hola, estamos aquí para ayudarte. Cuéntame qué necesitas y te ayudaré directamente o lo escalaré a la persona correcta.',
    },
    tags: ['support', 'help', 'soporte', 'ayuda'],
  },
  {
    id: 'escalate-to-carlos',
    shortcut: '/escalar',
    category: 'ESCALATION',
    status: 'APPROVED',
    title: { EN: 'Escalate to Carlos', ES: 'Escalar a Carlos' },
    body: {
      EN: 'Hi {{first_name}}, I want to make sure we give you an accurate answer. I am going to escalate this question to Carlos before making any commitment.',
      ES: 'Hola {{first_name}}, quiero asegurarme de darte una respuesta precisa. Voy a escalar esta pregunta a Carlos antes de asumir cualquier compromiso.',
    },
    neutralBody: {
      EN: 'I want to make sure we give you an accurate answer. I am going to escalate this question to Carlos before making any commitment.',
      ES: 'Quiero asegurarme de darte una respuesta precisa. Voy a escalar esta pregunta a Carlos antes de asumir cualquier compromiso.',
    },
    tags: ['escalate', 'approval', 'exception', 'escalar', 'aprobacion', 'excepcion'],
  },
];

export function detectConversationLanguage(text: string, fallback: MacroLanguage = 'EN'): MacroLanguage {
  const value = normalizeSearchText(text);
  if (!value) return fallback;
  const spanishSignals = ['hola', 'precio', 'cuanto', 'cuánto', 'necesito', 'quiero', 'servicio', 'empresa', 'ayuda', 'gracias', 'ustedes', 'mensual', 'configuracion', 'configuración'];
  const englishSignals = ['hello', 'hi', 'price', 'cost', 'how much', 'need', 'want', 'service', 'company', 'help', 'thanks', 'monthly', 'setup'];
  const es = spanishSignals.reduce((score, token) => score + (value.includes(normalizeSearchText(token)) ? 1 : 0), 0);
  const en = englishSignals.reduce((score, token) => score + (value.includes(token) ? 1 : 0), 0);
  if (es === en) return fallback;
  return es > en ? 'ES' : 'EN';
}

export function renderAgentMacro(macro: MacroDefinition, language: MacroLanguage, context: MacroContext): string {
  if (macro.status !== 'APPROVED') throw new Error('macro_not_approved');
  const cleanContext = {
    first_name: cleanPersonalizationValue(context.firstName),
    company_name: cleanPersonalizationValue(context.companyName),
    operator_name: cleanPersonalizationValue(context.operatorName),
  };
  const template = macro.body[language];
  const requiredVariables = [...template.matchAll(/{{\s*([a-z_]+)\s*}}/g)].map((match) => match[1]);
  const hasUnknownVariable = requiredVariables.some((name) => !SAFE_VARIABLES.has(name));
  if (hasUnknownVariable) throw new Error('macro_contains_unsupported_variable');
  const missingRequired = requiredVariables.some((name) => !cleanContext[name as keyof typeof cleanContext]);
  if (missingRequired && macro.neutralBody?.[language]) return macro.neutralBody[language].trim();
  return template.replace(/{{\s*([a-z_]+)\s*}}/g, (_match, name: keyof typeof cleanContext) => cleanContext[name] ?? '').replace(/\s{2,}/g, ' ').trim();
}

export function searchApprovedMacros(query: string, language: MacroLanguage): MacroDefinition[] {
  const needle = normalizeSearchText(query);
  return APPROVED_AGENT_MACROS.filter((macro) => {
    if (macro.status !== 'APPROVED') return false;
    if (!needle) return true;
    const haystack = normalizeSearchText([macro.shortcut, macro.title[language], macro.body[language], ...macro.tags].join(' '));
    return haystack.includes(needle);
  });
}

export function suggestApprovedMacros(message: string, language: MacroLanguage, limit = 2): MacroDefinition[] {
  const normalized = normalizeSearchText(message);
  return APPROVED_AGENT_MACROS
    .filter((macro) => macro.status === 'APPROVED')
    .map((macro) => ({ macro, score: macro.tags.reduce((score, tag) => score + (normalized.includes(normalizeSearchText(tag)) ? 1 : 0), 0) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.macro.title[language].localeCompare(b.macro.title[language]))
    .slice(0, Math.max(0, limit))
    .map(({ macro }) => macro);
}

export function shouldQueueNewQuestion(message: string, language: MacroLanguage): boolean {
  const value = message.trim();
  if (!value) return false;
  const looksLikeQuestion = /\?|\b(how|what|when|where|why|can|do|does|is|are|cuanto|cuánto|como|cómo|que|qué|cuando|cuándo|donde|dónde|por que|por qué|pueden|puede)\b/i.test(value);
  return looksLikeQuestion && suggestApprovedMacros(value, language, 1).length === 0;
}

function cleanPersonalizationValue(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null;
  const cleaned = value.replace(/[{}<>]/g, '').replace(/\s+/g, ' ').trim();
  return cleaned.length > 0 ? cleaned.slice(0, 120) : null;
}

function normalizeSearchText(value: string): string {
  return value.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s/_-]/g, ' ').replace(/\s+/g, ' ').trim();
}
