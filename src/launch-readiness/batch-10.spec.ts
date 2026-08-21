import { evaluateAddressLegalReadiness } from "./address-legal-readiness";
import { evaluateCustomerZeroSimulation } from "./customer-zero-simulation";
import { evaluateEvidenceCompleteness } from "./evidence-completeness";
import { evaluateLaunchGates } from "./launch-gates";
import { evaluatePaymentReadiness } from "./payment-readiness";
import { decideRelease } from "./release-decision";
import { syntheticLaunchCases } from "./synthetic-launch-cases";
import { buildExecutiveLaunchReadiness } from "../reports/executive-launch-readiness";

function assert(condition:boolean,message:string){if(!condition)throw new Error(message);}

const address=evaluateAddressLegalReadiness({businessAddressApproved:false,allowedUseVerified:false,entityDecisionRecorded:true,requiredDocsReady:true});
assert(address.ready===false,"missing address approval must block launch readiness");
assert(address.legalActionAuthorized===false&&address.addressChangeAuthorized===false,"readiness evaluation must not authorize legal/address changes");

const payment=evaluatePaymentReadiness({paymentProviderReady:true,payoutDestinationVerified:true,testModeEvidence:false,refundProcessDocumented:true});
assert(payment.ready===false&&payment.chargeAuthorized===false&&payment.refundAuthorized===false,"missing payment evidence must block and never authorize charge/refund");

const gates=evaluateLaunchGates([
 {name:"address",status:"UNKNOWN",critical:true},
 {name:"internal-doc",status:"PASS",critical:false},
]);
assert(gates.ready===false&&gates.unknown.includes("address"),"critical UNKNOWN gate must fail closed");
assert(gates.releaseAuthorized===false,"launch gate evaluation must not authorize release");

const evidence=evaluateEvidenceCompleteness([{gate:"legal",required:true},{gate:"qa",required:true,evidenceUrl:"https://example.com/evidence"}]);
assert(evidence.complete===false&&evidence.missing.includes("legal"),"required evidence without URL must remain incomplete");

const emptySimulation=evaluateCustomerZeroSimulation([]);
assert(emptySimulation.pass===false&&emptySimulation.productionTrafficAuthorized===false,"empty Customer Zero simulation must fail closed");
const passedSimulation=evaluateCustomerZeroSimulation([{name:"synthetic checkout path",passed:true,synthetic:true}]);
assert(passedSimulation.pass===true&&passedSimulation.syntheticOnly===true&&passedSimulation.productionTrafficAuthorized===false,"synthetic simulation success must not authorize production traffic");

const noOwner=decideRelease({criticalGatesPass:true,evidenceComplete:true,simulationPass:true,criticalRisks:0,ownerApproval:false});
assert(noOwner.decision==="HOLD"&&noOwner.productionReleaseAuthorized===false,"missing owner approval must HOLD");
const internalGreen=decideRelease({criticalGatesPass:true,evidenceComplete:true,simulationPass:true,criticalRisks:0,ownerApproval:true});
assert(internalGreen.decision==="GO_FOR_INTERNAL_REVIEW","all internal conditions may only advance to internal review");
assert(internalGreen.productionReleaseAuthorized===false,"even green internal review must not authorize production release");

assert(syntheticLaunchCases.length>0,"synthetic launch pack must not be empty");
assert(syntheticLaunchCases.every(item=>item.synthetic===true),"all Batch 10 launch cases must be synthetic");
assert(syntheticLaunchCases.some(item=>item.locale==="en-US")&&syntheticLaunchCases.some(item=>item.locale==="es-US"),"Batch 10 must cover EN/ES");
assert(syntheticLaunchCases.some(item=>item.expectedHold===true),"Batch 10 must cover HOLD scenarios");

const executive=buildExecutiveLaunchReadiness({readinessScore:110,criticalBlocks:[],openRisks:0,ownerActions:[],externalDependencies:[]});
assert(executive.status==="READY_FOR_INTERNAL_REVIEW"&&executive.readinessScore===100,"executive readiness may only signal internal review and must clamp score");
assert(executive.productionReleaseAuthorized===false,"executive report must never authorize production release");
