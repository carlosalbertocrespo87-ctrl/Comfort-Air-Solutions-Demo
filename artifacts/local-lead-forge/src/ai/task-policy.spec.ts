import { resolveBudget } from "./budget-guard";
import { getTaskModelPolicy } from "./task-policy";

const fast = getTaskModelPolicy("lead_classification");
if (fast.tier !== "fast") throw new Error("lead_classification must use fast tier");
if (!fast.allowFallback) throw new Error("lead_classification should allow fallback");

const voice = getTaskModelPolicy("voice_realtime");
if (voice.tier !== "realtime") throw new Error("voice must use realtime tier");
if (voice.allowFallback) throw new Error("voice MVP must not silently fallback");

const capped = resolveBudget({
  task: "qa_review",
  input: "synthetic",
  tenantId: "tenant-test",
  correlationId: "corr-test",
  maxLatencyMs: 999999,
  maxCostUsd: 999,
});
if (!capped.allowed) throw new Error("valid request budget should be allowed");
if (capped.maxLatencyMs !== 12000) throw new Error("latency must cap to policy");
if (capped.maxCostUsd !== 0.15) throw new Error("cost must cap to policy");

const invalid = resolveBudget({
  task: "lead_summary",
  input: "synthetic",
  tenantId: "tenant-test",
  correlationId: "corr-test-2",
  maxLatencyMs: 0,
});
if (invalid.allowed) throw new Error("zero latency budget must fail closed");
