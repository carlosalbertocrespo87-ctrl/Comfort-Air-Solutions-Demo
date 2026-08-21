export type StaleLeadFinding={stale:boolean;severity:'NONE'|'WATCH'|'URGENT';reason:string};
export function detectStaleLead(input:{stage:'NEW'|'CONTACT_PENDING'|'CONTACTED'|'QUALIFIED'|'APPOINTMENT'|'WON'|'LOST';ageMinutes:number}):StaleLeadFinding{
 if(input.stage==='WON'||input.stage==='LOST') return {stale:false,severity:'NONE',reason:'Lead is closed.'};
 if(input.stage==='NEW'&&input.ageMinutes>=30) return {stale:true,severity:'URGENT',reason:'New lead has waited at least 30 minutes.'};
 if((input.stage==='CONTACT_PENDING'||input.stage==='QUALIFIED')&&input.ageMinutes>=240) return {stale:true,severity:'WATCH',reason:'Lead has remained unresolved for at least 4 hours.'};
 return {stale:false,severity:'NONE',reason:'No stale-lead threshold reached.'};
}
