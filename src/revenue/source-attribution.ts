export type SourceAttribution = {
  source?: string;
  medium?: string;
  campaign?: string;
  referrer?: string;
  firstTouchAt?: string;
};

/** Preserve the original acquisition source. Later touches may be recorded elsewhere,
 * but they must not silently overwrite first-touch attribution. */
export function preserveFirstTouch(
  existing: SourceAttribution | undefined,
  incoming: SourceAttribution,
  nowIso: string,
): SourceAttribution {
  if (existing?.firstTouchAt) return { ...existing };
  return {
    source: clean(incoming.source),
    medium: clean(incoming.medium),
    campaign: clean(incoming.campaign),
    referrer: clean(incoming.referrer),
    firstTouchAt: incoming.firstTouchAt || nowIso,
  };
}

function clean(value?: string): string | undefined {
  const normalized = value?.trim();
  return normalized || undefined;
}
