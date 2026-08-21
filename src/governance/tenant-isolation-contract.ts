export type TenantAccessDecision={allowed:boolean;reason:string};
export function evaluateTenantAccess(input:{actorTenantId:string;resourceTenantId:string;systemScope?:boolean}):TenantAccessDecision{
 if(input.systemScope) return {allowed:false,reason:'System-scope access requires a separate privileged path.'};
 if(!input.actorTenantId||!input.resourceTenantId) return {allowed:false,reason:'Tenant identity is required.'};
 if(input.actorTenantId!==input.resourceTenantId) return {allowed:false,reason:'Cross-tenant access is denied.'};
 return {allowed:true,reason:'Tenant scope matches.'};
}
