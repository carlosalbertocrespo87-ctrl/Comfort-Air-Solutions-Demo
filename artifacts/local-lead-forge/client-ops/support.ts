export type Priority = 'P1' | 'P2' | 'P3';
export type Health = 'GREEN' | 'YELLOW' | 'RED' | 'GRAY';

export interface SupportSignal {
  serviceUnusable?: boolean;
  securityRisk?: boolean;
  materialCustomerImpact?: boolean;
  degradedWorkflow?: boolean;
  blockedWorkflow?: boolean;
}

export function classifyPriority(s: SupportSignal): Priority {
  if (s.serviceUnusable || s.securityRisk || s.materialCustomerImpact) return 'P1';
  if (s.degradedWorkflow || s.blockedWorkflow) return 'P2';
  return 'P3';
}

export interface AttentionInput {
  health: Health;
  openP1: number;
  staleP2: boolean;
  taskOverdue: boolean;
  missingEvidence: boolean;
  paymentException: boolean;
  activationGateMismatch: boolean;
  blockedDependency: boolean;
}

export function needsAttention(x: AttentionInput): boolean {
  return x.health === 'RED' || x.openP1 > 0 || x.staleP2 || x.taskOverdue || x.missingEvidence || x.paymentException || x.activationGateMismatch || x.blockedDependency;
}
