import { DEFAULT_KILL_SWITCH_STATE, engageGlobalKillSwitch, evaluateKillSwitch, rollbackToSafeDefault } from "./kill-switch";

if (!evaluateKillSwitch("openai", "tenant-a", DEFAULT_KILL_SWITCH_STATE).allowed) throw new Error("default clear state should allow evaluation");

const global = engageGlobalKillSwitch("incident-test", "operator");
if (evaluateKillSwitch("openai", "tenant-a", global).allowed) throw new Error("global kill switch must block");

const providerBlocked = { ...DEFAULT_KILL_SWITCH_STATE, disabledProviders: ["openai" as const] };
if (evaluateKillSwitch("openai", "tenant-a", providerBlocked).allowed) throw new Error("provider kill switch must block provider");

const tenantBlocked = { ...DEFAULT_KILL_SWITCH_STATE, disabledTenants: ["tenant-a"] };
if (evaluateKillSwitch("openai", "tenant-a", tenantBlocked).allowed) throw new Error("tenant kill switch must block tenant");
if (!evaluateKillSwitch("openai", "tenant-b", tenantBlocked).allowed) throw new Error("tenant kill switch must remain isolated");

const rollback = rollbackToSafeDefault();
if (!rollback.globalDisabled || evaluateKillSwitch("openai", "tenant-a", rollback).allowed) throw new Error("rollback must land in disabled safe state");
