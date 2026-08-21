export type ModelChangeGate={approvedForInternal:boolean;approvedForCustomer:false;blockers:string[]};
export function evaluateModelChange(input:{benchmarkPass:boolean;policyPass:boolean;regressionPass:boolean;costWithinBudget:boolean;humanReviewed:boolean}):ModelChangeGate{
 const blockers:string[]=[];
 if(!input.benchmarkPass) blockers.push('Benchmark evidence is insufficient.');
 if(!input.policyPass) blockers.push('Policy evaluation failed.');
 if(!input.regressionPass) blockers.push('Regression guard failed.');
 if(!input.costWithinBudget) blockers.push('Cost exceeds approved budget.');
 if(!input.humanReviewed) blockers.push('Human review is required.');
 return {approvedForInternal:blockers.length===0,approvedForCustomer:false,blockers};
}
