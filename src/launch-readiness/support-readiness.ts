export function evaluateSupportReadiness(input:{supportOwnerKnown:boolean;escalationPathKnown:boolean;responseWindowDocumented:boolean;incidentTemplateReady:boolean}){
 const blockers:string[]=[];
 if(!input.supportOwnerKnown) blockers.push('Support owner is not defined.');
 if(!input.escalationPathKnown) blockers.push('Escalation path is not defined.');
 if(!input.responseWindowDocumented) blockers.push('Support response window is not documented.');
 if(!input.incidentTemplateReady) blockers.push('Incident template is not ready.');
 return {ready:blockers.length===0,blockers,customerCommunicationAuthorized:false as const};
}
