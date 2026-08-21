export type AutonomyLevel = "L0" | "L1" | "L2" | "L3" | "HUMAN_ONLY";

export type AgentRole =
  | "lead_agent"
  | "follow_up_agent"
  | "sales_agent"
  | "onboarding_agent"
  | "qa_agent"
  | "revenue_agent";

export type ToolRisk = "read" | "internal_write" | "external_write" | "sensitive";

export type AgentToolDefinition = {
  id: string;
  minimumLevel: AutonomyLevel;
  risk: ToolRisk;
  requiresTenantScope: boolean;
  requiresHumanApproval: boolean;
};

export type AgentPermissionProfile = {
  role: AgentRole;
  autonomyLevel: AutonomyLevel;
  allowedTools: string[];
};

export const TOOL_REGISTRY: Record<string, AgentToolDefinition> = {
  read_lead: { id: "read_lead", minimumLevel: "L0", risk: "read", requiresTenantScope: true, requiresHumanApproval: false },
  score_lead: { id: "score_lead", minimumLevel: "L0", risk: "read", requiresTenantScope: true, requiresHumanApproval: false },
  draft_follow_up: { id: "draft_follow_up", minimumLevel: "L0", risk: "read", requiresTenantScope: true, requiresHumanApproval: false },
  update_internal_lead_status: { id: "update_internal_lead_status", minimumLevel: "L1", risk: "internal_write", requiresTenantScope: true, requiresHumanApproval: false },
  create_internal_task: { id: "create_internal_task", minimumLevel: "L1", risk: "internal_write", requiresTenantScope: true, requiresHumanApproval: false },
  send_approved_transactional_message: { id: "send_approved_transactional_message", minimumLevel: "L2", risk: "external_write", requiresTenantScope: true, requiresHumanApproval: false },
  execute_allowlisted_workflow: { id: "execute_allowlisted_workflow", minimumLevel: "L3", risk: "external_write", requiresTenantScope: true, requiresHumanApproval: false },
  charge_or_refund: { id: "charge_or_refund", minimumLevel: "HUMAN_ONLY", risk: "sensitive", requiresTenantScope: true, requiresHumanApproval: true },
  change_legal_terms: { id: "change_legal_terms", minimumLevel: "HUMAN_ONLY", risk: "sensitive", requiresTenantScope: false, requiresHumanApproval: true },
  change_credentials: { id: "change_credentials", minimumLevel: "HUMAN_ONLY", risk: "sensitive", requiresTenantScope: false, requiresHumanApproval: true },
};

export const AGENT_PERMISSION_PROFILES: Record<AgentRole, AgentPermissionProfile> = {
  lead_agent: { role: "lead_agent", autonomyLevel: "L0", allowedTools: ["read_lead", "score_lead"] },
  follow_up_agent: { role: "follow_up_agent", autonomyLevel: "L0", allowedTools: ["read_lead", "draft_follow_up"] },
  sales_agent: { role: "sales_agent", autonomyLevel: "L0", allowedTools: ["read_lead", "draft_follow_up"] },
  onboarding_agent: { role: "onboarding_agent", autonomyLevel: "L1", allowedTools: ["read_lead", "create_internal_task", "update_internal_lead_status"] },
  qa_agent: { role: "qa_agent", autonomyLevel: "L0", allowedTools: ["read_lead"] },
  revenue_agent: { role: "revenue_agent", autonomyLevel: "L0", allowedTools: ["read_lead"] },
};

const LEVEL_ORDER: Record<AutonomyLevel, number> = { L0: 0, L1: 1, L2: 2, L3: 3, HUMAN_ONLY: 99 };

export function canAgentUseTool(params: {
  role: AgentRole;
  toolId: string;
  tenantId?: string;
  humanApproved?: boolean;
}): { allowed: boolean; reason: string } {
  const profile = AGENT_PERMISSION_PROFILES[params.role];
  const tool = TOOL_REGISTRY[params.toolId];

  if (!tool) return { allowed: false, reason: "UNKNOWN_TOOL" };
  if (!profile.allowedTools.includes(params.toolId)) return { allowed: false, reason: "TOOL_NOT_ALLOWLISTED" };
  if (tool.requiresTenantScope && !params.tenantId) return { allowed: false, reason: "TENANT_SCOPE_REQUIRED" };
  if (tool.requiresHumanApproval && !params.humanApproved) return { allowed: false, reason: "HUMAN_APPROVAL_REQUIRED" };
  if (LEVEL_ORDER[profile.autonomyLevel] < LEVEL_ORDER[tool.minimumLevel]) return { allowed: false, reason: "AUTONOMY_LEVEL_TOO_LOW" };
  if (tool.minimumLevel === "HUMAN_ONLY") return { allowed: false, reason: "HUMAN_ONLY" };

  return { allowed: true, reason: "ALLOWLIST_MATCH" };
}
