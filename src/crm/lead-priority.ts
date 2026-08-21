export type LeadPriority='P1'|'P2'|'P3'|'P4';
export function scoreLeadPriority(input:{emergency:boolean;ageMinutes:number;qualified:boolean;appointmentRequested:boolean;estimatedValueKnown:boolean}):{priority:LeadPriority;reasons:string[];externalActionAuthorized:false}{
 const reasons:string[]=[];
 if(input.emergency){reasons.push('Emergency inquiry requires immediate human attention.');return {priority:'P1',reasons,externalActionAuthorized:false};}
 if(input.appointmentRequested){reasons.push('Prospect requested an appointment.');return {priority:'P1',reasons,externalActionAuthorized:false};}
 if(input.qualified&&input.ageMinutes>=15){reasons.push('Qualified lead is aging without resolution.');return {priority:'P2',reasons,externalActionAuthorized:false};}
 if(input.qualified||input.estimatedValueKnown){reasons.push('Lead has meaningful qualification/value evidence.');return {priority:'P3',reasons,externalActionAuthorized:false};}
 reasons.push('Insufficient urgency or qualification evidence.');
 return {priority:'P4',reasons,externalActionAuthorized:false};
}
