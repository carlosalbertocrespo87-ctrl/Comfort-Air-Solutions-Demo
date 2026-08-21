import{rollbackReady}from'./rollback.ts';
Deno.test('rollback requires owner restore point and verification',()=>{const p={documented:true,ownerId:'ops',restorePoint:'synthetic://snapshot/1',verificationStep:'rerun synthetic QA'};if(!rollbackReady(p))throw new Error('valid rollback blocked');if(rollbackReady({...p,restorePoint:''}))throw new Error('missing restore point allowed');});
