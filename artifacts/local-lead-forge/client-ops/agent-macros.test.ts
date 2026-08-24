import { APPROVED_AGENT_MACROS, detectConversationLanguage, renderAgentMacro, searchApprovedMacros, shouldQueueNewQuestion, suggestApprovedMacros } from '../src/lib/agent-macros.ts';

const pricing = APPROVED_AGENT_MACROS.find((macro) => macro.id === 'pricing-overview');
if (!pricing) throw new Error('pricing macro fixture missing');

Deno.test('personalizes approved Spanish macro with prospect and company name', () => {
  const value = renderAgentMacro(pricing, 'ES', { firstName: 'Luis', companyName: 'Empresa X', operatorName: 'Carlos' });
  if (!value.includes('Luis')) throw new Error('first name was not personalized');
  if (!value.includes('Empresa X')) throw new Error('company was not personalized');
  if (value.includes('{{')) throw new Error('raw macro variable leaked');
});

Deno.test('personalizes approved English macro', () => {
  const value = renderAgentMacro(pricing, 'EN', { firstName: 'Luis', companyName: 'Company X' });
  if (!value.startsWith('Hi Luis')) throw new Error(`unexpected English personalization: ${value}`);
});

Deno.test('missing personalization uses neutral fallback without inventing data', () => {
  const value = renderAgentMacro(pricing, 'ES', {});
  if (value.includes('{{') || value.includes('Luis') || value.includes('Empresa X')) throw new Error('unsafe personalization fallback');
});

Deno.test('language detection follows useful Spanish and English messages', () => {
  if (detectConversationLanguage('Hola, quiero saber cuánto cuesta el servicio') !== 'ES') throw new Error('Spanish not detected');
  if (detectConversationLanguage('Hi, how much does your service cost?') !== 'EN') throw new Error('English not detected');
});

Deno.test('search accepts bilingual terms and shortcuts', () => {
  if (!searchApprovedMacros('/precio', 'ES').some((macro) => macro.id === 'pricing-overview')) throw new Error('shortcut search failed');
  if (!searchApprovedMacros('support', 'EN').some((macro) => macro.id === 'support-availability')) throw new Error('English search failed');
});

Deno.test('suggestions only surface relevant approved macros', () => {
  const suggestions = suggestApprovedMacros('What is your price and monthly cost?', 'EN');
  if (suggestions[0]?.id !== 'pricing-overview') throw new Error('pricing suggestion missing');
});

Deno.test('new uncovered questions enter review queue instead of becoming official answers', () => {
  if (!shouldQueueNewQuestion('Do you integrate with a provider we have never discussed?', 'EN')) throw new Error('novel question was not queued');
  if (shouldQueueNewQuestion('How much does it cost?', 'EN')) throw new Error('covered pricing question should not enter novel queue');
});
