export type Priority='P1'|'P2'|'P3';
export interface TicketClock { priority:Priority; ageMinutes:number; ownerAssigned:boolean; resolved:boolean; }
export function escalationLevel(t:TicketClock): 'NONE'|'ATTENTION'|'ESCALATE' { if(t.resolved) return 'NONE'; if(!t.ownerAssigned) return 'ESCALATE'; if(t.priority==='P1') return 'ESCALATE'; if(t.priority==='P2' && t.ageMinutes>=1440) return 'ESCALATE'; if(t.priority==='P2' || t.priority==='P3') return 'ATTENTION'; return 'NONE'; }
