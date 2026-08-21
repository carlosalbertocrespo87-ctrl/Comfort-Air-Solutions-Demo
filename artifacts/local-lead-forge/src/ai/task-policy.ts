import type { AIProviderId, AITaskType } from "./contracts";

export type ModelTier = "fast" | "balanced" | "reasoning" | "realtime";

export type TaskModelPolicy = {
  task: AITaskType;
  tier: ModelTier;
  allowedProviders: AIProviderId[];
  maxLatencyMs: number;
  maxCostUsd: number;
  maxAttempts: number;
  requireStructuredOutput: boolean;
  allowFallback: boolean;
};

export const TASK_MODEL_POLICIES: Record<AITaskType, TaskModelPolicy> = {
  lead_classification: {
    task: "lead_classification",
    tier: "fast",
    allowedProviders: ["mock", "openai", "anthropic", "google"],
    maxLatencyMs: 2500,
    maxCostUsd: 0.01,
    maxAttempts: 2,
    requireStructuredOutput: true,
    allowFallback: true,
  },
  lead_summary: {
    task: "lead_summary",
    tier: "fast",
    allowedProviders: ["mock", "openai", "anthropic", "google"],
    maxLatencyMs: 3000,
    maxCostUsd: 0.02,
    maxAttempts: 2,
    requireStructuredOutput: false,
    allowFallback: true,
  },
  qa_review: {
    task: "qa_review",
    tier: "reasoning",
    allowedProviders: ["mock", "openai", "anthropic", "google"],
    maxLatencyMs: 12000,
    maxCostUsd: 0.15,
    maxAttempts: 2,
    requireStructuredOutput: true,
    allowFallback: true,
  },
  follow_up_draft: {
    task: "follow_up_draft",
    tier: "balanced",
    allowedProviders: ["mock", "openai", "anthropic", "google"],
    maxLatencyMs: 5000,
    maxCostUsd: 0.04,
    maxAttempts: 2,
    requireStructuredOutput: false,
    allowFallback: true,
  },
  voice_realtime: {
    task: "voice_realtime",
    tier: "realtime",
    allowedProviders: ["mock", "openai", "google"],
    maxLatencyMs: 900,
    maxCostUsd: 0.2,
    maxAttempts: 1,
    requireStructuredOutput: false,
    allowFallback: false,
  },
  general_reasoning: {
    task: "general_reasoning",
    tier: "reasoning",
    allowedProviders: ["mock", "openai", "anthropic", "google"],
    maxLatencyMs: 15000,
    maxCostUsd: 0.25,
    maxAttempts: 2,
    requireStructuredOutput: false,
    allowFallback: true,
  },
};

export function getTaskModelPolicy(task: AITaskType): TaskModelPolicy {
  return TASK_MODEL_POLICIES[task];
}
