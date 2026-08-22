import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import {
  SUPPORT_RUNTIME_DISCLOSURE,
  SUPPORT_RUNTIME_DISCLOSURE_ES,
  getSupportIntro,
  getSupportRuntimeDisclosure,
  getUnknownAnswerDisclosure,
} from './support-runtime-disclosure';

export function runSupportRuntimeDisclosureContractTests() {
  for (const disclosure of [SUPPORT_RUNTIME_DISCLOSURE, SUPPORT_RUNTIME_DISCLOSURE_ES]) {
    assert.equal(disclosure.mode, 'SIMULATION');
    assert.equal(disclosure.liveAiProvider, false);
    assert.equal(disclosure.liveCustomerMessaging, false);
    assert.equal(disclosure.liveHumanHandoff, false);
  }

  assert.equal(getSupportRuntimeDisclosure('en'), SUPPORT_RUNTIME_DISCLOSURE);
  assert.equal(getSupportRuntimeDisclosure('es'), SUPPORT_RUNTIME_DISCLOSURE_ES);
  assert.match(SUPPORT_RUNTIME_DISCLOSURE.handoffActionLabel, /preview|simulation/i);
  assert.match(SUPPORT_RUNTIME_DISCLOSURE_ES.handoffActionLabel, /vista previa|simulaci[oó]n/i);

  const englishCopy = [
    SUPPORT_RUNTIME_DISCLOSURE.statusLabel,
    SUPPORT_RUNTIME_DISCLOSURE.handoffActionLabel,
    SUPPORT_RUNTIME_DISCLOSURE.handoffTitle,
    SUPPORT_RUNTIME_DISCLOSURE.handoffMessage,
    SUPPORT_RUNTIME_DISCLOSURE.launcherLabel,
    SUPPORT_RUNTIME_DISCLOSURE.footerLabel,
    getSupportIntro('prospect', 'en'),
    getSupportIntro('client', 'en'),
    getUnknownAnswerDisclosure('en'),
  ].join(' ');
  assert.match(englishCopy, /demo|simulation/i);
  assert.match(englishCopy, /no live messaging|not live|has not been notified|only prepare/i);

  const spanishCopy = [
    SUPPORT_RUNTIME_DISCLOSURE_ES.statusLabel,
    SUPPORT_RUNTIME_DISCLOSURE_ES.handoffActionLabel,
    SUPPORT_RUNTIME_DISCLOSURE_ES.handoffTitle,
    SUPPORT_RUNTIME_DISCLOSURE_ES.handoffMessage,
    SUPPORT_RUNTIME_DISCLOSURE_ES.launcherLabel,
    SUPPORT_RUNTIME_DISCLOSURE_ES.footerLabel,
    getSupportIntro('prospect', 'es'),
    getSupportIntro('client', 'es'),
    getUnknownAnswerDisclosure('es'),
  ].join(' ');
  assert.match(spanishCopy, /demo|simulaci[oó]n/i);
  assert.match(spanishCopy, /sin mensajes en vivo|no est[aá]n activos|no voy a adivinar|ha sido notificado/i);

  const combined = `${englishCopy} ${spanishCopy}`;
  assert.doesNotMatch(combined, /\bAI online\b/i);
  assert.doesNotMatch(combined, /\bwaiting for LLF specialist\b/i);
  assert.doesNotMatch(combined, /\bhandoff requested\b/i);
  assert.doesNotMatch(combined, /\bwill be preserved for an authorized LLF specialist\b/i);

  const supportChatSource = readFileSync(
    new URL('../components/support-chat.tsx', import.meta.url),
    'utf8',
  );
  assert.match(supportChatSource, /getSupportRuntimeDisclosure\(locale\)/);
  assert.match(supportChatSource, /detectSupportLocale\(question, locale\)/);
  assert.match(supportChatSource, /aria-pressed=\{locale === option\}/);
  assert.doesNotMatch(supportChatSource, /\bAI online\b/i);
  assert.doesNotMatch(supportChatSource, /\bWaiting for LLF specialist\b/i);
  assert.doesNotMatch(supportChatSource, /\bHuman handoff requested\b/i);
}
