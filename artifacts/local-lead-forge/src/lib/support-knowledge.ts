export type SupportAudience = 'prospect' | 'client';

export type KnowledgeEntry = {
  id: string;
  audiences: SupportAudience[];
  keywords: string[];
  question: string;
  answer: string;
};

export const supportKnowledge: KnowledgeEntry[] = [
  {
    id: 'what-is-llf',
    audiences: ['prospect', 'client'],
    keywords: ['what', 'do', 'local lead forge', 'llf', 'service', 'lead', 'website', 'ai'],
    question: 'What does Local Lead Forge do?',
    answer: 'Local Lead Forge helps local service businesses capture, qualify, route, and track website opportunities using bilingual AI, structured lead delivery, reporting, and ongoing optimization.',
  },
  {
    id: 'pricing',
    audiences: ['prospect'],
    keywords: ['price', 'pricing', 'cost', 'setup', 'monthly', '$299', '$199'],
    question: 'How much does Local Lead Forge cost?',
    answer: 'The current founding-client offer is $299 one-time setup plus $199 per month. Final customer-ready checkout remains blocked until LLF completes its legal and first-sale release gates.',
  },
  {
    id: 'bilingual',
    audiences: ['prospect', 'client'],
    keywords: ['spanish', 'english', 'bilingual', 'espanol', 'idioma', 'language'],
    question: 'Does the assistant support English and Spanish?',
    answer: 'Yes. The LLF experience is designed to support both English and Spanish so visitors can ask questions and complete lead-capture flows in either language.',
  },
  {
    id: 'human-support',
    audiences: ['prospect', 'client'],
    keywords: ['human', 'agent', 'person', 'specialist', 'live', 'representative', 'carlos', 'maria'],
    question: 'Can I speak with a real person?',
    answer: 'Yes. You can request an LLF specialist at any time. The assistant preserves the conversation context and prepares a handoff summary so the human agent can continue without making you repeat everything.',
  },
  {
    id: 'onboarding',
    audiences: ['client'],
    keywords: ['onboarding', 'setup', 'implementation', 'activation', 'timeline', 'launch'],
    question: 'What happens during onboarding?',
    answer: 'After a verified purchase, LLF collects business facts and routing preferences, configures the system, performs desktop and mobile QA, requests client validation, activates the system, and follows up at Day 1, Day 7, and Day 30.',
  },
  {
    id: 'lead-routing',
    audiences: ['client'],
    keywords: ['routing', 'email', 'lead delivery', 'send leads', 'destination', 'change email'],
    question: 'How do I change where leads are sent?',
    answer: 'A lead-routing change should be confirmed by an LLF specialist. The agent will verify the new destination, update the configuration, run a test lead, and confirm that delivery is working before closing the request.',
  },
  {
    id: 'reporting',
    audiences: ['client'],
    keywords: ['report', 'metrics', 'dashboard', 'results', 'leads', 'appointments', 'roi'],
    question: 'What can I see in the client portal?',
    answer: 'The portal is designed to show implementation status, lead activity, qualification and appointment outcomes, support conversations, and periodic value reviews so the client can understand what LLF is doing and what happens next.',
  },
];

export function findKnowledgeAnswer(question: string, audience: SupportAudience) {
  const normalized = question.toLowerCase().trim();
  if (!normalized) return null;

  let best: { entry: KnowledgeEntry; score: number } | null = null;
  for (const entry of supportKnowledge) {
    if (!entry.audiences.includes(audience)) continue;
    const score = entry.keywords.reduce((total, keyword) => total + (normalized.includes(keyword.toLowerCase()) ? 1 : 0), 0);
    if (score > 0 && (!best || score > best.score)) best = { entry, score };
  }

  return best?.entry ?? null;
}
