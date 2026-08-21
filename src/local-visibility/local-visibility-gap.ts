export type VisibilityGap={type:'PROFILE'|'NAP'|'CATEGORY'|'SERVICE_AREA'|'HOURS'|'REVIEWS'|'LOCAL_PAGE'|'SCHEMA';priority:1|2|3;reason:string;requiresHumanReview:true};
export function prioritizeVisibilityGaps(input:{profileIncomplete:boolean;napConflict:boolean;categoryGap:boolean;serviceAreaGap:boolean;hoursGap:boolean;reviewGap:boolean;localPageGap:boolean;schemaGap:boolean}):VisibilityGap[]{
 const out:VisibilityGap[]=[]; const add=(condition:boolean,type:VisibilityGap['type'],priority:1|2|3,reason:string)=>{if(condition)out.push({type,priority,reason,requiresHumanReview:true});};
 add(input.napConflict,'NAP',1,'Public business identity/contact information conflicts across sources.');
 add(input.profileIncomplete,'PROFILE',1,'Core local profile information is incomplete.');
 add(input.categoryGap,'CATEGORY',2,'Primary/service category evidence is incomplete.');
 add(input.serviceAreaGap,'SERVICE_AREA',2,'Service-area evidence is incomplete.');
 add(input.hoursGap,'HOURS',2,'Hours are missing, stale or unverified.');
 add(input.localPageGap,'LOCAL_PAGE',2,'Local service/location landing readiness has gaps.');
 add(input.schemaGap,'SCHEMA',3,'Entity/schema readiness has gaps.');
 add(input.reviewGap,'REVIEWS',3,'Review workflow/readiness has gaps.');
 return out.sort((a,b)=>a.priority-b.priority);
}
