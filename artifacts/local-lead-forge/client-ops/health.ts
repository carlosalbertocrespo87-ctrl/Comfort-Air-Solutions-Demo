export type Health = 'GREEN' | 'YELLOW' | 'RED' | 'GRAY';
export interface HealthInput { paused?: boolean; openP1: number; staleP2: boolean; overdueCriticalTask: boolean; materialPaymentException: boolean; activationMismatch: boolean; }
export function deriveHealth(x: HealthInput): Health {
  if (x.paused) return 'GRAY';
  if (x.openP1 > 0 || x.materialPaymentException || x.activationMismatch) return 'RED';
  if (x.staleP2 || x.overdueCriticalTask) return 'YELLOW';
  return 'GREEN';
}
