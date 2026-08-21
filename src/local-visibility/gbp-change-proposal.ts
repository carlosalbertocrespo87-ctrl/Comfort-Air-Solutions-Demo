export type GbpChangeProposal={field:string;currentValue?:string;proposedValue:string;evidenceUrl:string;reason:string;externalWriteAuthorized:false;requiresHumanApproval:true};
export function proposeGbpChange(input:{field:string;currentValue?:string;proposedValue:string;evidenceUrl:string;reason:string}):GbpChangeProposal{
 const field=input.field.trim(),proposedValue=input.proposedValue.trim(),evidenceUrl=input.evidenceUrl.trim(),reason=input.reason.trim();
 if(!field||!proposedValue||!evidenceUrl||!reason) throw new Error('field, proposedValue, evidenceUrl and reason are required');
 return {field,currentValue:input.currentValue?.trim(),proposedValue,evidenceUrl,reason,externalWriteAuthorized:false,requiresHumanApproval:true};
}
