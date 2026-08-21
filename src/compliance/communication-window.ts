export type CommunicationWindowDecision={withinWindow:boolean;reason:string;communicationAuthorized:false};
export function evaluateCommunicationWindow(input:{localHour:number;startHour:number;endHour:number;emergencyTransactional?:boolean}):CommunicationWindowDecision{
 if(input.emergencyTransactional) return {withinWindow:true,reason:'Emergency transactional handling may follow a separate approved policy.',communicationAuthorized:false};
 if(input.startHour<0||input.endHour>24||input.startHour>=input.endHour) return {withinWindow:false,reason:'Invalid communication window configuration.',communicationAuthorized:false};
 const within=input.localHour>=input.startHour&&input.localHour<input.endHour;
 return {withinWindow:within,reason:within?'Within configured communication window.':'Outside configured communication window.',communicationAuthorized:false};
}
