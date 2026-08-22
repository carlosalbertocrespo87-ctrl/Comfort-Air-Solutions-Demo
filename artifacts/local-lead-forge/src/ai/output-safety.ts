export type OutputSafetyIssue = {
  code: "EMAIL" | "PHONE" | "SSN" | "API_KEY" | "SECRET" | "UNAUTHORIZED_ACTION" | "PROMPT_INJECTION" | "TENANT_BOUNDARY" | "INVALID_STRUCTURE";
  detail: string;
};

export type OutputSafetyResult<T = unknown> = {
  allowed: boolean;
  redactedText?: string;
  parsed?: T;
  issues: OutputSafetyIssue[];
  requiresHumanReview: boolean;
};

const REDACTIONS: Array<{ code: OutputSafetyIssue["code"]; pattern: RegExp; replacement: string }> = [
  { code: "EMAIL", pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, replacement: "[REDACTED_EMAIL]" },
  { code: "PHONE", pattern: /(?<!\d)(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}(?!\d)/g, replacement: "[REDACTED_PHONE]" },
  { code: "SSN", pattern: /\b\d{3}-\d{2}-\d{4}\b/g, replacement: "[REDACTED_SSN]" },
  { code: "API_KEY", pattern: /\bsk-[A-Za-z0-9_-]{12,}\b/g, replacement: "[REDACTED_API_KEY]" },
];

const PROMPT_INJECTION_PATTERNS = [
  /\bignore\s+(?:the\s+)?(?:policy|policies|rules|instructions|guardrails)\b/i,
  /\b(?:ignora|ignore|desobedece)\s+(?:las?\s+)?(?:reglas|instrucciones|pol[ií]ticas|controles)\b/i,
];

const FORBIDDEN_ACTION_PATTERNS = [
  /\b(?:i|we)\b.{0,100}\b(?:sent|emailed|texted|called|booked|scheduled|charged|refunded|updated\s+the\s+crm)\b/i,
  /\b(?:customer|client)\s+(?:was|has been)\s+(?:contacted|charged|refunded|scheduled)\b/i,
  /\b(?:gave|offered|committed)\b.{0,80}\b(?:discount|price|pricing)\b/i,
  /\b(?:yo\s+)?(?:envi[eé]|mand[eé]|llam[eé]|agend[eé]|program[eé]|cobr[eé]|reembols[eé]|actualic[eé])\b/i,
  /\b(?:di|ofrec[ií]|compromet[ií])\b.{0,80}\b(?:descuento|precio|tarifa)\b/i,
  /\b(?:cliente|usuario)\s+(?:fue|ha\s+sido)\s+(?:contactado|cobrado|reembolsado|agendado|programado)\b/i,
];

const TENANT_BOUNDARY_PATTERNS = [
  /\btenant\s+[a-z0-9_-]+\b.{0,120}\b(?:customer|client|lead)\s+data\b.{0,120}\btenant\s+[a-z0-9_-]+\b/i,
  /\b(?:datos|informaci[oó]n)\s+(?:del?\s+)?(?:cliente|usuario|lead)\b.{0,120}\btenant\s+[a-z0-9_-]+\b.{0,120}\btenant\s+[a-z0-9_-]+\b/i,
];

export function sanitizeModelText(text: string): OutputSafetyResult<string> {
  const issues: OutputSafetyIssue[] = [];
  let redactedText = text;

  for (const rule of REDACTIONS) {
    if (rule.pattern.test(redactedText)) {
      issues.push({ code: rule.code, detail: `${rule.code} detected and redacted` });
      rule.pattern.lastIndex = 0;
      redactedText = redactedText.replace(rule.pattern, rule.replacement);
    }
  }

  if (PROMPT_INJECTION_PATTERNS.some((pattern) => pattern.test(redactedText))) {
    issues.push({ code: "PROMPT_INJECTION", detail: "Output contains an instruction to bypass policy or guardrails" });
  }

  if (FORBIDDEN_ACTION_PATTERNS.some((pattern) => pattern.test(redactedText))) {
    issues.push({ code: "UNAUTHORIZED_ACTION", detail: "Output claims or commits an external action that is not authorized in synthetic/shadow mode" });
  }

  if (TENANT_BOUNDARY_PATTERNS.some((pattern) => pattern.test(redactedText))) {
    issues.push({ code: "TENANT_BOUNDARY", detail: "Output attempts to use data across tenant boundaries" });
  }

  const hardBlock = issues.some((issue) =>
    issue.code === "API_KEY" ||
    issue.code === "SECRET" ||
    issue.code === "UNAUTHORIZED_ACTION" ||
    issue.code === "PROMPT_INJECTION" ||
    issue.code === "TENANT_BOUNDARY"
  );
  return { allowed: !hardBlock, redactedText, parsed: redactedText, issues, requiresHumanReview: issues.length > 0 };
}

export function parseStructuredOutput<T>(text: string, validate: (value: unknown) => value is T): OutputSafetyResult<T> {
  const sanitized = sanitizeModelText(text);
  if (!sanitized.allowed) return { ...sanitized, parsed: undefined };

  try {
    const parsed: unknown = JSON.parse(sanitized.redactedText ?? "");
    if (!validate(parsed)) {
      return { allowed: false, issues: [...sanitized.issues, { code: "INVALID_STRUCTURE", detail: "Structured output failed schema validation" }], requiresHumanReview: true };
    }
    return { allowed: true, parsed, redactedText: sanitized.redactedText, issues: sanitized.issues, requiresHumanReview: sanitized.requiresHumanReview };
  } catch {
    return { allowed: false, issues: [...sanitized.issues, { code: "INVALID_STRUCTURE", detail: "Structured output is not valid JSON" }], requiresHumanReview: true };
  }
}
