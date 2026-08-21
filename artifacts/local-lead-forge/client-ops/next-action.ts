export interface NextActionRecord {
  terminal: boolean;
  ownerId?: string | null;
  nextAction?: string | null;
  dueAt?: string | null;
  holdDependency?: string | null;
}

export function hasValidNextAction(record: NextActionRecord): boolean {
  if (record.terminal) return true;
  if (!record.ownerId?.trim() || !record.nextAction?.trim()) return false;
  const hasDue = Boolean(record.dueAt?.trim());
  const hasHold = Boolean(record.holdDependency?.trim());
  return hasDue !== hasHold;
}
