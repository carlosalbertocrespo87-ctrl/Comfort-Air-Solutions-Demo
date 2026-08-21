export type ExecutiveLaunchInput={readinessScore:number;criticalBlocks:string[];openRisks:number;ownerActions:string[];externalDependencies:string[]};
export function buildExecutiveLaunchReadiness(input:ExecutiveLaunchInput){
 const status=input.criticalBlocks.length===0&&input.openRisks===0?'READY_FOR_INTERNAL_REVIEW':'HOLD';
 return {status,readinessScore:Math.max(0,Math.min(100,input.readinessScore)),criticalBlocks:input.criticalBlocks,openRisks:input.openRisks,ownerActions:input.ownerActions,externalDependencies:input.externalDependencies,productionReleaseAuthorized:false as const};
}
