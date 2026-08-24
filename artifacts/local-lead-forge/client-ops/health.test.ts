import { deriveHealth } from './health.ts';

const greenBase = { openP1: 0, staleP2: false, overdueCriticalTask: false, materialPaymentException: false, activationMismatch: false };

Deno.test('P1 is RED', () => {
  if (deriveHealth({ ...greenBase, openP1: 1 }) !== 'RED') throw new Error('P1 not RED');
});

Deno.test('material payment exception is RED', () => {
  if (deriveHealth({ ...greenBase, materialPaymentException: true }) !== 'RED') throw new Error('payment exception not RED');
});

Deno.test('activation mismatch is RED', () => {
  if (deriveHealth({ ...greenBase, activationMismatch: true }) !== 'RED') throw new Error('activation mismatch not RED');
});

Deno.test('stale P2 is YELLOW', () => {
  if (deriveHealth({ ...greenBase, staleP2: true }) !== 'YELLOW') throw new Error('P2 not YELLOW');
});

Deno.test('overdue critical task is YELLOW', () => {
  if (deriveHealth({ ...greenBase, overdueCriticalTask: true }) !== 'YELLOW') throw new Error('critical overdue task not YELLOW');
});

Deno.test('paused is GRAY even when other risks exist', () => {
  if (deriveHealth({ ...greenBase, paused: true, openP1: 2, materialPaymentException: true }) !== 'GRAY') throw new Error('pause not gray');
});

Deno.test('healthy client is GREEN', () => {
  if (deriveHealth(greenBase) !== 'GREEN') throw new Error('healthy client not GREEN');
});
