import {
  canUseKnowledgeSource,
  type KnowledgeSource,
  type KnowledgeSourceRuntimeState,
} from './knowledge-source-registry';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const approvedState: KnowledgeSourceRuntimeState = {
  lifecycle: 'APPROVED',
  reviewedAt: '2026-08-22T12:00:00Z',
  expiresAt: '2026-09-22T12:00:00Z',
};

const publicSource: KnowledgeSource = {
  key: 'public-test',
  title: 'Public approved test',
  driveFileId: 'synthetic-public',
  audiences: ['PROSPECT', 'CLIENT', 'AGENT'],
  sensitivity: 'PUBLIC_APPROVED',
  priority: 1,
  purpose: 'Synthetic contract test only.',
  allowAiAnswering: true,
};

const clientSource: KnowledgeSource = {
  ...publicSource,
  key: 'client-test',
  driveFileId: 'synthetic-client',
  audiences: ['CLIENT', 'AGENT'],
  sensitivity: 'CLIENT_AUTHENTICATED',
};

const internalSource: KnowledgeSource = {
  ...publicSource,
  key: 'internal-test',
  driveFileId: 'synthetic-internal',
  sensitivity: 'INTERNAL_AGENT_ONLY',
};

export function runKnowledgeSourceRegistryContractTests() {
  const now = new Date('2026-08-22T13:00:00Z');

  assert(
    canUseKnowledgeSource(publicSource, approvedState, { audience: 'PROSPECT', authenticatedClient: false, now }).allowed,
    'approved public knowledge should be eligible for prospects',
  );

  const unauthenticatedClient = canUseKnowledgeSource(clientSource, approvedState, {
    audience: 'CLIENT',
    authenticatedClient: false,
    now,
  });
  assert(
    !unauthenticatedClient.allowed && unauthenticatedClient.reason === 'CLIENT_AUTH_REQUIRED',
    'client-only knowledge must require authenticated client context',
  );

  const prospectClientLeak = canUseKnowledgeSource(clientSource, approvedState, {
    audience: 'PROSPECT',
    authenticatedClient: false,
    now,
  });
  assert(!prospectClientLeak.allowed, 'prospects must not receive client-authenticated knowledge');

  const prospectInternalLeak = canUseKnowledgeSource(internalSource, approvedState, {
    audience: 'PROSPECT',
    authenticatedClient: false,
    now,
  });
  assert(
    !prospectInternalLeak.allowed && prospectInternalLeak.reason === 'SENSITIVITY_MISMATCH',
    'prospects must not receive agent-internal knowledge even if a registry audience is misconfigured',
  );

  const clientInternalLeak = canUseKnowledgeSource(internalSource, approvedState, {
    audience: 'CLIENT',
    authenticatedClient: true,
    now,
  });
  assert(!clientInternalLeak.allowed, 'clients must not receive agent-internal knowledge');

  const missingState = canUseKnowledgeSource(publicSource, undefined, {
    audience: 'PROSPECT',
    authenticatedClient: false,
    now,
  });
  assert(
    !missingState.allowed && missingState.reason === 'SOURCE_STATE_REQUIRED',
    'missing lifecycle metadata must fail closed',
  );

  for (const lifecycle of ['DRAFT', 'SUPERSEDED', 'BLOCKED'] as const) {
    const decision = canUseKnowledgeSource(publicSource, { ...approvedState, lifecycle }, {
      audience: 'PROSPECT',
      authenticatedClient: false,
      now,
    });
    assert(!decision.allowed, `${lifecycle} knowledge must not answer automatically`);
  }

  const expired = canUseKnowledgeSource(
    publicSource,
    { ...approvedState, expiresAt: '2026-08-22T12:30:00Z' },
    { audience: 'PROSPECT', authenticatedClient: false, now },
  );
  assert(!expired.allowed && expired.reason === 'SOURCE_EXPIRED', 'expired knowledge must fail closed');

  const invalidDate = canUseKnowledgeSource(
    publicSource,
    { ...approvedState, reviewedAt: 'not-a-date' },
    { audience: 'PROSPECT', authenticatedClient: false, now },
  );
  assert(!invalidDate.allowed && invalidDate.reason === 'INVALID_SOURCE_DATE', 'invalid freshness metadata must fail closed');

  const disabled = canUseKnowledgeSource(
    { ...publicSource, allowAiAnswering: false },
    approvedState,
    { audience: 'PROSPECT', authenticatedClient: false, now },
  );
  assert(!disabled.allowed && disabled.reason === 'AI_ANSWERING_DISABLED', 'AI-disabled sources must remain unavailable');
}
