export type MeetingPrep={verifiedFacts:string[];discoveryQuestions:string[];prohibitedTopics:string[];requiresHumanDelivery:true};
export function buildMeetingPrep(input:{verifiedFacts:string[];knownGaps:string[]}):MeetingPrep{
 const facts=input.verifiedFacts.map(v=>v.trim()).filter(Boolean);
 const questions=input.knownGaps.map(g=>`Clarify: ${g.trim()}`).filter(v=>v!=='Clarify: ');
 return {verifiedFacts:facts,discoveryQuestions:questions,prohibitedTopics:['Unverified revenue guarantees','Unapproved pricing or discounts','Unsupported competitor claims'],requiresHumanDelivery:true};
}
