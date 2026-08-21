import { MockAIProvider } from "./mock-provider";
import { ModelRouter } from "./model-router";
import { InMemoryAITelemetry } from "./telemetry";

async function run() {
  const telemetry = new InMemoryAITelemetry();
  const router = new ModelRouter(
    [new MockAIProvider()],
    [{ task: "lead_classification", primary: "mock" }],
    telemetry,
  );

  await router.route({
    task: "lead_classification",
    input: "synthetic lead text that must not be stored in telemetry",
    tenantId: "tenant-a",
    correlationId: "trace-a",
    locale: "en",
  });

  const events = telemetry.list("tenant-a");
  if (events.length !== 1) throw new Error("successful route must emit one telemetry event");
  const serialized = JSON.stringify(events[0]);
  if (serialized.includes("synthetic lead text")) throw new Error("telemetry must not store prompt content");
  if (events[0].estimatedCostUsd !== 0) throw new Error("mock provider should remain zero cost");
  if (events[0].traceId !== "trace-a") throw new Error("trace id must propagate");

  const summary = telemetry.summarize("tenant-a");
  if (summary.requests !== 1 || summary.successes !== 1 || summary.failures !== 0) {
    throw new Error("summary request counters are incorrect");
  }
  if (summary.totalEstimatedCostUsd !== 0) throw new Error("summary cost should be zero");
  if (telemetry.list("tenant-b").length !== 0) throw new Error("tenant filtering must isolate telemetry");
}

void run();
