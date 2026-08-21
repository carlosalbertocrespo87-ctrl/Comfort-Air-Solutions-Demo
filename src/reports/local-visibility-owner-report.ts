export type LocalVisibilityOwnerReport={score:number;grade:'A'|'B'|'C';topGaps:string[];verifiedFacts:number;unverifiedFacts:number;duplicateRisk:'LOW'|'MEDIUM'|'HIGH';recommendedNextActions:string[];externalActionsAuthorized:false;guaranteesRanking:false};
export function buildLocalVisibilityOwnerReport(input:Omit<LocalVisibilityOwnerReport,'externalActionsAuthorized'|'guaranteesRanking'>):LocalVisibilityOwnerReport{
 return {...input,topGaps:input.topGaps.slice(0,5),recommendedNextActions:input.recommendedNextActions.slice(0,5),externalActionsAuthorized:false,guaranteesRanking:false};
}
