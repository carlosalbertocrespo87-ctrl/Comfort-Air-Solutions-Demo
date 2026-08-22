import { strict as assert } from 'node:assert';
import {
  detectSupportLocale,
  findKnowledgeAnswer,
  supportKnowledge,
} from './support-knowledge';

export function runSupportKnowledgeContractTests() {
  assert.equal(detectSupportLocale('¿Cuánto cuesta el servicio al mes?'), 'es');
  assert.equal(detectSupportLocale('How much does the service cost each month?'), 'en');
  assert.equal(detectSupportLocale('LLF', 'es'), 'es');

  const spanishPricing = findKnowledgeAnswer('¿Cuánto cuesta? precio mensual 299 199', 'prospect');
  assert.equal(spanishPricing?.id, 'pricing');
  assert.equal(spanishPricing?.locale, 'es');
  assert.match(spanishPricing?.answer ?? '', /\$299/);
  assert.match(spanishPricing?.answer ?? '', /\$199/);
  assert.match(spanishPricing?.answer ?? '', /checkout.*bloqueado/i);

  const englishPricing = findKnowledgeAnswer('What is the price and monthly cost?', 'prospect');
  assert.equal(englishPricing?.id, 'pricing');
  assert.equal(englishPricing?.locale, 'en');

  // Prospect-only pricing must not leak into the authenticated-client knowledge scope.
  assert.equal(findKnowledgeAnswer('¿Cuánto cuesta? precio mensual 299 199', 'client'), null);

  const spanishOnboarding = findKnowledgeAnswer('¿Cómo funciona la implementación y activación del onboarding?', 'client');
  assert.equal(spanishOnboarding?.id, 'onboarding');
  assert.equal(spanishOnboarding?.locale, 'es');
  assert.match(spanishOnboarding?.answer ?? '', /solo despu[eé]s de superar los gates/i);

  // Client-only operational guidance must not be exposed to a public prospect.
  assert.equal(findKnowledgeAnswer('implementación activación onboarding', 'prospect', 'es'), null);
  assert.equal(findKnowledgeAnswer('change routing email destination', 'prospect', 'en'), null);

  const handoff = findKnowledgeAnswer('quiero hablar con una persona especialista', 'prospect');
  assert.equal(handoff?.id, 'human-support');
  assert.equal(handoff?.locale, 'es');
  assert.match(handoff?.answer ?? '', /no notifica a ninguna persona/i);
  assert.match(handoff?.answer ?? '', /no env[ií]a mensajes en vivo/i);

  assert.equal(findKnowledgeAnswer('zebra quantum warranty question', 'prospect', 'en'), null);
  assert.ok(supportKnowledge.every((entry) => entry.localized.en.answer && entry.localized.es.answer));
}
