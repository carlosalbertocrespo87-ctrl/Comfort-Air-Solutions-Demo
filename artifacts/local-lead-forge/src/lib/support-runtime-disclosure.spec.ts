import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
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
  assert.match(SUPPORT_RUNTIME_DISCLOSURE.handoffActionLabel, /preview|simulation/i);

  const customerFacingCopy = [
    SUPPORT_RUNTIME_DISCLOSURE.statusLabel,
    SUPPORT_RUNTIME_DISCLOSURE.handoffActionLabel,
    SUPPORT_RUNTIME_DISCLOSURE.handoffTitle,
    SUPPORT_RUNTIME_DISCLOSURE.handoffMessage,
    SUPPORT_RUNTIME_DISCLOSURE.launcherLabel,
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

  const supportChatSource = readFileSync(
    new URL('../components/support-chat.tsx', import.meta.url),
    'utf8',
  );
  assert.match(supportChatSource, /SUPPORT_RUNTIME_DISCLOSURE\.statusLabel/);
  assert.match(supportChatSource, /SUPPORT_RUNTIME_DISCLOSURE\.handoffActionLabel/);
  assert.match(supportChatSource, /SUPPORT_RUNTIME_DISCLOSURE\.handoffMessage/);
  assert.doesNotMatch(supportChatSource, /\bAI online\b/i);
  assert.doesNotMatch(supportChatSource, /\bWaiting for LLF specialist\b/i);
  assert.doesNotMatch(supportChatSource, /\bHuman handoff requested\b/i);
}
