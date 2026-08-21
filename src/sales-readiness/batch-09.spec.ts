import { prepareBilingualDraft } from "./bilingual-message";
import { buildCadencePlan } from "./cadence-plan";
import { evaluateChannelReadiness } from "./channel-readiness";
import { evaluateSalesClaim } from "./claim-guard";
import { evaluateContactSuppression } from "./contact-suppression";
import { evaluateDirectMailReadiness } from "./direct-mail-readiness";
import { prepareFirstTouchDraft } from "./first-touch-draft";
import { buildOutreachExperiment } from "./outreach-experiment";
import { buildOwnerSalesReport } from "./owner-sales-report";
import { evaluateProposalReadiness } from "./proposal-readiness";
import { syntheticSalesCases } from "./synthetic-sales-cases";

function assert(condition:boolean,message:string){if(!condition)throw new Error(message);}

const suppressed=evaluateContactSuppression({doNotContact:true,optedOut:false,unresolvedComplaint:false,wrongParty:false,contactEvidence:true});
assert(suppressed.blocked===true&&suppressed.externalActionAuthorized===false,"DNC must suppress external sales action");
const optedOut=evaluateContactSuppression({doNotContact:false,optedOut:true,unresolvedComplaint:false,wrongParty:false,contactEvidence:true});
assert(optedOut.blocked===true,"opt-out must fail closed");
const noEvidence=evaluateContactSuppression({doNotContact:false,optedOut:false,unresolvedComplaint:false,wrongParty:false,contactEvidence:false});
assert(noEvidence.blocked===true,"missing contact evidence must fail closed");

const prohibited=evaluateSalesClaim({claim:"Guaranteed leads for your HVAC business",evidenceUrl:"https://example.com"});
assert(prohibited.allowed===false&&prohibited.requiresHumanReview===true,"guaranteed outcomes must be blocked");
const unsupported=evaluateSalesClaim({claim:"Your business serves this ZIP"});
assert(unsupported.allowed===false,"unsupported factual claims must be blocked");
const evidenced=evaluateSalesClaim({claim:"Your public website lists emergency service",evidenceUrl:"https://example.com/service"});
assert(evidenced.allowed===true&&evidenced.requiresHumanReview===true,"evidenced claims still require human review");

const channels=evaluateChannelReadiness({publicEmail:"info@example.com",publicPhone:"555-0100"});
assert(channels.readyChannels.includes("EMAIL")&&channels.outreachAuthorized===false,"channel readiness must not authorize outreach");

const firstTouch=prepareFirstTouchDraft({channel:"EMAIL",businessName:"Test HVAC",verifiedObservation:"your public site lists 24/7 service",valueHypothesis:"capture after-hours inquiries"});
assert(firstTouch.sendAuthorized===false,"first-touch output must remain a draft");
const esDraft=prepareBilingualDraft({locale:"es-US",businessName:"Test HVAC",verifiedObservation:"servicio en español",valueHypothesis:"captar consultas fuera de horario"});
assert(esDraft.sendAuthorized===false&&esDraft.locale==="es-US","bilingual sales content must remain draft-only");

const cadence=buildCadencePlan({channels:["EMAIL","PHONE"],maxTouches:4});
assert(cadence.length===4&&cadence.every(step=>step.sendAuthorized===false),"cadence plan must never authorize sends");

const experiment=buildOutreachExperiment({name:"synthetic channel test",hypothesis:"email copy may improve reply quality",channels:["EMAIL"],sampleSize:10,successMetric:"human-reviewed replies"});
assert(experiment.spendAuthorized===false&&experiment.executionAuthorized===false,"outreach experiment must keep spend and execution OFF");

const mail=evaluateDirectMailReadiness({postalAddressVerified:true,businessNameVerified:true,letterFactsVerified:true,returnAddressApproved:false,budgetApproved:true});
assert(mail.readyForHumanReview===false&&mail.mailAuthorized===false,"unapproved return address must block direct mail");

const proposal=evaluateProposalReadiness({scopeKnown:true,priceApproved:true,businessFactsVerified:true,termsReleased:false,paymentPathReady:true});
assert(proposal.ready===false&&proposal.proposalAuthorized===false,"unreleased terms must block proposal readiness");

assert(syntheticSalesCases.length>0,"synthetic sales case pack must not be empty");
assert(syntheticSalesCases.every(item=>item.synthetic===true),"all Batch 09 sales cases must be synthetic");
assert(syntheticSalesCases.some(item=>item.locale==="en-US")&&syntheticSalesCases.some(item=>item.locale==="es-US"),"Batch 09 must cover EN/ES");
assert(syntheticSalesCases.some(item=>item.expectedStatus==="SUPPRESSED"),"Batch 09 must cover suppression");

const report=buildOwnerSalesReport({readyProspects:2,priorityProspects:["Synthetic A"],blockingRisks:["No outreach release"]});
assert(report.externalActionsAuthorized===false,"owner sales report must not authorize external action");
