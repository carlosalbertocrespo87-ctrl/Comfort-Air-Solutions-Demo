export type LaunchRisk={id:string;area:string;severity:'LOW'|'MEDIUM'|'HIGH'|'CRITICAL';status:'OPEN'|'MITIGATED'|'ACCEPTED';evidence?:string};
const weight={LOW:1,MEDIUM:2,HIGH:3,CRITICAL:4} as const;
export function summarizeLaunchRisks(risks:LaunchRisk[]){
 const open=risks.filter(r=>r.status==='OPEN').sort((a,b)=>weight[b.severity]-weight[a.severity]);
 return {open,critical:open.filter(r=>r.severity==='CRITICAL').length,releaseBlocked:open.some(r=>r.severity==='CRITICAL')};
}
