export type TechnicalCheck = { id: string; pass: boolean; evidence?: string; blocking: boolean };
export type TechnicalReadiness = { ready: boolean; checks: TechnicalCheck[]; blockingFailures: string[] };

export function evaluateTechnicalReadiness(input: {
  mobileUsable: boolean;
  crawlable: boolean;
  metadataPresent: boolean;
  localBusinessSchemaValid?: boolean;
  formsWorking: boolean;
  criticalLinksWorking: boolean;
  performanceBudgetPass: boolean;
}): TechnicalReadiness {
  const checks: TechnicalCheck[] = [
    check('mobile', input.mobileUsable, true),
    check('crawlability', input.crawlable, true),
    check('metadata', input.metadataPresent, false),
    check('local-business-schema', input.localBusinessSchemaValid !== false, false),
    check('forms', input.formsWorking, true),
    check('critical-links', input.criticalLinksWorking, true),
    check('performance-budget', input.performanceBudgetPass, false),
  ];
  const blockingFailures = checks.filter(c => c.blocking && !c.pass).map(c => c.id);
  return { ready: blockingFailures.length === 0, checks, blockingFailures };
}
function check(id: string, pass: boolean, blocking: boolean): TechnicalCheck { return { id, pass, blocking }; }
