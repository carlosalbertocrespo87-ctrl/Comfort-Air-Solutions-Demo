import { escalationLevel } from './sla.ts';
Deno.test('P1 escalates immediately',()=>{if(escalationLevel({priority:'P1',ageMinutes:1,ownerAssigned:true,resolved:false})!=='ESCALATE') throw new Error('P1 not escalated');});
Deno.test('unowned ticket escalates',()=>{if(escalationLevel({priority:'P3',ageMinutes:1,ownerAssigned:false,resolved:false})!=='ESCALATE') throw new Error('unowned hidden');});
Deno.test('stale P2 escalates',()=>{if(escalationLevel({priority:'P2',ageMinutes:1440,ownerAssigned:true,resolved:false})!=='ESCALATE') throw new Error('stale P2 hidden');});
