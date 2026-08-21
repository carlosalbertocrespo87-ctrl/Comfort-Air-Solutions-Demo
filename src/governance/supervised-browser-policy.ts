export type BrowserPolicyDecision={allowed:boolean;mode:'SUPERVISED_INTERNAL'|'BLOCKED';reason:string;externalActionAuthorized:false};
export function evaluateBrowserResearch(input:{publicResearch:boolean;credentialsRequired:boolean;formSubmission:boolean;purchase:boolean;destructiveAction:boolean}):BrowserPolicyDecision{
 if(!input.publicResearch) return {allowed:false,mode:'BLOCKED',reason:'Only public/internal research is eligible for supervised browser use.',externalActionAuthorized:false};
 if(input.credentialsRequired||input.formSubmission||input.purchase||input.destructiveAction) return {allowed:false,mode:'BLOCKED',reason:'Credentialed, submitting, purchasing or destructive browser actions require a separate release.',externalActionAuthorized:false};
 return {allowed:true,mode:'SUPERVISED_INTERNAL',reason:'Eligible for supervised internal research/QA.',externalActionAuthorized:false};
}
