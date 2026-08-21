import { deriveHealth } from './health.ts';
Deno.test('P1 is RED', () => { if (deriveHealth({openP1:1,staleP2:false,overdueCriticalTask:false,materialPaymentException:false,activationMismatch:false}) !== 'RED') throw new Error('P1 not RED'); });
Deno.test('stale P2 is YELLOW', () => { if (deriveHealth({openP1:0,staleP2:true,overdueCriticalTask:false,materialPaymentException:false,activationMismatch:false}) !== 'YELLOW') throw new Error('P2 not YELLOW'); });
Deno.test('paused is GRAY', () => { if (deriveHealth({paused:true,openP1:0,staleP2:false,overdueCriticalTask:false,materialPaymentException:false,activationMismatch:false}) !== 'GRAY') throw new Error('pause not gray'); });
