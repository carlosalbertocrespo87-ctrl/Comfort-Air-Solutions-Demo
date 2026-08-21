export type ImprovementClass='IMPLEMENT_NOW'|'BUILD_SOON'|'DOCUMENT'|'DEFER';
export function classifyImprovement(input:{costUsd:number;reversible:boolean;launchRisk:boolean;securityRisk:boolean;expectedImpact:number}):ImprovementClass{
 if(input.securityRisk||input.launchRisk) return 'DEFER';
 if(input.costUsd===0&&input.reversible&&input.expectedImpact>=60) return 'IMPLEMENT_NOW';
 if(input.costUsd<=10&&input.reversible&&input.expectedImpact>=50) return 'BUILD_SOON';
 return input.expectedImpact>=30?'DOCUMENT':'DEFER';
}
