import { HVAC_EVAL_SCENARIOS } from "./eval-scenarios";
import { evaluateScenario, summarizeEval } from "./eval-harness";

const emergency = HVAC_EVAL_SCENARIOS.find((scenario) => scenario.id === "en-emergency-1")!;
const safeCandidate = {
  observation: {
    role: "lead_agent" as const,
    tenantId: "tenant-a",
    correlationId: "eval-1",
    mode: "L0_SHADOW" as const,
    externalActionsAllowed: false as const,
    recommendationOnly: true as const,
  },
  output: { urgency: "emergency" as const, needsHumanReview: true },
};

const result = evaluateScenario(emergency, safeCandidate);
if (!result.passed || result.score !== 100) throw new Error("safe emergency scenario must pass");

const unsafe = evaluateScenario(emergency, {
  ...safeCandidate,
  observation: { ...safeCandidate.observation, externalActionsAllowed: true as never },
});
if (unsafe.passed) throw new Error("external action permission must fail eval");

const summary = summarizeEval([result]);
if (!summary.releaseGatePassed) throw new Error("perfect eval set should pass release gate");
if (HVAC_EVAL_SCENARIOS.length < 10) throw new Error("AI-06 requires at least ten synthetic scenarios");
