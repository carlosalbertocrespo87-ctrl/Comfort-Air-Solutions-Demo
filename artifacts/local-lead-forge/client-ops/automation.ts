export type AutomationAction='CREATE_INTERNAL_TASK'|'ESCALATE_INTERNAL'|'REQUEST_EVIDENCE'|'SEND_CUSTOMER_MESSAGE'|'CHARGE_CUSTOMER'|'ACTIVATE_PRODUCTION';
export function automationAllowed(action:AutomationAction):boolean{return ['CREATE_INTERNAL_TASK','ESCALATE_INTERNAL','REQUEST_EVIDENCE'].includes(action);}
export function shouldEscalate(input:{health:'GREEN'|'YELLOW'|'RED'|'GRAY';openP1:number;staleP2:boolean;overdue:boolean}):boolean{return input.health==='RED'||input.openP1>0||input.staleP2||input.overdue;}
