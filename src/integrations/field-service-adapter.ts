export type ExternalSystem = 'SERVICETITAN' | 'JOBBER' | 'HOUSECALL_PRO' | 'HUBSPOT' | 'GOHIGHLEVEL' | 'OTHER';
export type AdapterCapability = 'READ_LEAD' | 'WRITE_LEAD' | 'READ_APPOINTMENT' | 'WRITE_APPOINTMENT' | 'READ_REVENUE';

export interface FieldServiceAdapter {
  system: ExternalSystem;
  capabilities: AdapterCapability[];
  liveWritesEnabled: false;
  healthCheck(): Promise<{ ok: boolean; detail?: string }>;
}

/** Contract only. Real adapters require client demand, API feasibility, cost review,
 * tenant isolation, credentials handling, and an explicit release gate. */
export function adapterContract(system: ExternalSystem, capabilities: AdapterCapability[]): Pick<FieldServiceAdapter,'system'|'capabilities'|'liveWritesEnabled'> {
  return { system, capabilities: [...new Set(capabilities)], liveWritesEnabled: false };
}
