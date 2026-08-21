export type CadenceStep={dayOffset:number;channel:'EMAIL'|'PHONE'|'POSTAL';purpose:string;sendAuthorized:false};
export function buildCadencePlan(input:{channels:Array<'EMAIL'|'PHONE'|'POSTAL'>;maxTouches?:number}):CadenceStep[]{
 const max=Math.max(1,Math.min(input.maxTouches??3,4)); const channels=[...new Set(input.channels)];
 if(channels.length===0) return [];
 return Array.from({length:max},(_,i)=>({dayOffset:[0,4,10,21][i]??21,channel:channels[i%channels.length],purpose:i===0?'first-touch':'human-reviewed follow-up',sendAuthorized:false}));
}
