export type DuplicateListingRisk={risk:'LOW'|'MEDIUM'|'HIGH';reasons:string[];automaticMergeAuthorized:false};
export function detectDuplicateListingRisk(input:{samePhone:boolean;similarName:boolean;overlappingAddressOrArea:boolean;multipleProfileUrls:boolean}):DuplicateListingRisk{
 const reasons:string[]=[]; let points=0;
 if(input.samePhone){points+=2;reasons.push('Multiple profiles appear to share the same phone.');}
 if(input.similarName){points+=1;reasons.push('Business names are materially similar.');}
 if(input.overlappingAddressOrArea){points+=1;reasons.push('Address/service-area signals overlap.');}
 if(input.multipleProfileUrls){points+=2;reasons.push('Multiple public profile URLs were observed.');}
 const risk:DuplicateListingRisk['risk']=points>=5?'HIGH':points>=3?'MEDIUM':'LOW';
 return {risk,reasons,automaticMergeAuthorized:false};
}
