import{canEnterStage}from'./stages.ts';
Deno.test('contact cannot occur without authorization',()=>{if(canEnterStage('CONTACTED',{}))throw new Error('unauthorized contact allowed');});
Deno.test('paid requires authoritative verification',()=>{if(canEnterStage('PAID_VERIFIED',{}))throw new Error('unverified payment accepted');});
Deno.test('handoff and delivery require complete gates',()=>{const pass={paymentVerified:true,legalVerified:true,deliveryReady:true,postPaymentPass:true};if(!canEnterStage('HANDOFF_READY',pass)||!canEnterStage('DELIVERY',pass))throw new Error('valid handoff blocked');for(const k of Object.keys(pass)){if(canEnterStage('DELIVERY',{...pass,[k]:false}))throw new Error(`delivery allowed without ${k}`);}});
