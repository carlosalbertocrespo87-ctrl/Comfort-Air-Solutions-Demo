import { canActivateClient, canBeginOnboarding, canEnterSetup } from './onboarding.ts';

Deno.test('onboarding requires entitlement and legal acceptance', () => {
  if (canBeginOnboarding({ entitlementVerified: true, legalAccepted: false, ownerAssigned: true, onboardingRecordCreated: true })) throw new Error('legal gate bypassed');
  if (!canBeginOnboarding({ entitlementVerified: true, legalAccepted: true, ownerAssigned: true, onboardingRecordCreated: true })) throw new Error('valid onboarding blocked');
});

Deno.test('setup requires completed intake and owner', () => {
  if (canEnterSetup({ intakeComplete: false, ownerAssigned: true })) throw new Error('incomplete intake allowed');
  if (!canEnterSetup({ intakeComplete: true, ownerAssigned: true })) throw new Error('valid setup blocked');
});

Deno.test('activation fails closed on every missing gate', () => {
  const valid = { qaPassed: true, openP1: 0, rollbackEvidence: true, explicitApproval: true, releaseGatesPassed: true };
  for (const key of ['qaPassed','rollbackEvidence','explicitApproval','releaseGatesPassed'] as const) {
    if (canActivateClient({ ...valid, [key]: false })) throw new Error(`activation allowed without ${key}`);
  }
  if (canActivateClient({ ...valid, openP1: 1 })) throw new Error('activation allowed with P1');
  if (!canActivateClient(valid)) throw new Error('valid activation blocked');
});
