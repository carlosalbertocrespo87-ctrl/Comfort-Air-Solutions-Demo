export type ICPFit={score:number;grade:'A'|'B'|'C';reasons:string[];requiresHumanReview:true};
export function scoreICP(input:{hvac:boolean;localService:boolean;serviceAreaKnown:boolean;websitePresent:boolean;leadCaptureOpportunity:boolean;contactEvidence:boolean}):ICPFit{
 const reasons:string[]=[]; let score=0;
 if(input.hvac){score+=30;reasons.push('HVAC target fit.');}
 if(input.localService){score+=20;reasons.push('Local-service business fit.');}
 if(input.serviceAreaKnown) score+=15;
 if(input.websitePresent) score+=10;
 if(input.leadCaptureOpportunity){score+=15;reasons.push('Lead-capture opportunity observed.');}
 if(input.contactEvidence) score+=10;
 const grade=score>=75?'A':score>=50?'B':'C';
 return {score,grade,reasons,requiresHumanReview:true};
}
