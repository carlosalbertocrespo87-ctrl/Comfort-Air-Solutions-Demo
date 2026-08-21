import type { ConversationAudience } from './conversation-model';
import type { IntentLevel, SatisfactionState } from './mobile-agent-experience-policy';

export type ConversationTopic =
  | 'PRICING'
  | 'IMPLEMENTATION'
  | 'CONTRACT_TERMS'
  | 'LEAD_DELIVERY'
  | 'REPORTING'
  | 'SUPPORT'
  | 'SECURITY_PRIVACY'
  | 'BILINGUAL_SUPPORT'
  | 'INTEGRATIONS'
  | 'OTHER';

export type ConversationSignal = {
  conversationId: string;
  audience: ConversationAudience;
  topic: ConversationTopic;
  intentLevel: IntentLevel;
  satisfaction: SatisfactionState;
  humanRequested: boolean;
  repeatedQuestion: boolean;
  knowledgeGapDetected: boolean;
  objection?: string;
  occurredAt: string;
};

export type ImprovementOpportunity = {
  key: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  target: 'WEBSITE' | 'FAQ' | 'KNOWLEDGE_CENTER' | 'SALES_SCRIPT' | 'ONBOARDING' | 'SUPPORT_PLAYBOOK';
  reason: string;
  evidenceCount: number;
};

export function deriveImprovementOpportunities(signals: ConversationSignal[]): ImprovementOpportunity[] {
  const topicCounts = new Map<ConversationTopic, number>();
  const gapCounts = new Map<ConversationTopic, number>();
  const objectionCounts = new Map<string, number>();

  for (const signal of signals) {
    topicCounts.set(signal.topic, (topicCounts.get(signal.topic) ?? 0) + 1);
    if (signal.knowledgeGapDetected || signal.satisfaction === 'NOT_SATISFIED') {
      gapCounts.set(signal.topic, (gapCounts.get(signal.topic) ?? 0) + 1);
    }
    if (signal.objection) {
      objectionCounts.set(signal.objection, (objectionCounts.get(signal.objection) ?? 0) + 1);
    }
  }

  const opportunities: ImprovementOpportunity[] = [];

  for (const [topic, count] of gapCounts.entries()) {
    opportunities.push({
      key: `knowledge-gap:${topic}`,
      priority: count >= 5 ? 'HIGH' : count >= 3 ? 'MEDIUM' : 'LOW',
      target: 'KNOWLEDGE_CENTER',
      reason: `${count} conversation(s) exposed an unresolved or unsatisfactory ${topic.toLowerCase()} question.`,
      evidenceCount: count,
    });
  }

  for (const [topic, count] of topicCounts.entries()) {
    if (count >= 5) {
      opportunities.push({
        key: `frequent-topic:${topic}`,
        priority: count >= 10 ? 'HIGH' : 'MEDIUM',
        target: topic === 'PRICING' || topic === 'IMPLEMENTATION' ? 'WEBSITE' : 'FAQ',
        reason: `${topic.toLowerCase()} appeared in ${count} conversations and should be easier to answer before a visitor needs support.`,
        evidenceCount: count,
      });
    }
  }

  for (const [objection, count] of objectionCounts.entries()) {
    if (count >= 3) {
      opportunities.push({
        key: `objection:${objection.toLowerCase().replace(/\s+/g, '-')}`,
        priority: count >= 7 ? 'HIGH' : 'MEDIUM',
        target: 'SALES_SCRIPT',
        reason: `Repeated objection: ${objection}`,
        evidenceCount: count,
      });
    }
  }

  return opportunities.sort((a, b) => {
    const weight = { HIGH: 3, MEDIUM: 2, LOW: 1 } as const;
    return weight[b.priority] - weight[a.priority] || b.evidenceCount - a.evidenceCount;
  });
}

export type ConversationIntelligenceDigest = {
  totalConversations: number;
  prospectConversations: number;
  clientConversations: number;
  highIntentConversations: number;
  readyToBuyConversations: number;
  humanRequests: number;
  satisfied: number;
  notSatisfied: number;
  knowledgeGaps: number;
  topTopics: Array<{ topic: ConversationTopic; count: number }>;
};

export function buildConversationIntelligenceDigest(signals: ConversationSignal[]): ConversationIntelligenceDigest {
  const topicCounts = new Map<ConversationTopic, number>();
  const uniqueConversations = new Set(signals.map((signal) => signal.conversationId));
  const prospectConversations = new Set(signals.filter((s) => s.audience === 'PROSPECT').map((s) => s.conversationId));
  const clientConversations = new Set(signals.filter((s) => s.audience === 'CLIENT').map((s) => s.conversationId));

  for (const signal of signals) {
    topicCounts.set(signal.topic, (topicCounts.get(signal.topic) ?? 0) + 1);
  }

  return {
    totalConversations: uniqueConversations.size,
    prospectConversations: prospectConversations.size,
    clientConversations: clientConversations.size,
    highIntentConversations: new Set(signals.filter((s) => s.intentLevel === 'HIGH').map((s) => s.conversationId)).size,
    readyToBuyConversations: new Set(signals.filter((s) => s.intentLevel === 'READY_TO_BUY').map((s) => s.conversationId)).size,
    humanRequests: new Set(signals.filter((s) => s.humanRequested).map((s) => s.conversationId)).size,
    satisfied: new Set(signals.filter((s) => s.satisfaction === 'SATISFIED').map((s) => s.conversationId)).size,
    notSatisfied: new Set(signals.filter((s) => s.satisfaction === 'NOT_SATISFIED').map((s) => s.conversationId)).size,
    knowledgeGaps: signals.filter((s) => s.knowledgeGapDetected).length,
    topTopics: [...topicCounts.entries()]
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
  };
}
