export type LearningRecord={id:string;observation:string;decision:string;evidenceRefs:string[];externalActionAuthorized:false};
export function createLearningRecord(input:{id:string;observation:string;decision:string;evidenceRefs?:string[]}):LearningRecord{
 return {id:input.id.trim(),observation:input.observation.trim(),decision:input.decision.trim(),evidenceRefs:[...new Set(input.evidenceRefs??[])],externalActionAuthorized:false};
}
