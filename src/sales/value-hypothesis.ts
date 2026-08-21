export type ValueHypothesis={hypotheses:string[];guaranteedOutcome:false;requiresValidation:true};
export function buildValueHypothesis(input:{leadCaptureWeak?:boolean;slowResponseRisk?:boolean;missedCallRisk?:boolean;followUpGap?:boolean;attributionGap?:boolean}):ValueHypothesis{
 const hypotheses:string[]=[];
 if(input.leadCaptureWeak) hypotheses.push('Improved lead capture may reduce inquiry leakage.');
 if(input.slowResponseRisk) hypotheses.push('Faster response workflows may improve contact opportunity.');
 if(input.missedCallRisk) hypotheses.push('A missed-call recovery workflow may recover otherwise lost inquiries.');
 if(input.followUpGap) hypotheses.push('Structured follow-up may recover stalled opportunities or estimates.');
 if(input.attributionGap) hypotheses.push('Revenue attribution may make marketing performance easier to evaluate.');
 return {hypotheses,guaranteedOutcome:false,requiresValidation:true};
}
