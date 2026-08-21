export type TerritoryExperiment={zip:string;eligibleForStudy:boolean;promiseAuthorized:false;reason:string};
export function evaluateTerritoryExperiment(input:{zip:string;activeClientConflicts:number;capacityKnown:boolean;pricingDefined:boolean;termsReviewed:boolean}):TerritoryExperiment{
 if(!/^\d{5}$/.test(input.zip)) return {zip:input.zip,eligibleForStudy:false,promiseAuthorized:false,reason:'Valid five-digit ZIP required.'};
 if(input.activeClientConflicts>0) return {zip:input.zip,eligibleForStudy:false,promiseAuthorized:false,reason:'Existing client conflict detected.'};
 const ready=input.capacityKnown&&input.pricingDefined&&input.termsReviewed;
 return {zip:input.zip,eligibleForStudy:ready,promiseAuthorized:false,reason:ready?'Eligible for internal commercial study only.':'Capacity, pricing and terms must be defined before testing exclusivity.'};
}
