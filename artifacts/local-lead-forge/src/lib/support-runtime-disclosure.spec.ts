import { strict as assert } from 'node:assert';
import {
  SUPPORT_RUNTIME_DISCLOSURE,
  getSupportIntro,
  getUnknownAnswerDisclosure,
} from './support-runtime-disclosure';

export function runSupportRuntimeDisclosureContractTests() {
  assert.equal(SUPPORT_RUNTIME_DISCLOSURE.mode, 'SIMULATION');
  assert.equal(SUPPORT_RUNTIME_DISCLOSURE.liveAiProvider, false);
  assert.equal(SUPPORT_RUNTIME_DISCLOSURE.liveCustomerMessaging, false);
  assert.equal(SUPPORT_RUNTIME_DISCLOSURE.liveHumanHandoff, false);

  const customerFacingCopy = [
    SUPPORT_RUNTIME_DISCLOSURE.statusLabel,
    SUPPORT_RUNTIME_DISCLOSURE.handoffTitle,
    SUPPORT_RUNTIME_DISCLOSURE.handoffMessage,
    SUPPORT_RUNTIME_DISCLOSURE.footerLabel,
    getSupportIntro('prospect'),
    getSupportIntro('client'),
    getUnknownAnswerDisclosure(),
  ].join(' ');

  assert.match(customerFacingCopy, /demo|simulation/i);
  assert.match(customerFacingCopy, /no live messaging|not live|has not been notified|only prepare/i);
  assert.doesNotMatch(customerFacingCopy, /\bAI online\b/i);
  assert.doesNotMatch(customerFacingCopy, /\bwaiting for LLF specialist\b/i);
  assert.doesNotMatch(customerFacingCopy, /\bhandoff requested\b/i);
  assert.doesNotMatch(customerFacingCopy, /\bwill be preserved for an authorized LLF specialist\b/i);
}
