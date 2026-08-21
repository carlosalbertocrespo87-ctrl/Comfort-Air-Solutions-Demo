export type GovernanceAutonomy='L0'|'L1'|'L2'|'L3'|'HUMAN_ONLY';
const externalActions=new Set(['external_message','live_crm_write','calendar_change']);
const humanOnlyActions=new Set(['payment','refund','contract_change','credential_change','legal_change','destructive_action']);
export function isActionAllowed(level:GovernanceAutonomy,action:string):boolean{
 if(humanOnlyActions.has(action)) return level==='HUMAN_ONLY';
 if(externalActions.has(action)) return level==='L2'||level==='L3'||level==='HUMAN_ONLY';
 return level!=='L0'||action==='advisory';
}
