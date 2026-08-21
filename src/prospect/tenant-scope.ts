export type TenantScopeResult={allowed:boolean;reason:string};
export function enforceTenantScope(input:{recordTenantId:string;activeTenantId:string}):TenantScopeResult{
 if(!input.recordTenantId||!input.activeTenantId) return {allowed:false,reason:'Tenant identity is missing.'};
 if(input.recordTenantId!==input.activeTenantId) return {allowed:false,reason:'Cross-tenant prospect access denied.'};
 return {allowed:true,reason:'Prospect belongs to active tenant.'};
}
