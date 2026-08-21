import { hasValidNextAction } from './next-action.ts';

Deno.test('non-terminal record needs owner action and due/hold', () => {
  if (hasValidNextAction({ terminal:false, ownerId:'ops', nextAction:'Collect intake' })) throw new Error('missing due/hold accepted');
  if (!hasValidNextAction({ terminal:false, ownerId:'ops', nextAction:'Collect intake', dueAt:'2026-08-22T12:00:00Z' })) throw new Error('valid due action rejected');
  if (!hasValidNextAction({ terminal:false, ownerId:'ops', nextAction:'Wait for address approval', holdDependency:'iPostal approval' })) throw new Error('valid hold rejected');
});
Deno.test('due and hold cannot both be authoritative', () => {
  if (hasValidNextAction({ terminal:false, ownerId:'ops', nextAction:'Ambiguous', dueAt:'x', holdDependency:'y' })) throw new Error('ambiguous next action accepted');
});
