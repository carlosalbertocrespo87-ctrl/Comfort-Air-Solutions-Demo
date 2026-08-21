export type LocalLandingReadiness={ready:boolean;blockers:string[];warnings:string[];guaranteesRanking:false};
export function evaluateLocalLanding(input:{serviceVerified:boolean;locationVerified:boolean;uniqueUsefulContent:boolean;contactPathPresent:boolean;duplicateContentRisk:boolean}):LocalLandingReadiness{
 const blockers:string[]=[],warnings:string[]=[];
 if(!input.serviceVerified) blockers.push('Service claim is not verified.');
 if(!input.locationVerified) blockers.push('Location/service-area claim is not verified.');
 if(!input.contactPathPresent) blockers.push('Contact/conversion path is missing.');
 if(!input.uniqueUsefulContent) warnings.push('Page may lack sufficient unique useful content.');
 if(input.duplicateContentRisk) warnings.push('Potential duplicate/thin local-page pattern requires review.');
 return {ready:blockers.length===0,blockers,warnings,guaranteesRanking:false};
}
