export type CategoryReadiness={ready:boolean;missingEvidence:string[];externalChangeAuthorized:false};
export function evaluateCategoryReadiness(input:{primaryCategory?:string;serviceCategories:string[];evidencedServices:string[]}):CategoryReadiness{
 const evidenced=new Set(input.evidencedServices.map(v=>v.trim().toLowerCase()).filter(Boolean)); const missingEvidence:string[]=[];
 if(!input.primaryCategory?.trim()) missingEvidence.push('Primary category is not documented.');
 for(const category of input.serviceCategories.map(v=>v.trim()).filter(Boolean)){if(!evidenced.has(category.toLowerCase())) missingEvidence.push(`Category/service lacks evidence: ${category}`);}
 return {ready:missingEvidence.length===0,missingEvidence,externalChangeAuthorized:false};
}
