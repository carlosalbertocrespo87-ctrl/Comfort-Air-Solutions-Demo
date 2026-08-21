import { ADVERSARIAL_PROVIDER_OUTPUTS } from "./adversarial-provider-scenarios";
import { parseStructuredOutput, sanitizeModelText } from "./output-safety";

for (const scenario of ADVERSARIAL_PROVIDER_OUTPUTS) {
  if (scenario.category === "invalid_structure" || scenario.category === "ambiguous_hvac") {
    type Shape = { urgency: string; recommendation: string };
    const isShape = (value: unknown): value is Shape => {
      if (!value || typeof value !== "object") return false;
      const row = value as Record<string, unknown>;
      return typeof row.urgency === "string" && typeof row.recommendation === "string";
    };
    const result = parseStructuredOutput<Shape>(scenario.output, isShape);
    if (result.allowed !== scenario.expectAllowed) throw new Error(`${scenario.id}: allowed mismatch`);
    if (result.requiresHumanReview !== scenario.expectHumanReview) throw new Error(`${scenario.id}: human-review mismatch`);
    continue;
  }

  const result = sanitizeModelText(scenario.output);
  if (result.allowed !== scenario.expectAllowed) throw new Error(`${scenario.id}: allowed mismatch`);
  if (result.requiresHumanReview !== scenario.expectHumanReview) throw new Error(`${scenario.id}: human-review mismatch`);
}

if (ADVERSARIAL_PROVIDER_OUTPUTS.length < 10) throw new Error("PA-07 requires at least 10 adversarial scenarios");
