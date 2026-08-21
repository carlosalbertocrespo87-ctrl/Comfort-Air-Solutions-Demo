import { calculateRoi, verifiedMetric } from './roi.ts';
Deno.test('unverified revenue remains UNKNOWN', () => {
  if (verifiedMetric(10000, false) !== 'UNKNOWN') throw new Error('invented revenue allowed');
});
Deno.test('ROI requires verified revenue and fees', () => {
  if (calculateRoi({ attributableRevenue:'UNKNOWN', llfFees:199 }) !== 'UNKNOWN') throw new Error('unknown ROI fabricated');
  const roi = calculateRoi({ attributableRevenue:1000, llfFees:200 });
  if (roi !== 4) throw new Error(`unexpected ROI ${roi}`);
});
