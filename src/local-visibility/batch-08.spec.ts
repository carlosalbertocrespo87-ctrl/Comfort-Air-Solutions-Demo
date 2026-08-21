import { detectDuplicateListingRisk } from "./duplicate-listing-risk";
import { proposeGbpChange } from "./gbp-change-proposal";
import { localVisibilitySyntheticCases } from "./local-qa-cases";
import { buildLocalProfile } from "./profile-facts";
import { evaluateReviewReadiness } from "./review-readiness";
import { prepareReviewResponse } from "./review-response-draft";
import { buildLocalVisibilityOwnerReport } from "../reports/local-visibility-owner-report";

function assert(condition:boolean,message:string){if(!condition)throw new Error(message);}
function assertThrows(fn:()=>unknown,messagePart:string){try{fn();}catch(error){if(error instanceof Error&&error.message.includes(messagePart))return;throw error;}throw new Error(`Expected error containing: ${messagePart}`);}

const profile=buildLocalProfile({businessName:" Test HVAC ",facts:[
 {field:" phone ",value:" 555-0100 ",evidenceUrl:" https://example.com/contact ",verified:true},
 {field:"",value:"ignored",evidenceUrl:"https://example.com",verified:false},
]});
assert(profile.businessName==="Test HVAC","profile business name should be normalized");
assert(profile.facts.length===1&&profile.externalMutationAuthorized===false,"profile facts must be evidence-backed and internal-only");
assertThrows(()=>buildLocalProfile({businessName:" ",facts:[]}),"businessName");

const dnc=evaluateReviewReadiness({jobComplete:true,customerEligible:true,doNotContact:true,incentiveOffered:false,sentimentFiltered:false});
assert(dnc.ready===false&&dnc.communicationAuthorized===false,"DNC must block review readiness and communication");
const gated=evaluateReviewReadiness({jobComplete:true,customerEligible:true,doNotContact:false,incentiveOffered:false,sentimentFiltered:true});
assert(gated.ready===false&&gated.reviewGatingAllowed===false,"sentiment-based review gating must fail closed");
const incentive=evaluateReviewReadiness({jobComplete:true,customerEligible:true,doNotContact:false,incentiveOffered:true,sentimentFiltered:false});
assert(incentive.ready===false,"incentivized review flow must fail closed");

const response=prepareReviewResponse({customerName:"Pat",reviewSummary:"Synthetic positive review",issueUnresolved:false});
assert(response.requiresHumanDelivery===true&&response.externalActionAuthorized===false,"review response must remain draft-only and human-delivered");

const highDuplicate=detectDuplicateListingRisk({samePhone:true,similarName:true,overlappingAddressOrArea:true,multipleProfileUrls:true});
assert(highDuplicate.risk==="HIGH"&&highDuplicate.automaticMergeAuthorized===false,"high duplicate risk must never auto-merge listings");

const proposal=proposeGbpChange({field:"phone",currentValue:"555-0100",proposedValue:"555-0101",evidenceUrl:"https://example.com/contact",reason:"Verified public source"});
assert(proposal.externalWriteAuthorized===false&&proposal.requiresHumanApproval===true,"GBP changes must remain proposals only");
assertThrows(()=>proposeGbpChange({field:"phone",proposedValue:"",evidenceUrl:"https://example.com",reason:"evidence"}),"required");

assert(localVisibilitySyntheticCases.length>0,"local visibility synthetic pack must not be empty");
assert(localVisibilitySyntheticCases.every(item=>item.synthetic===true),"all Batch 08 QA cases must be synthetic");
assert(localVisibilitySyntheticCases.some(item=>item.locale==="en-US")&&localVisibilitySyntheticCases.some(item=>item.locale==="es-US"),"Batch 08 QA must cover EN/ES");
assert(localVisibilitySyntheticCases.some(item=>item.id==="es-review-gating"&&item.expectedHumanReview===true),"Batch 08 QA must cover review gating");

const report=buildLocalVisibilityOwnerReport({score:82,grade:"B",topGaps:["gap1","gap2"],verifiedFacts:8,unverifiedFacts:2,duplicateRisk:"LOW",recommendedNextActions:["verify only"]});
assert(report.externalActionsAuthorized===false,"owner report must not authorize external actions");
assert(report.guaranteesRanking===false,"owner report must not guarantee rankings");
