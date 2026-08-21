export function improvementImpactScore(input:{revenue:number;conversion:number;retention:number;quality:number;timeSaved:number;costEfficiency:number}):number{
 const clamp=(v:number)=>Math.max(0,Math.min(100,v));
 return Math.round((clamp(input.revenue)+clamp(input.conversion)+clamp(input.retention)+clamp(input.quality)+clamp(input.timeSaved)+clamp(input.costEfficiency))/6);
}
