export type LeadHeat = 'COLD' | 'WARM' | 'HOT' | 'READY_TO_BUY';
export type ClientHealth = 'HEALTHY' | 'WATCH' | 'AT_RISK' | 'INSUFFICIENT_DATA';
export type NextBestAction =
  | 'ANSWER_NOW'
  | 'HUMAN_HANDOFF'
  | 'SEND_DEMO'
  | 'COLLECT_MORE_CONTEXT'
  | 'FOLLOW_UP_REVIEW'
  | 'KNOWLEDGE_REVIEW'
  | 'NO_ACTION';

export type ProspectSignals = {
  explicitHumanRequest: boolean;
  pricingQuestionCount: number;
  implementationQuestionCount: number;
  demoInterest: boolean;
  readyToBuyLanguage: boolean;
  explicitSatisfaction: 'SATISFIED' | 'NOT_SATISFIED' | 'UNKNOWN';
  unresolved: boolean;
};

export function classifyLeadHeat(signals: ProspectSignals): LeadHeat {
  if (signals.readyToBuyLanguage && (signals.demoInterest || signals.pricingQuestionCount > 0)) return 'READY_TO_BUY';
  if (signals.explicitHumanRequest || signals.demoInterest || signals.pricingQuestionCount >= 2) return 'HOT';
  if (signals.pricingQuestionCount > 0 || signals.implementationQuestionCount > 0) return 'WARM';
  return 'COLD';
}

export function chooseNextBestAction(input: {
  audience: 'PROSPECT' | 'CLIENT';
  humanRequested: boolean;
  unresolved: boolean;
  knowledgeGap: boolean;
  leadHeat?: LeadHeat;
  clientIncidentCritical?: boolean;
}): NextBestAction {
  if (input.humanRequested || input.clientIncidentCritical) return 'HUMAN_HANDOFF';
  if (input.knowledgeGap || input.unresolved) return 'KNOWLEDGE_REVIEW';
  if (input.audience === 'PROSPECT' && (input.leadHeat === 'HOT' || input.leadHeat === 'READY_TO_BUY')) return 'SEND_DEMO';
  return 'NO_ACTION';
}

export type ClientHealthSignals = {
  minimumEvidenceMet: boolean;
  explicitDissatisfactionCount: number;
  unresolvedConversationCount: number;
  criticalIncidentCount: number;
  recentPositiveFeedbackCount: number;
  engagementDropDetected: boolean;
};

/**
 * Foundation only. Thresholds must be recalibrated from real client behavior before any
 * retention/churn claim is shown. Until minimum evidence is met, return INSUFFICIENT_DATA.
 */
export function classifyClientHealth(signals: ClientHealthSignals): ClientHealth {
  if (!signals.minimumEvidenceMet) return 'INSUFFICIENT_DATA';
  if (signals.criticalIncidentCount > 0 || signals.explicitDissatisfactionCount >= 2) return 'AT_RISK';
  if (signals.unresolvedConversationCount >= 2 || signals.engagementDropDetected) return 'WATCH';
  return 'HEALTHY';
}

export type CompanyMemoryFact = {
  key: string;
  value: string;
  sourceConversationId?: string;
  sourceKnowledgeKey?: string;
  approvedForReuse: boolean;
  sensitivity: 'NORMAL' | 'RESTRICTED';
  updatedAt: string;
};

export function canReuseCompanyMemory(fact: CompanyMemoryFact): boolean {
  return fact.approvedForReuse && fact.sensitivity === 'NORMAL';
}

export type ImprovementSignal = {
  target: 'WEBSITE' | 'FAQ' | 'KNOWLEDGE_CENTER' | 'SALES_SCRIPT' | 'ONBOARDING' | 'SUPPORT_PLAYBOOK' | 'DEMO';
  evidenceCount: number;
  qaImpactCount: number;
  highIntentImpactCount: number;
};

export function improvementPriority(signal: ImprovementSignal): 'LOW' | 'MEDIUM' | 'HIGH' {
  if (signal.qaImpactCount >= 3 || signal.highIntentImpactCount >= 3) return 'HIGH';
  if (signal.evidenceCount >= 3) return 'MEDIUM';
  return 'LOW';
}
