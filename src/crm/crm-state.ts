export type LeadStage='NEW'|'CONTACT_PENDING'|'CONTACTED'|'QUALIFIED'|'APPOINTMENT'|'WON'|'LOST'|'REACTIVATION_CANDIDATE';
export type LeadState={leadId:string;stage:LeadStage;updatedAt:string;ownerId?:string;externalMutationAuthorized:false};
export function buildLeadState(input:{leadId:string;stage:LeadStage;updatedAt:string;ownerId?:string}):LeadState{
 return {...input,externalMutationAuthorized:false};
}
