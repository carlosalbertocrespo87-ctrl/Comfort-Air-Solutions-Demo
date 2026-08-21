export type OwnerAction={leadId:string;priority:'P1'|'P2'|'P3';action:string;reason:string;requiresHuman:true};
export function buildOwnerAction(input:Omit<OwnerAction,'requiresHuman'>):OwnerAction{
 return {...input,requiresHuman:true};
}
