export type ResearchGap={field:string;priority:'HIGH'|'MEDIUM'|'LOW';reason:string};
export function detectResearchGaps(input:{servicesKnown:boolean;serviceAreaKnown:boolean;phoneKnown:boolean;websiteKnown:boolean;leadCaptureKnown:boolean;mobileKnown:boolean}):ResearchGap[]{
 const gaps:ResearchGap[]=[];
 const add=(missing:boolean,field:string,priority:ResearchGap['priority'],reason:string)=>{if(missing)gaps.push({field,priority,reason})};
 add(!input.websiteKnown,'website','HIGH','Website evidence is required for reliable demo preparation.');
 add(!input.servicesKnown,'services','HIGH','Do not infer HVAC services without evidence.');
 add(!input.serviceAreaKnown,'serviceArea','MEDIUM','Service-area uncertainty weakens personalization.');
 add(!input.phoneKnown,'phone','MEDIUM','Public contact information is unverified.');
 add(!input.leadCaptureKnown,'leadCapture','MEDIUM','Lead-capture opportunity cannot yet be assessed.');
 add(!input.mobileKnown,'mobile','LOW','Mobile usability still needs assessment.');
 return gaps;
}
