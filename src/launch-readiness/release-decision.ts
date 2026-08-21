export type ReleaseDecision='GO_FOR_INTERNAL_REVIEW'|'HOLD';
export function decideRelease(input:{criticalGatesPass:boolean;evidenceComplete:boolean;simulationPass:boolean;criticalRisks:number;ownerApproval:boolean}):{decision:ReleaseDecision;reasons:string[];productionReleaseAuthorized:false}{
 const reasons:string[]=[];
 if(!input.criticalGatesPass) reasons.push('Critical launch gates are not green.');
 if(!input.evidenceComplete) reasons.push('Required launch evidence is incomplete.');
 if(!input.simulationPass) reasons.push('Customer Zero simulation is not passing.');
 if(input.criticalRisks>0) reasons.push('Critical launch risks remain open.');
 if(!input.ownerApproval) reasons.push('Owner approval is not recorded.');
 return {decision:reasons.length===0?'GO_FOR_INTERNAL_REVIEW':'HOLD',reasons,productionReleaseAuthorized:false};
}
