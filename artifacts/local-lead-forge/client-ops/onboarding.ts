export type OnboardingReadiness = {
  entitlementVerified: boolean;
  legalAccepted: boolean;
  ownerAssigned: boolean;
  intakeComplete: boolean;
  activationAuthorized: boolean;
};

export function canStartOnboarding(input: OnboardingReadiness): boolean {
  return input.entitlementVerified && input.legalAccepted && input.ownerAssigned;
}

export function canEnterSetup(input: OnboardingReadiness): boolean {
  return canStartOnboarding(input) && input.intakeComplete;
}

export function canActivateClient(input: OnboardingReadiness): boolean {
  return canEnterSetup(input) && input.activationAuthorized;
}
