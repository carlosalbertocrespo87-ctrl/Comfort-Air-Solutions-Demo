export type OutputSafetyIssue = {
  code: "EMAIL" | "PHONE" | "SSN" | "API_KEY" | "SECRET" | "UNAUTHORIZED_ACTION" | "INVALID_STRUCTURE";
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

const FORBIDDEN_ACTION_PATTERNS = [
  /(?:i|we)\s+(?:sent|emailed|texted|called|booked|scheduled|charged|refunded|updated\s+the\s+crm)\b/i,
  /(?:customer|client)\s+(?:was|has been)\s+(?:contacted|charged|refunded|scheduled)\b/i,
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

  for (const pattern of FORBIDDEN_ACTION_PATTERNS) {
    if (pattern.test(redactedText)) {
      issues.push({ code: "UNAUTHORIZED_ACTION", detail: "Output claims an external action that is not authorized in synthetic/shadow mode" });
    }
  }

  const hardBlock = issues.some((issue) => issue.code === "API_KEY" || issue.code === "SECRET" || issue.code === "UNAUTHORIZED_ACTION");
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
