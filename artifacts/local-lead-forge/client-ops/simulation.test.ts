import { syntheticClientReady, productionActivationAllowed } from './simulation.ts';
const pass={entitlement:true,legal:true,onboarding:true,setup:true,qa:true,rollback:true,auditTrail:true,nextActionOwner:true,explicitApproval:true};
Deno.test('simulation requires every evidence gate',()=>{if(!syntheticClientReady(pass))throw new Error('valid simulation blocked'); for(const k of Object.keys(pass)){if(syntheticClientReady({...pass,[k]:false}))throw new Error(`missing ${k} accepted`);}});
Deno.test('phase cannot activate production',()=>{if(productionActivationAllowed())throw new Error('production activation enabled');});
