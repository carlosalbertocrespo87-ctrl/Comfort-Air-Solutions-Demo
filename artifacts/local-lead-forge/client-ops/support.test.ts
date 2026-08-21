import { classifyPriority, needsAttention } from './support.ts';

Deno.test('material impact becomes P1', () => {
  if (classifyPriority({ materialCustomerImpact: true }) !== 'P1') throw new Error('P1 missed');
});
Deno.test('degraded workflow becomes P2', () => {
  if (classifyPriority({ degradedWorkflow: true }) !== 'P2') throw new Error('P2 missed');
});
Deno.test('normal request remains P3', () => {
  if (classifyPriority({}) !== 'P3') throw new Error('P3 missed');
});
Deno.test('RED cannot be hidden', () => {
  if (!needsAttention({ health:'RED', openP1:0, staleP2:false, taskOverdue:false, missingEvidence:false, paymentException:false, activationGateMismatch:false, blockedDependency:false })) throw new Error('RED hidden');
});
Deno.test('stale P2 surfaces attention', () => {
  if (!needsAttention({ health:'GREEN', openP1:0, staleP2:true, taskOverdue:false, missingEvidence:false, paymentException:false, activationGateMismatch:false, blockedDependency:false })) throw new Error('stale P2 hidden');
});
