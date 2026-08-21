export type ProspectPrepReport={prospect:string;score?:number;confidence:string;topOpportunities:string[];researchGaps:string[];demoReady:boolean;salesReady:boolean;externalActionAuthorized:false};
export function buildProspectPrepReport(input:Omit<ProspectPrepReport,'externalActionAuthorized'>):ProspectPrepReport{
 return {...input,topOpportunities:[...new Set(input.topOpportunities)],researchGaps:[...new Set(input.researchGaps)],externalActionAuthorized:false};
}
