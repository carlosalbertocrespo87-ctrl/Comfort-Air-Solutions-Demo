export type AuthoritativeEntitlementState = {
  acceptanceRef: string;
  eventId: string;
  eventCreatedAt: string | null;
  stripeCustomerRef: string | null;
  setupPaymentRef: string | null;
  subscriptionRef: string | null;
  setupStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  monthlyStatus: 'PENDING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'FAILED';
};

export async function applyAuthoritativeEntitlementState(admin: any, state: AuthoritativeEntitlementState) {
  if (!/^[0-9a-fA-F-]{36}$/.test(state.acceptanceRef)) throw new Error('invalid_acceptance_ref');
  if (!state.eventId.startsWith('evt_')) throw new Error('invalid_event_id');

  const { data, error } = await admin.rpc('llf_apply_payment_entitlement_state', {
    p_acceptance_ref: state.acceptanceRef,
    p_stripe_event_id: state.eventId,
    p_event_created_at: state.eventCreatedAt,
    p_stripe_customer_ref: state.stripeCustomerRef,
    p_setup_payment_ref: state.setupPaymentRef,
    p_subscription_ref: state.subscriptionRef,
    p_setup_status: state.setupStatus,
    p_monthly_status: state.monthlyStatus,
  });
  if (error) throw new Error('entitlement_atomic_apply_failed');
  const row = Array.isArray(data) ? data[0] : data;
  return {
    applied: row?.applied === true,
    onboardingEligible: row?.onboarding_eligible === true,
  };
}
