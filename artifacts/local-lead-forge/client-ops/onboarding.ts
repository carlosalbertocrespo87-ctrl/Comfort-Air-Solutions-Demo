export type OnboardingStartReadiness = {
  entitlementVerified: boolean;
  legalAccepted: boolean;
  ownerAssigned: boolean;
  onboardingRecordCreated: boolean;
};

export type SetupReadiness = {
  intakeComplete: boolean;
  ownerAssigned: boolean;
};

export type ActivationReadiness = {
  qaPassed: boolean;
  openP1: number;
  rollbackEvidence: boolean;
  explicitApproval: boolean;
  releaseGatesPassed: boolean;
};

export function canBeginOnboarding(input: OnboardingStartReadiness): boolean {
  return input.entitlementVerified && input.legalAccepted && input.ownerAssigned && input.onboardingRecordCreated;
}

export const canStartOnboarding = canBeginOnboarding;

export function canEnterSetup(input: SetupReadiness): boolean {
  return input.ownerAssigned && input.intakeComplete;
}

export function canActivateClient(input: ActivationReadiness): boolean {
  return input.qaPassed && input.openP1 === 0 && input.rollbackEvidence && input.explicitApproval && input.releaseGatesPassed;
}
