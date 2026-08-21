export type OwnerAction={action:string;priority:1|2|3;reason:string;requiresOwner:boolean};
export function buildOwnerActionPlan(items:OwnerAction[]){
 return items.filter(i=>i.requiresOwner).sort((a,b)=>a.priority-b.priority).map((item,index)=>({...item,order:index+1}));
}
