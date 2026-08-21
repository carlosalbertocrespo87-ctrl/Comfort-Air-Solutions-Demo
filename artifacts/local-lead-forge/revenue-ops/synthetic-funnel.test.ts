import{syntheticFunnelPass,realOutreachAllowed,realChargeAllowed}from'./synthetic-funnel.ts';
const pass={qualified:true,demoReady:true,contactAuthorized:true,replyHandled:true,discoveryReady:true,proposalReady:true,verbalYesReady:true,paymentVerified:true,legalVerified:true,postPaymentPass:true,handoffReady:true};
Deno.test('synthetic funnel requires every gate',()=>{if(!syntheticFunnelPass(pass))throw new Error('valid funnel blocked');for(const k of Object.keys(pass)){if(syntheticFunnelPass({...pass,[k]:false}))throw new Error(`missing ${k} accepted`);}});
Deno.test('phase cannot perform real outreach or charges',()=>{if(realOutreachAllowed())throw new Error('real outreach enabled');if(realChargeAllowed())throw new Error('real charge enabled');});
