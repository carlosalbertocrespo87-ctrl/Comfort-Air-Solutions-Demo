export type CorrelationCandidate = {
  acceptance_ref: string;
  stripe_customer_ref: string | null;
  setup_payment_ref: string | null;
  subscription_ref: string | null;
};

export function resolveSingleCorrelation(
  candidates: CorrelationCandidate[],
  refs: { customerRef?: string | null; paymentIntentRef?: string | null; subscriptionRef?: string | null },
): CorrelationCandidate | null {
  const matches = candidates.filter((candidate) => {
    const checks: boolean[] = [];
    if (refs.customerRef) checks.push(candidate.stripe_customer_ref === refs.customerRef);
    if (refs.paymentIntentRef) checks.push(candidate.setup_payment_ref === refs.paymentIntentRef);
    if (refs.subscriptionRef) checks.push(candidate.subscription_ref === refs.subscriptionRef);
    return checks.length > 0 && checks.some(Boolean);
  });

  if (matches.length !== 1) return null;
  const match = matches[0];

  if (refs.customerRef && match.stripe_customer_ref && match.stripe_customer_ref !== refs.customerRef) return null;
  if (refs.paymentIntentRef && match.setup_payment_ref && match.setup_payment_ref !== refs.paymentIntentRef) return null;
  if (refs.subscriptionRef && match.subscription_ref && match.subscription_ref !== refs.subscriptionRef) return null;
  return match;
}
