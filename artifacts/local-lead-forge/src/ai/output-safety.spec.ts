import { parseStructuredOutput, sanitizeModelText } from "./output-safety";

const pii = sanitizeModelText("Synthetic lead: test@example.com, 470-555-1212, SSN 123-45-6789");
if (!pii.allowed) throw new Error("ordinary PII should redact and require review, not claim execution");
if (!pii.requiresHumanReview) throw new Error("PII must require human review");
if (!pii.redactedText?.includes("[REDACTED_EMAIL]") || !pii.redactedText.includes("[REDACTED_PHONE]") || !pii.redactedText.includes("[REDACTED_SSN]")) throw new Error("PII redaction failed");

const secret = sanitizeModelText("Use sk-abcdefghijklmnopqrstuvwxyz123456 for the next call");
if (secret.allowed) throw new Error("API key leakage must hard-block");

const fakeAction = sanitizeModelText("I sent the customer an email and booked the appointment.");
if (fakeAction.allowed) throw new Error("unauthorized external-action claim must block");

type LeadShape = { urgency: string; recommendation: string };
const isLeadShape = (value: unknown): value is LeadShape => {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return typeof row.urgency === "string" && typeof row.recommendation === "string";
};

const valid = parseStructuredOutput<LeadShape>('{"urgency":"today","recommendation":"human review"}', isLeadShape);
if (!valid.allowed || !valid.parsed) throw new Error("valid structured output should pass");

const invalid = parseStructuredOutput<LeadShape>('{"urgency":"today"}', isLeadShape);
if (invalid.allowed) throw new Error("schema-invalid output must fail closed");
