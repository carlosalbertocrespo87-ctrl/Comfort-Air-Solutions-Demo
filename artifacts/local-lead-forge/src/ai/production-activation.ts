import type { AIProviderId, AIRequest } from "./contracts";

export type TrafficClass = "synthetic" | "internal" | "customer";

export type ActivationConfig = {
  liveProviderEnabled: boolean;
  allowedProviders: AIProviderId[];
  allowedTraffic: TrafficClass[];
  requireSyntheticMarker: boolean;
};

export const PA01_DEFAULT_CONFIG: ActivationConfig = {
  liveProviderEnabled: false,
  allowedProviders: ["openai"],
  allowedTraffic: ["synthetic"],
  requireSyntheticMarker: true,
};

export type ActivationDecision = { allowed: boolean; reason: string };

export function evaluateProviderActivation(
  provider: AIProviderId,
  request: AIRequest,
  traffic: TrafficClass,
  config: ActivationConfig = PA01_DEFAULT_CONFIG,
): ActivationDecision {
  if (!config.liveProviderEnabled) return { allowed: false, reason: "LIVE_PROVIDER_DISABLED" };
  if (!config.allowedProviders.includes(provider)) return { allowed: false, reason: "PROVIDER_NOT_ALLOWLISTED" };
  if (!config.allowedTraffic.includes(traffic)) return { allowed: false, reason: "TRAFFIC_CLASS_BLOCKED" };
  if (traffic === "customer") return { allowed: false, reason: "CUSTOMER_TRAFFIC_NOT_AUTHORIZED" };
  if (config.requireSyntheticMarker && request.metadata?.synthetic !== true) {
    return { allowed: false, reason: "SYNTHETIC_MARKER_REQUIRED" };
  }
  return { allowed: true, reason: "PA01_SYNTHETIC_ONLY_ALLOWED" };
}
