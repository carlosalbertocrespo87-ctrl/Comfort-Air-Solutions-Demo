export type LifecycleOpportunityType = 'FEEDBACK' | 'REVIEW' | 'MAINTENANCE' | 'SEASONAL_RECALL' | 'RENEWAL' | 'CROSS_SELL';
export type LifecycleOpportunity = { type: LifecycleOpportunityType; reason: string; communicationAuthorized: false };

export function deriveLifecycleOpportunities(input: {
  jobCompleted?: boolean;
  feedbackRecorded?: boolean;
  reviewRequested?: boolean;
  maintenanceEligible?: boolean;
  seasonalRecallDue?: boolean;
  renewalDue?: boolean;
  approvedCrossSellServices?: string[];
}): LifecycleOpportunity[] {
  const out: LifecycleOpportunity[] = [];
  const add = (type: LifecycleOpportunityType, reason: string) => out.push({ type, reason, communicationAuthorized: false });
  if (!input.jobCompleted) return out;
  if (!input.feedbackRecorded) add('FEEDBACK', 'Completed job has no recorded feedback.');
  if (input.feedbackRecorded && !input.reviewRequested) add('REVIEW', 'Feedback exists and review request may be considered under approved policy.');
  if (input.maintenanceEligible) add('MAINTENANCE', 'Customer is eligible for an approved maintenance workflow.');
  if (input.seasonalRecallDue) add('SEASONAL_RECALL', 'Seasonal service window is due.');
  if (input.renewalDue) add('RENEWAL', 'Approved maintenance/membership renewal is due.');
  if ((input.approvedCrossSellServices || []).length) add('CROSS_SELL', 'Approved complementary services are available for human review.');
  return out;
}
