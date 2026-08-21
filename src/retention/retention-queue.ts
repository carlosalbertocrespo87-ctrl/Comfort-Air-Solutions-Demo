export type RetentionQueueItem={customerId:string;priority:'HIGH'|'MEDIUM'|'LOW';reason:string;externalActionAuthorized:false};
export function buildRetentionQueue(items:RetentionQueueItem[]):RetentionQueueItem[]{
 const order={HIGH:0,MEDIUM:1,LOW:2} as const;
 return [...items].sort((a,b)=>order[a.priority]-order[b.priority]).map(item=>({...item,externalActionAuthorized:false}));
}
