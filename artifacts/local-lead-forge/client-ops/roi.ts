export type Metric = number | 'UNKNOWN';
export interface RoiInput { attributableRevenue: Metric; llfFees: Metric; }
export function calculateRoi(x: RoiInput): Metric {
  if (x.attributableRevenue === 'UNKNOWN' || x.llfFees === 'UNKNOWN' || x.llfFees <= 0) return 'UNKNOWN';
  return (x.attributableRevenue - x.llfFees) / x.llfFees;
}
export function verifiedMetric(value?: number | null, verified = false): Metric {
  return verified && typeof value === 'number' && value >= 0 ? value : 'UNKNOWN';
}
