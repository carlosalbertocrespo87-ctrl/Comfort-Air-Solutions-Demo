import{automationAllowed,shouldEscalate}from'./automation.ts';
Deno.test('internal automation allowed',()=>{for(const a of ['CREATE_INTERNAL_TASK','ESCALATE_INTERNAL','REQUEST_EVIDENCE'] as const)if(!automationAllowed(a))throw new Error(`${a} blocked`);});
Deno.test('live automation denied',()=>{for(const a of ['SEND_CUSTOMER_MESSAGE','CHARGE_CUSTOMER','ACTIVATE_PRODUCTION'] as const)if(automationAllowed(a))throw new Error(`${a} allowed`);});
Deno.test('material exceptions escalate',()=>{if(!shouldEscalate({health:'RED',openP1:0,staleP2:false,overdue:false}))throw new Error('RED missed');if(!shouldEscalate({health:'GREEN',openP1:0,staleP2:true,overdue:false}))throw new Error('P2 missed');});
