export type ClientLifecycleStatus =
  | 'PAID_PENDING_VERIFICATION'
  | 'READY_FOR_ONBOARDING'
  | 'ONBOARDING'
  | 'SETUP'
  | 'QA'
  | 'READY_TO_ACTIVATE'
  | 'ACTIVE'
  | 'AT_RISK'
  | 'PAUSED'
  | 'OFFBOARDED';

export type TransitionEvidence = {
  entitlementVerified: boolean;
  legalAccepted: boolean;
  ownerAssigned: boolean;
  onboardingRecordCreated: boolean;
  intakeComplete: boolean;
  nonLiveSetupComplete: boolean;
  qaPassed: boolean;
  openP1: number;
  rollbackEvidence: boolean;
  explicitActivationApproval: boolean;
  allReleaseGatesPassed: boolean;
  recoveryEvidence: boolean;
  authorizedOperationalDecision: boolean;
  authorizedOffboarding: boolean;
};

export function canTransition(
  from: ClientLifecycleStatus,
  to: ClientLifecycleStatus,
  evidence: TransitionEvidence,
): boolean {
  if (from === to) return true;

  if (from === 'PAID_PENDING_VERIFICATION' && to === 'READY_FOR_ONBOARDING') {
    return evidence.entitlementVerified && evidence.legalAccepted;
  }
  if (from === 'READY_FOR_ONBOARDING' && to === 'ONBOARDING') {
    return evidence.ownerAssigned && evidence.onboardingRecordCreated;
  }
  if (from === 'ONBOARDING' && to === 'SETUP') return evidence.intakeComplete;
  if (from === 'SETUP' && to === 'QA') return evidence.nonLiveSetupComplete;
  if (from === 'QA' && to === 'READY_TO_ACTIVATE') {
    return evidence.qaPassed && evidence.openP1 === 0 && evidence.rollbackEvidence;
  }
  if (from === 'READY_TO_ACTIVATE' && to === 'ACTIVE') {
    return evidence.explicitActivationApproval && evidence.allReleaseGatesPassed;
  }
  if (from === 'ACTIVE' && to === 'AT_RISK') return true;
  if ((from === 'ACTIVE' || from === 'AT_RISK') && to === 'PAUSED') {
    return evidence.authorizedOperationalDecision;
  }
  if (from === 'PAUSED' && to === 'ACTIVE') {
    return evidence.recoveryEvidence && evidence.explicitActivationApproval && evidence.allReleaseGatesPassed;
  }
  if (to === 'OFFBOARDED') return evidence.authorizedOffboarding;

  return false;
}
