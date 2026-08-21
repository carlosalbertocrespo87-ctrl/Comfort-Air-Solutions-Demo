export type RevenueEngineArea={name:string;ready:boolean;metric?:number;note?:string};
export function summarizeRevenueEngine(areas:RevenueEngineArea[]){
 const readyCount=areas.filter(a=>a.ready).length;
 return {readyCount,total:areas.length,percent:areas.length?Math.round((readyCount/areas.length)*100):0,blocking:areas.filter(a=>!a.ready).map(a=>a.name),revenueGuaranteed:false as const};
}
