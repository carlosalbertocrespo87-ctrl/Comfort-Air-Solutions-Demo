export type DemoQaResult={pass:boolean;blockingFailures:string[];warnings:string[];publishAuthorized:false};
export function evaluateDemoQa(input:{englishFlowPass:boolean;spanishFlowPass:boolean;mobilePass:boolean;leadFormPass:boolean;criticalLinksPass:boolean;businessFactsVerified:boolean;pricingVerified:boolean}):DemoQaResult{
 const blockingFailures:string[]=[]; const warnings:string[]=[];
 const required:[[boolean,string],[boolean,string],[boolean,string],[boolean,string],[boolean,string],[boolean,string]]=[
  [input.englishFlowPass,'English flow failed'],[input.spanishFlowPass,'Spanish flow failed'],[input.mobilePass,'Mobile QA failed'],[input.leadFormPass,'Lead form failed'],[input.criticalLinksPass,'Critical link failed'],[input.businessFactsVerified,'Business facts are not verified']
 ];
 required.forEach(([ok,msg])=>{if(!ok)blockingFailures.push(msg)});
 if(!input.pricingVerified) warnings.push('Do not display or promise unverified pricing.');
 return {pass:blockingFailures.length===0,blockingFailures,warnings,publishAuthorized:false};
}
