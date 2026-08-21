export type StripePriceSnapshot = {
  id: string;
  active: boolean;
  currency: string;
  unit_amount: number | null;
  type: 'one_time' | 'recurring';
  recurring?: { interval?: string | null } | null;
};

export type OfferVerification = {
  ok: boolean;
  errors: string[];
};

const SETUP_CENTS = 29900;
const MONTHLY_CENTS = 19900;

export function verifyApprovedOffer(
  setup: StripePriceSnapshot,
  monthly: StripePriceSnapshot,
): OfferVerification {
  const errors: string[] = [];

  if (!setup.active) errors.push('setup_price_inactive');
  if (setup.currency.toLowerCase() !== 'usd') errors.push('setup_currency_mismatch');
  if (setup.unit_amount !== SETUP_CENTS) errors.push('setup_amount_mismatch');
  if (setup.type !== 'one_time') errors.push('setup_type_mismatch');

  if (!monthly.active) errors.push('monthly_price_inactive');
  if (monthly.currency.toLowerCase() !== 'usd') errors.push('monthly_currency_mismatch');
  if (monthly.unit_amount !== MONTHLY_CENTS) errors.push('monthly_amount_mismatch');
  if (monthly.type !== 'recurring') errors.push('monthly_type_mismatch');
  if (monthly.recurring?.interval !== 'month') errors.push('monthly_interval_mismatch');

  return { ok: errors.length === 0, errors };
}

export const APPROVED_OFFER = Object.freeze({
  currency: 'usd',
  setup_usd_cents: SETUP_CENTS,
  setup_type: 'one_time',
  monthly_usd_cents: MONTHLY_CENTS,
  monthly_type: 'recurring',
  monthly_interval: 'month',
});