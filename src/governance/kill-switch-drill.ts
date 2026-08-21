export type KillSwitchDrill={pass:boolean;failures:string[]};
export function evaluateKillSwitchDrill(input:{globalStops:boolean;tenantStops:boolean;providerStops:boolean;rollbackSafe:boolean;executorBypassed:boolean}):KillSwitchDrill{
 const failures:string[]=[];
 if(!input.globalStops) failures.push('Global stop failed.');
 if(!input.tenantStops) failures.push('Tenant stop failed.');
 if(!input.providerStops) failures.push('Provider stop failed.');
 if(!input.rollbackSafe) failures.push('Rollback did not land in safe default.');
 if(!input.executorBypassed) failures.push('Executor was reached while disabled.');
 return {pass:failures.length===0,failures};
}
