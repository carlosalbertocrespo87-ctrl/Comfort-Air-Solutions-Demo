import type { AIRequest } from "./contracts";
import { evaluateProviderActivation, PA01_DEFAULT_CONFIG } from "./production-activation";

const request: AIRequest = {
  task: "lead_classification",
  input: "synthetic HVAC test",
  tenantId: "synthetic-tenant",
  correlationId: "pa01-1",
  metadata: { synthetic: true },
};

const disabled = evaluateProviderActivation("openai", request, "synthetic", PA01_DEFAULT_CONFIG);
if (disabled.allowed || disabled.reason !== "LIVE_PROVIDER_DISABLED") throw new Error("default must fail closed");

const enabledSynthetic = evaluateProviderActivation("openai", request, "synthetic", { ...PA01_DEFAULT_CONFIG, liveProviderEnabled: true });
if (!enabledSynthetic.allowed) throw new Error("explicit synthetic activation should be allowed");

const customer = evaluateProviderActivation("openai", request, "customer", { ...PA01_DEFAULT_CONFIG, liveProviderEnabled: true, allowedTraffic: ["synthetic", "customer"] });
if (customer.allowed) throw new Error("customer traffic must remain blocked in PA-01");

const unmarked = evaluateProviderActivation("openai", { ...request, metadata: {} }, "synthetic", { ...PA01_DEFAULT_CONFIG, liveProviderEnabled: true });
if (unmarked.allowed) throw new Error("synthetic marker is mandatory");
