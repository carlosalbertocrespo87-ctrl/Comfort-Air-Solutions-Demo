export type HumanTimeObservation={tenantId:string;workflow:string;manualBaselineMinutes:number;actualHumanMinutes:number};
export type HumanMinutesSavedSummary={tenantId:string;observations:number;baselineMinutes:number;actualMinutes:number;minutesSaved:number};

export function summarizeHumanMinutesSaved(tenantId:string,rows:HumanTimeObservation[]):HumanMinutesSavedSummary{
 const scoped=rows.filter(r=>r.tenantId===tenantId && r.manualBaselineMinutes>=0 && r.actualHumanMinutes>=0);
 const baselineMinutes=scoped.reduce((n,r)=>n+r.manualBaselineMinutes,0);
 const actualMinutes=scoped.reduce((n,r)=>n+r.actualHumanMinutes,0);
 return {tenantId,observations:scoped.length,baselineMinutes,actualMinutes,minutesSaved:Math.max(0,baselineMinutes-actualMinutes)};
}
