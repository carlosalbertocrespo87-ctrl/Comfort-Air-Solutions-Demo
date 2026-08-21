import { executiveException, safeCount } from './reporting.ts';
Deno.test('RED and support exceptions surface',()=>{ if(!executiveException({leadsCaptured:0,qualifiedLeads:0,appointments:0,wonJobs:0,attributableRevenue:'UNKNOWN',llfFees:'UNKNOWN',openP1:0,staleP2:0,health:'RED'})) throw new Error('RED hidden'); });
Deno.test('unverified counts stay UNKNOWN',()=>{ if(safeCount(5,false)!=='UNKNOWN') throw new Error('unverified metric exposed'); });
