import type { LeakageSignal } from "./pipeline-leakage";

export type OwnerReportInput = {
  tenantId: string;
  periodStart: string;
  periodEnd: string;
  leads: number;
  appointments: number;
  won: number;
  lost: number;
  attributedRevenueUsd: number;
  recoveredRevenueUsd: number;
  averageResponseSeconds: number | null;
  leakageSignals: LeakageSignal[];
};

export type WeeklyOwnerWinReport = OwnerReportInput & {
  appointmentRate: number;
  winRate: number;
  leakageCount: number;
  headline: string;
};

export function buildWeeklyOwnerWinReport(input: OwnerReportInput): WeeklyOwnerWinReport {
  if (input.leads < 0 || input.appointments < 0 || input.won < 0 || input.lost < 0) throw new Error("NEGATIVE_COUNT");
  if (input.attributedRevenueUsd < 0 || input.recoveredRevenueUsd < 0) throw new Error("NEGATIVE_REVENUE");

  const appointmentRate = input.leads === 0 ? 0 : input.appointments / input.leads;
  const decided = input.won + input.lost;
  const winRate = decided === 0 ? 0 : input.won / decided;
  const leakageCount = input.leakageSignals.length;

  return {
    ...input,
    appointmentRate,
    winRate,
    leakageCount,
    headline: `LLF tracked $${input.attributedRevenueUsd.toFixed(2)} attributed and $${input.recoveredRevenueUsd.toFixed(2)} recovered revenue this period.`,
  };
}
