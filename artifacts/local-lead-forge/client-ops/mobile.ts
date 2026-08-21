export interface MobileItem { id:string; health:'GREEN'|'YELLOW'|'RED'|'GRAY'; priority:'P1'|'P2'|'P3'; dueAt?:string|null; ownerId?:string|null; }
export function mobileRank(x: MobileItem): number {
  if (x.priority === 'P1' || x.health === 'RED') return 0;
  if (x.priority === 'P2' || x.health === 'YELLOW') return 1;
  return 2;
}
export function requiresExplicitConfirmation(action:string): boolean {
  return ['ACTIVATE_CLIENT','PAUSE_CLIENT','OFFBOARD_CLIENT','ENABLE_LIVE_MESSAGING'].includes(action);
}
