export type MultiAgentReadiness={readyForShadow:boolean;readyForExternal:false;missing:string[]};
export function evaluateMultiAgentReadiness(input:{individualAgentsPassedEvals:boolean;tenantIsolationPassed:boolean;toolAllowlistsPassed:boolean;handoffSchemaDefined:boolean;loopLimitDefined:boolean;costBudgetDefined:boolean;humanEscalationDefined:boolean}):MultiAgentReadiness{
 const missing:string[]=[];
 Object.entries(input).forEach(([k,v])=>{if(!v) missing.push(k)});
 return {readyForShadow:missing.length===0,readyForExternal:false,missing};
}
