export type SupportedLanguage = 'EN' | 'ES';

export type LanguageDecision = {
  language: SupportedLanguage;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  source: 'EXPLICIT_USER_CHOICE' | 'MESSAGE_DETECTION' | 'ACCOUNT_PREFERENCE' | 'FALLBACK';
};

const spanishSignals = [
  'hola', 'gracias', 'precio', 'cuanto', 'cuánto', 'necesito', 'quiero', 'puedo', 'servicio', 'cliente', 'hablar', 'agente',
];
const englishSignals = [
  'hello', 'thanks', 'price', 'how much', 'need', 'want', 'can i', 'service', 'client', 'speak', 'agent',
];

function scoreSignals(message: string, signals: string[]): number {
  const normalized = message.toLowerCase();
  return signals.reduce((score, signal) => score + (normalized.includes(signal) ? 1 : 0), 0);
}

export function detectConversationLanguage(input: {
  message: string;
  explicitChoice?: SupportedLanguage | null;
  accountPreference?: SupportedLanguage | null;
  previousLanguage?: SupportedLanguage | null;
}): LanguageDecision {
  if (input.explicitChoice) {
    return { language: input.explicitChoice, confidence: 'HIGH', source: 'EXPLICIT_USER_CHOICE' };
  }

  const es = scoreSignals(input.message, spanishSignals);
  const en = scoreSignals(input.message, englishSignals);

  if (es > en && es > 0) return { language: 'ES', confidence: es >= 2 ? 'HIGH' : 'MEDIUM', source: 'MESSAGE_DETECTION' };
  if (en > es && en > 0) return { language: 'EN', confidence: en >= 2 ? 'HIGH' : 'MEDIUM', source: 'MESSAGE_DETECTION' };

  if (input.previousLanguage) {
    return { language: input.previousLanguage, confidence: 'MEDIUM', source: 'MESSAGE_DETECTION' };
  }

  if (input.accountPreference) {
    return { language: input.accountPreference, confidence: 'MEDIUM', source: 'ACCOUNT_PREFERENCE' };
  }

  return { language: 'EN', confidence: 'LOW', source: 'FALLBACK' };
}

export function bilingualSupportRules(language: SupportedLanguage): string[] {
  const base = [
    'Answer in the user-selected or detected language.',
    'Preserve conversation context when the user switches between English and Spanish.',
    'Do not translate legal, pricing, policy, or security facts from an unapproved source.',
    'Keep product names, URLs, codes, and identifiers unchanged unless an approved localized version exists.',
    'If language detection is uncertain, ask a short preference question instead of guessing repeatedly.',
    'Human handoff must include the active language so the agent can continue without making the user repeat context.',
  ];

  return language === 'ES'
    ? [...base, 'Use clear, natural Spanish; avoid literal machine-style translations.']
    : [...base, 'Use clear, natural English; avoid unnecessary jargon.'];
}
