export type KnownMetric = number | 'UNKNOWN';
export interface OperationalReport { leadsCaptured: KnownMetric; qualifiedLeads: KnownMetric; appointments: KnownMetric; wonJobs: KnownMetric; attributableRevenue: KnownMetric; llfFees: KnownMetric; openP1: number; staleP2: number; health: 'GREEN'|'YELLOW'|'RED'|'GRAY'; }
export function executiveException(r: OperationalReport): boolean { return r.health === 'RED' || r.openP1 > 0 || r.staleP2 > 0; }
export function safeCount(value?: number|null, verified=true): KnownMetric { return verified && typeof value === 'number' && value >= 0 ? value : 'UNKNOWN'; }
