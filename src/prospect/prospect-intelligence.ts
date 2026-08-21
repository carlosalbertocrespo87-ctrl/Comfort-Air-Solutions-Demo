export type ProspectEvidence={servicesFound?:string[];serviceAreasFound?:string[];phoneFound?:boolean;websiteUsable?:boolean;leadCapturePresent?:boolean;chatPresent?:boolean;mobileUsable?:boolean;sourceUrls:string[]};
export type ProspectAssessment={score:number;grade:'A'|'B'|'C';opportunities:string[];evidenceCount:number;requiresHumanReview:true};
export function assessProspect(e:ProspectEvidence):ProspectAssessment{
 let score=0; const opportunities:string[]=[];
 const add=(ok:boolean,points:number,opportunity:string)=>{if(ok)score+=points;else opportunities.push(opportunity)};
 add(Boolean(e.servicesFound?.length),20,'Clarify services from public evidence.');
 add(Boolean(e.serviceAreasFound?.length),15,'Clarify service area from public evidence.');
 add(Boolean(e.phoneFound),10,'Verify a public business phone.');
 add(Boolean(e.websiteUsable),15,'Website usability may be an improvement opportunity.');
 add(Boolean(e.leadCapturePresent),15,'Lead capture may be missing or weak.');
 add(Boolean(e.chatPresent),10,'Conversational lead capture may be an opportunity.');
 add(Boolean(e.mobileUsable),15,'Mobile experience may be an improvement opportunity.');
 const evidenceCount=e.sourceUrls.filter(Boolean).length;
 if(evidenceCount===0){score=Math.min(score,39);opportunities.push('No source evidence: assessment cannot be trusted yet.');}
 return {score,grade:score>=75?'A':score>=50?'B':'C',opportunities,evidenceCount,requiresHumanReview:true};
}
