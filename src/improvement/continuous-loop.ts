export type ContinuousStep='MEASURE'|'COMPARE'|'IMPLEMENT_FREE_WIN'|'VALIDATE'|'DOCUMENT';
export type ContinuousLoopState={step:ContinuousStep;externalActionsAuthorized:false};
export function nextContinuousStep(step:ContinuousStep):ContinuousLoopState{
 const order:ContinuousStep[]=['MEASURE','COMPARE','IMPLEMENT_FREE_WIN','VALIDATE','DOCUMENT'];
 const index=order.indexOf(step);
 return {step:order[(index+1)%order.length],externalActionsAuthorized:false};
}
