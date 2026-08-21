export type OpportunityType='LEAD_CAPTURE'|'MOBILE'|'CHAT'|'FOLLOW_UP'|'ATTRIBUTION'|'SEO_READINESS';
export type ProspectOpportunity={type:OpportunityType;priority:1|2|3;reason:string;requiresHumanReview:true};
export function prioritizeProspectOpportunities(input:{leadCapturePresent?:boolean;mobileUsable?:boolean;chatPresent?:boolean;followUpVisible?:boolean;sourceTrackingVisible?:boolean;seoReadiness?:boolean}):ProspectOpportunity[]{
 const out:ProspectOpportunity[]=[]; const add=(type:OpportunityType,priority:1|2|3,reason:string)=>out.push({type,priority,reason,requiresHumanReview:true});
 if(input.leadCapturePresent===false)add('LEAD_CAPTURE',1,'Lead capture appears absent or weak.');
 if(input.mobileUsable===false)add('MOBILE',1,'Mobile experience appears weak.');
 if(input.followUpVisible===false)add('FOLLOW_UP',1,'No visible follow-up workflow evidence.');
 if(input.chatPresent===false)add('CHAT',2,'Conversational lead capture may be an opportunity.');
 if(input.sourceTrackingVisible===false)add('ATTRIBUTION',2,'Attribution/tracking may be an opportunity.');
 if(input.seoReadiness===false)add('SEO_READINESS',3,'Technical/local search readiness may be improved.');
 return out.sort((a,b)=>a.priority-b.priority);
}
