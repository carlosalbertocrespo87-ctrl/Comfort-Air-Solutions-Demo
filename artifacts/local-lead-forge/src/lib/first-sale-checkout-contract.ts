import { LEGAL_VERSION } from '@/lib/legal-release';

export const ACCEPTANCE_EVIDENCE_ENDPOINT = '/api/legal-acceptance';
export const SETUP_PAYMENT_VERIFICATION_ENDPOINT = '/api/setup-payment-status';

export type AcceptanceEvidenceRequest = {
  legalVersion: string;
  customerName: string;
  customerEmail: string;
  companyName: string;
  accepted: true;
  clientTimestamp: string;
};

export type AcceptanceEvidenceResponse = {
  acceptanceReference: string;
  legalVersion: string;
  recordedAt: string;
};

export type SetupPaymentStatusResponse = {
  setupPaid: boolean;
  paymentReference?: string;
  verifiedAt?: string;
};

export type FirstSaleCheckoutState =
  | 'LEGAL_NOT_RELEASED'
  | 'IDENTITY_INCOMPLETE'
  | 'ACCEPTANCE_NOT_RECORDED'
  | 'SETUP_PAYMENT_PENDING'
  | 'MONTHLY_ENROLLMENT_PENDING'
  | 'READY_FOR_ONBOARDING';

export function buildAcceptanceEvidenceRequest(input: {
  customerName: string;
  customerEmail: string;
  companyName: string;
  accepted: boolean;
}): AcceptanceEvidenceRequest {
  if (!input.accepted) throw new Error('Affirmative legal acceptance is required.');

  const customerName = input.customerName.trim();
  const customerEmail = input.customerEmail.trim().toLowerCase();
  const companyName = input.companyName.trim();

  if (!customerName || !customerEmail || !companyName) {
    throw new Error('Customer identity fields are required before acceptance can be recorded.');
  }

  return {
    legalVersion: LEGAL_VERSION,
    customerName,
    customerEmail,
    companyName,
    accepted: true,
    clientTimestamp: new Date().toISOString(),
  };
}

export function isValidAcceptanceEvidenceResponse(
  value: unknown,
): value is AcceptanceEvidenceResponse {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<AcceptanceEvidenceResponse>;
  return Boolean(
    candidate.acceptanceReference &&
      candidate.legalVersion === LEGAL_VERSION &&
      candidate.recordedAt,
  );
}

export function determineFirstSaleCheckoutState(input: {
  legalReleased: boolean;
  identityComplete: boolean;
  acceptanceRecorded: boolean;
  setupPaid: boolean;
  monthlyEnrolled: boolean;
}): FirstSaleCheckoutState {
  if (!input.legalReleased) return 'LEGAL_NOT_RELEASED';
  if (!input.identityComplete) return 'IDENTITY_INCOMPLETE';
  if (!input.acceptanceRecorded) return 'ACCEPTANCE_NOT_RECORDED';
  if (!input.setupPaid) return 'SETUP_PAYMENT_PENDING';
  if (!input.monthlyEnrolled) return 'MONTHLY_ENROLLMENT_PENDING';
  return 'READY_FOR_ONBOARDING';
}
