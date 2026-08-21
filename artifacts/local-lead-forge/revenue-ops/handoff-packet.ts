export interface HandoffPacket{clientIdentity:boolean;commercialTerms:boolean;scope:boolean;exclusions:boolean;paymentEvidence:boolean;legalEvidence:boolean;onboardingInputs:boolean;deliveryOwner:boolean;nextAction:boolean;evidenceRefs:boolean;}
export function handoffPacketComplete(x:HandoffPacket):boolean{return Object.values(x).every(Boolean);}
