export type FrontierPoint={id:string;quality:number;costUsd:number;latencyMs:number};
export function qualityCostFrontier(points:FrontierPoint[]):FrontierPoint[]{
 return points.filter((p,i)=>!points.some((q,j)=>j!==i&&q.quality>=p.quality&&q.costUsd<=p.costUsd&&q.latencyMs<=p.latencyMs&&(q.quality>p.quality||q.costUsd<p.costUsd||q.latencyMs<p.latencyMs)));
}
