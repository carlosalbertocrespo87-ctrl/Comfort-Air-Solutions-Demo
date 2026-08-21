import{validSalesAudit}from'./sales-audit.ts';
const base={actorId:'sales-ops',at:'2099-01-01T00:00:00Z',prospectId:'synthetic-001',action:'STAGE_CHANGE',stageBefore:'PROPOSAL',stageAfter:'VERBAL_YES',evidenceRef:'synthetic://evidence/1',reason:'Synthetic readiness test'};
Deno.test('commercial audit requires evidence and reason',()=>{if(!validSalesAudit(base))throw new Error('valid audit blocked');if(validSalesAudit({...base,evidenceRef:''}))throw new Error('missing evidence accepted');if(validSalesAudit({...base,reason:''}))throw new Error('missing reason accepted');});
