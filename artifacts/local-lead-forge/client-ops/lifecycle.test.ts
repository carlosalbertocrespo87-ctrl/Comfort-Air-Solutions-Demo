import { canTransition, type TransitionEvidence } from './lifecycle.ts';

const base: TransitionEvidence = {
  entitlementVerified: false,
  legalAccepted: false,
  ownerAssigned: false,
  onboardingRecordCreated: false,
  intakeComplete: false,
  nonLiveSetupComplete: false,
  qaPassed: false,
  openP1: 0,
  rollbackEvidence: false,
  explicitActivationApproval: false,
  allReleaseGatesPassed: false,
  recoveryEvidence: false,
  authorizedOperationalDecision: false,
  authorizedOffboarding: false,
};

Deno.test('payment cannot jump directly to ACTIVE', () => {
  if (canTransition('PAID_PENDING_VERIFICATION', 'ACTIVE', { ...base, entitlementVerified: true, legalAccepted: true })) {
    throw new Error('unsafe direct activation allowed');
  }
});

Deno.test('READY_TO_ACTIVATE requires QA, no P1 and rollback evidence', () => {
  if (canTransition('QA', 'READY_TO_ACTIVATE', { ...base, qaPassed: true, openP1: 1, rollbackEvidence: true })) {
    throw new Error('P1 should block readiness');
  }
  if (!canTransition('QA', 'READY_TO_ACTIVATE', { ...base, qaPassed: true, openP1: 0, rollbackEvidence: true })) {
    throw new Error('valid QA transition blocked');
  }
});

Deno.test('ACTIVE requires explicit approval and all release gates', () => {
  if (canTransition('READY_TO_ACTIVATE', 'ACTIVE', { ...base, explicitActivationApproval: true })) {
    throw new Error('activation allowed without release gates');
  }
  if (!canTransition('READY_TO_ACTIVATE', 'ACTIVE', { ...base, explicitActivationApproval: true, allReleaseGatesPassed: true })) {
    throw new Error('valid activation blocked');
  }
});

Deno.test('PAUSED recovery requires evidence, approval and release gates', () => {
  if (canTransition('PAUSED', 'ACTIVE', { ...base, recoveryEvidence: true, explicitActivationApproval: true })) {
    throw new Error('paused client reactivated without release gates');
  }
  if (canTransition('PAUSED', 'ACTIVE', { ...base, recoveryEvidence: true, allReleaseGatesPassed: true })) {
    throw new Error('paused client reactivated without explicit approval');
  }
  if (!canTransition('PAUSED', 'ACTIVE', { ...base, recoveryEvidence: true, explicitActivationApproval: true, allReleaseGatesPassed: true })) {
    throw new Error('valid paused recovery blocked');
  }
});

Deno.test('AT_RISK cannot silently jump back to ACTIVE', () => {
  if (canTransition('AT_RISK', 'ACTIVE', { ...base, explicitActivationApproval: true, allReleaseGatesPassed: true })) {
    throw new Error('at-risk client bypassed pause/recovery workflow');
  }
});

Deno.test('offboarding always requires authorization', () => {
  if (canTransition('ACTIVE', 'OFFBOARDED', base)) throw new Error('unauthorized offboarding allowed');
  if (!canTransition('ACTIVE', 'OFFBOARDED', { ...base, authorizedOffboarding: true })) throw new Error('authorized offboarding blocked');
});

Deno.test('OFFBOARDED cannot be reactivated', () => {
  if (canTransition('OFFBOARDED', 'ACTIVE', { ...base, recoveryEvidence: true, explicitActivationApproval: true, allReleaseGatesPassed: true })) {
    throw new Error('offboarded client reactivated');
  }
});
