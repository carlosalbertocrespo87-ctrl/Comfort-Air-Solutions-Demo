import { mobileRank, requiresExplicitConfirmation } from './mobile.ts';
Deno.test('RED and P1 rank first on mobile',()=>{if(mobileRank({id:'x',health:'RED',priority:'P3'})!==0)throw new Error('RED not first');});
Deno.test('live actions require confirmation',()=>{for(const a of ['ACTIVATE_CLIENT','PAUSE_CLIENT','OFFBOARD_CLIENT','ENABLE_LIVE_MESSAGING'])if(!requiresExplicitConfirmation(a))throw new Error(`${a} unguarded`);});
