import { canAgentUseTool } from "./agent-permissions";

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

export function runAgentPermissionContractTests() {
  const leadRead = canAgentUseTool({ role: "lead_agent", toolId: "read_lead", tenantId: "tenant-a" });
  assert(leadRead.allowed, "lead_agent should read tenant-scoped leads");

  const missingTenant = canAgentUseTool({ role: "lead_agent", toolId: "read_lead" });
  assert(!missingTenant.allowed && missingTenant.reason === "TENANT_SCOPE_REQUIRED", "tenant scope must be required");

  const unlisted = canAgentUseTool({ role: "lead_agent", toolId: "create_internal_task", tenantId: "tenant-a" });
  assert(!unlisted.allowed && unlisted.reason === "TOOL_NOT_ALLOWLISTED", "deny-by-default must reject unlisted tools");

  const humanOnly = canAgentUseTool({ role: "revenue_agent", toolId: "charge_or_refund", tenantId: "tenant-a", humanApproved: true });
  assert(!humanOnly.allowed, "agents must never execute HUMAN_ONLY tools");

  const unknown = canAgentUseTool({ role: "qa_agent", toolId: "does_not_exist", tenantId: "tenant-a" });
  assert(!unknown.allowed && unknown.reason === "UNKNOWN_TOOL", "unknown tools must fail closed");
}
