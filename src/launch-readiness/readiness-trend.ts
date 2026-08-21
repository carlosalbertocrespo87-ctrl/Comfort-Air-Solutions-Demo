export type ReadinessPoint={label:string;score:number;timestamp:string};
export function readinessTrend(points:ReadinessPoint[]){
 const ordered=[...points].sort((a,b)=>a.timestamp.localeCompare(b.timestamp));
 const first=ordered[0]?.score??0,last=ordered[ordered.length-1]?.score??0;
 return {points:ordered,delta:last-first,direction:last>first?'IMPROVING':last<first?'DECLINING':'FLAT'};
}
