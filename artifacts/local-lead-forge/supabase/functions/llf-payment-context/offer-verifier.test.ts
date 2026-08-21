import { verifyApprovedOffer, type StripePriceSnapshot } from './offer-verifier.ts';

const setup: StripePriceSnapshot = {
  id: 'price_setup', active: true, currency: 'usd', unit_amount: 29900, type: 'one_time', recurring: null,
};
const monthly: StripePriceSnapshot = {
  id: 'price_monthly', active: true, currency: 'usd', unit_amount: 19900, type: 'recurring', recurring: { interval: 'month' },
};

Deno.test('approved LLF offer passes', () => {
  const result = verifyApprovedOffer(setup, monthly);
  if (!result.ok || result.errors.length) throw new Error(JSON.stringify(result));
});

Deno.test('setup amount manipulation fails', () => {
  const result = verifyApprovedOffer({ ...setup, unit_amount: 29800 }, monthly);
  if (result.ok || !result.errors.includes('setup_amount_mismatch')) throw new Error(JSON.stringify(result));
});

Deno.test('setup recurring type fails', () => {
  const result = verifyApprovedOffer({ ...setup, type: 'recurring', recurring: { interval: 'month' } }, monthly);
  if (result.ok || !result.errors.includes('setup_type_mismatch')) throw new Error(JSON.stringify(result));
});

Deno.test('monthly amount, currency and interval manipulation fails', () => {
  const result = verifyApprovedOffer(setup, { ...monthly, unit_amount: 20000, currency: 'eur', recurring: { interval: 'year' } });
  const required = ['monthly_amount_mismatch', 'monthly_currency_mismatch', 'monthly_interval_mismatch'];
  if (result.ok || required.some((error) => !result.errors.includes(error))) throw new Error(JSON.stringify(result));
});

Deno.test('inactive prices fail closed', () => {
  const result = verifyApprovedOffer({ ...setup, active: false }, { ...monthly, active: false });
  if (result.ok || !result.errors.includes('setup_price_inactive') || !result.errors.includes('monthly_price_inactive')) {
    throw new Error(JSON.stringify(result));
  }
});