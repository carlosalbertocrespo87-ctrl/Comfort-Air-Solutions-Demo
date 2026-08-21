export type AiGeoAudit = { score: number; findings: string[]; guaranteesRanking: false };
export function auditAiGeoReadiness(input: {
  servicesClear: boolean;
  locationsClear: boolean;
  faqPresent: boolean;
  structuredDataPresent: boolean;
  businessFactsConsistent: boolean;
}): AiGeoAudit {
  const entries: Array<[boolean,string]> = [
    [input.servicesClear, 'Clarify service offerings.'],
    [input.locationsClear, 'Clarify service areas/locations.'],
    [input.faqPresent, 'Add factual customer FAQs.'],
    [input.structuredDataPresent, 'Add/validate appropriate structured data.'],
    [input.businessFactsConsistent, 'Reconcile inconsistent business facts.'],
  ];
  const passed = entries.filter(([ok]) => ok).length;
  return { score: Math.round((passed / entries.length) * 100), findings: entries.filter(([ok]) => !ok).map(([,finding]) => finding), guaranteesRanking: false };
}
