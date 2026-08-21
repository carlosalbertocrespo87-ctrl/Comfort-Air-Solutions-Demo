export type AppointmentRisk={atRisk:boolean;score:number;reasons:string[];externalActionAuthorized:false};
export function detectAppointmentRisk(input:{confirmed:boolean;hoursUntilAppointment:number;noResponseAfterBooking:boolean;rescheduleRequested:boolean;missingContactMethod:boolean}):AppointmentRisk{
 const reasons:string[]=[]; let score=0;
 if(!input.confirmed){score+=40;reasons.push('Appointment is not confirmed.');}
 if(input.noResponseAfterBooking){score+=30;reasons.push('No response after booking.');}
 if(input.rescheduleRequested){score+=35;reasons.push('Reschedule request is unresolved.');}
 if(input.missingContactMethod){score+=25;reasons.push('No reliable contact method is recorded.');}
 if(input.hoursUntilAppointment<=24 && !input.confirmed){score+=20;reasons.push('Unconfirmed appointment is within 24 hours.');}
 score=Math.min(100,score);
 return {atRisk:score>=40,score,reasons,externalActionAuthorized:false};
}
