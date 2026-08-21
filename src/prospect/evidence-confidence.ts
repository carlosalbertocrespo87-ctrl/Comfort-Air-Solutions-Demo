export type EvidenceConfidence='HIGH'|'MEDIUM'|'LOW'|'UNVERIFIED';
export function evidenceConfidence(input:{sourceCount:number;officialSource:boolean;freshnessKnown:boolean;conflicts:number}):EvidenceConfidence{
 if(input.sourceCount<=0) return 'UNVERIFIED';
 if(input.conflicts>0) return 'LOW';
 if(input.officialSource && input.freshnessKnown && input.sourceCount>=2) return 'HIGH';
 if(input.officialSource || input.sourceCount>=2) return 'MEDIUM';
 return 'LOW';
}
