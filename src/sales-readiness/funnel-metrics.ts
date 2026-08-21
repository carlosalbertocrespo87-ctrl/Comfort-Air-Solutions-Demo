export type FunnelMetrics={prospects:number;prepared:number;contacted:number;replied:number;meetings:number;won:number;replyRate:number;meetingRate:number;winRate:number};
export function buildFunnelMetrics(input:{prospects:number;prepared:number;contacted:number;replied:number;meetings:number;won:number}):FunnelMetrics{
 const rate=(n:number,d:number)=>d>0?Math.round((n/d)*1000)/10:0;
 return {...input,replyRate:rate(input.replied,input.contacted),meetingRate:rate(input.meetings,input.contacted),winRate:rate(input.won,input.contacted)};
}
