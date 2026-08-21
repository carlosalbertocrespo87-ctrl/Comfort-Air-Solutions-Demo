export type ReadinessDimension={name:string;score:number;weight:number;criticalBlock?:boolean};
export function firstCustomerReadinessScore(dimensions:ReadinessDimension[]){
 const totalWeight=dimensions.reduce((s,d)=>s+Math.max(0,d.weight),0)||1;
 const score=Math.round(dimensions.reduce((s,d)=>s+Math.max(0,Math.min(100,d.score))*Math.max(0,d.weight),0)/totalWeight);
 const criticalBlocks=dimensions.filter(d=>d.criticalBlock).map(d=>d.name);
 return {score,grade:score>=90?'GREEN':score>=75?'YELLOW':'RED',criticalBlocks,goLiveAuthorized:false as const};
}
