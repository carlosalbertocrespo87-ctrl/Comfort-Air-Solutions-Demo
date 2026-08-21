import { recordBenchmarkObservation } from "../benchmark/benchmark-observation";
import { syntheticTaskPack } from "../benchmark/synthetic-task-pack";
import { nextContinuousStep } from "../improvement/continuous-loop";
import { buildModelImprovementReport } from "../reports/model-improvement-report";
import { benchmarkBudget } from "./benchmark-budget";
import { benchmarkScore } from "./benchmark-score";
import { reviewFallback } from "./fallback-policy-review";
import { normalizeModelCandidate } from "./model-candidate";
import { evaluateModelChange } from "./model-change-gate";
import { checkRegression } from "./regression-guard";
import { recommendRoute } from "./routing-recommendation";

function assert(condition:boolean,message:string){if(!condition)throw new Error(message);}

const candidate=normalizeModelCandidate({provider:" mock ",model:" candidate-a ",qualityScore:140,estimatedCostUsd:-1,latencyMs:-10});
assert(candidate.provider==="mock"&&candidate.model==="candidate-a","candidate identifiers should be normalized");
assert(candidate.qualityScore===100&&candidate.estimatedCostUsd===0&&candidate.latencyMs===0,"candidate metrics should clamp to safe deterministic ranges");
assert(candidate.syntheticOnly===true,"Batch 07 model candidates must remain synthetic-only");

const budget=benchmarkBudget({maxPerRequestUsd:0.01,maxRunUsd:0.05});
assert(budget.spendAuthorized===false,"benchmark budget must never authorize spend by itself");
assert(benchmarkBudget({maxPerRequestUsd:-1,maxRunUsd:-1}).maxRunUsd===0,"negative benchmark budgets must clamp to zero");

const score=benchmarkScore({quality:100,policyPassRate:100,latencyScore:100,costScore:100});
assert(score===100,"benchmark score should be deterministic at full marks");

const regression=checkRegression({baselineTaskSuccess:95,candidateTaskSuccess:95,baselinePolicyPass:100,candidatePolicyPass:99});
assert(regression.pass===false&&regression.reasons.some(reason=>reason.includes("Policy")),"policy regression must fail closed");

const crossTenantFallback=reviewFallback({fallbackAllowed:true,sameTenant:false,policyCompatible:true,withinBudget:true});
assert(crossTenantFallback.safe===false,"fallback must not cross tenant boundaries");

const route=recommendRoute([
 {id:"unsafe-high",score:100,policyPass:false},
 {id:"safe-lower",score:80,policyPass:true},
]);
assert(route?.candidateId==="safe-lower","routing must exclude policy-failing candidates");
assert(route?.advisoryOnly===true&&route?.requiresHumanReview===true,"routing recommendation must remain advisory and human-reviewed");

const noHumanChange=evaluateModelChange({benchmarkPass:true,policyPass:true,regressionPass:true,costWithinBudget:true,humanReviewed:false});
assert(noHumanChange.approvedForInternal===false,"model change must block without human review");
assert(noHumanChange.approvedForCustomer===false,"model change gate must never authorize customer activation");
const reviewedChange=evaluateModelChange({benchmarkPass:true,policyPass:true,regressionPass:true,costWithinBudget:true,humanReviewed:true});
assert(reviewedChange.approvedForInternal===true&&reviewedChange.approvedForCustomer===false,"passing internal evidence must still not authorize customer activation");

const observation=recordBenchmarkObservation({candidateId:"candidate-a",taskId:"task-a",success:true,policyPass:true,latencyMs:10,estimatedCostUsd:0});
assert(observation.contentStored===false,"benchmark observations must not store prompt/response content");

assert(syntheticTaskPack.length>0,"synthetic task pack must not be empty");
assert(syntheticTaskPack.every(task=>task.synthetic===true),"all Batch 07 benchmark tasks must be synthetic");
assert(syntheticTaskPack.some(task=>task.locale==="en")&&syntheticTaskPack.some(task=>task.locale==="es"),"synthetic task pack must cover EN and ES");

const loop=nextContinuousStep("MEASURE");
assert(loop.externalActionsAuthorized===false,"continuous-improvement loop must not authorize external actions");

const report=buildModelImprovementReport({candidate:"candidate-a",benchmarkScore:90,costClass:"FREE",regressionPass:true,recommendedAction:"internal review"});
assert(report.customerActivationAuthorized===false,"model-improvement report must never authorize customer activation");
